/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadFileWithAuth, fetchJsonWithAuth, fetchWithAuth } from "@/lib/api-client";

export type FinanceResource = "dashboard" | "invoices" | "payments" | "expenses" | "journals" | "accounts" | "budgets" | "vendors" | "assets" | "categories" | "feeStructures" | "assignments" | "installments" | "discounts" | "scholarships" | "refunds" | "receipts" | "incomes" | "recurringExpenses" | "bankAccounts" | "payrollIntegrations";

export function useFinanceDashboard() {
  return useQuery<any>({ queryKey: ["finance-dashboard"], queryFn: () => fetchJsonWithAuth("/finance/dashboard"), staleTime: 30_000 });
}

export function useFinanceResource(resource: FinanceResource, enabled = true) {
  return useQuery<any[]>({ queryKey: ["finance-resource", resource], queryFn: () => fetchJsonWithAuth(`/finance/${resource}`), enabled });
}

function mutation(endpoint: string, method = "POST") {
  return async (body: unknown) => {
    const response = await fetchWithAuth(endpoint, { method, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "Finance request failed");
    return data;
  };
}

export function useCreateFinanceRecord() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ type, body }: { type: "invoices" | "payments" | "expenses" | "journals"; body: unknown }) => mutation(`/finance/${type}`)(body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["finance-dashboard"] }); client.invalidateQueries({ queryKey: ["finance-resource"] }); },
  });
}

export function useUpdateExpense() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) => mutation(`/finance/expenses/${id}`, "PATCH")(body),
    onSuccess: () => { client.invalidateQueries({ queryKey: ["finance-dashboard"] }); client.invalidateQueries({ queryKey: ["finance-resource", "expenses"] }); },
  });
}

export function exportFinance(resource: FinanceResource, format: "csv" | "pdf") {
  return downloadFileWithAuth(`/finance/export?resource=${resource}&format=${format}`, `radora-${resource}.${format}`);
}
