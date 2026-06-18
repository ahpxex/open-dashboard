import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "../src/db/index.ts";
import { accounts, products, users } from "../src/db/schema.ts";
import { auth } from "../src/lib/auth.ts";

const categories = [
  "Electronics",
  "Apparel",
  "Home & Kitchen",
  "Books",
  "Toys",
  "Sports",
  "Beauty",
  "Grocery",
];

const statuses = ["available", "out_of_stock", "discontinued"] as const;

async function seed() {
  console.log("Seeding products…");

  await db.delete(products);

  const rows = Array.from({ length: 60 }, () => ({
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(categories),
    price: Number.parseFloat(faker.commerce.price({ min: 5, max: 900 })),
    stock: faker.number.int({ min: 0, max: 500 }),
    status: faker.helpers.arrayElement(statuses),
    sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
    description: faker.commerce.productDescription(),
  }));

  await db.insert(products).values(rows);
  console.log(`✓ Inserted ${rows.length} products.`);

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
