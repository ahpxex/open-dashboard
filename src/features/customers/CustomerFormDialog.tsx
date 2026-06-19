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
import { useCreateCustomer, useUpdateCustomer } from "./queries";
import {
  type Customer,
  type CustomerInput,
  customerFormSchema,
  customerInputSchema,
  customerPlans,
  customerStatuses,
} from "./schema";

const EMPTY_FORM: CustomerInput = {
  name: "",
  email: "",
  company: "",
  plan: "free",
  mrr: 0,
  status: "trial",
};

const planOptions = customerPlans.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const statusOptions = customerStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(customer?: Customer): CustomerInput {
  if (!customer) return { ...EMPTY_FORM };
  return {
    name: customer.name,
    email: customer.email,
    company: customer.company,
    plan: customer.plan,
    mrr: customer.mrr,
    status: customer.status,
  };
}

export function CustomerFormDialog({
  open,
  mode,
  customer,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  customer?: Customer;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit customer" : "New customer"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this customer's account."
              : "Add a customer account."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CustomerForm
            key={customer?.id ?? "new"}
            mode={mode}
            customer={customer}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CustomerForm({
  mode,
  customer,
  onDone,
}: {
  mode: "create" | "edit";
  customer?: Customer;
  onDone: () => void;
}) {
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(customer),
    validators: { onChange: customerFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = customerInputSchema.parse(value);
      try {
        if (mode === "edit" && customer) {
          await update.mutateAsync({ id: customer.id, ...payload });
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

      <TextField form={form} name="name" label="Name" required />
      <TextField form={form} name="email" label="Email" type="email" required />
      <TextField form={form} name="company" label="Company" required />

      <div className="grid grid-cols-3 gap-3">
        <SelectField
          form={form}
          name="plan"
          label="Plan"
          options={planOptions}
        />
        <NumberField form={form} name="mrr" label="MRR" min={0} required />
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
