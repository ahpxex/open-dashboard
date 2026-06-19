import { CheckIcon } from "@phosphor-icons/react";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  FormError,
  SelectField,
  SubmitButton,
  TextField,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  employeesListQuery,
  useCreateEmployee,
} from "@/features/employees/queries";
import {
  allEmployeesParams,
  type EmployeeInput,
  employeeDepartments,
  employeeStatuses,
  onboardingSchema,
} from "@/features/employees/schema";
import { errorMessage } from "@/lib/toast";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/hr/onboarding")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(employeesListQuery(allEmployeesParams)),
  component: Onboarding,
});

const EMPTY: EmployeeInput = {
  name: "",
  email: "",
  title: "",
  department: "engineering",
  managerId: "",
  status: "active",
};

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const departmentOptions = employeeDepartments.map((value) => ({
  value,
  label: titleCase(value),
}));

const statusOptions = employeeStatuses.map((value) => ({
  value,
  label: value === "onleave" ? "On leave" : titleCase(value),
}));

const STEPS = [
  { title: "Personal", fields: ["name", "email"] as const },
  {
    title: "Role",
    fields: ["title", "department", "managerId", "status"] as const,
  },
  { title: "Review", fields: [] as const },
];

function Onboarding() {
  const navigate = useNavigate();
  const create = useCreateEmployee();
  const employeesQuery = useQuery(employeesListQuery(allEmployeesParams));
  const [step, setStep] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const managerOptions = useMemo(
    () =>
      (employeesQuery.data?.rows ?? []).map((employee) => ({
        value: employee.id,
        label: `${employee.name} — ${employee.title}`,
      })),
    [employeesQuery.data],
  );

  const form = useForm({
    defaultValues: EMPTY,
    validators: { onChange: onboardingSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await create.mutateAsync(value);
        navigate({ to: "/hr/directory" });
      } catch (err) {
        setServerError(errorMessage(err));
      }
    },
  });

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function stepIsValid(index: number) {
    return STEPS[index].fields.every((name) => {
      const value = form.getFieldValue(name);
      return onboardingSchema.shape[name].safeParse(value).success;
    });
  }

  function next() {
    if (!stepIsValid(step)) {
      for (const name of current.fields) {
        form.setFieldMeta(name, (meta) => ({ ...meta, isTouched: true }));
      }
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Onboard a teammate
        </h1>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          A short wizard that adds a new person to the directory and org chart.
        </p>
      </div>

      <ol className="flex max-w-2xl items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <li key={s.title} className="flex flex-1 items-center gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center border text-xs font-medium",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-primary text-primary",
                    !done && !active && "border-border text-muted-foreground",
                  )}
                >
                  {done ? <CheckIcon className="size-4" /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-sm",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 ? <Separator className="flex-1" /> : null}
            </li>
          );
        })}
      </ol>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          form.handleSubmit();
        }}
        className="flex max-w-2xl flex-col gap-6"
      >
        <FormError message={serverError} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Step {step + 1} of {STEPS.length} · {current.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {step === 0 ? (
              <>
                <TextField form={form} name="name" label="Full name" required />
                <TextField
                  form={form}
                  name="email"
                  type="email"
                  label="Email"
                  required
                />
              </>
            ) : null}

            {step === 1 ? (
              <>
                <TextField form={form} name="title" label="Title" required />
                <div className="grid grid-cols-2 gap-3">
                  <SelectField
                    form={form}
                    name="department"
                    label="Department"
                    options={departmentOptions}
                  />
                  <SelectField
                    form={form}
                    name="status"
                    label="Status"
                    options={statusOptions}
                  />
                </div>
                <SelectField
                  form={form}
                  name="managerId"
                  label="Manager"
                  options={managerOptions}
                  placeholder="Select a manager"
                />
              </>
            ) : null}

            {step === 2 ? (
              <form.Subscribe selector={(state) => state.values}>
                {(values) => {
                  const manager = managerOptions.find(
                    (option) => option.value === values.managerId,
                  );
                  return (
                    <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium">{values.name}</dd>
                      <dt className="text-muted-foreground">Email</dt>
                      <dd className="font-medium">{values.email}</dd>
                      <dt className="text-muted-foreground">Title</dt>
                      <dd className="font-medium">{values.title}</dd>
                      <dt className="text-muted-foreground">Department</dt>
                      <dd className="font-medium">
                        {titleCase(values.department)}
                      </dd>
                      <dt className="text-muted-foreground">Manager</dt>
                      <dd className="font-medium">{manager?.label ?? "—"}</dd>
                    </dl>
                  );
                }}
              </form.Subscribe>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(s - 1, 0))}
          >
            Back
          </Button>
          {isLast ? (
            <SubmitButton form={form}>Add to team</SubmitButton>
          ) : (
            <Button type="button" onClick={next}>
              Next
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
