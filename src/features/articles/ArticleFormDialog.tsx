import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SelectField,
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
import { useCreateArticle, useUpdateArticle } from "./queries";
import {
  type Article,
  type ArticleInput,
  articleDifficulties,
  articleFormSchema,
  articleInputSchema,
  articleStatuses,
} from "./schema";

const EMPTY_FORM: ArticleInput = {
  title: "",
  author: "",
  wordCount: 100,
  difficulty: "easy",
  status: "draft",
};

const difficultyOptions = articleDifficulties.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const statusOptions = articleStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(article?: Article): ArticleInput {
  if (!article) return { ...EMPTY_FORM };
  return {
    title: article.title,
    author: article.author,
    wordCount: article.wordCount,
    difficulty: article.difficulty,
    status: article.status,
  };
}

export function ArticleFormDialog({
  open,
  mode,
  article,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  article?: Article;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit article" : "New article"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this typing passage."
              : "Add a passage students can practice on."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ArticleForm
            key={article?.id ?? "new"}
            mode={mode}
            article={article}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ArticleForm({
  mode,
  article,
  onDone,
}: {
  mode: "create" | "edit";
  article?: Article;
  onDone: () => void;
}) {
  const create = useCreateArticle();
  const update = useUpdateArticle();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(article),
    validators: { onChange: articleFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = articleInputSchema.parse(value);
      try {
        if (mode === "edit" && article) {
          await update.mutateAsync({ id: article.id, ...payload });
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
      <TextField form={form} name="author" label="Author" required />

      <div className="grid grid-cols-3 gap-3">
        <NumberField
          form={form}
          name="wordCount"
          label="Words"
          min={1}
          required
        />
        <SelectField
          form={form}
          name="difficulty"
          label="Difficulty"
          options={difficultyOptions}
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
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
