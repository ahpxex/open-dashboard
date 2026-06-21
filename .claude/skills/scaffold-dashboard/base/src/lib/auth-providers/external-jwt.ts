import type { AuthProvider } from "@/lib/auth-provider";

/**
 * Auth preset wiring — **external custom-JWT API** (e.g. the
 * `fastapi-sqlalchemy-jwt` backend preset). Dormant by default: the active
 * binding in `@/lib/auth-provider` stays better-auth. Activate it by pointing
 * `authProvider` here and swapping `@/lib/auth-client` to the matching client
 * (`@/lib/auth-clients/external-jwt`). See the `add-backend` skill.
 *
 * Wire contract (see `backends/CONTRACT.md` §2a): the upstream service exposes
 * `POST /auth/register`, `POST /auth/login` → `{ token, user }`, and
 * `GET /auth/me` (Bearer) → `{ id, email, name }`. The browser only ever talks
 * to this app's `/api/auth/*`; the token lives in an HttpOnly `session` cookie
 * that THIS app owns (the upstream returns the token in the JSON body).
 *
 * Server-only: it reads `process.env` and runs inside the `/api/auth/$` handler
 * and the `getSession`/`requireUser` chain — never a client module.
 */

/** Upstream auth API origin, e.g. `http://localhost:8000`. */
const AUTH_API_URL = () => process.env.AUTH_API_URL ?? "http://localhost:8000";

const COOKIE_NAME = "session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function readCookie(headers: Headers, name: string): string | null {
  const cookie = headers.get("cookie");
  if (!cookie) return null;
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? " Secure;" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax;${secure} Max-Age=${MAX_AGE_SECONDS}`;
}

function clearCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`;
}

function json(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json", ...init?.headers },
  });
}

export const externalJwtAuthProvider: AuthProvider = {
  async getSession(headers) {
    const token = readCookie(headers, COOKIE_NAME);
    if (!token) return null;
    const res = await fetch(`${AUTH_API_URL()}/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const u = (await res.json()) as { id: string; email: string; name: string };
    return { user: { id: String(u.id), email: u.email, name: u.name } };
  },

  async handler(request) {
    const action = new URL(request.url).pathname.replace(/^\/api\/auth\//, "");

    if (action === "logout") {
      return json({ ok: true }, { headers: { "set-cookie": clearCookie() } });
    }

    if (action === "login" || action === "register") {
      const upstream = await fetch(`${AUTH_API_URL()}/auth/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: await request.text(),
      });
      const payload = (await upstream.json().catch(() => ({}))) as {
        token?: string;
        user?: unknown;
        message?: string;
        detail?: string;
      };
      if (!upstream.ok || !payload.token) {
        const message =
          payload.message ?? payload.detail ?? "Authentication failed.";
        return json({ error: { message } }, { status: upstream.status || 401 });
      }
      return json(
        { data: { user: payload.user } },
        { headers: { "set-cookie": sessionCookie(payload.token) } },
      );
    }

    return json({ error: { message: "Not found" } }, { status: 404 });
  },
};
