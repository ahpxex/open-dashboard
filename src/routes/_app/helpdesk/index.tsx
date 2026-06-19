import {
  CheckCircleIcon,
  ClockIcon,
  type Icon,
  TimerIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { StatCard, type StatCardProps } from "@/components/charts";
import { buttonVariants } from "@/components/ui/button";
import { ticketsListQuery } from "@/features/tickets/queries";
import {
  allTicketsParams,
  type Ticket,
  type TicketStatus,
} from "@/features/tickets/schema";

export const Route = createFileRoute("/_app/helpdesk/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ticketsListQuery(allTicketsParams)),
  component: HelpdeskOverview,
});

const STATUS_TONE: Record<TicketStatus, string> = {
  open: "bg-primary/10 text-primary",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  resolved: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  closed: "bg-muted text-muted-foreground",
};

const STATUS_ICON: Record<TicketStatus, Icon> = {
  open: WarningIcon,
  pending: ClockIcon,
  resolved: CheckCircleIcon,
  closed: CheckCircleIcon,
};

function HelpdeskOverview() {
  const query = useQuery(ticketsListQuery(allTicketsParams));
  const tickets = query.data?.rows ?? [];

  const recent = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 8),
    [tickets],
  );

  const count = (status: TicketStatus) =>
    tickets.filter((ticket) => ticket.status === status).length;

  const stats: StatCardProps[] = [
    {
      label: "Open",
      value: String(count("open")),
      icon: WarningIcon,
      sub: "Needs attention",
    },
    {
      label: "Pending",
      value: String(count("pending")),
      icon: ClockIcon,
      sub: "Awaiting reply",
    },
    {
      label: "Resolved",
      value: String(count("resolved")),
      icon: CheckCircleIcon,
      sub: "This period",
    },
    {
      label: "Avg first response",
      value: "2.4h",
      icon: TimerIcon,
      sub: "Target: under 4h",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Helpdesk
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Service levels at a glance, plus the latest ticket activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/helpdesk/tickets"
            className={buttonVariants({ variant: "outline" })}
          >
            Open inbox
          </Link>
          <Link to="/helpdesk/board" className={buttonVariants()}>
            Triage board
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="border border-border p-6">
        <h2 className="mb-4 text-base font-semibold">Recent activity</h2>
        <ol className="relative flex flex-col gap-5 border-l border-border pl-6">
          {recent.map((ticket: Ticket) => {
            const EventIcon = STATUS_ICON[ticket.status];
            return (
              <li key={ticket.id} className="relative">
                <span
                  className={`absolute -left-[33px] flex size-6 items-center justify-center rounded-full ring-4 ring-background ${STATUS_TONE[ticket.status]}`}
                >
                  <EventIcon className="size-3.5" weight="bold" />
                </span>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{ticket.requester}</span>{" "}
                    <span className="text-muted-foreground">
                      — {ticket.subject}
                    </span>
                  </p>
                  <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {new Date(ticket.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
