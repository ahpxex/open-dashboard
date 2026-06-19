import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Form-level (server) error banner. Validation errors render under their field;
 * this surfaces the error a failed mutation throws (e.g. "UNAUTHORIZED", a
 * unique-constraint violation). Render at the top of the form body.
 */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
