import { z } from "zod";

export type Score = {
  id: string;
  student: string;
  article: string;
  wpm: number;
  accuracy: number;
  date: string;
  createdAt: Date;
  updatedAt: Date;
};

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the format YYYY-MM-DD");

export const scoreInputSchema = z.object({
  student: z.string().min(1, "Student is required"),
  article: z.string().min(1, "Article is required"),
  wpm: z.coerce.number().int().min(0, "Must be ≥ 0"),
  accuracy: z.coerce.number().min(0).max(100, "0–100"),
  date: isoDate,
});
export type ScoreInput = z.infer<typeof scoreInputSchema>;

export const scoreFormSchema = z.object({
  student: z.string().min(1, "Student is required"),
  article: z.string().min(1, "Article is required"),
  wpm: z.number({ message: "Required" }).int().min(0, "Must be ≥ 0"),
  accuracy: z.number({ message: "Required" }).min(0).max(100, "0–100"),
  date: isoDate,
});

/** Partial update — inline cell edits send only the changed field. */
export const scoreUpdateSchema = z.object({
  id: z.string().min(1),
  student: z.string().min(1).optional(),
  article: z.string().min(1).optional(),
  wpm: z.coerce.number().int().min(0).optional(),
  accuracy: z.coerce.number().min(0).max(100).optional(),
  date: isoDate.optional(),
});
export type ScoreUpdate = z.infer<typeof scoreUpdateSchema>;

export const scoreListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(500).default(200),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});
export type ScoreListParams = z.infer<typeof scoreListParamsSchema>;

export const allScoresParams: ScoreListParams = {
  page: 1,
  pageSize: 200,
  search: "",
};
