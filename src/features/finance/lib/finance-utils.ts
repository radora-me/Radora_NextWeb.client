/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FinanceResource } from "../services/finance.service";

export type FinanceGroup =
  | "Overview"
  | "Fee Management"
  | "Accounting"
  | "Operations"
  | "Controls"
  | "Intelligence";

export type FinanceSection = {
  id: string;
  label: string;
  group: FinanceGroup;
  resource?: FinanceResource;
};

/**
 * Every section, label and resource mapping is unchanged from the original
 * finance page — only their presentation moved into this module.
 */
export const financeSections: FinanceSection[] = [
  { id: "dashboard", label: "Finance Dashboard", group: "Overview" },
  { id: "fee-categories", label: "Fee Categories", resource: "categories", group: "Fee Management" },
  { id: "fee-structures", label: "Fee Structures", resource: "feeStructures", group: "Fee Management" },
  { id: "assignments", label: "Student Fee Assignment", resource: "assignments", group: "Fee Management" },
  { id: "invoices", label: "Fee Invoices", resource: "invoices", group: "Fee Management" },
  { id: "installments", label: "Installments", resource: "installments", group: "Fee Management" },
  { id: "discounts", label: "Discounts / Concessions", resource: "discounts", group: "Fee Management" },
  { id: "late-fees", label: "Late Fees", resource: "invoices", group: "Fee Management" },
  { id: "scholarships", label: "Scholarships", resource: "scholarships", group: "Fee Management" },
  { id: "payments", label: "Payments", resource: "payments", group: "Fee Management" },
  { id: "refunds", label: "Refunds", resource: "refunds", group: "Fee Management" },
  { id: "receipts", label: "Receipts", resource: "receipts", group: "Fee Management" },
  { id: "outstanding", label: "Outstanding Fees", resource: "invoices", group: "Fee Management" },
  { id: "chart", label: "Chart of Accounts", resource: "accounts", group: "Accounting" },
  { id: "ledgers", label: "Ledgers", resource: "journals", group: "Accounting" },
  { id: "journals", label: "Journal Entries", resource: "journals", group: "Accounting" },
  { id: "general-ledger", label: "General Ledger", resource: "journals", group: "Accounting" },
  { id: "cash-book", label: "Cash Book", resource: "payments", group: "Accounting" },
  { id: "bank-book", label: "Bank Book", resource: "bankAccounts", group: "Accounting" },
  { id: "contra", label: "Contra Entries", resource: "journals", group: "Accounting" },
  { id: "opening", label: "Opening Balances", resource: "accounts", group: "Accounting" },
  { id: "income", label: "Income", resource: "incomes", group: "Operations" },
  { id: "expenses", label: "Expenses", resource: "expenses", group: "Operations" },
  { id: "purchases", label: "Purchases", resource: "expenses", group: "Operations" },
  { id: "assets", label: "Assets", resource: "assets", group: "Operations" },
  { id: "payroll", label: "Payroll Integration", resource: "payrollIntegrations", group: "Operations" },
  { id: "budgets", label: "Budgets", resource: "budgets", group: "Controls" },
  { id: "bank", label: "Bank Management", resource: "bankAccounts", group: "Controls" },
  { id: "reports", label: "Reports", resource: "journals", group: "Controls" },
  { id: "exports", label: "Exports", resource: "invoices", group: "Controls" },
  { id: "intelligence", label: "Finance Intelligence", group: "Intelligence" },
];

export const financeGroupOrder: FinanceGroup[] = [
  "Overview",
  "Fee Management",
  "Accounting",
  "Operations",
  "Controls",
  "Intelligence",
];

export function groupFinanceSections(sections: FinanceSection[]) {
  const buckets = new Map<FinanceGroup, FinanceSection[]>();

  for (const section of sections) {
    const bucket = buckets.get(section.group);
    if (bucket) bucket.push(section);
    else buckets.set(section.group, [section]);
  }

  return financeGroupOrder
    .filter((group) => buckets.has(group))
    .map((group) => ({
      group,
      sections: buckets.get(group) as FinanceSection[],
    }));
}

export function findFinanceSection(id: string): FinanceSection {
  return financeSections.find((section) => section.id === id) ?? financeSections[0];
}

/** Sections that can create a record, keyed by the dialog they open. */
export const createActionBySectionId: Record<string, "invoice" | "payment" | "expense"> = {
  invoices: "invoice",
  payments: "payment",
  expenses: "expense",
};

