import { InfoIcon, WarningIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alertsListQuery } from "@/features/alerts/queries";
import {
  type AlertSeverity,
  alertSeverities,
  allAlertsParams,
} from "@/features/alerts/schema";

export const Route = createFileRoute("/_app/fleet/alerts")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(alertsListQuery(allAlertsParams)),
  component: AlertsTimeline,
});

const SEVERITY_TONE: Record<AlertSeverity, string> = {
  info: "bg-muted text-muted-foreground",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  critical: "bg-destructive/10 text-destructive",
};

function AlertsTimeline() {
  const query = useQuery(alertsListQuery(allAlertsParams));
  const alerts = query.data?.rows ?? [];
  const [severity, setSeverity] = useState("");

  const visible = useMemo(
    () => (severity ? alerts.filter((a) => a.severity === severity) : alerts),
    [alerts, severity],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Alerts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recent fleet events, newest first.
          </p>
        </div>
        <Select
          value={severity}
          onValueChange={(value) =>
            setSeverity(value && value !== "all" ? value : "")
          }
        >
          <SelectTrigger className="h-9 w-40">
            <SelectValue placeholder="All severities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            {alertSeverities.map((value) => (
              <SelectItem key={value} value={value}>
                <span className="capitalize">{value}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="max-w-2xl border border-border p-6">
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No alerts.
          </p>
        ) : (
          <ol className="relative flex flex-col gap-5 border-l border-border pl-6">
            {visible.map((alert) => {
              const Icon = alert.severity === "info" ? InfoIcon : WarningIcon;
              return (
                <li key={alert.id} className="relative">
                  <span
                    className={`absolute -left-[33px] flex size-6 items-center justify-center rounded-full ring-4 ring-background ${SEVERITY_TONE[alert.severity]}`}
                  >
                    <Icon className="size-3.5" weight="bold" />
                  </span>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm text-foreground">
                      <span className="font-mono text-xs font-medium">
                        {alert.device}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {alert.message}
                      </span>
                    </p>
                    <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
                      {new Date(alert.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}
