/**
 * Single source of truth for money and date formatting used by the finance
 * and fees surfaces. Formatters return an em dash for missing or invalid input
 * so payload gaps never render "Invalid Date" or a fake zero.
 */

export const formatMoney = (value: unknown) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(value ?? 0)
  );

export const formatMoneyRounded = (value: unknown) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

/** Compact form for chart axis ticks: 1245000 -> ₹12.45L */
export const formatMoneyCompact = (value: unknown) => {
  const amount = Number(value ?? 0);
  const magnitude = Math.abs(amount);

  if (magnitude >= 1e7) return `₹${(amount / 1e7).toFixed(2)}Cr`;
  if (magnitude >= 1e5) return `₹${(amount / 1e5).toFixed(2)}L`;
  if (magnitude >= 1e3) return `₹${(amount / 1e3).toFixed(1)}K`;
  return `₹${amount}`;
};

const toDate = (value: unknown) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatDate = (value: unknown) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const formatDateTime = (value: unknown) => {
  const date = toDate(value);
  if (!date) return "—";
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/** Whole days a due date is in the past. 0 when not due yet or unparseable. */
export function daysOverdue(dueDate: unknown, now: Date = new Date()): number {
  const due = toDate(dueDate);
  if (!due) return 0;

  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();

  const diff = Math.floor((startOfDay(now) - startOfDay(due)) / 86_400_000);
  return diff > 0 ? diff : 0;
}

/** Tomorrow as YYYY-MM-DD, for the `min` attribute on date inputs. */
export const futureDate = () =>
  new Date(Date.now() + 86_400_000).toLocaleDateString("en-CA");
