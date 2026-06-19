import { z } from "zod";

export const ticketStatuses = [
  "open",
  "pending",
  "resolved",
  "closed",
] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export type Ticket = {
  id: string;
  subject: string;
  requester: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ticketInputSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  requester: z.string().min(1, "Requester is required"),
  status: z.enum(ticketStatuses),
  priority: z.enum(ticketPriorities),
  assignee: z.string().min(1, "Assignee is required"),
  description: z.string().optional().default(""),
});
export type TicketInput = z.infer<typeof ticketInputSchema>;

/** Non-coercing form validator: matches the form value types exactly. */
export const ticketFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  requester: z.string().min(1, "Requester is required"),
  status: z.enum(ticketStatuses),
  priority: z.enum(ticketPriorities),
  assignee: z.string().min(1, "Assignee is required"),
  description: z.string(),
});

/** Partial update — the board's drag-and-drop sends only `{ id, status }`. */
export const ticketUpdateSchema = z.object({
  id: z.string().min(1),
  subject: z.string().min(1).optional(),
  requester: z.string().min(1).optional(),
  status: z.enum(ticketStatuses).optional(),
  priority: z.enum(ticketPriorities).optional(),
  assignee: z.string().min(1).optional(),
  description: z.string().optional(),
});
export type TicketUpdate = z.infer<typeof ticketUpdateSchema>;

export const ticketListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  status: z.string().optional().default(""),
  priority: z.string().optional().default(""),
});
export type TicketListParams = z.infer<typeof ticketListParamsSchema>;

/** The board and overview fetch every ticket in one page. */
export const allTicketsParams: TicketListParams = {
  page: 1,
  pageSize: 200,
  search: "",
  status: "",
  priority: "",
};
