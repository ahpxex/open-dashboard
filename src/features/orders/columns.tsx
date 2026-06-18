import type { ColumnDef } from "@tanstack/react-table";
import type { Order } from "@/db/schema";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { OrderStatus } from "./schema";

const statusColorMap: Record<OrderStatus, ChipColor> = {
  active: "success",
  archived: "default",
};

export interface OrderTableContext {
  onEdit: (row: Order) => void;
  onDelete: (row: Order) => void;
}

export function createOrdersColumns(
  context: OrderTableContext,
): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <span className="font-medium">{info.getValue() as string}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as OrderStatus}
          colorMap={statusColorMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(row)}
              onDelete={() => context.onDelete(row)}
            />
          </div>
        );
      },
    },
  ];
}