export type FinanceRowKind =
  | "invoice"
  | "payment"
  | "expense"
  | "account"
  | "journal"
  | "asset"
  | "fee-structure"
  | "generic";

export function financeRowKind(resource?: FinanceResource): FinanceRowKind {
  switch (resource) {
    case "invoices":
      return "invoice";
    case "payments":
      return "payment";
    case "expenses":
      return "expense";
    case "accounts":
      return "account";
    case "journals":
      return "journal";
    case "assets":
      return "asset";
    case "feeStructures":
      return "fee-structure";
    default:
      return "generic";
  }
}

export const financeColumnLabels: Record<
  FinanceRowKind,
  { reference: string; title: string; amount: string; date: string }
> = {
  invoice: { reference: "Invoice", title: "Student", amount: "Total", date: "Due date" },
  payment: { reference: "Reference", title: "Payer", amount: "Amount", date: "Paid on" },
  expense: { reference: "Bill no.", title: "Vendor / description", amount: "Amount", date: "Bill date" },
  account: { reference: "Code", title: "Account", amount: "Balance", date: "Opened" },
  journal: { reference: "Entry", title: "Description", amount: "Amount", date: "Entry date" },
  asset: { reference: "Asset code", title: "Asset", amount: "Current value", date: "Purchased" },
  "fee-structure": { reference: "Name", title: "Applies to", amount: "Amount", date: "Created" },
  generic: { reference: "Reference", title: "Name / description", amount: "Amount", date: "Date" },
};

/* Defensive readers. The payloads are untyped, so these keep the original
   fallback chains and render nothing rather than inventing values. */

export function rowReference(row: any): string {
  return (
    row?.invoiceNumber ||
    row?.reference ||
    row?.billNumber ||
    row?.entryNumber ||
    row?.code ||
    row?.assetCode ||
    row?.receiptNumber ||
    row?.name ||
    (row?.id ? String(row.id).slice(0, 8) : "—")
  );
}

export function rowTitle(row: any): string {
  return (
    row?.student?.name ||
    row?.vendor?.name ||
    row?.name ||
    row?.description ||
    row?.account?.name ||
    row?.invoice?.invoiceNumber ||
    row?.title ||
    "—"
  );
}

export function rowSecondary(row: any): string | null {
  return row?.student?.rollNumber || row?.category?.name || row?.frequency || null;
}

export function rowAmountValue(row: any): number {
  return Number(
    row?.amount ??
      row?.total ??
      row?.totalDebit ??
      row?.assignedAmount ??
      row?.fixedAmount ??
      row?.purchaseValue ??
      row?.currentValue ??
      row?.allocated ??
      row?.paidAmount ??
      row?.payment?.amount ??
      row?.invoice?.total ??
      0
  );
}

export function rowDateValue(row: any): string | null {
  return (
    row?.createdAt ||
    row?.paidAt ||
    row?.issueDate ||
    row?.billDate ||
    row?.entryDate ||
    row?.assignedAt ||
    row?.dueDate ||
    row?.receivedAt ||
    row?.issuedAt ||
    row?.syncedAt ||
    null
  );
}

/** Only a returned status/type. No synthetic "ACTIVE". */
export function rowStatusValue(row: any): string | null {
  const value = row?.status ?? row?.type ?? null;
  return value ? String(value) : null;
}

export type StatusTone = "positive" | "warning" | "danger" | "neutral";

const positiveStatuses = ["PAID", "APPROVED", "POSTED", "SETTLED", "SUCCESS", "COMPLETED", "RECEIVED", "ACTIVE", "CLEARED"];
const warningStatuses = ["ISSUED", "PENDING", "SUBMITTED", "PARTIAL", "PARTIALLY_PAID", "DUE", "OPEN", "DRAFT"];
const dangerStatuses = ["OVERDUE", "FAILED", "REJECTED", "CANCELLED", "VOID", "EXPIRED"];

export function statusTone(status?: string | null): StatusTone {
  if (!status) return "neutral";
  const value = status.toUpperCase();
  if (positiveStatuses.includes(value)) return "positive";
  if (dangerStatuses.includes(value)) return "danger";
  if (warningStatuses.includes(value)) return "warning";
  return "neutral";
}

export const statusToneClass: Record<StatusTone, string> = {
  positive: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
  neutral: "bg-muted text-muted-foreground",
};

/** "PARTIALLY_PAID" -> "Partially paid" */
export function formatStatusLabel(status: string): string {
  const spaced = status.replaceAll("_", " ").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
