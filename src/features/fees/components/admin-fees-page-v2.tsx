"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { Download, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { downloadFileWithAuth } from "@/lib/api-client";
import { formatMoney } from "@/lib/format";
import {
  useCreateFinanceRecord,
  useDeleteFinanceInvoice,
  useFinanceResource,
} from "@/features/finance/services/finance.service";
import { summariseInvoices } from "../lib/fee-selectors";
import { CreateFeeDueDialog } from "./create-fee-due-dialog";
import { FeeDuesPanel } from "./fee-dues-panel";
import { FeesKpiRow } from "./fees-kpi-row";
import {
  PaymentConfirmationsPanel,
  RemovedDuesPanel,
} from "./fees-history-panels";

export function AdminFeesPage() {
  const invoices = useFinanceResource("invoices");
  const deletedInvoices = useFinanceResource("deletedInvoices");
  const payments = useFinanceResource("payments");
  const create = useCreateFinanceRecord();
  const remove = useDeleteFinanceInvoice();

  const [tab, setTab] = useState("dues");
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<any | null>(null);

  const invoiceRows = useMemo<any[]>(() => invoices.data ?? [], [invoices.data]);
  const paymentRows = useMemo<any[]>(() => payments.data ?? [], [payments.data]);
  const deletedRows = useMemo<any[]>(
    () => deletedInvoices.data ?? [],
    [deletedInvoices.data]
  );

  const summary = useMemo(() => summariseInvoices(invoiceRows), [invoiceRows]);

  const errorMessage =
    invoices.error || payments.error
      ? (invoices.error || payments.error) instanceof Error
        ? ((invoices.error || payments.error) as Error).message
        : "Please check the database migration."
      : null;

  const exportCsv = () =>
    downloadFileWithAuth(
      "/finance/export?resource=invoices&format=csv",
      "radora-invoices.csv"
    ).catch((error: Error) => toast.error(error.message));

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());

    create.mutate(
      { type: "invoices", body },
      {
        onSuccess: () => {
          setCreateOpen(false);
          toast.success("Fee due issued to the student");
        },
        onError: (error) => toast.error(error.message),
      }
    );
  };

  const confirmRemoval = () => {
    if (!pendingRemoval) return;

    remove.mutate(pendingRemoval.id, {
      onSuccess: () => {
        toast.success("Issued due removed and recorded");
        // The service does not invalidate the audit list, so refresh it here.
        deletedInvoices.refetch();
        setPendingRemoval(null);
      },
      onError: (error) => toast.error(error.message),
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Fees &amp; payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Issue dues, confirm payments and download receipts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download aria-hidden="true" />
            Export
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <FilePlus2 aria-hidden="true" />
            Create fee due
          </Button>
        </div>
      </header>

      {errorMessage ? (
        <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-destructive/20">
          Unable to load fee records. {errorMessage}
        </div>
      ) : null}

      <FeesKpiRow summary={summary} isLoading={invoices.isLoading} />

      <Tabs value={tab} onValueChange={(value) => setTab(String(value))}>
        <TabsList className="max-w-full overflow-x-auto overflow-y-hidden">
          <TabsTrigger value="dues">
            <span className="sm:hidden">Dues</span>
            <span className="hidden sm:inline">Fee dues</span>
            <span className="tabular-nums text-muted-foreground">
              {invoiceRows.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="payments">
            <span className="sm:hidden">Payments</span>
            <span className="hidden sm:inline">Payment confirmations</span>
            <span className="tabular-nums text-muted-foreground">
              {paymentRows.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="removed">
            <span className="sm:hidden">Removed</span>
            <span className="hidden sm:inline">Removed dues</span>
            <span className="tabular-nums text-muted-foreground">
              {deletedRows.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dues" className="mt-3">
          <FeeDuesPanel
            invoices={invoiceRows}
            isLoading={invoices.isLoading}
            isError={invoices.isError}
            errorMessage={errorMessage ?? undefined}
            onRetry={() => invoices.refetch()}
            onRequestRemove={setPendingRemoval}
            isRemoving={remove.isPending}
          />
        </TabsContent>

        <TabsContent value="payments" className="mt-3">
          <PaymentConfirmationsPanel
            payments={paymentRows}
            isLoading={payments.isLoading}
          />
        </TabsContent>

        <TabsContent value="removed" className="mt-3">
          <RemovedDuesPanel
            invoices={deletedRows}
            isLoading={deletedInvoices.isLoading}
          />
        </TabsContent>
      </Tabs>

      <CreateFeeDueDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={submit}
        isPending={create.isPending}
      />

      <Dialog
        open={pendingRemoval !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRemoval(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove issued due</DialogTitle>
            <DialogDescription>
              Only an untouched issued due can be removed; the removal is retained
              permanently in the audit list.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Invoice</span>
            <span className="font-medium">{pendingRemoval?.invoiceNumber ?? "—"}</span>
            <span className="text-muted-foreground">Student</span>
            <span>{pendingRemoval?.student?.name ?? "—"}</span>
            <span className="text-muted-foreground">Total</span>
            <span className="tabular-nums">{formatMoney(pendingRemoval?.total)}</span>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingRemoval(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              loading={remove.isPending}
              onClick={confirmRemoval}
            >
              Remove due
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
