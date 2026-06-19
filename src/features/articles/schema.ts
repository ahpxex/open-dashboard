import { z } from "zod";

export const articleDifficulties = ["easy", "medium", "hard"] as const;
export type ArticleDifficulty = (typeof articleDifficulties)[number];

export const articleStatuses = ["draft", "published", "archived"] as const;
export type ArticleStatus = (typeof articleStatuses)[number];

export type Article = {
  id: string;
  title: string;
  author: string;
  wordCount: number;
  difficulty: ArticleDifficulty;
  status: ArticleStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const articleInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  wordCount: z.coerce.number().int().min(1, "Word count must be ≥ 1"),
  difficulty: z.enum(articleDifficulties),
  status: z.enum(articleStatuses),
});
export type ArticleInput = z.infer<typeof articleInputSchema>;

export const articleFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  wordCount: z
    .number({ message: "Word count is required" })
    .int()
    .min(1, "Word count must be ≥ 1"),
  difficulty: z.enum(articleDifficulties),
  status: z.enum(articleStatuses),
});

export const articleUpdateSchema = articleInputSchema.extend({
  id: z.string().min(1),
});
export type ArticleUpdate = z.infer<typeof articleUpdateSchema>;

export const articleListParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  difficulty: z.string().optional().default(""),
  status: z.string().optional().default(""),
});
export type ArticleListParams = z.infer<typeof articleListParamsSchema>;
