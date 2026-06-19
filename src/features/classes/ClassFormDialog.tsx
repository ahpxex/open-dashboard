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
import { useCreateClass, useUpdateClass } from "./queries";
import {
  type ClassGroup,
  type ClassInput,
  classFormSchema,
  classInputSchema,
  classLevels,
} from "./schema";

const EMPTY_FORM: ClassInput = {
  name: "",
  teacher: "",
  studentCount: 0,
  level: "beginner",
};

const levelOptions = classLevels.map((value) => ({
  value,
  label: value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(group?: ClassGroup): ClassInput {
  if (!group) return { ...EMPTY_FORM };
  return {
    name: group.name,
    teacher: group.teacher,
    studentCount: group.studentCount,
    level: group.level,
  };
}

export function ClassFormDialog({
  open,
  mode,
  group,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  group?: ClassGroup;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit class" : "New class"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update this class." : "Create a class group."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <ClassForm
            key={group?.id ?? "new"}
            mode={mode}
            group={group}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function ClassForm({
  mode,
  group,
  onDone,
}: {
  mode: "create" | "edit";
  group?: ClassGroup;
  onDone: () => void;
}) {
  const create = useCreateClass();
  const update = useUpdateClass();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(group),
    validators: { onChange: classFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = classInputSchema.parse(value);
      try {
        if (mode === "edit" && group) {
          await update.mutateAsync({ id: group.id, ...payload });
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

      <TextField form={form} name="name" label="Class name" required />
      <TextField form={form} name="teacher" label="Teacher" required />

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          form={form}
          name="studentCount"
          label="Students"
          min={0}
          required
        />
        <SelectField
          form={form}
          name="level"
          label="Level"
          options={levelOptions}
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
