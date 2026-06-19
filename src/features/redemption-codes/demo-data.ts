import type { RedemptionCode, RedemptionCodeStatus } from "./schema";

const SEED: {
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  status: RedemptionCodeStatus;
}[] = [
  {
    code: "WELCOME10",
    discountPercent: 10,
    maxUses: 1000,
    usedCount: 642,
    status: "active",
  },
  {
    code: "LAUNCH25",
    discountPercent: 25,
    maxUses: 500,
    usedCount: 500,
    status: "expired",
  },
  {
    code: "BLACKFRIDAY",
    discountPercent: 40,
    maxUses: 2000,
    usedCount: 1180,
    status: "active",
  },
  {
    code: "CREATOR15",
    discountPercent: 15,
    maxUses: 300,
    usedCount: 87,
    status: "active",
  },
  {
    code: "WINBACK20",
    discountPercent: 20,
    maxUses: 250,
    usedCount: 0,
    status: "paused",
  },
  {
    code: "STUDENT50",
    discountPercent: 50,
    maxUses: 400,
    usedCount: 233,
    status: "active",
  },
  {
    code: "PARTNER30",
    discountPercent: 30,
    maxUses: 150,
    usedCount: 41,
    status: "active",
  },
  {
    code: "EARLYBIRD",
    discountPercent: 35,
    maxUses: 100,
    usedCount: 100,
    status: "expired",
  },
  {
    code: "SUMMER12",
    discountPercent: 12,
    maxUses: 800,
    usedCount: 318,
    status: "active",
  },
  {
    code: "TRIALEXT",
    discountPercent: 0,
    maxUses: 200,
    usedCount: 64,
    status: "paused",
  },
  {
    code: "VIP5",
    discountPercent: 5,
    maxUses: 50,
    usedCount: 12,
    status: "active",
  },
  {
    code: "REFERRAL10",
    discountPercent: 10,
    maxUses: 5000,
    usedCount: 2741,
    status: "active",
  },
];

export const demoRedemptionCodes: RedemptionCode[] = SEED.map((row, i) => ({
  id: `code_${200 + i}`,
  ...row,
  createdAt: new Date(2026, 1, 1 + i * 5),
  updatedAt: new Date(2026, 4, 1 + i),
}));
