"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  downloadFinanceReceipt,
  viewFinanceReceipt,
} from "@/features/finance/services/finance.service";
import { paginate } from "../lib/fee-selectors";
import { FeePagination } from "./fee-pagination";

const PAGE_SIZE = 10;

const shellClassName = "overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10";

function ReceiptButtons({ receipts }: { receipts: any[] }) {
  if (!receipts?.length) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {receipts.map((receipt) => (
        <div key={receipt.id} className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="View receipt"
            title="View receipt"
            onClick={() => viewFinanceReceipt(receipt.id)}
          >
            <Eye aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Download receipt"
            title="Download receipt"
            onClick={() =>
              downloadFinanceReceipt(
                receipt.id,
                receipt.receiptNumber ?? "receipt"
              ).catch((error: Error) => toast.error(error.message))
            }
          >
            <Download aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}

export function PaymentConfirmationsPanel({
  payments,
  isLoading,
}: {
  payments: any[];
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const paged = paginate(payments, page, PAGE_SIZE);

  if (isLoading) {
    return (
      <div className={shellClassName}>
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Reference</TableHead>
            <TableHead className="px-4">Student / receiver</TableHead>
            <TableHead className="px-4">Paid date</TableHead>
            <TableHead className="px-4 text-right">Amount</TableHead>
            <TableHead className="px-4">Status</TableHead>
            <TableHead className="px-4 text-right">Receipts</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                No payments returned.
              </TableCell>
            </TableRow>
          ) : (
            paged.rows.map((payment, index) => (
              <TableRow key={payment.id ?? index}>
                <TableCell className="px-4 py-2.5 font-medium">
                  {payment.reference ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {payment.invoice?.student?.name ?? payment.receivedBy?.name ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-muted-foreground">
                  {formatDate(payment.paidAt)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-right tabular-nums">
                  {formatMoney(payment.amount)}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <Badge
                    variant="secondary"
                    className={
                      payment.status === "PAID"
                        ? "bg-emerald-100 text-emerald-700"
                        : ["FAILED", "EXPIRED", "CANCELLED"].includes(String(payment.status))
                          ? "bg-red-100 text-red-700"
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {payment.status ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <ReceiptButtons receipts={payment.receipts ?? []} />
                </TableCell>
              </TableRow>
            ))
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
    </div>
  );
}

export function RemovedDuesPanel({
  invoices,
  isLoading,
}: {
  invoices: any[];
  isLoading: boolean;
}) {
  const [page, setPage] = useState(0);
  const paged = paginate(invoices, page, PAGE_SIZE);

  if (isLoading) {
    return (
      <div className={shellClassName}>
        <div className="space-y-2 p-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Invoice</TableHead>
            <TableHead className="px-4">Student</TableHead>
            <TableHead className="px-4">Removed date</TableHead>
            <TableHead className="px-4">Removed by</TableHead>
            <TableHead className="px-4">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                No removed dues returned.
              </TableCell>
            </TableRow>
          ) : (
            paged.rows.map((invoice, index) => (
              <TableRow key={invoice.id ?? index}>
                <TableCell className="px-4 py-2.5 font-medium">
                  {invoice.invoiceNumber ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  {invoice.student?.name ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-muted-foreground">
                  {formatDate(invoice.deletedAt)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-muted-foreground">
                  {invoice.deletedBy?.name ?? "—"}
                </TableCell>
                <TableCell className="px-4 py-2.5">
                  <Badge variant="secondary" className="bg-muted text-muted-foreground">
                    {invoice.status ?? "—"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
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
    </div>
  );
}
