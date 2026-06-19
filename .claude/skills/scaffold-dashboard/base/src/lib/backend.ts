/**
 * Which backend is configured.
 *
 * This module pulls in **no** database client or secret, so it is safe to import
 * from anywhere — including client-reachable modules (a resource's `server.ts`
 * reads it to pick its data adapter). It only inspects the environment.
 *
 * `hasDatabase` is `true` when a Postgres connection string is present. When it
 * is `false` the app runs in zero-config mode: auth uses better-auth's in-memory
 * adapter and resources use `memoryRepository`, so `bun dev` works with no
 * Docker/Postgres. Set `DATABASE_URL` (copy `.env.example` to `.env`) to switch
 * the whole stack onto Postgres + Drizzle + better-auth.
 *
 * The check is guarded with `typeof process` so it is inert in the browser bundle
 * (where it resolves to `false`); only server-fn handlers ever act on it.
 */
export const hasDatabase =
  typeof process !== "undefined" && Boolean(process.env.DATABASE_URL);
