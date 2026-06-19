import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import type { Customer, CustomerPlan, CustomerStatus } from "./schema";

export const planColorMap: Record<CustomerPlan, ChipColor> = {
  free: "default",
  pro: "primary",
  scale: "secondary",
};

export const planLabelMap: Record<CustomerPlan, string> = {
  free: "Free",
  pro: "Pro",
  scale: "Scale",
};

export const customerStatusColorMap: Record<CustomerStatus, ChipColor> = {
  trial: "warning",
  active: "success",
  churned: "danger",
};

export const customerStatusLabelMap: Record<CustomerStatus, string> = {
  trial: "Trial",
  active: "Active",
  churned: "Churned",
};

export interface CustomersTableContext {
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

export function createCustomersColumns(
  context: CustomersTableContext,
): ColumnDef<Customer>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: (info) => (
        <Link
          to="/customers/$id"
          params={{ id: info.row.original.id }}
          className="font-medium hover:underline"
        >
          {info.getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: "company",
      header: "Company",
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "plan",
      header: "Plan",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as CustomerPlan}
          colorMap={planColorMap}
          labelMap={planLabelMap}
        />
      ),
    },
    {
      accessorKey: "mrr",
      header: "MRR",
      cell: (info) => (
        <span className="tabular-nums">
          ${(info.getValue() as number).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as CustomerStatus}
          colorMap={customerStatusColorMap}
          labelMap={customerStatusLabelMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const customer = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(customer)}
              onDelete={() => context.onDelete(customer)}
            />
          </div>
        );
      },
    },
  ];
}
