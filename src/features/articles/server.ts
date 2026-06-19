import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoArticles } from "./demo-data";
import {
  type Article,
  type ArticleInput,
  type ArticleListParams,
  articleInputSchema,
  articleListParamsSchema,
  articleUpdateSchema,
} from "./schema";

export const articlesRepository: Repository<Article, ArticleInput> =
  memoryRepository<Article, ArticleInput>(demoArticles, {
    searchFields: ["title", "author"],
    sortFields: ["title", "wordCount", "createdAt"],
    filterFields: ["difficulty", "status"],
    defaultSort: { field: "createdAt", dir: "desc" },
    createdAtKey: "createdAt",
    updatedAtKey: "updatedAt",
  });

function toListParams(data: ArticleListParams) {
  const filters: Record<string, string> = {};
  if (data.difficulty) filters.difficulty = data.difficulty;
  if (data.status) filters.status = data.status;
  return {
    page: data.page,
    pageSize: data.pageSize,
    search: data.search,
    sortBy: data.sortBy,
    sortDir: data.sortDir,
    filters: Object.keys(filters).length ? filters : undefined,
  };
}

export const listArticles = createServerFn({ method: "GET" })
  .validator((data: ArticleListParams) => articleListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return articlesRepository.list(toListParams(data));
  });

export const createArticle = createServerFn({ method: "POST" })
  .validator((data: unknown) => articleInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return articlesRepository.create(data);
  });

export const updateArticle = createServerFn({ method: "POST" })
  .validator((data: unknown) => articleUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return articlesRepository.update(id, values);
  });

export const deleteArticle = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await articlesRepository.remove(id);
    return { id };
  });
