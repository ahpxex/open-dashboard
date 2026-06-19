import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ticketPriorityColorMap,
  ticketPriorityLabelMap,
} from "@/features/tickets/columns";
import { ticketsListQuery, useUpdateTicket } from "@/features/tickets/queries";
import {
  allTicketsParams,
  type Ticket,
  type TicketStatus,
  ticketStatuses,
} from "@/features/tickets/schema";
import { TicketFormDialog } from "@/features/tickets/TicketFormDialog";
import { StatusChip } from "@/infra/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/helpdesk/board")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ticketsListQuery(allTicketsParams)),
  component: TicketsBoard,
});

const COLUMN_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

type DialogState = { mode: "create" | "edit"; ticket?: Ticket } | null;

function TicketsBoard() {
  const query = useQuery(ticketsListQuery(allTicketsParams));
  const updateTicket = useUpdateTicket();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dragging, setDragging] = useState<{
    from: TicketStatus;
    id: string;
  } | null>(null);
  const [overColumn, setOverColumn] = useState<TicketStatus | null>(null);

  const tickets = query.data?.rows ?? [];
  const grouped = useMemo(() => {
    const map: Record<TicketStatus, Ticket[]> = {
      open: [],
      pending: [],
      resolved: [],
      closed: [],
    };
    for (const ticket of tickets) map[ticket.status].push(ticket);
    return map;
  }, [tickets]);

  function handleDrop(to: TicketStatus) {
    setOverColumn(null);
    if (!dragging) return;
    const { from, id } = dragging;
    setDragging(null);
    if (from === to) return;
    updateTicket.mutate({ id, status: to });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Triage board
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag tickets between columns to change status. Click a card to edit.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          New ticket
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {ticketStatuses.map((status) => {
          const cards = grouped[status];
          const isOver = overColumn === status;
          return (
            <div
              key={status}
              className={cn(
                "flex min-w-72 flex-1 flex-col gap-3 border border-border bg-muted/30 p-3 transition-colors",
                isOver && "border-primary bg-primary/5",
              )}
              onDragOver={(e) => {
                e.preventDefault();
                if (overColumn !== status) setOverColumn(status);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setOverColumn((prev) => (prev === status ? null : prev));
                }
              }}
              onDrop={() => handleDrop(status)}
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="font-heading text-sm font-medium">
                  {COLUMN_LABELS[status]}
                </h2>
                <Badge variant="outline">{cards.length}</Badge>
              </div>

              <div className="flex max-h-[32rem] flex-col gap-2 overflow-y-auto">
                {cards.length === 0 ? (
                  <p className="px-1 py-6 text-center text-xs text-muted-foreground">
                    No tickets
                  </p>
                ) : (
                  cards.map((ticket) => (
                    <Card
                      key={ticket.id}
                      size="sm"
                      draggable
                      onDragStart={() =>
                        setDragging({ from: status, id: ticket.id })
                      }
                      onDragEnd={() => {
                        setDragging(null);
                        setOverColumn(null);
                      }}
                      onClick={() => setDialog({ mode: "edit", ticket })}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        dragging?.id === ticket.id && "opacity-50",
                      )}
                    >
                      <CardContent className="flex items-start gap-2">
                        <DotsSixVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {ticket.subject}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <StatusChip
                              status={ticket.priority}
                              colorMap={ticketPriorityColorMap}
                              labelMap={ticketPriorityLabelMap}
                            />
                            <span className="truncate text-xs text-muted-foreground">
                              {ticket.requester}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
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
