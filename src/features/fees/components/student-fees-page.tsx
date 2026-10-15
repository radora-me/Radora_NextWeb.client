"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreditCard, Download, FileText, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useStudentFees, useStartStudentCheckout, useStudentOrderStatus, downloadStudentReceipt } from "../services/student-fees.service";

declare global {
  interface Window { Cashfree?: (options: { mode: "sandbox" | "production" }) => { checkout: (options: { paymentSessionId: string; redirectTarget: "_self" }) => Promise<unknown> }; }
}

function currency(value: number) { return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0)); }
function date(value: string) { return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }); }

async function loadCashfree() {
  if (window.Cashfree) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-cashfree-sdk="true"]');
    if (existing) { existing.addEventListener("load", () => resolve()); existing.addEventListener("error", () => reject(new Error("Cashfree checkout could not be loaded"))); return; }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true; script.dataset.cashfreeSdk = "true";
    script.onload = () => resolve(); script.onerror = () => reject(new Error("Cashfree checkout could not be loaded"));
    document.head.appendChild(script);
  });
}

export function StudentFeesPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("cashfree_order_id") || searchParams.get("order_id");
  const fees = useStudentFees();
  const checkout = useStartStudentCheckout();
  const status = useStudentOrderStatus(orderId);
  const [busyInvoice, setBusyInvoice] = useState<string | null>(null);
  const balance = useMemo(() => (fees.data || []).reduce((sum, fee) => sum + Number(fee.balance || 0), 0), [fees.data]);

  useEffect(() => {
    if (status.data?.status === "PAID") { toast.success("Payment received. Your receipt is ready below."); fees.refetch(); }
    if (["FAILED", "EXPIRED", "CANCELLED"].includes(status.data?.status)) toast.error(`Payment ${String(status.data.status).toLowerCase()}. You can try again.`);
  }, [status.data?.status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function pay(invoiceId: string) {
    try {
      setBusyInvoice(invoiceId);
      const order = await checkout.mutateAsync(invoiceId);
      await loadCashfree();
      if (!window.Cashfree) throw new Error("Cashfree checkout is unavailable");
      await window.Cashfree({ mode: order.environment }).checkout({ paymentSessionId: order.paymentSessionId, redirectTarget: "_self" });
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to start payment"); setBusyInvoice(null); }
  }

  return <div className="mx-auto max-w-5xl space-y-6">
    <div><p className="text-xs font-medium uppercase tracking-wider text-primary">Student / Fees</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Fees & payments</h1><p className="mt-1 text-sm text-muted-foreground">Pay outstanding dues securely with Cashfree and download official receipts.</p></div>
    <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">Outstanding</p><p className="mt-2 text-2xl font-semibold">{currency(balance)}</p></div><div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">Invoices</p><p className="mt-2 text-2xl font-semibold">{fees.data?.length || 0}</p></div><div className="rounded-2xl border bg-card p-5"><p className="text-sm text-muted-foreground">Payment security</p><p className="mt-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Cashfree hosted checkout</p></div></div>
    {fees.error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Unable to load fee dues: {fees.error instanceof Error ? fees.error.message : "Please try again after the database migration is deployed."}</div>}
    {orderId && <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">{status.isLoading || status.data?.status === "ACTIVE" ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Confirming your payment with Cashfree…</span> : status.data?.status === "PAID" ? "Payment confirmed. Your receipt is available in the payment history." : `Payment status: ${status.data?.status || "checking"}`}</div>}
    <div className="rounded-2xl border bg-card shadow-sm"><div className="border-b p-5"><h2 className="font-semibold">Fee dues</h2><p className="mt-1 text-xs text-muted-foreground">The final payment status is updated from Cashfree’s server-side confirmation.</p></div>{fees.isLoading ? <p className="p-8 text-sm text-muted-foreground">Loading dues…</p> : fees.data?.length ? <div className="divide-y">{fees.data.map((fee) => { const paid = fee.displayStatus === "PAID"; return <div key={fee.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /><p className="font-medium">{fee.invoiceNumber}</p><span className={`rounded-full px-2 py-0.5 text-[11px] ${paid ? "bg-emerald-100 text-emerald-700" : fee.displayStatus === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{fee.displayStatus}</span></div><p className="mt-2 text-sm text-muted-foreground">Due {date(fee.dueDate)} · Total {currency(fee.total)}</p><p className="mt-1 text-sm">Balance <span className="font-semibold">{currency(fee.balance)}</span></p></div><div className="flex flex-wrap items-center gap-2">{!paid && <button disabled={busyInvoice === fee.id} onClick={() => pay(fee.id)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"><CreditCard className="h-4 w-4" />{busyInvoice === fee.id ? "Opening…" : "Pay securely"}</button>}{fee.payments.flatMap((payment) => payment.receipts).map((receipt) => <button key={receipt.id} onClick={() => downloadStudentReceipt(receipt.id, receipt.receiptNumber).catch((error) => toast.error(error.message))} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"><Download className="h-4 w-4" />{receipt.receiptNumber}</button>)}</div></div>; })}</div> : <p className="p-8 text-sm text-muted-foreground">No fee dues have been issued to your account.</p>}</div>
  </div>;
}
