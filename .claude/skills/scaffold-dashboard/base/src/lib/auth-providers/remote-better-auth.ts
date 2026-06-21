import type { AuthProvider } from "@/lib/auth-provider";

/**
 * Auth preset wiring — **remote better-auth** (the `hono-drizzle-betterauth`
 * backend preset hosts real better-auth at `/api/auth/*` on its own origin).
 * Dormant by default. Activate by pointing `authProvider` here and swapping
 * `@/lib/auth-client` to `@/lib/auth-clients/remote-better-auth`. See
 * `backends/CONTRACT.md` §2b and the `add-backend` skill.
 *
 * The browser talks only to THIS app's `/api/auth/*`; `handler` proxies to the
 * remote service and rewrites upstream `Set-Cookie` to host-only (drops the
 * `Domain` attribute) so the session cookie lands on the frontend origin.
 * `getSession` validates by calling the remote `/api/auth/get-session` with the
 * forwarded cookie. Server-only.
 */

/** Remote better-auth service origin, e.g. `http://localhost:8787`. */
const AUTH_SERVER_URL = () =>
  process.env.AUTH_SERVER_URL ?? "http://localhost:8787";

/** Forward only the headers better-auth needs (cookie + CSRF origin + body type). */
function forwardHeaders(headers: Headers): Headers {
  const out = new Headers();
  for (const key of ["cookie", "content-type", "origin", "user-agent"]) {
    const value = headers.get(key);
    if (value) out.set(key, value);
  }
  return out;
}

/** Strip the `Domain=...` attribute so the cookie is scoped to the frontend host. */
function toHostOnly(setCookie: string): string {
  return setCookie.replace(/;\s*Domain=[^;]+/i, "");
}

export const remoteBetterAuthProvider: AuthProvider = {
  async getSession(headers) {
    const res = await fetch(`${AUTH_SERVER_URL()}/api/auth/get-session`, {
      headers: { cookie: headers.get("cookie") ?? "" },
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as {
      user?: { id: string; email: string; name: string; image?: string | null };
    } | null;
    if (!data?.user) return null;
    const { id, email, name, image } = data.user;
    return { user: { id, email, name, image } };
  },

  async handler(request) {
    const path = new URL(request.url).pathname.replace(/^\/api\/auth/, "");
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const upstream = await fetch(`${AUTH_SERVER_URL()}/api/auth${path}`, {
      method: request.method,
      headers: forwardHeaders(request.headers),
      body: hasBody ? await request.text() : undefined,
    });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append("set-cookie", toHostOnly(cookie));
    }
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers,
    });
  },
};
