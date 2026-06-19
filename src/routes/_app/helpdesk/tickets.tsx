import { PlusIcon } from "@phosphor-icons/react";
import {
  createFileRoute,
  Outlet,
  useChildMatches,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { createTicketsColumns } from "@/features/tickets/columns";
import { ticketsFilters, ticketsTableConfig } from "@/features/tickets/config";
import { ticketsListQuery, useDeleteTicket } from "@/features/tickets/queries";
import { type Ticket, ticketListParamsSchema } from "@/features/tickets/schema";
import { TicketFormDialog } from "@/features/tickets/TicketFormDialog";
import { useResourceList } from "@/infra/list";
import { DataTable } from "@/infra/table";

export const Route = createFileRoute("/_app/helpdesk/tickets")({
  validateSearch: ticketListParamsSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(ticketsListQuery(deps)),
  component: TicketsInbox,
});

type DialogState = { mode: "create" | "edit"; ticket?: Ticket } | null;

function TicketsInbox() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { table, rows, total, isLoading, refetch } = useResourceList<
    typeof search,
    Ticket
  >(search, navigate, ticketsListQuery);
  const [dialog, setDialog] = useState<DialogState>(null);

  const remove = useDeleteTicket();
  const confirm = useConfirm();

  const childMatches = useChildMatches();
  const selectedId = (childMatches[0]?.params as { id?: string } | undefined)
    ?.id;

  const columns = useMemo(
    () =>
      createTicketsColumns({
        selectedId,
        onEdit: (ticket) => setDialog({ mode: "edit", ticket }),
        onDelete: async (ticket) => {
          const ok = await confirm({
            title: "Delete this ticket?",
            description: ticket.subject,
            confirmLabel: "Delete",
            destructive: true,
          });
          if (ok) remove.mutate(ticket.id);
        },
      }),
    [remove, confirm, selectedId],
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Inbox
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Select a ticket to open it in the side panel — the list stays mounted
          and the selection lives in the URL.
        </p>
      </div>

      <div className="flex flex-1 items-start gap-4">
        <div className="min-w-0 flex-1">
          <DataTable
            columns={columns}
            data={rows}
            total={total}
            isLoading={isLoading}
            searchValue={search.search}
            onSearchChange={table.setSearch}
            searchPlaceholder={ticketsTableConfig.searchPlaceholder}
            filters={ticketsFilters}
            filterValues={{ status: search.status, priority: search.priority }}
            onFilterChange={table.setFilter}
            onRefresh={refetch}
            sorting={table.sorting}
            onSortingChange={table.onSortingChange}
            page={search.page}
            pageSize={search.pageSize}
            pageSizeOptions={ticketsTableConfig.pageSizeOptions}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
            emptyMessage={ticketsTableConfig.emptyMessage}
            toolbarActions={
              <Button onClick={() => setDialog({ mode: "create" })}>
                <PlusIcon size={16} />
                New ticket
              </Button>
            }
          />
        </div>

        <Outlet />
      </div>

      <TicketFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        ticket={dialog?.ticket}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
