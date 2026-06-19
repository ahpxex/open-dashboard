import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SubmitButton,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
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
import { useCreateScore, useUpdateScore } from "./queries";
import {
  type Score,
  type ScoreInput,
  scoreFormSchema,
  scoreInputSchema,
} from "./schema";

const EMPTY_FORM: ScoreInput = {
  student: "",
  article: "",
  wpm: 0,
  accuracy: 95,
  date: "2026-06-01",
};

function toForm(score?: Score): ScoreInput {
  if (!score) return { ...EMPTY_FORM };
  return {
    student: score.student,
    article: score.article,
    wpm: score.wpm,
    accuracy: score.accuracy,
    date: score.date,
  };
}

export function ScoreFormDialog({
  open,
  mode,
  score,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  score?: Score;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit score" : "New score"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this result."
              : "Log a typing result for a student."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ScoreForm
            key={score?.id ?? "new"}
            mode={mode}
            score={score}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ScoreForm({
  mode,
  score,
  onDone,
}: {
  mode: "create" | "edit";
  score?: Score;
  onDone: () => void;
}) {
  const create = useCreateScore();
  const update = useUpdateScore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(score),
    validators: { onChange: scoreFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = scoreInputSchema.parse(value);
      try {
        if (mode === "edit" && score) {
          await update.mutateAsync({ id: score.id, ...payload });
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

      <TextField form={form} name="student" label="Student" required />
      <TextField form={form} name="article" label="Article" required />

      <div className="grid grid-cols-3 gap-3">
        <NumberField form={form} name="wpm" label="WPM" min={0} required />
        <NumberField
          form={form}
          name="accuracy"
          label="Accuracy %"
          min={0}
          max={100}
          required
        />
        <TextField form={form} name="date" label="Date" required />
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
