import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import {
  FormError,
  NumberField,
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
import { useCreateStudent, useUpdateStudent } from "./queries";
import {
  type Student,
  type StudentInput,
  studentFormSchema,
  studentInputSchema,
} from "./schema";

const EMPTY_FORM: StudentInput = {
  name: "",
  className: "",
  wpm: 0,
  accuracy: 95,
  lessonsDone: 0,
};

function toForm(student?: Student): StudentInput {
  if (!student) return { ...EMPTY_FORM };
  return {
    name: student.name,
    className: student.className,
    wpm: student.wpm,
    accuracy: student.accuracy,
    lessonsDone: student.lessonsDone,
  };
}

export function StudentFormDialog({
  open,
  mode,
  student,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  student?: Student;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit student" : "New student"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this student's record."
              : "Add a student to a class."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <StudentForm
            key={student?.id ?? "new"}
            mode={mode}
            student={student}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function StudentForm({
  mode,
  student,
  onDone,
}: {
  mode: "create" | "edit";
  student?: Student;
  onDone: () => void;
}) {
  const create = useCreateStudent();
  const update = useUpdateStudent();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(student),
    validators: { onChange: studentFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = studentInputSchema.parse(value);
      try {
        if (mode === "edit" && student) {
          await update.mutateAsync({ id: student.id, ...payload });
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
      <TextField form={form} name="className" label="Class" required />

      <div className="grid grid-cols-3 gap-3">
        <NumberField form={form} name="wpm" label="WPM" min={0} required />
        <NumberField
          form={form}
          name="accuracy"
          label="Accuracy %"
          min={0}
          max={100}
          required
        />
        <NumberField
          form={form}
          name="lessonsDone"
          label="Lessons"
          min={0}
          required
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
