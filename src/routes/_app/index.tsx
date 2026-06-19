import {
  CurrencyDollarIcon,
  ListChecksIcon,
  TicketIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AreaChart,
  BarChart,
  CHART_PRIMARY,
  CHART_SECONDARY,
  ChartCard,
  PieChart,
  StatCard,
  type StatCardProps,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  categoryData,
  monthlyRevenueData,
  trafficSourceData,
} from "@/lib/dashboard/chart-data";

export const Route = createFileRoute("/_app/")({
  component: TaoracleOverview,
});

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";

const STATS: StatCardProps[] = [
  {
    label: "Total Users",
    value: "2,847",
    icon: UsersIcon,
    trend: { value: "12%", up: true },
    progress: 71,
    sub: "71% of quarter target",
  },
  {
    label: "Monthly Revenue",
    value: "$48,250",
    icon: CurrencyDollarIcon,
    trend: { value: "8%", up: true },
    progress: 78,
    sub: "78% of monthly target",
  },
  {
    label: "Active Tasks",
    value: "37",
    icon: ListChecksIcon,
    trend: { value: "6", up: true },
    progress: 48,
    sub: "9 due this week",
  },
  {
    label: "Codes Redeemed",
    value: "6,432",
    icon: TicketIcon,
    trend: { value: "18%", up: true },
    progress: 64,
    sub: "Across 12 campaigns",
  },
];

const ACTIVITY = [
  {
    user: "Avery Quinn",
    action: "Upgraded to the Scale plan",
    time: "2 min ago",
  },
  { user: "Jordan Lee", action: "Redeemed code LAUNCH25", time: "18 min ago" },
  { user: "Priya Nair", action: "Invited 3 teammates", time: "1 hour ago" },
  {
    user: "Mateo Rossi",
    action: "Closed task “SSO enforcement”",
    time: "3 hours ago",
  },
];

const QUICK_ACTIONS = [
  { label: "Manage users", to: "/taoracle/users" },
  { label: "Create a code", to: "/taoracle/affiliate" },
  { label: "Open task board", to: "/taoracle/tasks" },
  { label: "Write a post", to: "/posts" },
];

function TaoracleOverview() {
  const { user } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            taoracle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/taoracle/users"
            className={buttonVariants({ variant: "outline" })}
          >
            View users
          </Link>
          <Link to="/taoracle/affiliate" className={buttonVariants()}>
            New code
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Revenue & Users Trend"
          action={<Badge variant="secondary">Last 7 months</Badge>}
        >
          <AreaChart
            data={monthlyRevenueData}
            xKey="name"
            series={[
              { key: "revenue", label: "Revenue", color: CHART_PRIMARY },
              { key: "users", label: "Users", color: CHART_SECONDARY },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Signups by Plan"
          action={<Badge variant="secondary">This quarter</Badge>}
        >
          <BarChart
            data={categoryData}
            xKey="name"
            bars={[{ key: "value", label: "Signups" }]}
          />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title="Acquisition Channels">
          <PieChart data={trafficSourceData} nameKey="name" valueKey="value" />
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {ACTIVITY.map((activity) => (
              <div
                key={activity.user}
                className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
              >
                <div className="grid size-8 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {activity.user}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {activity.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full justify-start",
                })}
              >
                {action.label}
              </Link>
            ))}

            <div className="mt-3 border border-border bg-muted/40 p-4">
              <p className="mb-3 text-sm font-semibold">System Status</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    API Status
                  </span>
                  <Badge variant="outline" className={trendUpBadge}>
                    <span className="size-1.5 bg-green-500" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Database
                  </span>
                  <Badge variant="outline" className={trendUpBadge}>
                    <span className="size-1.5 bg-green-500" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Storage</span>
                  <Badge
                    variant="outline"
                    className="border-transparent bg-amber-500/15 text-amber-700 dark:text-amber-400"
                  >
                    <span className="size-1.5 bg-amber-500" />
                    72% Used
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
