import type { Customer, CustomerPlan, CustomerStatus } from "./schema";

const SEED: {
  name: string;
  company: string;
  plan: CustomerPlan;
  mrr: number;
  status: CustomerStatus;
}[] = [
  {
    name: "Avery Quinn",
    company: "Northwind Labs",
    plan: "scale",
    mrr: 4800,
    status: "active",
  },
  {
    name: "Jordan Lee",
    company: "Acme Co",
    plan: "pro",
    mrr: 290,
    status: "active",
  },
  {
    name: "Priya Nair",
    company: "Lumen Studio",
    plan: "pro",
    mrr: 290,
    status: "trial",
  },
  {
    name: "Mateo Rossi",
    company: "Forge & Co",
    plan: "free",
    mrr: 0,
    status: "trial",
  },
  {
    name: "Hana Kim",
    company: "Bluebird",
    plan: "scale",
    mrr: 6200,
    status: "active",
  },
  {
    name: "Diego Alvarez",
    company: "Helio Systems",
    plan: "pro",
    mrr: 290,
    status: "churned",
  },
  {
    name: "Noa Cohen",
    company: "Vertex AI",
    plan: "scale",
    mrr: 5400,
    status: "active",
  },
  {
    name: "Sofia Marin",
    company: "Tidal",
    plan: "free",
    mrr: 0,
    status: "trial",
  },
  {
    name: "Kenji Tanaka",
    company: "Sakura Tech",
    plan: "pro",
    mrr: 290,
    status: "active",
  },
  {
    name: "Amara Okafor",
    company: "Baobab",
    plan: "scale",
    mrr: 3900,
    status: "active",
  },
  {
    name: "Lucas Müller",
    company: "Rheinwerk",
    plan: "pro",
    mrr: 290,
    status: "churned",
  },
  {
    name: "Yara Haddad",
    company: "Cedar",
    plan: "free",
    mrr: 0,
    status: "trial",
  },
  {
    name: "Elena Petrova",
    company: "Aurora",
    plan: "scale",
    mrr: 7100,
    status: "active",
  },
  {
    name: "Tomas Novak",
    company: "Praha Soft",
    plan: "pro",
    mrr: 290,
    status: "active",
  },
  {
    name: "Fatima Zahra",
    company: "Atlas",
    plan: "pro",
    mrr: 290,
    status: "trial",
  },
  {
    name: "Oliver Bennett",
    company: "Kingfisher",
    plan: "free",
    mrr: 0,
    status: "churned",
  },
];

export const demoCustomers: Customer[] = SEED.map((row, i) => {
  const handle = row.name.toLowerCase().replace(/[^a-z]+/g, ".");
  const domain = row.company.toLowerCase().replace(/[^a-z]+/g, "");
  return {
    id: `cus_${3000 + i}`,
    name: row.name,
    email: `${handle}@${domain}.com`,
    company: row.company,
    plan: row.plan,
    mrr: row.mrr,
    status: row.status,
    createdAt: new Date(2025, 9, 1 + i * 6),
    updatedAt: new Date(2026, 4, 1 + i),
  };
});
