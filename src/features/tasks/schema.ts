import { z } from "zod";

export const taskStatuses = ["backlog", "todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const taskPriorities = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof taskPriorities)[number];

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  createdAt: Date;
  updatedAt: Date;
};

export const taskInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  status: z.enum(taskStatuses),
  priority: z.enum(taskPriorities),
  assignee: z.string().min(1, "Assignee is required"),
});
export type TaskInput = z.infer<typeof taskInputSchema>;

/** Partial update — drag-and-drop sends only `{ id, status }`. */
export const taskUpdateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  assignee: z.string().min(1).optional(),
});
export type TaskUpdate = z.infer<typeof taskUpdateSchema>;

export const taskListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type TaskListParams = z.infer<typeof taskListParamsSchema>;

/** The board fetches every task in one page and groups client-side. */
export const allTasksParams: TaskListParams = {
  page: 1,
  pageSize: 200,
  search: "",
};
