import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { downloadFileWithAuth, fetchJsonWithAuth } from "@/lib/api-client";

export type StudentFee = {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  balance: number;
  status: string;
  displayStatus: string;
  notes?: string | null;
  payments: Array<{ id: string; amount: number; reference: string; paidAt: string; receipts: Array<{ id: string; receiptNumber: string }> }>;
};

export function useStudentFees() {
  return useQuery<StudentFee[]>({ queryKey: ["student-fees"], queryFn: () => fetchJsonWithAuth("/student/fees"), staleTime: 15_000 });
}

export function useStartStudentCheckout() {
  const client = useQueryClient();
  return useMutation<{ orderId: string; paymentSessionId: string; amount: number; environment: "sandbox" | "production" }, Error, string>({
    mutationFn: (invoiceId) => fetchJsonWithAuth(`/student/fees/${invoiceId}/checkout`, { method: "POST", body: "{}" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["student-fees"] }),
  });
}

export function useStudentOrderStatus(orderId: string | null) {
  return useQuery<any>({
    queryKey: ["student-fee-order", orderId],
    queryFn: () => fetchJsonWithAuth(`/student/fees/orders/${encodeURIComponent(orderId as string)}/status`),
    enabled: Boolean(orderId),
    refetchInterval: (query) => query.state.data?.status === "PAID" || ["FAILED", "EXPIRED", "CANCELLED"].includes(query.state.data?.status) ? false : 3000,
    refetchIntervalInBackground: true,
  });
}

export function downloadStudentReceipt(receiptId: string, receiptNumber: string) {
  return downloadFileWithAuth(`/student/fees/receipts/${receiptId}/pdf`, `${receiptNumber}.pdf`);
}
