/* eslint-disable @typescript-eslint/no-explicit-any */
import { daysOverdue } from "@/lib/format";

export type FeeStatusFilter = "all" | "paid" | "part-paid" | "overdue";

export type FeeCounts = {
  all: number;
  paid: number;
  partPaid: number;
  overdue: number;
};

export type FeeSummary = {
  invoiced: number;
  collected: number;
  outstanding: number;
  counts: FeeCounts;
};

export type FeeReceipt = {
  receipt: { id: string; receiptNumber?: string };
  reference: string | null;
  paidAt: string | null;
};

const statusOf = (invoice: any) => String(invoice?.status ?? "").toUpperCase();

export const invoiceTotal = (invoice: any) => Number(invoice?.total ?? 0);
export const invoicePaid = (invoice: any) => Number(invoice?.paidAmount ?? 0);
export const invoiceBalance = (invoice: any) =>
  invoiceTotal(invoice) - invoicePaid(invoice);

export const isInvoicePaid = (invoice: any) => statusOf(invoice) === "PAID";

export const isInvoicePartPaid = (invoice: any) =>
  !isInvoicePaid(invoice) && invoicePaid(invoice) > 0;

export const isInvoiceOverdue = (invoice: any, now: Date = new Date()) =>
  !isInvoicePaid(invoice) &&
  invoiceBalance(invoice) > 0 &&
  daysOverdue(invoice?.dueDate, now) > 0;

export function matchesStatusFilter(invoice: any, filter: FeeStatusFilter) {
  switch (filter) {
    case "paid":
      return isInvoicePaid(invoice);
    case "part-paid":
      return isInvoicePartPaid(invoice);
    case "overdue":
      return isInvoiceOverdue(invoice);
    default:
      return true;
  }
}

export function searchInvoices(invoices: any[], query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return invoices;

  return invoices.filter((invoice) =>
    `${invoice?.invoiceNumber ?? ""} ${invoice?.student?.name ?? ""} ${invoice?.student?.rollNumber ?? ""}`
      .toLowerCase()
      .includes(needle)
  );
}

export function filterInvoices(
  invoices: any[],
  { query, status }: { query: string; status: FeeStatusFilter }
) {
  return searchInvoices(invoices, query).filter((invoice) =>
    matchesStatusFilter(invoice, status)
  );
}

export function sortByOldestDue(invoices: any[]) {
  return [...invoices].sort(
    (a, b) =>
      new Date(a?.dueDate ?? 0).getTime() - new Date(b?.dueDate ?? 0).getTime()
  );
}

/**
 * Counts run on the searched set but before the status filter, so a tab never
 * collapses to zero merely because another tab is selected.
 */
export function countsByStatus(rows: any[]): FeeCounts {
  return {
    all: rows.length,
    paid: rows.filter(isInvoicePaid).length,
    partPaid: rows.filter(isInvoicePartPaid).length,
    overdue: rows.filter((invoice) => isInvoiceOverdue(invoice)).length,
  };
}

/** Totals always cover every loaded invoice, never the filtered view. */
export function summariseInvoices(rows: any[]): FeeSummary {
  const totals = rows.reduce(
    (accumulator, invoice) => {
      accumulator.invoiced += invoiceTotal(invoice);
      accumulator.collected += invoicePaid(invoice);
      accumulator.outstanding += isInvoicePaid(invoice) ? 0 : invoiceBalance(invoice);
      return accumulator;
    },
    { invoiced: 0, collected: 0, outstanding: 0 }
  );

  return { ...totals, counts: countsByStatus(rows) };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(0, page), pageCount - 1);
  const start = currentPage * pageSize;

  return {
    rows: items.slice(start, start + pageSize),
    pageCount,
    page: currentPage,
    from: items.length === 0 ? 0 : start + 1,
    to: Math.min(items.length, start + pageSize),
    total: items.length,
  };
}

export function receiptsOf(invoice: any): FeeReceipt[] {
  return (invoice?.payments ?? []).flatMap((payment: any) =>
    (payment?.receipts ?? []).map((receipt: any) => ({
      receipt,
      reference: payment?.reference ?? null,
      paidAt: payment?.paidAt ?? null,
    }))
  );
}

export const receiptCount = (invoice: any) => receiptsOf(invoice).length;
