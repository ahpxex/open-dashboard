import { queryOptions } from "@tanstack/react-query";
import type { DeviceListParams } from "./schema";
import { listDevices } from "./server";

export const deviceKeys = {
  all: ["devices"] as const,
  lists: () => [...deviceKeys.all, "list"] as const,
  list: (params: DeviceListParams) => [...deviceKeys.lists(), params] as const,
};

export function devicesListQuery(params: DeviceListParams) {
  return queryOptions({
    queryKey: deviceKeys.list(params),
    queryFn: () => listDevices({ data: params }),
  });
}
