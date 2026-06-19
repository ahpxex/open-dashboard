import type { Contact } from "./schema";

const SEED: { name: string; company: string; title: string }[] = [
  { name: "Avery Quinn", company: "Northwind Labs", title: "VP Engineering" },
  { name: "Jordan Lee", company: "Acme Co", title: "Product Manager" },
  { name: "Priya Nair", company: "Lumen Studio", title: "Founder" },
  { name: "Mateo Rossi", company: "Forge & Co", title: "CTO" },
  { name: "Hana Kim", company: "Bluebird", title: "Head of Ops" },
  { name: "Diego Alvarez", company: "Helio Systems", title: "Engineer" },
  { name: "Noa Cohen", company: "Vertex AI", title: "Data Lead" },
  { name: "Sofia Marin", company: "Tidal", title: "Designer" },
  { name: "Kenji Tanaka", company: "Sakura Tech", title: "CEO" },
  { name: "Amara Okafor", company: "Baobab", title: "COO" },
  { name: "Lucas Müller", company: "Rheinwerk", title: "Procurement" },
  { name: "Yara Haddad", company: "Cedar", title: "Marketing Lead" },
  { name: "Elena Petrova", company: "Aurora", title: "VP Sales" },
  { name: "Tomas Novak", company: "Praha Soft", title: "Engineer" },
  { name: "Fatima Zahra", company: "Atlas", title: "Analyst" },
  { name: "Oliver Bennett", company: "Kingfisher", title: "Owner" },
];

export const demoContacts: Contact[] = SEED.map((row, i) => {
  const handle = row.name.toLowerCase().replace(/[^a-z]+/g, ".");
  const domain = row.company.toLowerCase().replace(/[^a-z]+/g, "");
  return {
    id: `con_${7000 + i}`,
    name: row.name,
    email: `${handle}@${domain}.com`,
    phone: `+1 (555) ${String(100 + i).padStart(3, "0")}-${String(
      2000 + i * 7,
    ).slice(0, 4)}`,
    company: row.company,
    title: row.title,
    createdAt: new Date(2025, 11, 1 + i * 3),
    updatedAt: new Date(2026, 4, 1 + i),
  };
});
