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
import { useCreateRefund, useUpdateRefund } from "./queries";
import {
  type Refund,
  type RefundInput,
  refundFormSchema,
  refundInputSchema,
  refundReasons,
  refundStatuses,
} from "./schema";

const EMPTY_FORM: RefundInput = {
  orderRef: "",
  customer: "",
  amount: 0,
  reason: "requested_by_customer",
  status: "pending",
};

const reasonOptions = refundReasons.map((value) => ({
  value,
  label: value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
}));

const statusOptions = refundStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(refund?: Refund): RefundInput {
  if (!refund) return { ...EMPTY_FORM };
  return {
    orderRef: refund.orderRef,
    customer: refund.customer,
    amount: refund.amount,
    reason: refund.reason,
    status: refund.status,
  };
}

export function RefundFormDialog({
  open,
  mode,
  refund,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  refund?: Refund;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Review refund" : "New refund"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update the refund and its status."
              : "Record a refund request."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <RefundForm
            key={refund?.id ?? "new"}
            mode={mode}
            refund={refund}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RefundForm({
  mode,
  refund,
  onDone,
}: {
  mode: "create" | "edit";
  refund?: Refund;
  onDone: () => void;
}) {
  const create = useCreateRefund();
  const update = useUpdateRefund();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(refund),
    validators: { onChange: refundFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = refundInputSchema.parse(value);
      try {
        if (mode === "edit" && refund) {
          await update.mutateAsync({ id: refund.id, ...payload });
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

      <div className="grid grid-cols-2 gap-3">
        <TextField form={form} name="orderRef" label="Order ref" required />
        <NumberField
          form={form}
          name="amount"
          label="Amount"
          min={0}
          step="0.01"
          required
        />
      </div>
      <TextField form={form} name="customer" label="Customer" required />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="reason"
          label="Reason"
          options={reasonOptions}
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
