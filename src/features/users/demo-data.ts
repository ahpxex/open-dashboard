import type { User, UserRole, UserStatus } from "./schema";

const NAMES = [
  "Avery Quinn",
  "Jordan Lee",
  "Priya Nair",
  "Mateo Rossi",
  "Hana Kim",
  "Diego Alvarez",
  "Noa Cohen",
  "Liam O'Brien",
  "Sofia Marin",
  "Kenji Tanaka",
  "Amara Okafor",
  "Lucas Müller",
  "Yara Haddad",
  "Elena Petrova",
  "Tomas Novak",
  "Fatima Zahra",
  "Oliver Bennett",
  "Mei Lin",
  "Gabriel Silva",
  "Ingrid Larsen",
];

const roleFor = (i: number): UserRole =>
  i % 7 === 0 ? "admin" : i % 3 === 0 ? "viewer" : "member";

const statusFor = (i: number): UserStatus =>
  i % 9 === 4 ? "suspended" : i % 5 === 0 ? "invited" : "active";

export const demoUsers: User[] = NAMES.map((name, i) => {
  const handle = name.toLowerCase().replace(/[^a-z]+/g, ".");
  return {
    id: `usr_${1000 + i}`,
    name,
    email: `${handle}@taoracle.io`,
    role: roleFor(i),
    status: statusFor(i),
    createdAt: new Date(2026, 0, 2 + i * 4),
    updatedAt: new Date(2026, 3, 1 + i),
  };
});
