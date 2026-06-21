import { useEffect, useState } from "react";
import type { AuthSession, AuthUser } from "@/lib/auth-provider";
import { getSession } from "@/lib/auth-server";

/**
 * Browser auth client for the **remote Auth.js / NextAuth** preset (pairs with
 * `@/lib/auth-providers/remote-authjs`). Mirrors the better-auth client surface
 * the pages use (`signIn.email` / `signUp.email` / `signOut` / `useSession`) so
 * activating Auth.js is a one-line swap of `@/lib/auth-client`.
 *
 * Sign-in drives Auth.js's CSRF → credentials-callback dance, then confirms via
 * the `getSession` server fn (version-independent — no parsing of Auth.js's
 * redirect response). All calls go to this app's same-origin `/api/auth/*`, which
 * `remoteAuthjsProvider.handler` proxies to the service.
 *
 * To activate: `export * from "@/lib/auth-clients/authjs";` in `src/lib/auth-client.ts`.
 */

type Result = { data?: unknown; error?: { message: string } };

async function csrfToken(): Promise<string> {
  const res = await fetch("/api/auth/csrf");
  const body = (await res.json().catch(() => ({}))) as { csrfToken?: string };
  return body.csrfToken ?? "";
}

async function signInWithCredentials(
  email: string,
  password: string,
): Promise<Result> {
  const csrf = await csrfToken();
  await fetch("/api/auth/callback/credentials", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      csrfToken: csrf,
      email,
      password,
      callbackUrl: window.location.origin,
    }),
    redirect: "manual",
  });
  // Auth.js answers credentials with a redirect; confirm by reading the session.
  const session = await getSession();
  return session
    ? { data: session }
    : { error: { message: "Invalid email or password." } };
}

export const authClient = {
  signIn: {
    email: ({ email, password }: { email: string; password: string }) =>
      signInWithCredentials(email, password),
  },
  signUp: {
    email: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }): Promise<Result> => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        return {
          error: { message: body.message ?? "Unable to create account." },
        };
      }
      return signInWithCredentials(email, password);
    },
  },
  signOut: async () => {
    const csrf = await csrfToken();
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ csrfToken: csrf }),
      redirect: "manual",
    });
  },
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
