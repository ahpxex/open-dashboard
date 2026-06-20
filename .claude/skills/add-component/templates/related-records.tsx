import { CaretRightIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { RelatedList } from "@/components/data/RelatedList";
import { Badge } from "@/components/ui/badge";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/gallery/related-records")({
  component: RelatedRecordsDemo,
});

type OrderStatus = "fulfilled" | "processing" | "refunded";
const orderColors: Record<OrderStatus, "success" | "warning" | "danger"> = {
  fulfilled: "success",
  processing: "warning",
  refunded: "danger",
};

type InvoiceStatus = "paid" | "open" | "overdue";
const invoiceColors: Record<InvoiceStatus, "success" | "secondary" | "danger"> =
  {
    paid: "success",
    open: "secondary",
    overdue: "danger",
  };

type Order = {
  id: string;
  date: string;
  items: number;
  total: string;
  status: OrderStatus;
};
type Invoice = {
  id: string;
  issued: string;
  due: string;
  amount: string;
  status: InvoiceStatus;
};

// Local, parent-scoped data — in a real page these come from child list queries
// filtered by the parent record's id (see the add-related-records skill).
const ORDERS: Order[] = [
  {
    id: "ORD-2048",
    date: "2026-05-14",
    items: 3,
    total: "$184.00",
    status: "fulfilled",
  },
  {
    id: "ORD-2031",
    date: "2026-05-02",
    items: 1,
    total: "$49.00",
    status: "processing",
  },
  {
    id: "ORD-1997",
    date: "2026-04-21",
    items: 5,
    total: "$312.50",
    status: "fulfilled",
  },
  {
    id: "ORD-1960",
    date: "2026-04-08",
    items: 2,
    total: "$98.00",
    status: "refunded",
  },
];

const INVOICES: Invoice[] = [
  {
    id: "INV-0912",
    issued: "2026-05-14",
    due: "2026-06-13",
    amount: "$184.00",
    status: "paid",
  },
  {
    id: "INV-0904",
    issued: "2026-05-02",
    due: "2026-06-01",
    amount: "$49.00",
    status: "open",
  },
  {
    id: "INV-0888",
    issued: "2026-04-08",
    due: "2026-05-08",
    amount: "$98.00",
    status: "overdue",
  },
];

/**
 * Gallery demo: one parent record (a customer) with its related children
 * inline. A header + a DescriptionList summary, then two `RelatedList`s —
 * Orders and Invoices — scoped to this customer, each with status chips and a
 * "View all" link. Complements add-master-detail (list + panel) and
 * add-record-tabs (tabs): here it is one record and its children on one page.
 */
function RelatedRecordsDemo() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Record with related lists
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A parent record header and summary, followed by its one-to-many
          children rendered inline as compact related lists.
        </p>
      </div>

      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Customers</span>
        <CaretRightIcon size={12} />
        <span className="text-foreground">Acme Corporation</span>
      </nav>

      <div className="flex flex-col gap-4 border border-border p-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight">
            Acme Corporation
          </h2>
          <Badge
            variant="outline"
            className="border-transparent bg-green-500/15 text-green-700 dark:text-green-400"
          >
            Active
          </Badge>
        </div>
        <DescriptionList
          columns={3}
          items={[
            { label: "Primary contact", value: "Dana Whitfield" },
            { label: "Email", value: "billing@acme.example" },
            { label: "Plan", value: "Enterprise" },
            { label: "Lifetime value", value: "$18,420.00" },
            { label: "Open balance", value: "$147.00" },
            { label: "Customer since", value: "2024-02-11" },
          ]}
        />
      </div>

      <RelatedList<Order>
        title="Orders"
        rows={ORDERS}
        rowKey={(o) => o.id}
        viewAll={{ to: "/gallery/related-records" }}
        columns={[
          {
            header: "Order",
            cell: (o) => <span className="font-mono">{o.id}</span>,
          },
          {
            header: "Date",
            cell: (o) => (
              <span className="text-muted-foreground">{o.date}</span>
            ),
          },
          { header: "Items", align: "right", cell: (o) => o.items },
          {
            header: "Total",
            align: "right",
            cell: (o) => <span className="font-medium">{o.total}</span>,
          },
          {
            header: "Status",
            cell: (o) => (
              <StatusChip status={o.status} colorMap={orderColors} />
            ),
          },
        ]}
        emptyMessage="No orders for this customer yet."
      />

      <RelatedList<Invoice>
        title="Invoices"
        rows={INVOICES}
        rowKey={(i) => i.id}
        viewAll={{ to: "/gallery/related-records" }}
        columns={[
          {
            header: "Invoice",
            cell: (i) => <span className="font-mono">{i.id}</span>,
          },
          {
            header: "Issued",
            cell: (i) => (
              <span className="text-muted-foreground">{i.issued}</span>
            ),
          },
          {
            header: "Due",
            cell: (i) => <span className="text-muted-foreground">{i.due}</span>,
          },
          {
            header: "Amount",
            align: "right",
            cell: (i) => <span className="font-medium">{i.amount}</span>,
          },
          {
            header: "Status",
            cell: (i) => (
              <StatusChip status={i.status} colorMap={invoiceColors} />
            ),
          },
        ]}
        emptyMessage="No invoices for this customer yet."
      />
    </div>
  );
}
