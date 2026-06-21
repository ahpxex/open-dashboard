import {
  CurrencyDollarIcon,
  ReceiptIcon,
  TrendUpIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  AreaChart,
  BarChart,
  ChartCard,
  PieChart,
  StatCard,
  type StatCardProps,
} from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order } from "@/db/schema";
import { statusColorMap } from "@/features/orders/columns";
import { ordersListQuery } from "@/features/orders/queries";
import type { OrderListParams, OrderStatus } from "@/features/orders/schema";
import { productsListQuery } from "@/features/products/queries";
import type { ProductListParams } from "@/features/products/schema";
import { StatusChip } from "@/infra/ui";
import { formatMoney } from "@/lib/format";

/**
 * Store overview — the app home (`/`) and the canonical example for the
 * `add-chart-page` skill. A real analytics view composed from the live
 * `products` and `orders` resources: KPI StatCards with period-over-period
 * trends, a revenue time-series (AreaChart), a top-customers bar + orders-by-
 * status pie, and a recent-orders feed. Copy this file's shape for any metrics
 * screen — then swap in your own resources and aggregates.
 */

// Aggregation ceiling: the KPIs/charts are computed from the returned `rows`, so
// a `pageSize` of 100 caps every metric at the first 100 records. Fine for the
// demo resources; a large, real resource should aggregate server-side via a
// dedicated stats server fn (SUM/COUNT/GROUP BY) instead of paging rows here.
const ALL_PRODUCTS: ProductListParams = {
  page: 1,
  pageSize: 100,
  search: "",
  status: "",
};

const ALL_ORDERS: OrderListParams = {
  page: 1,
  pageSize: 100,
  search: "",
  status: "",
};

/** Statuses that count as recognised revenue. */
const REVENUE_STATUSES: OrderStatus[] = ["paid", "fulfilled"];
const isRevenue = (o: Order) =>
  REVENUE_STATUSES.includes(o.status as OrderStatus);

export const Route = createFileRoute("/_app/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsListQuery(ALL_PRODUCTS)),
      context.queryClient.ensureQueryData(ordersListQuery(ALL_ORDERS)),
    ]);
  },
  component: StoreOverview,
});

const QUICK_ACTIONS = [
  { label: "Manage products", to: "/products" },
  { label: "View orders", to: "/orders" },
  { label: "Customers", to: "/customers" },
  { label: "Write a post", to: "/posts" },
];

/** Period-over-period delta → a StatCard trend pill (anchored to the data span,
 *  not wall-clock, so the demo always reads correctly). */
function deltaTrend(current: number, previous: number): StatCardProps["trend"] {
  if (previous === 0) {
    return current > 0 ? { value: "new", up: true } : undefined;
  }
  const pct = Math.round(((current - previous) / previous) * 100);
  return { value: `${Math.abs(pct)}%`, up: pct >= 0 };
}

