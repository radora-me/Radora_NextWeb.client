"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { ReceiptText, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney } from "@/lib/format";
import {
  countsByStatus,
  invoiceBalance,
  invoicePaid,
  invoiceTotal,
  isInvoiceOverdue,
  matchesStatusFilter,
  paginate,
  receiptCount,
  searchInvoices,
  sortByOldestDue,
  type FeeCounts,
  type FeeStatusFilter,
} from "../lib/fee-selectors";
import { FeePagination } from "./fee-pagination";
import { FeeReceiptsDialog } from "./fee-receipts-dialog";

const PAGE_SIZE = 10;

const filters: { id: FeeStatusFilter; label: string; countKey: keyof FeeCounts }[] = [
  { id: "all", label: "All", countKey: "all" },
  { id: "paid", label: "Paid", countKey: "paid" },
  { id: "part-paid", label: "Part-paid", countKey: "partPaid" },
  { id: "overdue", label: "Overdue", countKey: "overdue" },
];

type FeeDuesPanelProps = {
  invoices: any[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
  onRequestRemove: (invoice: any) => void;
  isRemoving?: boolean;
};

export function FeeDuesPanel({
  invoices,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onRequestRemove,
  isRemoving = false,
}: FeeDuesPanelProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FeeStatusFilter>("all");
  const [page, setPage] = useState(0);
  const [receiptsInvoice, setReceiptsInvoice] = useState<any | null>(null);

  const searched = useMemo(() => searchInvoices(invoices, query), [invoices, query]);
  const counts = useMemo(() => countsByStatus(searched), [searched]);
  const filtered = useMemo(
    () => searched.filter((invoice) => matchesStatusFilter(invoice, status)),
    [searched, status]
  );
  const ordered = status === "overdue" ? sortByOldestDue(filtered) : filtered;
  const paged = paginate(ordered, page, PAGE_SIZE);

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <div
          role="group"
          aria-label="Filter fee dues by status"
          className="flex flex-wrap items-center gap-1"
        >
          {filters.map((filter) => (
            <Button
              key={filter.id}
              size="sm"
              variant={status === filter.id ? "secondary" : "ghost"}
              aria-pressed={status === filter.id}
              onClick={() => {
                setStatus(filter.id);
                setPage(0);
              }}
            >
              {filter.label}
              <span className="tabular-nums text-muted-foreground">
                {counts[filter.countKey]}
              </span>
            </Button>
          ))}
        </div>

        <div className="relative ml-auto w-full max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Search student or invoice"
            aria-label="Search fee dues"
            className="h-8 pl-8 text-[13px]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-wrap items-center gap-3 px-4 py-6 text-sm">
          <p className="text-muted-foreground">
            {errorMessage || "Unable to load fee dues."}
          </p>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-4">Invoice</TableHead>
                <TableHead className="px-4">Student</TableHead>
                <TableHead className="px-4">Due date</TableHead>
                <TableHead className="px-4 text-right">Total</TableHead>
                <TableHead className="px-4 text-right">Paid</TableHead>
                <TableHead className="px-4 text-right">Balance</TableHead>
                <TableHead className="px-4">Status</TableHead>
                <TableHead className="px-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <p>No fee dues returned.</p>
                    {query || status !== "all" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setQuery("");
                          setStatus("all");
                          setPage(0);
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ) : (
                paged.rows.map((invoice) => {
                  const overdue = isInvoiceOverdue(invoice);
                  const receipts = receiptCount(invoice);
                  const balance = invoiceBalance(invoice);

                  return (
                    <TableRow key={invoice.id ?? invoice.invoiceNumber}>
                      <TableCell className="px-4 py-2.5 font-medium">
                        {invoice.invoiceNumber ?? "—"}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <span className="block truncate">{invoice.student?.name ?? "—"}</span>
                        {invoice.student?.rollNumber ? (
                          <span className="block text-xs text-muted-foreground">
                            {invoice.student.rollNumber}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-muted-foreground">
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right tabular-nums">
                        {formatMoney(invoiceTotal(invoice))}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatMoney(invoicePaid(invoice))}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-right font-medium tabular-nums">
                        {formatMoney(balance)}
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className={
                              invoice.status === "PAID"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }
                          >
                            {invoice.status ?? "—"}
                          </Badge>
                          {overdue ? (
                            <Badge variant="outline" className="border-red-200 text-red-700">
                              Overdue
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          {receipts > 0 ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReceiptsInvoice(invoice)}
                            >
                              <ReceiptText aria-hidden="true" />
                              Receipts ({receipts})
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                          {invoice.status === "ISSUED" && invoicePaid(invoice) === 0 ? (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove issued due ${invoice.invoiceNumber ?? ""}`}
                              title="Remove issued due"
                              disabled={isRemoving}
                              onClick={() => onRequestRemove(invoice)}
                            >
                              <Trash2 aria-hidden="true" className="text-destructive" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <FeePagination
            page={paged.page}
            pageCount={paged.pageCount}
            from={paged.from}
            to={paged.to}
            total={paged.total}
            onPageChange={setPage}
          />
        </>
      )}

      <FeeReceiptsDialog
        invoice={receiptsInvoice}
        onOpenChange={(open) => {
          if (!open) setReceiptsInvoice(null);
        }}
      />
    </div>
  );
}
