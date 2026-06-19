import type { LeaveRequest, LeaveStatus, LeaveType } from "./schema";

const SEED: {
  employee: string;
  type: LeaveType;
  day: number;
  status: LeaveStatus;
}[] = [
  { employee: "Diego Alvarez", type: "vacation", day: 3, status: "approved" },
  { employee: "Priya Nair", type: "personal", day: 5, status: "approved" },
  { employee: "Hana Kim", type: "sick", day: 9, status: "approved" },
  { employee: "Sofia Marin", type: "vacation", day: 12, status: "pending" },
  { employee: "Jordan Lee", type: "vacation", day: 12, status: "approved" },
  { employee: "Lucas Müller", type: "personal", day: 16, status: "pending" },
  { employee: "Noa Cohen", type: "sick", day: 18, status: "approved" },
  { employee: "Yara Haddad", type: "vacation", day: 22, status: "pending" },
  { employee: "Tomas Novak", type: "vacation", day: 24, status: "rejected" },
  { employee: "Amara Okafor", type: "personal", day: 26, status: "approved" },
];

export const demoLeaveRequests: LeaveRequest[] = SEED.map((row, i) => ({
  id: `lv_${9000 + i}`,
  employee: row.employee,
  type: row.type,
  date: `2026-06-${String(row.day).padStart(2, "0")}`,
  status: row.status,
  createdAt: new Date(2026, 4, 1 + i),
  updatedAt: new Date(2026, 4, 2 + i),
}));
