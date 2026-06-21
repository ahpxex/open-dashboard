import { useEffect, useState } from "react";
import type { AuthSession, AuthUser } from "@/lib/auth-provider";
import { getSession } from "@/lib/auth-server";

/**
 * Browser auth client for the **external custom-JWT** preset (pairs with
 * `@/lib/auth-providers/external-jwt`). Mirrors the better-auth client surface
 * the auth pages and `UserAvatar` use — `signIn.email`, `signUp.email`,
 * `signOut`, `useSession` — so activating this preset is a one-line swap of
 * `@/lib/auth-client` with no page changes.
 *
 * To activate: replace the body of `src/lib/auth-client.ts` with
 * `export * from "@/lib/auth-clients/external-jwt";`.
 */

type Result = { data?: unknown; error?: { message: string } };

async function post(path: string, body?: unknown): Promise<Result> {
  const res = await fetch(`/api/auth/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = (await res.json().catch(() => ({}))) as Result;
  if (!res.ok || payload.error) {
    return { error: payload.error ?? { message: "Request failed." } };
  }
  return { data: payload.data };
}

export const authClient = {
  signIn: {
    email: (credentials: { email: string; password: string }) =>
      post("login", credentials),
  },
  signUp: {
    email: (input: { name: string; email: string; password: string }) =>
      post("register", input),
  },
  signOut: () => post("logout"),
  /** Reactive session — fetches the normalized session via the `getSession` server fn. */
  useSession: () => {
    const [data, setData] = useState<AuthSession | null>(null);
    const [isPending, setIsPending] = useState(true);
    useEffect(() => {
      let active = true;
      getSession()
        .then((session) => active && setData(session))
        .finally(() => active && setIsPending(false));
      return () => {
        active = false;
      };
    }, []);
    return { data, isPending };
  },
};

export const { signIn, signUp, signOut, useSession } = authClient;

export type SessionUser = AuthUser;
