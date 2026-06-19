import type { Company, CompanyIndustry } from "./schema";

const SEED: {
  name: string;
  industry: CompanyIndustry;
  size: number;
  location: string;
}[] = [
  {
    name: "Northwind Labs",
    industry: "saas",
    size: 320,
    location: "Austin, US",
  },
  { name: "Acme Co", industry: "ecommerce", size: 85, location: "Chicago, US" },
  { name: "Lumen Studio", industry: "media", size: 24, location: "Lisbon, PT" },
  { name: "Bluebird", industry: "fintech", size: 540, location: "London, UK" },
  { name: "Vertex AI", industry: "saas", size: 210, location: "Berlin, DE" },
  {
    name: "Helio Systems",
    industry: "healthcare",
    size: 130,
    location: "Toronto, CA",
  },
  { name: "Aurora", industry: "fintech", size: 760, location: "Singapore, SG" },
  { name: "Tidal", industry: "media", size: 42, location: "Amsterdam, NL" },
  { name: "Sakura Tech", industry: "saas", size: 95, location: "Tokyo, JP" },
  { name: "Baobab", industry: "ecommerce", size: 180, location: "Nairobi, KE" },
  { name: "Praha Soft", industry: "saas", size: 60, location: "Prague, CZ" },
  { name: "Atlas", industry: "healthcare", size: 410, location: "Madrid, ES" },
];

export const demoCompanies: Company[] = SEED.map((row, i) => ({
  id: `co_${8000 + i}`,
  name: row.name,
  industry: row.industry,
  size: row.size,
  location: row.location,
  website: `${row.name.toLowerCase().replace(/[^a-z]+/g, "")}.com`,
  createdAt: new Date(2025, 8, 1 + i * 5),
  updatedAt: new Date(2026, 4, 1 + i),
}));
