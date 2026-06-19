"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { AnyForm } from "./fields";

interface SubmitButtonProps {
  form: AnyForm;
  children: ReactNode;
  /** Label shown while the form is submitting. */
  pendingText?: ReactNode;
  className?: string;
  /** Extra disabled condition on top of form validity / submission state. */
  disabled?: boolean;
}

/**
 * Submit button bound to a TanStack Form. Disables itself when the form is
 * invalid or mid-submission, so consumers never wire that plumbing by hand.
 */
export function SubmitButton({
  form,
  children,
  pendingText = "Saving…",
  className,
  disabled,
}: SubmitButtonProps) {
  return (
    <form.Subscribe
      selector={(state) => ({
        canSubmit: state.canSubmit,
        isSubmitting: state.isSubmitting,
      })}
    >
      {({ canSubmit, isSubmitting }) => (
        <Button
          type="submit"
          className={className}
          disabled={disabled || !canSubmit || isSubmitting}
        >
          {isSubmitting ? pendingText : children}
        </Button>
      )}
    </form.Subscribe>
  );
}
