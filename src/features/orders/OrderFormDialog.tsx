import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
  SelectField,
  SubmitButton,
  TextareaField,
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
import type { Order } from "@/db/schema";
import { centsToDollars, dollarsToCents } from "@/lib/format";
import { errorMessage } from "@/lib/toast";
import { useCreateOrder, useUpdateOrder } from "./queries";
import { ordersFormSchema, ordersInputSchema, ordersStatuses } from "./schema";

/** Form values mirror `ordersFormSchema` — `total` is edited in DOLLARS. */
type OrderFormValues = {
  name: string;
  customer: string;
  status: Order["status"];
  total: number;
  description: string;
};

const EMPTY_FORM: OrderFormValues = {
  name: "",
  customer: "",
  status: "pending",
  total: 0,
  description: "",
};

const statusOptions = ordersStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(row?: Order): OrderFormValues {
  if (!row) return { ...EMPTY_FORM };
  return {
    name: row.name,
    customer: row.customer,
    status: row.status,
    total: centsToDollars(row.total),
    description: row.description ?? "",
  };
}

/** Create/edit dialog for an order, shared by the list and detail panel. */
export function OrderFormDialog({
  open,
  mode,
  row,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  row?: Order;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit order" : "New order"}
          </DialogTitle>
          <DialogDescription>Fill in the details below.</DialogDescription>
        </DialogHeader>

        {open ? (
          <OrderForm
            key={row?.id ?? "new"}
            mode={mode}
            row={row}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrderForm({
  mode,
  row,
  onDone,
}: {
  mode: "create" | "edit";
  row?: Order;
  onDone: () => void;
}) {
  const create = useCreateOrder();
  const update = useUpdateOrder();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(row),
    validators: { onChange: ordersFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      // Convert dollars→cents and carry existing line items through (the form
      // edits the header, not the items), then validate the wire payload.
      const payload = ordersInputSchema.parse({
        name: value.name,
        customer: value.customer,
        status: value.status,
        total: dollarsToCents(value.total),
        description: value.description,
        items: row?.items ?? [],
      });
      try {
        if (mode === "edit" && row) {
          await update.mutateAsync({ id: row.id, ...payload });
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

      <TextField form={form} name="name" label="Order" required />
      <TextField form={form} name="customer" label="Customer" required />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
        <NumberField form={form} name="total" label="Total ($)" min={0} />
      </div>

      <TextareaField
        form={form}
        name="description"
        label="Description"
        rows={3}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
