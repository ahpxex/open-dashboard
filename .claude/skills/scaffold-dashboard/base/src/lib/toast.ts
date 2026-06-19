import { toast } from "sonner";

export { toast };

/**
 * Extract a human-readable message from an unknown thrown value. Server
 * functions reject with `Error` instances; this normalizes everything else to
 * a sensible fallback so toasts never render "[object Object]".
 */
export function errorMessage(
  err: unknown,
  fallback = "Something went wrong.",
): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err) return err;
  return fallback;
}

/** Show a destructive toast for a failed action. */
export function toastError(err: unknown, fallback?: string): void {
  toast.error(errorMessage(err, fallback));
}

/** Show a success toast for a completed action. */
export function toastSuccess(message: string): void {
  toast.success(message);
}
