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
import { useCreateUser, useUpdateUser } from "./queries";
import {
  type User,
  type UserInput,
  userInputSchema,
  userRoles,
  userStatuses,
} from "./schema";

const EMPTY_FORM: UserInput = {
  name: "",
  email: "",
  role: "member",
  status: "active",
};

const roleOptions = userRoles.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

const statusOptions = userStatuses.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(user?: User): UserInput {
  if (!user) return { ...EMPTY_FORM };
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export function UserFormDialog({
  open,
  mode,
  user,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  user?: User;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit user" : "New user"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this account's details."
              : "Invite a new account member."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <UserForm
            key={user?.id ?? "new"}
            mode={mode}
            user={user}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  mode,
  user,
  onDone,
}: {
  mode: "create" | "edit";
  user?: User;
  onDone: () => void;
}) {
  const create = useCreateUser();
  const update = useUpdateUser();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(user),
    validators: { onChange: userInputSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = userInputSchema.parse(value);
      try {
        if (mode === "edit" && user) {
          await update.mutateAsync({ id: user.id, ...payload });
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
        <SelectField
          form={form}
          name="role"
          label="Role"
          options={roleOptions}
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
