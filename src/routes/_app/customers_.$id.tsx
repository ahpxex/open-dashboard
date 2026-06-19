import {
  CaretRightIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  notFound,
  useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerFormDialog } from "@/features/customers/CustomerFormDialog";
import {
  customerStatusColorMap,
  customerStatusLabelMap,
  planColorMap,
  planLabelMap,
} from "@/features/customers/columns";
import {
  customerDetailQuery,
  useDeleteCustomer,
} from "@/features/customers/queries";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/customers_/$id")({
  loader: async ({ context, params }) => {
    const customer = await context.queryClient.ensureQueryData(
      customerDetailQuery(params.id),
    );
    if (!customer) throw notFound();
    return { customer };
  },
  component: CustomerDetailPage,
});

function CustomerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const deleteCustomer = useDeleteCustomer();
  const [editing, setEditing] = useState(false);

  const query = useQuery(customerDetailQuery(id));
  const customer = query.data;

  if (query.isLoading && !customer) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">Customer not found</h1>
        <Link to="/customers" className="text-sm underline">
          Back to customers
        </Link>
      </div>
    );
  }

  async function onDelete() {
    if (!customer) return;
    const ok = await confirm({
      title: `Delete “${customer.name}”?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await deleteCustomer.mutateAsync(customer.id);
      navigate({ to: "/customers" });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/customers" className="hover:text-foreground hover:underline">
          Customers
        </Link>
        <CaretRightIcon size={12} />
        <span className="text-foreground">{customer.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {customer.name}
            </h1>
            <StatusChip
              status={customer.status}
              colorMap={customerStatusColorMap}
              labelMap={customerStatusLabelMap}
            />
          </div>
          <p className="text-xs text-muted-foreground">{customer.company}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)}>
            <PencilSimpleIcon size={16} />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={deleteCustomer.isPending}
          >
            <TrashIcon size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="border border-border p-6">
        <DescriptionList
          columns={3}
          items={[
            { label: "Company", value: customer.company },
            { label: "Email", value: customer.email },
            {
              label: "Plan",
              value: (
                <StatusChip
                  status={customer.plan}
                  colorMap={planColorMap}
                  labelMap={planLabelMap}
                />
              ),
            },
            { label: "MRR", value: `$${customer.mrr.toLocaleString()}` },
            {
              label: "Status",
              value: (
                <StatusChip
                  status={customer.status}
                  colorMap={customerStatusColorMap}
                  labelMap={customerStatusLabelMap}
                />
              ),
            },
            {
              label: "Customer since",
              value: new Date(customer.createdAt).toLocaleDateString(),
            },
          ]}
        />
      </div>

      <CustomerFormDialog
        open={editing}
        mode="edit"
        customer={customer}
        onOpenChange={setEditing}
      />
    </div>
  );
}
