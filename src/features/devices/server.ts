import { createServerFn } from "@tanstack/react-start";
import { memoryRepository } from "@/infra/data/memory-repository";
import type { Repository } from "@/infra/data/repository";
import { requireUser } from "@/lib/require-user";
import { demoDevices } from "./demo-data";
import {
  type Device,
  type DeviceListParams,
  deviceListParamsSchema,
} from "./schema";

/**
 * Devices are read-only here (a monitoring fleet is provisioned elsewhere). The
 * list returns the whole fleet in one page so the route can virtualize it
 * client-side.
 */
export const devicesRepository: Repository<Device, Device> = memoryRepository<
  Device,
  Device
>(demoDevices, {
  searchFields: ["name", "model", "location"],
  sortFields: ["name", "uptime"],
  filterFields: ["status"],
  defaultSort: { field: "name", dir: "asc" },
});

export const listDevices = createServerFn({ method: "GET" })
  .validator((data: DeviceListParams) => deviceListParamsSchema.parse(data))
  .handler(async ({ data }) => {
    await requireUser();
    return devicesRepository.list({
      page: data.page,
      pageSize: data.pageSize,
      search: data.search,
      sortBy: data.sortBy,
      sortDir: data.sortDir,
      filters: data.status ? { status: data.status } : undefined,
    });
  });
