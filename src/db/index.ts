import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hasDatabase } from "@/lib/backend";
import * as schema from "./schema";

/**
 * The Drizzle client.
 *
 * Created only when `DATABASE_URL` is set. With no database configured `db` is a
 * Proxy that throws a clear error the moment anything actually touches it — so
 * importing this module never crashes (the app boots zero-config on the in-memory
 * adapters), yet a stray Postgres call still fails loudly instead of silently.
 *
 * This module is server-only: it is reached lazily from `drizzleRepository` and
 * from the server-only `@/lib/auth`, never from a client-reachable import.
 */
export const db: NodePgDatabase<typeof schema> = hasDatabase
  ? drizzle(new Pool({ connectionString: process.env.DATABASE_URL }), {
      schema,
    })
  : (new Proxy({} as NodePgDatabase<typeof schema>, {
      get() {
        throw new Error(
          "DATABASE_URL is not set, but a Postgres-backed repository was used. " +
            "Either set DATABASE_URL (copy .env.example to .env) or back this " +
            "resource with a non-Postgres adapter (memory / REST / GraphQL).",
        );
      },
    }) as NodePgDatabase<typeof schema>);

export { schema };
