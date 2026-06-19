import { z } from "zod";

export const alertSeverities = ["info", "warning", "critical"] as const;
export type AlertSeverity = (typeof alertSeverities)[number];

export type Alert = {
  id: string;
  device: string;
  message: string;
  severity: AlertSeverity;
  createdAt: Date;
};

export const alertListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  severity: z.string().optional().default(""),
});
export type AlertListParams = z.infer<typeof alertListParamsSchema>;

export const allAlertsParams: AlertListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  severity: "",
};
