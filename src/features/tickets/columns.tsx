import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionMenu, type ChipColor, StatusChip } from "@/infra/ui";
import { cn } from "@/lib/utils";
import type { Ticket, TicketPriority, TicketStatus } from "./schema";

export const ticketStatusColorMap: Record<TicketStatus, ChipColor> = {
  open: "primary",
  pending: "warning",
  resolved: "success",
  closed: "default",
};

export const ticketStatusLabelMap: Record<TicketStatus, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
  closed: "Closed",
};

export const ticketPriorityColorMap: Record<TicketPriority, ChipColor> = {
  low: "default",
  medium: "secondary",
  high: "warning",
  urgent: "danger",
};

export const ticketPriorityLabelMap: Record<TicketPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export interface TicketsTableContext {
  selectedId?: string;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
}

export function createTicketsColumns(
  context: TicketsTableContext,
): ColumnDef<Ticket>[] {
  return [
    {
      accessorKey: "subject",
      header: "Subject",
      cell: (info) => {
        const ticket = info.row.original;
        const isSelected = ticket.id === context.selectedId;
        return (
          <Link
            to="/helpdesk/tickets/$id"
            params={{ id: ticket.id }}
            search={(prev) => prev}
            className={cn(
              "font-medium hover:underline",
              isSelected && "text-primary",
            )}
          >
            {info.getValue() as string}
          </Link>
        );
      },
    },
    {
      accessorKey: "requester",
      header: "Requester",
      enableSorting: false,
      cell: (info) => (
        <span className="text-muted-foreground">
          {info.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as TicketPriority}
          colorMap={ticketPriorityColorMap}
          labelMap={ticketPriorityLabelMap}
        />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: false,
      cell: (info) => (
        <StatusChip
          status={info.getValue() as TicketStatus}
          colorMap={ticketStatusColorMap}
          labelMap={ticketStatusLabelMap}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (info) => {
        const ticket = info.row.original;
        return (
          <div className="flex justify-end">
            <ActionMenu
              onEdit={() => context.onEdit(ticket)}
              onDelete={() => context.onDelete(ticket)}
            />
          </div>
        );
      },
    },
  ];
}
