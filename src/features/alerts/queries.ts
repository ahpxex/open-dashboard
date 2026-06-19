import { queryOptions } from "@tanstack/react-query";
import type { AlertListParams } from "./schema";
import { listAlerts } from "./server";

export const alertKeys = {
  all: ["alerts"] as const,
  lists: () => [...alertKeys.all, "list"] as const,
  list: (params: AlertListParams) => [...alertKeys.lists(), params] as const,
};

export function alertsListQuery(params: AlertListParams) {
  return queryOptions({
    queryKey: alertKeys.list(params),
    queryFn: () => listAlerts({ data: params }),
  });
}
