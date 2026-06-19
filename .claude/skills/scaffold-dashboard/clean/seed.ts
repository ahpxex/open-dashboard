import { eq } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { accounts, users } from "../src/db/schema.ts";
import { auth } from "../src/lib/auth.ts";

async function seed() {
  // Known local dev account. Hash the password with better-auth's own hasher
  // so `signIn.email` works exactly like a real registration.
  const devEmail = "dev@example.com";
  const devPassword = "password";
  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(devPassword);

  await db.delete(users).where(eq(users.email, devEmail));
  const devUserId = crypto.randomUUID();
  await db.insert(users).values({
    id: devUserId,
    name: "Dev User",
    email: devEmail,
    emailVerified: true,
  });
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    accountId: devUserId,
    providerId: "credential",
    userId: devUserId,
    password: hashedPassword,
  });
  console.log(`✓ Dev account: ${devEmail} / ${devPassword}`);

  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
