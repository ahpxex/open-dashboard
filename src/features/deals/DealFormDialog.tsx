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
import { useCreateDeal, useDeleteDeal, useUpdateDeal } from "./queries";
import {
  type Deal,
  type DealInput,
  dealFormSchema,
  dealInputSchema,
  dealStages,
} from "./schema";

const EMPTY_FORM: DealInput = {
  name: "",
  company: "",
  value: 0,
  owner: "",
  stage: "lead",
};

const stageOptions = dealStages.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(deal?: Deal): DealInput {
  if (!deal) return { ...EMPTY_FORM };
  return {
    name: deal.name,
    company: deal.company,
    value: deal.value,
    owner: deal.owner,
    stage: deal.stage,
  };
}

export function DealFormDialog({
  open,
  mode,
  deal,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  deal?: Deal;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit deal" : "New deal"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this opportunity."
              : "Add an opportunity to the pipeline."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <DealForm
            key={deal?.id ?? "new"}
            mode={mode}
            deal={deal}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function DealForm({
  mode,
  deal,
  onDone,
}: {
  mode: "create" | "edit";
  deal?: Deal;
  onDone: () => void;
}) {
  const create = useCreateDeal();
  const update = useUpdateDeal();
  const remove = useDeleteDeal();
  const confirm = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(deal),
    validators: { onChange: dealFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = dealInputSchema.parse(value);
      try {
        if (mode === "edit" && deal) {
          await update.mutateAsync({ id: deal.id, ...payload });
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

      <TextField form={form} name="name" label="Deal name" required />
      <TextField form={form} name="company" label="Company" required />

      <div className="grid grid-cols-2 gap-3">
        <NumberField form={form} name="value" label="Value" min={0} required />
        <SelectField
          form={form}
          name="stage"
          label="Stage"
          options={stageOptions}
        />
      </div>
      <TextField form={form} name="owner" label="Owner" required />

      <DialogFooter className="items-center sm:justify-between">
        {mode === "edit" && deal ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              const ok = await confirm({
                title: "Delete this deal?",
                description: deal.name,
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                remove.mutate(deal.id);
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
