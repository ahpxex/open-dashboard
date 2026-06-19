import { z } from "zod";

export const leaveTypes = ["vacation", "sick", "personal"] as const;
export type LeaveType = (typeof leaveTypes)[number];

export const leaveStatuses = ["pending", "approved", "rejected"] as const;
export type LeaveStatus = (typeof leaveStatuses)[number];

export type LeaveRequest = {
  id: string;
  employee: string;
  type: LeaveType;
  /** ISO date, `YYYY-MM-DD`. Stored as a string so it round-trips cleanly. */
  date: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");

export const leaveInputSchema = z.object({
  employee: z.string().min(1, "Employee is required"),
  type: z.enum(leaveTypes),
  date: isoDate,
  status: z.enum(leaveStatuses),
});
export type LeaveInput = z.infer<typeof leaveInputSchema>;

export const leaveUpdateSchema = leaveInputSchema.extend({
  id: z.string().min(1),
});
export type LeaveUpdate = z.infer<typeof leaveUpdateSchema>;

export const leaveListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type LeaveListParams = z.infer<typeof leaveListParamsSchema>;

export const allLeaveParams: LeaveListParams = {
  page: 1,
  pageSize: 200,
  search: "",
};
