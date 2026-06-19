import { PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BarChart, ChartCard } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  scoresListQuery,
  useDeleteScore,
  useUpdateScore,
} from "@/features/scores/queries";
import { ScoreFormDialog } from "@/features/scores/ScoreFormDialog";
import { allScoresParams, type Score } from "@/features/scores/schema";
import { ActionMenu } from "@/infra/ui";

export const Route = createFileRoute("/_app/typing/scores")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(scoresListQuery(allScoresParams)),
  component: ScoresPage,
});

type EditField = "wpm" | "accuracy";
type DialogState = { mode: "create" | "edit"; score?: Score } | null;

function ScoresPage() {
  const query = useQuery(scoresListQuery(allScoresParams));
  const update = useUpdateScore();
  const remove = useDeleteScore();
  const confirm = useConfirm();

  const [dialog, setDialog] = useState<DialogState>(null);
  const [editing, setEditing] = useState<{
    id: string;
    field: EditField;
  } | null>(null);
  const [draft, setDraft] = useState("");

  const scores = query.data?.rows ?? [];

  const leaderboard = useMemo(() => {
    const best = new Map<string, number>();
    for (const score of scores) {
      best.set(
        score.student,
        Math.max(best.get(score.student) ?? 0, score.wpm),
      );
    }
    return Array.from(best, ([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [scores]);

  function commit(score: Score, field: EditField) {
    setEditing(null);
    const next = Number(draft);
    if (!Number.isFinite(next) || next < 0) return;
    if (next === score[field]) return;
    update.mutate(
      field === "wpm"
        ? { id: score.id, wpm: Math.round(next) }
        : { id: score.id, accuracy: next },
    );
  }

  const isEditing = (id: string, field: EditField) =>
    editing?.id === id && editing.field === field;

  function startEdit(score: Score, field: EditField) {
    setEditing({ id: score.id, field });
    setDraft(String(score[field]));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Scores
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The leaderboard, plus an editable results table — click a WPM or
            accuracy cell to fix it inline.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          New score
        </Button>
      </div>

      <ChartCard title="Top students by best WPM">
        <BarChart
          data={leaderboard}
          xKey="name"
          bars={[{ key: "value", label: "WPM" }]}
        />
      </ChartCard>

      <div className="border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Article</TableHead>
              <TableHead className="w-28">WPM</TableHead>
              <TableHead className="w-32">Accuracy</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No scores yet.
                </TableCell>
              </TableRow>
            ) : (
              scores.map((score) => (
                <TableRow key={score.id}>
                  <TableCell className="font-medium">{score.student}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {score.article}
                  </TableCell>
                  <TableCell>
                    {isEditing(score.id, "wpm") ? (
                      <Input
                        autoFocus
                        type="number"
                        min={0}
                        className="h-7 w-20"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={() => commit(score, "wpm")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commit(score, "wpm");
                          if (event.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="-mx-1 w-full rounded-none px-1 py-1 text-left tabular-nums hover:bg-muted/60"
                        onClick={() => startEdit(score, "wpm")}
                      >
                        {score.wpm}
                      </button>
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing(score.id, "accuracy") ? (
                      <Input
                        autoFocus
                        type="number"
                        min={0}
                        max={100}
                        className="h-7 w-20"
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={() => commit(score, "accuracy")}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commit(score, "accuracy");
                          if (event.key === "Escape") setEditing(null);
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="-mx-1 w-full rounded-none px-1 py-1 text-left tabular-nums hover:bg-muted/60"
                        onClick={() => startEdit(score, "accuracy")}
                      >
                        {score.accuracy}%
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {score.date}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <ActionMenu
                        onEdit={() => setDialog({ mode: "edit", score })}
                        onDelete={async () => {
                          const ok = await confirm({
                            title: "Delete this score?",
                            description: `${score.student} · ${score.article}`,
                            confirmLabel: "Delete",
                            destructive: true,
                          });
                          if (ok) remove.mutate(score.id);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ScoreFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        score={dialog?.score}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
