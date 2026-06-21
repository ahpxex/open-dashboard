import { afterEach, describe, expect, it, vi } from "vitest";
import { externalJwtAuthProvider } from "./external-jwt";
import { remoteAuthjsProvider } from "./remote-authjs";
import { remoteBetterAuthProvider } from "./remote-better-auth";

/**
 * The preset auth providers are wiring over `fetch`, so the tests mock the
 * transport (no live upstream) and assert the seam contract: a normalized
 * `AuthSession`, the right upstream calls, and correct cookie handling.
 */

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetch(impl: (url: string, init?: RequestInit) => Response) {
  const fn = vi.fn((input: string | URL | Request, init?: RequestInit) =>
    Promise.resolve(impl(String(input), init)),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

describe("externalJwtAuthProvider", () => {
  it("returns null when no session cookie is present", async () => {
    const fetchMock = mockFetch(() => json({}));
    const session = await externalJwtAuthProvider.getSession(new Headers());
    expect(session).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("validates the cookie token against /auth/me and normalizes the user", async () => {
    const fetchMock = mockFetch((url, init) => {
      expect(url).toMatch(/\/auth\/me$/);
      expect((init?.headers as Record<string, string>).authorization).toBe(
        "Bearer tok-123",
      );
      return json({ id: 7, email: "a@b.com", name: "Ada" });
    });
    const session = await externalJwtAuthProvider.getSession(
      new Headers({ cookie: "session=tok-123" }),
    );
    expect(session).toEqual({
      user: { id: "7", email: "a@b.com", name: "Ada" },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("returns null when /auth/me rejects the token", async () => {
    mockFetch(() => json({ detail: "expired" }, { status: 401 }));
    const session = await externalJwtAuthProvider.getSession(
      new Headers({ cookie: "session=stale" }),
    );
    expect(session).toBeNull();
  });

  it("login proxies upstream and sets the session cookie on this origin", async () => {
    mockFetch((url) => {
      expect(url).toMatch(/\/auth\/login$/);
      return json({
        token: "jwt-xyz",
        user: { id: "1", email: "a@b.com", name: "Ada" },
      });
    });
    const res = await externalJwtAuthProvider.handler(
      new Request("https://app.test/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "pw" }),
      }),
    );
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("session=jwt-xyz");
    expect(setCookie).toContain("HttpOnly");
    expect(await res.json()).toEqual({
      data: { user: { id: "1", email: "a@b.com", name: "Ada" } },
    });
  });

  it("surfaces an error and no cookie when upstream login fails", async () => {
    mockFetch(() => json({ detail: "bad creds" }, { status: 401 }));
    const res = await externalJwtAuthProvider.handler(
      new Request("https://app.test/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
      }),
    );
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(await res.json()).toEqual({ error: { message: "bad creds" } });
  });

  it("logout clears the session cookie", async () => {
    mockFetch(() => json({}));
    const res = await externalJwtAuthProvider.handler(
      new Request("https://app.test/api/auth/logout", { method: "POST" }),
    );
    expect(res.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});

describe("remoteBetterAuthProvider", () => {
  it("normalizes the user from the remote get-session", async () => {
    mockFetch((url, init) => {
      expect(url).toMatch(/\/api\/auth\/get-session$/);
      expect((init?.headers as Record<string, string>).cookie).toBe(
        "better-auth.session=abc",
      );
      return json({
        user: { id: "u1", email: "a@b.com", name: "Ada", image: null },
      });
    });
    const session = await remoteBetterAuthProvider.getSession(
      new Headers({ cookie: "better-auth.session=abc" }),
    );
    expect(session).toEqual({
      user: { id: "u1", email: "a@b.com", name: "Ada", image: null },
    });
  });

  it("returns null when the remote session is anonymous", async () => {
    mockFetch(() => json(null));
    const session = await remoteBetterAuthProvider.getSession(new Headers());
    expect(session).toBeNull();
  });

  it("proxies and rewrites upstream Set-Cookie to host-only", async () => {
    mockFetch((url) => {
      expect(url).toMatch(/\/api\/auth\/sign-in\/email$/);
      return json(
        { user: { id: "u1" } },
        {
          headers: {
            "set-cookie":
              "better-auth.session=tok; Domain=api.example.com; Path=/; HttpOnly",
          },
        },
      );
    });
    const res = await remoteBetterAuthProvider.handler(
      new Request("https://app.test/api/auth/sign-in/email", {
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "pw" }),
      }),
    );
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("better-auth.session=tok");
    expect(setCookie).not.toContain("Domain=");
  });
});

describe("remoteAuthjsProvider", () => {
  it("normalizes the Auth.js /session user (synthesizing id from email)", async () => {
    mockFetch((url) => {
      expect(url).toMatch(/\/api\/auth\/session$/);
      return json({ user: { email: "a@b.com", name: "Ada" } });
    });
    const session = await remoteAuthjsProvider.getSession(
      new Headers({ cookie: "authjs.session-token=abc" }),
    );
    expect(session).toEqual({
      user: { id: "a@b.com", email: "a@b.com", name: "Ada", image: undefined },
    });
  });

  it("returns null when Auth.js reports no session", async () => {
    mockFetch(() => json({}));
    const session = await remoteAuthjsProvider.getSession(new Headers());
    expect(session).toBeNull();
  });

  it("proxies and rewrites upstream Set-Cookie to host-only", async () => {
    mockFetch(() =>
      json(
        { url: "/" },
        {
          headers: {
            "set-cookie":
              "authjs.session-token=tok; Domain=api.example.com; Path=/; HttpOnly",
          },
        },
      ),
    );
    const res = await remoteAuthjsProvider.handler(
      new Request("https://app.test/api/auth/callback/credentials", {
        method: "POST",
        body: "csrfToken=x&email=a%40b.com&password=pw",
      }),
    );
    const setCookie = res.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("authjs.session-token=tok");
    expect(setCookie).not.toContain("Domain=");
  });
});
