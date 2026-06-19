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
import { useCreateCompany, useUpdateCompany } from "./queries";
import {
  type Company,
  type CompanyInput,
  companyFormSchema,
  companyIndustries,
  companyInputSchema,
} from "./schema";

const EMPTY_FORM: CompanyInput = {
  name: "",
  industry: "saas",
  size: 1,
  location: "",
  website: "",
};

const industryOptions = companyIndustries.map((value) => ({
  value,
  label:
    value === "saas" ? "SaaS" : value.charAt(0).toUpperCase() + value.slice(1),
}));

function toForm(company?: Company): CompanyInput {
  if (!company) return { ...EMPTY_FORM };
  return {
    name: company.name,
    industry: company.industry,
    size: company.size,
    location: company.location,
    website: company.website,
  };
}

export function CompanyFormDialog({
  open,
  mode,
  company,
  onOpenChange,
}: {
  open: boolean;
  mode: "create" | "edit";
  company?: Company;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit company" : "New company"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update this company's profile."
              : "Add a company account."}
          </DialogDescription>
        </DialogHeader>

        {open ? (
          <CompanyForm
            key={company?.id ?? "new"}
            mode={mode}
            company={company}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CompanyForm({
  mode,
  company,
  onDone,
}: {
  mode: "create" | "edit";
  company?: Company;
  onDone: () => void;
}) {
  const create = useCreateCompany();
  const update = useUpdateCompany();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: toForm(company),
    validators: { onChange: companyFormSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      const payload = companyInputSchema.parse(value);
      try {
        if (mode === "edit" && company) {
          await update.mutateAsync({ id: company.id, ...payload });
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

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          form={form}
          name="industry"
          label="Industry"
          options={industryOptions}
        />
        <NumberField form={form} name="size" label="Staff" min={1} required />
      </div>

      <TextField form={form} name="location" label="Location" required />
      <TextField form={form} name="website" label="Website" required />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>
          Cancel
        </DialogClose>
        <SubmitButton form={form}>Save</SubmitButton>
      </DialogFooter>
    </form>
  );
}
