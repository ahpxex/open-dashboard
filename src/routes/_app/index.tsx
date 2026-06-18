import {
  ChartLineIcon,
  ClockIcon,
  CurrencyDollarIcon,
  TrendDownIcon,
  TrendUpIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useThemeColors } from "@/lib/color-theme";
import {
  categoryData,
  monthlyRevenueData,
  trafficSourceData,
} from "@/lib/dashboard/chart-data";

export const Route = createFileRoute("/_app/")({
  component: DashboardHome,
});

const trendUpBadge =
  "border-transparent bg-green-500/15 text-green-700 dark:text-green-400";
const trendDownBadge = "border-transparent bg-destructive/15 text-destructive";

type Stat = {
  label: string;
  value: string;
  icon: typeof UsersIcon;
  trend: string;
  trendUp: boolean;
  progress: number;
  sub: string;
};

const STATS: Stat[] = [
  {
    label: "Total Users",
    value: "1,234",
    icon: UsersIcon,
    trend: "12%",
    trendUp: true,
    progress: 65,
    sub: "65% of monthly target",
  },
  {
    label: "Revenue",
    value: "$45,678",
    icon: CurrencyDollarIcon,
    trend: "8%",
    trendUp: true,
    progress: 78,
    sub: "78% of monthly target",
  },
  {
    label: "Active Sessions",
    value: "432",
    icon: ClockIcon,
    trend: "5%",
    trendUp: true,
    progress: 43,
    sub: "Peak: 542 sessions",
  },
  {
    label: "Conversion Rate",
    value: "3.24%",
    icon: ChartLineIcon,
    trend: "2%",
    trendUp: false,
    progress: 32,
    sub: "Industry avg: 3.5%",
  },
];

const ACTIVITY = [
  { user: "John Doe", action: "Created new project", time: "2 min ago" },
  { user: "Jane Smith", action: "Updated dashboard", time: "15 min ago" },
  { user: "Bob Wilson", action: "Added new users", time: "1 hour ago" },
  { user: "Alice Brown", action: "Generated report", time: "2 hours ago" },
];

function DashboardHome() {
  const { user } = Route.useRouteContext();
  const themeColors = useThemeColors();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>Create New</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendUp ? TrendUpIcon : TrendDownIcon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="grid size-9 place-items-center border border-border bg-muted text-foreground">
                      <Icon size={20} weight="duotone" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={stat.trendUp ? trendUpBadge : trendDownBadge}
                  >
                    <TrendIcon size={14} />
                    {stat.trend}
                  </Badge>
                </div>
                <p className="text-3xl font-bold tracking-tight tabular-nums">
                  {stat.value}
                </p>
                <Progress value={stat.progress} className="mt-1" />
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Revenue &amp; Users Trend
            </CardTitle>
            <Badge variant="secondary">Last 7 months</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={monthlyRevenueData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={themeColors.chartColors.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={themeColors.chartColors.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={themeColors.chartColors.secondary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={themeColors.chartColors.secondary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={themeColors.chartColors.grid}
                />
                <XAxis
                  dataKey="name"
                  stroke={themeColors.chartColors.axis}
                  fontSize={12}
                />
                <YAxis stroke={themeColors.chartColors.axis} fontSize={12} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={themeColors.chartColors.primary}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={themeColors.chartColors.secondary}
                  strokeWidth={2}
                  fill="url(#usersFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Product Performance</CardTitle>
            <Badge variant="secondary">Top 5 Products</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={categoryData}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={themeColors.chartColors.grid}
                />
                <XAxis
                  dataKey="name"
                  stroke={themeColors.chartColors.axis}
                  fontSize={12}
                />
                <YAxis stroke={themeColors.chartColors.axis} fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill={themeColors.chartColors.primary} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props) =>
                    `${props.name} ${((props.percent ?? 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={95}
                  dataKey="value"
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={
                        themeColors.chartPalette[
                          index % themeColors.chartPalette.length
                        ]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
            <Button className="w-full justify-start" variant="outline">
              Generate Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Invite Team Member
            </Button>
            <Button className="w-full justify-start" variant="outline">
              View Analytics
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Manage Settings
            </Button>

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
