import { PencilSimpleIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ticketPriorityColorMap,
  ticketPriorityLabelMap,
  ticketStatusColorMap,
  ticketStatusLabelMap,
} from "@/features/tickets/columns";
import { ticketDetailQuery, useDeleteTicket } from "@/features/tickets/queries";
import { TicketFormDialog } from "@/features/tickets/TicketFormDialog";
import { DescriptionList, StatusChip } from "@/infra/ui";

export const Route = createFileRoute("/_app/helpdesk/tickets/$id")({
  loader: async ({ context, params }) => {
    const ticket = await context.queryClient.ensureQueryData(
      ticketDetailQuery(params.id),
    );
    if (!ticket) throw notFound();
  },
  component: TicketPanel,
});

function TicketPanel() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const remove = useDeleteTicket();
  const [editing, setEditing] = useState(false);

  const query = useQuery(ticketDetailQuery(id));
  const ticket = query.data;

  const close = () =>
    navigate({ to: "/helpdesk/tickets", search: (prev) => prev });

  async function onDelete() {
    if (!ticket) return;
    const ok = await confirm({
      title: "Delete this ticket?",
      description: ticket.subject,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) {
      await remove.mutateAsync(ticket.id);
      close();
    }
  }

  return (
    <aside className="w-full shrink-0 border border-border p-5 lg:w-96">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-2">
          {ticket ? (
            <>
              <h2 className="text-base font-semibold">{ticket.subject}</h2>
              <div className="flex items-center gap-2">
                <StatusChip
                  status={ticket.status}
                  colorMap={ticketStatusColorMap}
                  labelMap={ticketStatusLabelMap}
                />
                <StatusChip
                  status={ticket.priority}
                  colorMap={ticketPriorityColorMap}
                  labelMap={ticketPriorityLabelMap}
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

      {ticket ? (
        <div className="mt-5 flex flex-col gap-5">
          <DescriptionList
            columns={1}
            items={[
              { label: "Requester", value: ticket.requester },
              { label: "Assignee", value: ticket.assignee },
              {
                label: "Opened",
                value: new Date(ticket.createdAt).toLocaleString(),
              },
              {
                label: "Last update",
                value: new Date(ticket.updatedAt).toLocaleString(),
              },
              {
                label: "Description",
                value: ticket.description || "—",
                full: true,
              },
            ]}
          />

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

      <TicketFormDialog
        open={editing}
        mode="edit"
        ticket={ticket ?? undefined}
        onOpenChange={setEditing}
      />
    </aside>
  );
}
