import type { AuthProvider } from "@/lib/auth-provider";

/**
 * Auth preset wiring — **remote Auth.js / NextAuth** (the `hono-drizzle-authjs`
 * backend preset hosts Auth.js v5 with a Credentials provider at `/api/auth/*`).
 * Dormant by default. Activate by pointing `authProvider` here and swapping
 * `@/lib/auth-client` to `@/lib/auth-clients/authjs`. See `backends/CONTRACT.md`
 * §2c and the `add-backend` skill.
 *
 * Like the remote-better-auth provider it proxies `/api/auth/*` (rewriting
 * upstream `Set-Cookie` to host-only) — but `getSession` reads Auth.js's
 * `/api/auth/session` shape (`{ user }` or `{}`), synthesizing a stable id from
 * the email when a JWT session omits one. Server-only.
 */

/** Remote Auth.js service origin, e.g. `http://localhost:8789`. */
const AUTH_SERVER_URL = () =>
  process.env.AUTH_SERVER_URL ?? "http://localhost:8789";

function forwardHeaders(headers: Headers): Headers {
  const out = new Headers();
  for (const key of ["cookie", "content-type", "origin", "user-agent"]) {
    const value = headers.get(key);
    if (value) out.set(key, value);
  }
  return out;
}

function toHostOnly(setCookie: string): string {
  return setCookie.replace(/;\s*Domain=[^;]+/i, "");
}

export const remoteAuthjsProvider: AuthProvider = {
  async getSession(headers) {
    const res = await fetch(`${AUTH_SERVER_URL()}/api/auth/session`, {
      headers: { cookie: headers.get("cookie") ?? "" },
    });
    if (!res.ok) return null;
    const data = (await res.json().catch(() => null)) as {
      user?: {
        id?: string;
        email?: string;
        name?: string;
        image?: string | null;
      };
    } | null;
    if (!data?.user?.email) return null;
    const { id, email, name, image } = data.user;
    return { user: { id: id ?? email, email, name: name ?? email, image } };
  },

  async handler(request) {
    const path = new URL(request.url).pathname.replace(/^\/api\/auth/, "");
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const upstream = await fetch(`${AUTH_SERVER_URL()}/api/auth${path}`, {
      method: request.method,
      headers: forwardHeaders(request.headers),
      body: hasBody ? await request.text() : undefined,
      redirect: "manual",
    });

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    const location = upstream.headers.get("location");
    if (location) headers.set("location", location);
    for (const cookie of upstream.headers.getSetCookie()) {
      headers.append("set-cookie", toHostOnly(cookie));
    }
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers,
    });
  },
};
