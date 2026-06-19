import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextareaField,
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
import { useCreateTicket, useDeleteTicket, useUpdateTicket } from "./queries";
import {
  type Ticket,
  type TicketInput,
  ticketFormSchema,
  ticketInputSchema,
  ticketPriorities,
  ticketStatuses,
} from "./schema";

const EMPTY_FORM: TicketInput = {
  subject: "",
  requester: "",
  status: "open",
  priority: "medium",
  assignee: "",
  description: "",
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const statusOptions = ticketStatuses.map((value) => ({
  value,
  label: titleCase(value),
}));

const priorityOptions = ticketPriorities.map((value) => ({
  value,
  label: titleCase(value),
}));

function toForm(ticket?: Ticket): TicketInput {
  if (!ticket) return { ...EMPTY_FORM };
  return {
    subject: ticket.subject,
    requester: ticket.requester,
    status: ticket.status,
    priority: ticket.priority,
    assignee: ticket.assignee,
    description: ticket.description,
  };
}

export function TicketFormDialog({
  open,
  mode,
  ticket,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  ticket?: Ticket;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit ticket" : "New ticket"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this ticket's details."
              : "Log a new support ticket."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <TicketForm
            key={ticket?.id ?? "new"}
            mode={mode}
            ticket={ticket}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TicketForm({
  mode,
  ticket,
  onDone,
}: {
  mode: "create" | "edit";
  ticket?: Ticket;
  onDone: () => void;
}) {
  const create = useCreateTicket();
  const update = useUpdateTicket();
  const remove = useDeleteTicket();
  const confirm = useConfirm();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(ticket),
    validators: { onChange: ticketFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = ticketInputSchema.parse(value);
      try {
        if (mode === "edit" && ticket) {
          await update.mutateAsync({ id: ticket.id, ...payload });
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

      <TextField form={form} name="subject" label="Subject" required />

      <div className="grid grid-cols-2 gap-3">
        <TextField form={form} name="requester" label="Requester" required />
        <TextField form={form} name="assignee" label="Assignee" required />
      </div>

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

      <TextareaField
        form={form}
        name="description"
        label="Description"
        rows={3}
      />

      <DialogFooter className="items-center sm:justify-between">
        {mode === "edit" && ticket ? (
          <Button
            type="button"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={async () => {
              const ok = await confirm({
                title: "Delete this ticket?",
                description: ticket.subject,
                confirmLabel: "Delete",
                destructive: true,
              });
              if (ok) {
                remove.mutate(ticket.id);
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
