import { DotsSixVerticalIcon, PlusIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { tasksListQuery, useUpdateTask } from "@/features/tasks/queries";
import {
  allTasksParams,
  type Task,
  type TaskPriority,
  type TaskStatus,
  taskStatuses,
} from "@/features/tasks/schema";
import { TaskFormDialog } from "@/features/tasks/TaskFormDialog";
import { type ChipColor, StatusChip } from "@/infra/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/taoracle/tasks")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(tasksListQuery(allTasksParams)),
  component: TasksBoard,
});

const COLUMN_LABELS: Record<TaskStatus, string> = {
  backlog: "Backlog",
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const priorityColorMap: Record<TaskPriority, ChipColor> = {
  low: "default",
  medium: "warning",
  high: "danger",
};

const priorityLabelMap: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

type DialogState = { mode: "create" | "edit"; task?: Task } | null;

function TasksBoard() {
  const query = useQuery(tasksListQuery(allTasksParams));
  const updateTask = useUpdateTask();
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dragging, setDragging] = useState<{
    from: TaskStatus;
    id: string;
  } | null>(null);
  const [overColumn, setOverColumn] = useState<TaskStatus | null>(null);

  const tasks = query.data?.rows ?? [];
  const grouped = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const task of tasks) map[task.status].push(task);
    return map;
  }, [tasks]);

  function handleDrop(to: TaskStatus) {
    setOverColumn(null);
    if (!dragging) return;
    const { from, id } = dragging;
    setDragging(null);
    if (from === to) return;
    updateTask.mutate({ id, status: to });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Tasks
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag cards between columns to update status. Click a card to edit.
          </p>
        </div>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <PlusIcon size={16} />
          New task
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {taskStatuses.map((status) => {
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
                    Drop cards here
                  </p>
                ) : (
                  cards.map((task) => (
                    <Card
                      key={task.id}
                      size="sm"
                      draggable
                      onDragStart={() =>
                        setDragging({ from: status, id: task.id })
                      }
                      onDragEnd={() => {
                        setDragging(null);
                        setOverColumn(null);
                      }}
                      onClick={() => setDialog({ mode: "edit", task })}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        dragging?.id === task.id && "opacity-50",
                      )}
                    >
                      <CardContent className="flex items-start gap-2">
                        <DotsSixVerticalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          <div className="flex items-center justify-between gap-2">
                            <StatusChip
                              status={task.priority}
                              colorMap={priorityColorMap}
                              labelMap={priorityLabelMap}
                            />
                            <span className="truncate text-xs text-muted-foreground">
                              {task.assignee}
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

      <TaskFormDialog
        open={dialog !== null}
        mode={dialog?.mode ?? "create"}
        task={dialog?.task}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      />
    </div>
  );
}