function StoreOverview() {
  const { user } = Route.useRouteContext();
  const productsQuery = useQuery(productsListQuery(ALL_PRODUCTS));
  const ordersQuery = useQuery(ordersListQuery(ALL_ORDERS));

  const products = productsQuery.data?.rows ?? [];
  const orders = ordersQuery.data?.rows ?? [];

  const model = useMemo(() => {
    const outOfStock = products.filter(
      (p) => p.status === "out_of_stock",
    ).length;

    const recognised = orders.filter(isRevenue);
    const revenue = recognised.reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => o.status === "pending").length;
    const aov = recognised.length ? Math.round(revenue / recognised.length) : 0;

    // Split the data span in half for period-over-period trends.
    const times = orders.map((o) => new Date(o.createdAt).getTime());
    const min = times.length ? Math.min(...times) : 0;
    const max = times.length ? Math.max(...times) : 0;
    const mid = min + (max - min) / 2;
    const inFirst = (o: Order) => new Date(o.createdAt).getTime() < mid;

    const firstRev = orders
      .filter((o) => inFirst(o) && isRevenue(o))
      .reduce((s, o) => s + o.total, 0);
    const secondRev = revenue - firstRev;
    const firstCount = orders.filter(inFirst).length;
    const secondCount = orders.length - firstCount;
    const firstRecognised = orders.filter(
      (o) => inFirst(o) && isRevenue(o),
    ).length;
    const firstAov = firstRecognised
      ? Math.round(firstRev / firstRecognised)
      : 0;
    const secondRecognised = recognised.length - firstRecognised;
    const secondAov = secondRecognised
      ? Math.round(secondRev / secondRecognised)
      : 0;

    const statCards: StatCardProps[] = [
      {
        label: "Revenue",
        value: formatMoney(revenue),
        icon: CurrencyDollarIcon,
        trend: deltaTrend(secondRev, firstRev),
        sub: `${recognised.length} paid + fulfilled orders`,
      },
      {
        label: "Orders",
        value: (ordersQuery.data?.total ?? orders.length).toLocaleString(),
        icon: ReceiptIcon,
        trend: deltaTrend(secondCount, firstCount),
        sub: `${pending} pending`,
      },
      {
        label: "Avg order value",
        value: formatMoney(aov),
        icon: TrendUpIcon,
        trend: deltaTrend(secondAov, firstAov),
        sub: "per recognised order",
      },
      {
        label: "Out of stock",
        value: String(outOfStock),
        icon: WarningIcon,
        sub: `of ${products.length} products`,
      },
    ];

    // Daily revenue series across the data span (zero-filled), in dollars.
    const byDay = new Map<string, number>();
    for (const o of recognised) {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + o.total);
    }
    const revenueSeries: { date: string; revenue: number }[] = [];
    if (times.length) {
      const day = new Date(min);
      day.setHours(0, 0, 0, 0);
      const end = new Date(max);
      end.setHours(0, 0, 0, 0);
      while (day <= end) {
        const key = day.toISOString().slice(0, 10);
        revenueSeries.push({
          date: day.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          revenue: Math.round((byDay.get(key) ?? 0) / 100),
        });
        day.setDate(day.getDate() + 1);
      }
    }

    // Top customers by recognised revenue (dollars).
    const byCustomer = new Map<string, number>();
    for (const o of recognised) {
      byCustomer.set(o.customer, (byCustomer.get(o.customer) ?? 0) + o.total);
    }
    const topCustomers = [...byCustomer.entries()]
      .map(([name, cents]) => ({ name, value: Math.round(cents / 100) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Orders by status (count) for the pie.
    const byStatus = new Map<string, number>();
    for (const o of orders) {
      byStatus.set(o.status, (byStatus.get(o.status) ?? 0) + 1);
    }
    const statusData = [...byStatus.entries()]
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
      .filter((e) => e.value > 0);

    const recentOrders = [...orders]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5);

    return {
      stats: statCards,
      revenueSeries,
      topCustomers,
      statusData,
      recentOrders,
    };
  }, [products, orders, ordersQuery.data?.total]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Store overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/products"
            className={buttonVariants({ variant: "outline" })}
          >
            View products
          </Link>
          <Link to="/orders" className={buttonVariants()}>
            View orders
          </Link>
        </div>
      </div>

      {/* KPIs with period-over-period trends */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {model.stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Revenue over time — the flagship temporal view */}
      <ChartCard
        title="Revenue"
        action={<Badge variant="secondary">paid + fulfilled</Badge>}
      >
        <AreaChart
          data={model.revenueSeries}
          xKey="date"
          series={[{ key: "revenue", label: "Revenue ($)" }]}
          height={260}
          showLegend={false}
        />
      </ChartCard>

      {/* Secondary charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard
          title="Top customers"
          action={<Badge variant="secondary">by revenue</Badge>}
        >
          <BarChart
            data={model.topCustomers}
            xKey="name"
            bars={[{ key: "value", label: "Revenue ($)" }]}
            forceBars
            colorful
          />
        </ChartCard>

        <ChartCard
          title="Orders by status"
          action={
            <Badge variant="secondary">{model.statusData.length} states</Badge>
          }
        >
          <PieChart data={model.statusData} nameKey="name" valueKey="value" />
        </ChartCard>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent orders</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {model.recentOrders.map((order) => (
              <Link
                key={order.id}
                to="/orders/$id"
                params={{ id: order.id }}
                className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0 hover:opacity-80"
              >
                <div className="grid size-8 shrink-0 place-items-center bg-muted text-xs font-semibold text-foreground">
                  {order.customer.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{order.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {order.customer}
                  </p>
                </div>
                <StatusChip
                  status={order.status as OrderStatus}
                  colorMap={statusColorMap}
                />
                <span className="w-20 whitespace-nowrap text-right text-sm font-medium tabular-nums">
                  {formatMoney(order.total)}
                </span>
              </Link>
            ))}
            {model.recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick actions</CardTitle>
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
              <p className="mb-3 text-sm font-semibold">System status</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">API</span>
                  <Badge
                    variant="outline"
                    className="border-transparent bg-green-500/15 text-green-700 dark:text-green-400"
                  >
                    <span className="size-1.5 bg-green-500" />
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Database
                  </span>
                  <Badge
                    variant="outline"
                    className="border-transparent bg-green-500/15 text-green-700 dark:text-green-400"
                  >
                    <span className="size-1.5 bg-green-500" />
                    Healthy
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
