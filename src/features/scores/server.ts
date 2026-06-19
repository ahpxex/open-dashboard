import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoScores } from "./demo-data";
import {
  type Score,
  type ScoreInput,
  type ScoreListParams,
  scoreInputSchema,
  scoreListParamsSchema,
  scoreUpdateSchema,
} from "./schema";

export const scoresRepository: Repository<Score, ScoreInput> = memoryRepository<
  Score,
  ScoreInput
>(demoScores, {
  searchFields: ["student", "article"],
  sortFields: ["wpm", "accuracy", "date"],
  defaultSort: { field: "wpm", dir: "desc" },
  createdAtKey: "createdAt",
  updatedAtKey: "updatedAt",
});

export const listScores = createServerFn({ method: "GET" })
  .validator((data: ScoreListParams) => scoreListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return scoresRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
    });
  });

export const createScore = createServerFn({ method: "POST" })
  .validator((data: unknown) => scoreInputSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return scoresRepository.create(data);
  });

export const updateScore = createServerFn({ method: "POST" })
  .validator((data: unknown) => scoreUpdateSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    const { id, ...values } = data;
    return scoresRepository.update(id, values);
  });

export const deleteScore = createServerFn({ method: "POST" })
  .validator((id: string) => z.string().min(1).parse(id))
  .handler(async ({ data: id }) => {
    await requireUser();
    await scoresRepository.remove(id);
    return { id };
  });
