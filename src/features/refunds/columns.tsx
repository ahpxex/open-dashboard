import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { Refund, RefundReason, RefundStatus } from "./schema";

export const refundStatusColorMap: Record<RefundStatus, ChipColor> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

export const refundStatusLabelMap: Record<RefundStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

export const refundReasonLabelMap: Record<RefundReason, string> = {
  duplicate: "Duplicate",
  fraudulent: "Fraudulent",
  requested_by_customer: "Requested",
  defective: "Defective",
};

export interface RefundsTableContext {
  onEdit: (refund: Refund) => void;
  onDelete: (refund: Refund) => void;
}

export function createRefundsColumns(
  context: RefundsTableContext,
): ColumnDef<Refund>[] {
  return [
    {
      accessorKey: "orderRef",
      header: "Order",
      enableSorting: false,
      cell: (info) => (
        <span className="font-mono text-xs font-medium">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer",
      enableSorting: false,
      cell: (info) => info.getValue() as string,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: (info) => (
        <span className="tabular-nums">
          ${(info.getValue() as number).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground">
          {refundReasonLabelMap[info.getValue() as RefundReason]}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as RefundStatus}
          colorMap={refundStatusColorMap}
          labelMap={refundStatusLabelMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const refund = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(refund)}
              onDelete={() => context.onDelete(refund)}
            />
          </div>
        );
      },
    },
  ];
}
