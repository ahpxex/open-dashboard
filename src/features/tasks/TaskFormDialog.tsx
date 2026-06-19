import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { errorMessage } from "@/lib/toast";
import { useCreateTask, useDeleteTask, useUpdateTask } from "./queries";
import {
  type Task,
  type TaskInput,
  taskInputSchema,
  taskPriorities,
  taskStatuses,
} from "./schema";

const EMPTY_FORM: TaskInput = {
  title: "",
  status: "backlog",
  priority: "medium",
  assignee: "",
};

const titleCase = (value: string) =>
  value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const statusOptions = taskStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));

const priorityOptions = taskPriorities.map((value) => ({
  value,
  label: titleCase(value),
}));

function toForm(task?: Task): TaskInput {
  if (!task) return { ...EMPTY_FORM };
  return {
    title: task.title,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
  };
}

export function TaskFormDialog({
  open,
  mode,
  task,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  task?: Task;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit task" : "New task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this task's details."
              : "Add a task to the board."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <TaskForm
            key={task?.id ?? "new"}
            mode={mode}
            task={task}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({
  mode,
  task,
  onDone,
}: {
  mode: "create" | "edit";
  task?: Task;
  onDone: () => void;
}) {
  const create = useCreateTask();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const confirm = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(task),
    validators: { onChange: taskInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = taskInputSchema.parse(value);
      try {
        if (mode === "edit" && task) {
          await update.mutateAsync({ id: task.id, ...payload });
        } else {
          await create.mutateAsync(payload);
        }
        onDone();
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <FormError message={serverError} />

      <TextField form={form} name="title" label="Title" required />
      <TextField form={form} name="assignee" label="Assignee" required />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
        <SelectField
          form={form}
          name="priority"
          label="Priority"
          options={priorityOptions}
        />
      </div>

      <DialogFooter className="items-center sm:justify-between">
        {mode === "edit" && task ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              const ok = await confirm({
                title: "Delete this task?",
                description: task.title,
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                remove.mutate(task.id);
                onDone();
              }
            }}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Cancel
          </DialogClose>
          <SubmitButton form={form}>Save</SubmitButton>
        </div>
      </DialogFooter>
    </form>
  );
}
