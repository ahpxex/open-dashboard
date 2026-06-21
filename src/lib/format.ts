/**
 * Formatting helpers. Money is stored as integer minor units (cents) everywhere
 * so arithmetic stays exact — these convert to/from a human display string.
 */

const DEFAULT_CURRENCY = "USD";

/** Format integer cents as a currency string, e.g. `129900` → `$1,299.00`. */
export function formatMoney(
  cents: number,
  currency = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format((cents ?? 0) / 100);
}

/** Compact currency for dense tiles, e.g. `1299000` → `$13K`. */
export function formatCompactMoney(
  cents: number,
  currency = DEFAULT_CURRENCY,
): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format((cents ?? 0) / 100);
}

/** Cents → editable dollars (for a form field). */
export const centsToDollars = (cents: number): number => (cents ?? 0) / 100;

/** Editable dollars → integer cents (for storage). */
export const dollarsToCents = (dollars: number): number =>
  Math.round((dollars ?? 0) * 100);
