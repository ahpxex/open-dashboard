import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
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
import { useCreateLeaveRequest } from "./queries";
import {
  type LeaveInput,
  leaveInputSchema,
  leaveStatuses,
  leaveTypes,
} from "./schema";

const typeOptions = leaveTypes.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const statusOptions = leaveStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

export function LeaveFormDialog({
  open,
  defaultDate,
  onOpenChange,
}: {
  open: boolean;
  defaultDate: string;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request leave</DialogTitle>
          <DialogDescription>
            Add time off to the team calendar.
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <LeaveForm
            key={defaultDate || "new"}
            defaultDate={defaultDate}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function LeaveForm({
  defaultDate,
  onDone,
}: {
  defaultDate: string;
  onDone: () => void;
}) {
  const create = useCreateLeaveRequest();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      employee: "",
      type: "vacation",
      date: defaultDate,
      status: "pending",
    } as LeaveInput,
    validators: { onChange: leaveInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await create.mutateAsync(leaveInputSchema.parse(value));
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

      <TextField form={form} name="employee" label="Employee" required />

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="type"
          label="Type"
          options={typeOptions}
        />
        <SelectField
          form={form}
          name="status"
          label="Status"
          options={statusOptions}
        />
      </div>

      <TextField
        form={form}
        name="date"
        label="Date"
        placeholder="2026-06-15"
        required
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Request</SubmitButton>
      </DialogFooter>
    </form>
  );
}
