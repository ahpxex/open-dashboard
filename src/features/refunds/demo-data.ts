import type { Refund, RefundReason, RefundStatus } from "./schema";

const SEED: {
  customer: string;
  amount: number;
  reason: RefundReason;
  status: RefundStatus;
}[] = [
  {
    customer: "Avery Quinn",
    amount: 49,
    reason: "requested_by_customer",
    status: "pending",
  },
  {
    customer: "Jordan Lee",
    amount: 290,
    reason: "duplicate",
    status: "approved",
  },
  {
    customer: "Priya Nair",
    amount: 19,
    reason: "defective",
    status: "approved",
  },
  {
    customer: "Mateo Rossi",
    amount: 120,
    reason: "fraudulent",
    status: "rejected",
  },
  {
    customer: "Hana Kim",
    amount: 4800,
    reason: "requested_by_customer",
    status: "pending",
  },
  {
    customer: "Diego Alvarez",
    amount: 59,
    reason: "duplicate",
    status: "approved",
  },
  { customer: "Noa Cohen", amount: 35, reason: "defective", status: "pending" },
  {
    customer: "Sofia Marin",
    amount: 12,
    reason: "requested_by_customer",
    status: "rejected",
  },
  {
    customer: "Kenji Tanaka",
    amount: 290,
    reason: "duplicate",
    status: "approved",
  },
  {
    customer: "Amara Okafor",
    amount: 75,
    reason: "defective",
    status: "pending",
  },
  {
    customer: "Lucas Müller",
    amount: 199,
    reason: "fraudulent",
    status: "rejected",
  },
  {
    customer: "Yara Haddad",
    amount: 24,
    reason: "requested_by_customer",
    status: "pending",
  },
  {
    customer: "Elena Petrova",
    amount: 540,
    reason: "duplicate",
    status: "approved",
  },
  {
    customer: "Tomas Novak",
    amount: 89,
    reason: "defective",
    status: "pending",
  },
];

export const demoRefunds: Refund[] = SEED.map((row, i) => ({
  id: `ref_${4000 + i}`,
  orderRef: `ORD-${9100 + i * 7}`,
  customer: row.customer,
  amount: row.amount,
  reason: row.reason,
  status: row.status,
  createdAt: new Date(2026, 3, 1 + i * 2),
  updatedAt: new Date(2026, 4, 1 + i),
}));
