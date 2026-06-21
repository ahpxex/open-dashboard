import { PencilSimpleIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrderItem } from "@/db/schema";
import { statusColorMap } from "@/features/orders/columns";
import { OrderFormDialog } from "@/features/orders/OrderFormDialog";
import { orderDetailQuery, useDeleteOrder } from "@/features/orders/queries";
import type { OrderStatus } from "@/features/orders/schema";
import { DescriptionList, StatusChip } from "@/infra/ui";
import { formatMoney } from "@/lib/format";

export const Route = createFileRoute("/_app/orders/$id")({
  loader: async ({ context, params }) => {
    const order = await context.queryClient.ensureQueryData(
      orderDetailQuery(params.id),
    );
    if (!order) throw notFound();
  },
  component: OrderPanel,
  // Keep the master list mounted when the id is stale: render the not-found
  // state inside the panel chrome instead of falling through to the app-wide
  // default not-found component (which would replace the whole split layout).
  notFoundComponent: OrderNotFound,
});

/** Panel shell — the bordered `<aside>` with a close button, shared by the
 * record panel and its not-found state so the master list stays put. */
function PanelShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const close = () => navigate({ to: "/orders", search: (prev) => prev });
  return (
    <aside className="w-full shrink-0 border border-border p-5 lg:w-96">
      <div className="flex items-start justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={close}
          aria-label="Close panel"
        >
          <XIcon size={16} />
        </Button>
      </div>
      {children}
    </aside>
  );
}

function OrderNotFound() {
  return (
    <PanelShell>
      <div className="-mt-4 flex flex-col gap-1">
        <h2 className="text-base font-semibold">Order not found</h2>
        <p className="text-sm text-muted-foreground">
          This order may have been deleted. Pick another from the list.
        </p>
      </div>
    </PanelShell>
  );
}

function OrderPanel() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const remove = useDeleteOrder();
  const [editing, setEditing] = useState(false);

  const query = useQuery(orderDetailQuery(id));
  const order = query.data;

  const close = () => navigate({ to: "/orders", search: (prev) => prev });

  async function onDelete() {
    if (!order) return;
    const ok = await confirm({
      title: `Delete “${order.name}”?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await remove.mutateAsync(order.id);
      close();
    }
  }

  return (
    <aside className="w-full shrink-0 border border-border p-5 lg:w-96">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          {order ? (
            <>
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold">
                  {order.name}
                </h2>
                <StatusChip
                  status={order.status as OrderStatus}
                  colorMap={statusColorMap}
                />
              </div>
            </>
          ) : (
            <Skeleton className="h-5 w-32" />
          )}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={close}
          aria-label="Close panel"
        >
          <XIcon size={16} />
        </Button>
      </div>

      {order ? (
        <div className="mt-5 flex flex-col gap-5">
          <DescriptionList
            columns={1}
            items={[
              { label: "Customer", value: order.customer || "—" },
              { label: "Total", value: formatMoney(order.total) },
              {
                label: "Created",
                value: new Date(order.createdAt).toLocaleString(),
              },
              {
                label: "Updated",
                value: new Date(order.updatedAt).toLocaleString(),
              },
              {
                label: "Description",
                value: order.description || "—",
                full: true,
              },
            ]}
          />

          <OrderLineItems items={order.items ?? []} total={order.total} />

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <PencilSimpleIcon size={16} />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={remove.isPending}
            >
              <TrashIcon size={16} />
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <Skeleton className="mt-5 h-32 w-full" />
      )}

      <OrderFormDialog
        open={editing}
        mode="edit"
        row={order ?? undefined}
        onOpenChange={setEditing}
      />
    </aside>
  );
}

/** Compact line-items table with a total row; empty state when there are none. */
function OrderLineItems({
  items,
  total,
}: {
  items: OrderItem[];
  total: number;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No line items on this order.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Line items
      </h3>
      <div className="border border-border">
        <table className="w-full text-sm">
          <tbody>
            {items.map((it) => (
              <tr key={it.sku} className="border-b border-border last:border-0">
                <td className="px-3 py-2">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {it.sku} · {it.qty} × {formatMoney(it.unitPrice)}
                  </div>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatMoney(it.qty * it.unitPrice)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border">
              <td className="px-3 py-2 text-right font-medium">Total</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">
                {formatMoney(total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
