import type { Deal, DealStage } from "./schema";

const SEED: {
  name: string;
  company: string;
  value: number;
  owner: string;
  stage: DealStage;
}[] = [
  {
    name: "Platform rollout",
    company: "Northwind Labs",
    value: 48000,
    owner: "Sam Rivera",
    stage: "proposal",
  },
  {
    name: "Seat expansion",
    company: "Acme Co",
    value: 12000,
    owner: "Robin Park",
    stage: "qualified",
  },
  {
    name: "Annual renewal",
    company: "Bluebird",
    value: 62000,
    owner: "Sam Rivera",
    stage: "won",
  },
  {
    name: "Pilot program",
    company: "Lumen Studio",
    value: 8000,
    owner: "Robin Park",
    stage: "lead",
  },
  {
    name: "Enterprise tier",
    company: "Vertex AI",
    value: 90000,
    owner: "Sam Rivera",
    stage: "proposal",
  },
  {
    name: "Add-on: analytics",
    company: "Helio Systems",
    value: 15000,
    owner: "Robin Park",
    stage: "qualified",
  },
  {
    name: "Migration project",
    company: "Aurora",
    value: 71000,
    owner: "Sam Rivera",
    stage: "won",
  },
  {
    name: "Trial conversion",
    company: "Tidal",
    value: 6000,
    owner: "Robin Park",
    stage: "lead",
  },
  {
    name: "Security review",
    company: "Forge & Co",
    value: 22000,
    owner: "Sam Rivera",
    stage: "lost",
  },
  {
    name: "Team plan",
    company: "Sakura Tech",
    value: 9000,
    owner: "Robin Park",
    stage: "qualified",
  },
  {
    name: "Multi-year deal",
    company: "Baobab",
    value: 54000,
    owner: "Sam Rivera",
    stage: "proposal",
  },
  {
    name: "Onboarding package",
    company: "Cedar",
    value: 4000,
    owner: "Robin Park",
    stage: "lead",
  },
  {
    name: "Premium support",
    company: "Praha Soft",
    value: 18000,
    owner: "Sam Rivera",
    stage: "won",
  },
  {
    name: "Custom integration",
    company: "Atlas",
    value: 33000,
    owner: "Robin Park",
    stage: "lost",
  },
];

export const demoDeals: Deal[] = SEED.map((row, i) => ({
  id: `deal_${6000 + i}`,
  name: row.name,
  company: row.company,
  value: row.value,
  owner: row.owner,
  stage: row.stage,
  createdAt: new Date(2026, 2, 1 + i * 3),
  updatedAt: new Date(2026, 5, 1 + i),
}));
