"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Download, Eye } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/format";
import {
  downloadFinanceReceipt,
  viewFinanceReceipt,
} from "@/features/finance/services/finance.service";
import { receiptsOf } from "../lib/fee-selectors";

type FeeReceiptsDialogProps = {
  invoice: any | null;
  onOpenChange: (open: boolean) => void;
};

export function FeeReceiptsDialog({ invoice, onOpenChange }: FeeReceiptsDialogProps) {
  const receipts = invoice ? receiptsOf(invoice) : [];

  return (
    <Dialog open={invoice !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Receipts</DialogTitle>
          <DialogDescription>
            {invoice?.invoiceNumber ?? "Invoice"} · {invoice?.student?.name ?? "Student"}
          </DialogDescription>
        </DialogHeader>

        {receipts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No receipts returned.</p>
        ) : (
          <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {receipts.map((entry, index) => (
              <li
                key={entry.receipt.id ?? index}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {entry.receipt.receiptNumber ?? "Receipt"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[entry.reference, entry.paidAt ? formatDate(entry.paidAt) : null]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label="View receipt"
                    title="View receipt"
                    onClick={() => viewFinanceReceipt(entry.receipt.id)}
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
                        entry.receipt.id,
                        entry.receipt.receiptNumber ?? "receipt"
                      ).catch((error: Error) => toast.error(error.message))
                    }
                  >
                    <Download aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
