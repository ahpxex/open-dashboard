// biome-ignore-all lint/suspicious/noExplicitAny: AnyForm deliberately erases TanStack Form's 12 generic params so these field components accept a form of any value shape; the consuming form keeps full type-safety via useForm + zod.
"use client";

import type { AnyFieldApi, ReactFormExtendedApi } from "@tanstack/react-form";
import type { ReactNode } from "react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/**
 * A TanStack Form instance with the React extensions (`.Field`, `.Subscribe`).
 * The reusable field components are intentionally agnostic of a form's value
 * shape — the consuming form keeps full type-safety via `useForm` + zod.
 */
export type AnyForm = ReactFormExtendedApi<
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

/** First validation error for a field, normalized to a string. */
export function fieldErrorMessage(field: AnyFieldApi): string | undefined {
  const err = field.state.meta.errors?.[0];
  if (err == null) return undefined;
  if (typeof err === "string") return err;
  if (typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

interface BaseFieldProps {
  form: AnyForm;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  className?: string;
}

/**
 * Binds a TanStack Form `<form.Field>` to the `Field` atom (label + error +
 * description). Errors only surface once the field is touched. Use the bound
 * inputs below for common cases, or this directly for a custom control.
 */
export function FormField({
  form,
  name,
  label,
  description,
  required,
  className,
  children,
}: BaseFieldProps & { children: (field: AnyFieldApi) => ReactNode }) {
  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const error = field.state.meta.isTouched
          ? fieldErrorMessage(field)
          : undefined;
        return (
          <Field
            label={label}
            htmlFor={name}
            required={required}
            description={description}
            error={error}
            className={className}
          >
            {children(field)}
          </Field>
        );
      }}
    </form.Field>
  );
}

interface TextFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "password" | "url" | "tel";
  placeholder?: string;
  autoComplete?: string;
}

export function TextField({
  type = "text",
  placeholder,
  autoComplete,
  ...base
}: TextFieldProps) {
  return (
    <FormField {...base}>
      {(field) => (
        <Input
          id={base.name}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={(field.state.value as string | undefined) ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
      )}
    </FormField>
  );
}

interface NumberFieldProps extends BaseFieldProps {
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
}

export function NumberField({
  placeholder,
  min,
  max,
  step,
  ...base
}: NumberFieldProps) {
  return (
    <FormField {...base}>
      {(field) => (
        <Input
          id={base.name}
          type="number"
          inputMode="decimal"
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          value={field.state.value == null ? "" : String(field.state.value)}
          onChange={(e) => {
            const raw = e.target.value;
            field.handleChange(raw === "" ? undefined : Number(raw));
          }}
          onBlur={field.handleBlur}
        />
      )}
    </FormField>
  );
}

interface TextareaFieldProps extends BaseFieldProps {
  placeholder?: string;
  rows?: number;
}

export function TextareaField({
  placeholder,
  rows = 3,
  ...base
}: TextareaFieldProps) {
  return (
    <FormField {...base}>
      {(field) => (
        <Textarea
          id={base.name}
          rows={rows}
          placeholder={placeholder}
          value={(field.state.value as string | undefined) ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
        />
      )}
    </FormField>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({
  options,
  placeholder,
  ...base
}: SelectFieldProps) {
  return (
    <FormField {...base}>
      {(field) => (
        <Select
          value={(field.state.value as string | undefined) ?? ""}
          onValueChange={(value) => {
            field.handleChange(value);
            field.handleBlur();
          }}
        >
          <SelectTrigger id={base.name}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </FormField>
  );
}
