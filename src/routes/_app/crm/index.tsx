import {
  ChartLineUpIcon,
  CoinsIcon,
  HandshakeIcon,
  TrophyIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  BarChart,
  ChartCard,
  StatCard,
  type StatCardProps,
} from "@/components/charts";
import { buttonVariants } from "@/components/ui/button";
import { dealsListQuery } from "@/features/deals/queries";
import { allDealsParams, type DealStage } from "@/features/deals/schema";

export const Route = createFileRoute("/_app/crm/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(dealsListQuery(allDealsParams)),
  component: CrmForecast,
});

const currency = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const STAGE_LABEL: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost",
};

const OPEN_STAGES: DealStage[] = ["lead", "qualified", "proposal"];

function CrmForecast() {
  const query = useQuery(dealsListQuery(allDealsParams));
  const deals = query.data?.rows ?? [];

  const { stats, byStage } = useMemo(() => {
    const sumWhere = (predicate: (stage: DealStage) => boolean) =>
      deals
        .filter((deal) => predicate(deal.stage))
        .reduce((total, deal) => total + deal.value, 0);

    const openValue = sumWhere((stage) => OPEN_STAGES.includes(stage));
    const wonValue = sumWhere((stage) => stage === "won");
    const wonCount = deals.filter((deal) => deal.stage === "won").length;
    const lostCount = deals.filter((deal) => deal.stage === "lost").length;
    const decided = wonCount + lostCount;
    const winRate = decided ? Math.round((wonCount / decided) * 100) : 0;
    const openCount = deals.filter((deal) =>
      OPEN_STAGES.includes(deal.stage),
    ).length;

    const statCards: StatCardProps[] = [
      {
        label: "Open pipeline",
        value: currency(openValue),
        icon: CoinsIcon,
        sub: `${openCount} active deals`,
      },
      {
        label: "Won (closed)",
        value: currency(wonValue),
        icon: TrophyIcon,
        sub: `${wonCount} deals`,
      },
      {
        label: "Win rate",
        value: `${winRate}%`,
        icon: ChartLineUpIcon,
        progress: winRate,
        sub: `${wonCount} of ${decided} decided`,
      },
      {
        label: "Open deals",
        value: String(openCount),
        icon: HandshakeIcon,
        sub: "Across all stages",
      },
    ];

    const stageData = (
      ["lead", "qualified", "proposal", "won"] as DealStage[]
    ).map((stage) => ({
      name: STAGE_LABEL[stage],
      value: sumWhere((s) => s === stage),
    }));

    return { stats: statCards, byStage: stageData };
  }, [deals]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Sales forecast
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pipeline health across stages.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/crm/contacts"
            className={buttonVariants({ variant: "outline" })}
          >
            Contacts
          </Link>
          <Link to="/crm/deals" className={buttonVariants()}>
            Open pipeline
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <ChartCard title="Pipeline value by stage">
        <BarChart
          data={byStage}
          xKey="name"
          bars={[{ key: "value", label: "Value" }]}
        />
      </ChartCard>
    </div>
  );
}
