import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { FormError, SubmitButton, TextField } from "@/components/form";
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
import { useCreateContact, useUpdateContact } from "./queries";
import { type Contact, type ContactInput, contactInputSchema } from "./schema";

const EMPTY_FORM: ContactInput = {
  name: "",
  email: "",
  phone: "",
  company: "",
  title: "",
};

function toForm(contact?: Contact): ContactInput {
  if (!contact) return { ...EMPTY_FORM };
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    title: contact.title,
  };
}

export function ContactFormDialog({
  open,
  mode,
  contact,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  contact?: Contact;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit contact" : "New contact"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this contact's details."
              : "Add a contact to your CRM."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ContactForm
            key={contact?.id ?? "new"}
            mode={mode}
            contact={contact}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ContactForm({
  mode,
  contact,
  onDone,
}: {
  mode: "create" | "edit";
  contact?: Contact;
  onDone: () => void;
}) {
  const create = useCreateContact();
  const update = useUpdateContact();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(contact),
    validators: { onChange: contactInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = contactInputSchema.parse(value);
      try {
        if (mode === "edit" && contact) {
          await update.mutateAsync({ id: contact.id, ...payload });
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

      <div className="grid grid-cols-2 gap-3">
        <TextField form={form} name="phone" label="Phone" required />
        <TextField form={form} name="title" label="Title" required />
      </div>
      <TextField form={form} name="company" label="Company" required />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
