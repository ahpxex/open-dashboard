import { createServerFn } from "@tanstack/react-start";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoAlerts } from "./demo-data";
import {
  type Alert,
  type AlertListParams,
  alertListParamsSchema,
} from "./schema";

export const alertsRepository: Repository<Alert, Alert> = memoryRepository<
  Alert,
  Alert
>(demoAlerts, {
  searchFields: ["device", "message"],
  sortFields: ["createdAt"],
  filterFields: ["severity"],
  defaultSort: { field: "createdAt", dir: "desc" },
});

export const listAlerts = createServerFn({ method: "GET" })
  .validator((data: AlertListParams) => alertListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return alertsRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
      filters: data.severity ? { severity: data.severity } : undefined,
    });
  });
