import type { Order, OrderItem } from "@/db/schema";

/**
 * Seed rows for the zero-config in-memory backend (used when `DATABASE_URL` is
 * unset). Only loaded by `memoryRepository` in `server.ts`; ignored once a real
 * Postgres backend is configured. Repo-only — the scaffold base ships without
 * the demo resources.
 *
 * `total` is the sum of line items, in integer minor units (cents).
 */
const at = (iso: string) => new Date(iso);
const sum = (items: OrderItem[]) =>
  items.reduce((acc, it) => acc + it.qty * it.unitPrice, 0);

type Seed = Omit<Order, "total"> & { items: OrderItem[] };

const seed: Seed[] = [
  {
    id: "22222222-2222-4222-8222-000000000001",
    name: "Order #1024",
    customer: "Acme Corp",
    status: "fulfilled",
    items: [
      {
        sku: "AUR-WH-01",
        name: "Aurora Wireless Headphones",
        qty: 12,
        unitPrice: 12900,
      },
      { sku: "AUR-CASE", name: "Aurora Carry Case", qty: 12, unitPrice: 1900 },
    ],
    description: "Net-30, shipped via DHL.",
    createdAt: at("2026-01-03T09:15:00Z"),
    updatedAt: at("2026-01-06T12:00:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000002",
    name: "Order #1025",
    customer: "Globex",
    status: "paid",
    items: [
      {
        sku: "APP-TEE-BLK",
        name: "Essential Tee (Black)",
        qty: 80,
        unitPrice: 1500,
      },
      {
        sku: "APP-HOOD-GRY",
        name: "Heavyweight Hoodie (Grey)",
        qty: 40,
        unitPrice: 4500,
      },
    ],
    description: "Bulk apparel restock.",
    createdAt: at("2026-01-05T13:40:00Z"),
    updatedAt: at("2026-01-05T13:40:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000003",
    name: "Order #1026",
    customer: "Initech",
    status: "fulfilled",
    items: [
      {
        sku: "DSK-STND",
        name: "Standing Desk Converter",
        qty: 6,
        unitPrice: 21900,
      },
    ],
    description: "Completed and shipped.",
    createdAt: at("2026-01-07T08:00:00Z"),
    updatedAt: at("2026-01-09T17:30:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000004",
    name: "Order #1027",
    customer: "Umbrella",
    status: "pending",
    items: [
      { sku: "MON-27-4K", name: '27" 4K Monitor', qty: 10, unitPrice: 38900 },
    ],
    description: "Awaiting payment confirmation.",
    createdAt: at("2026-01-09T11:25:00Z"),
    updatedAt: at("2026-01-09T11:25:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000005",
    name: "Order #1028",
    customer: "Soylent",
    status: "paid",
    items: [
      {
        sku: "KEY-MX-BRN",
        name: "Mechanical Keyboard (Brown)",
        qty: 24,
        unitPrice: 8900,
      },
      { sku: "MSE-ERG", name: "Ergonomic Mouse", qty: 24, unitPrice: 4900 },
    ],
    description: "Recurring monthly equipment order.",
    createdAt: at("2026-01-11T15:10:00Z"),
    updatedAt: at("2026-01-11T15:10:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000006",
    name: "Order #1029",
    customer: "Hooli",
    status: "cancelled",
    items: [
      {
        sku: "AUR-WH-01",
        name: "Aurora Wireless Headphones",
        qty: 5,
        unitPrice: 12900,
      },
    ],
    description: "Cancelled by customer before fulfilment.",
    createdAt: at("2026-01-12T10:45:00Z"),
    updatedAt: at("2026-01-13T09:00:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000007",
    name: "Order #1030",
    customer: "Stark Industries",
    status: "fulfilled",
    items: [
      { sku: "MON-27-4K", name: '27" 4K Monitor', qty: 20, unitPrice: 38900 },
      {
        sku: "DSK-STND",
        name: "Standing Desk Converter",
        qty: 20,
        unitPrice: 21900,
      },
    ],
    description: "New-hire workstation rollout.",
    createdAt: at("2026-01-14T16:20:00Z"),
    updatedAt: at("2026-01-17T11:00:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000008",
    name: "Order #1031",
    customer: "Wayne Enterprises",
    status: "paid",
    items: [
      {
        sku: "CHR-ERG-BLK",
        name: "Ergonomic Chair (Black)",
        qty: 15,
        unitPrice: 32900,
      },
    ],
    description: "Office refit, phase one.",
    createdAt: at("2026-01-16T09:05:00Z"),
    updatedAt: at("2026-01-16T09:05:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000009",
    name: "Order #1032",
    customer: "Wonka Industries",
    status: "refunded",
    items: [
      {
        sku: "APP-HOOD-GRY",
        name: "Heavyweight Hoodie (Grey)",
        qty: 30,
        unitPrice: 4500,
      },
    ],
    description: "Sizing issue — full refund issued.",
    createdAt: at("2026-01-18T14:30:00Z"),
    updatedAt: at("2026-01-20T10:15:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000010",
    name: "Order #1033",
    customer: "Cyberdyne",
    status: "pending",
    items: [
      {
        sku: "KEY-MX-BRN",
        name: "Mechanical Keyboard (Brown)",
        qty: 50,
        unitPrice: 8900,
      },
    ],
    description: "Quote approved, invoice pending.",
    createdAt: at("2026-01-20T08:50:00Z"),
    updatedAt: at("2026-01-20T08:50:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000011",
    name: "Order #1034",
    customer: "Tyrell Corp",
    status: "fulfilled",
    items: [
      {
        sku: "AUR-WH-01",
        name: "Aurora Wireless Headphones",
        qty: 40,
        unitPrice: 12900,
      },
      { sku: "AUR-CASE", name: "Aurora Carry Case", qty: 40, unitPrice: 1900 },
      { sku: "MSE-ERG", name: "Ergonomic Mouse", qty: 40, unitPrice: 4900 },
    ],
    description: "Annual hardware refresh.",
    createdAt: at("2026-01-22T12:10:00Z"),
    updatedAt: at("2026-01-24T16:40:00Z"),
  },
  {
    id: "22222222-2222-4222-8222-000000000012",
    name: "Order #1035",
    customer: "Massive Dynamic",
    status: "paid",
    items: [
      {
        sku: "CHR-ERG-BLK",
        name: "Ergonomic Chair (Black)",
        qty: 8,
        unitPrice: 32900,
      },
      {
        sku: "DSK-STND",
        name: "Standing Desk Converter",
        qty: 8,
        unitPrice: 21900,
      },
    ],
    description: "Executive suite fit-out.",
    createdAt: at("2026-01-24T10:00:00Z"),
    updatedAt: at("2026-01-24T10:00:00Z"),
  },
];

export const demoOrders: Order[] = seed.map((row) => ({
  ...row,
  total: sum(row.items),
}));
