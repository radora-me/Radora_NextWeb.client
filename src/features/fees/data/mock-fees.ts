export interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  frequency: "monthly" | "quarterly" | "annually" | "one-time";
  applicableTo: string;
  description?: string;
}

export interface FeePayment {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  section: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "partial" | "pending" | "overdue";
  receiptNo?: string;
}

export const feeStructures: FeeStructure[] = [
  { id: "FS01", name: "Tuition Fee", amount: 5000, frequency: "monthly", applicableTo: "All Classes", description: "Monthly tuition charges" },
  { id: "FS02", name: "Transport Fee", amount: 2000, frequency: "monthly", applicableTo: "Bus Students", description: "School bus transportation" },
  { id: "FS03", name: "Lab Fee", amount: 3000, frequency: "annually", applicableTo: "Classes 9-12", description: "Science and computer lab usage" },
  { id: "FS04", name: "Library Fee", amount: 1500, frequency: "annually", applicableTo: "All Classes", description: "Library access and maintenance" },
  { id: "FS05", name: "Sports Fee", amount: 2000, frequency: "annually", applicableTo: "All Classes", description: "Sports equipment and ground maintenance" },
  { id: "FS06", name: "Exam Fee", amount: 1000, frequency: "quarterly", applicableTo: "All Classes", description: "Examination charges" },
  { id: "FS07", name: "Admission Fee", amount: 15000, frequency: "one-time", applicableTo: "New Admissions", description: "One-time admission processing" },
  { id: "FS08", name: "Development Fund", amount: 5000, frequency: "annually", applicableTo: "All Classes", description: "Infrastructure development" },
];

export const feePayments: FeePayment[] = [
  { id: "FP001", studentId: "STU001", studentName: "Aarav Sharma", class: "10", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-08", status: "paid", receiptNo: "REC-2026-001" },
  { id: "FP002", studentId: "STU002", studentName: "Diya Patel", class: "10", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-09", status: "paid", receiptNo: "REC-2026-002" },
  { id: "FP003", studentId: "STU003", studentName: "Vihaan Gupta", class: "10", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 3000, dueDate: "2026-06-10", paidDate: "2026-06-10", status: "partial" },
  { id: "FP004", studentId: "STU004", studentName: "Ananya Iyer", class: "10", section: "B", feeType: "Tuition Fee", amount: 5000, paidAmount: 0, dueDate: "2026-06-10", status: "overdue" },
  { id: "FP005", studentId: "STU005", studentName: "Arjun Mehta", class: "10", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-05", status: "paid", receiptNo: "REC-2026-005" },
  { id: "FP006", studentId: "STU006", studentName: "Isha Nair", class: "9", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 0, dueDate: "2026-06-10", status: "overdue" },
  { id: "FP007", studentId: "STU007", studentName: "Kabir Singh", class: "9", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-07", status: "paid", receiptNo: "REC-2026-007" },
  { id: "FP008", studentId: "STU008", studentName: "Mira Joshi", class: "12", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 0, dueDate: "2026-07-10", status: "pending" },
  { id: "FP009", studentId: "STU009", studentName: "Rohan Verma", class: "12", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 2500, dueDate: "2026-06-10", status: "partial" },
  { id: "FP010", studentId: "STU010", studentName: "Priya Kumar", class: "11", section: "A", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-01", status: "paid", receiptNo: "REC-2026-010" },
  { id: "FP011", studentId: "STU011", studentName: "Aditya Rao", class: "11", section: "A", feeType: "Lab Fee", amount: 3000, paidAmount: 0, dueDate: "2026-06-15", status: "pending" },
  { id: "FP012", studentId: "STU012", studentName: "Kavya Desai", class: "10", section: "B", feeType: "Transport Fee", amount: 2000, paidAmount: 2000, dueDate: "2026-06-10", paidDate: "2026-06-09", status: "paid", receiptNo: "REC-2026-012" },
  { id: "FP013", studentId: "STU013", studentName: "Neil Bhat", class: "10", section: "B", feeType: "Tuition Fee", amount: 5000, paidAmount: 0, dueDate: "2026-06-10", status: "overdue" },
  { id: "FP014", studentId: "STU014", studentName: "Riya Pandey", class: "9", section: "B", feeType: "Tuition Fee", amount: 5000, paidAmount: 5000, dueDate: "2026-06-10", paidDate: "2026-06-10", status: "paid", receiptNo: "REC-2026-014" },
  { id: "FP015", studentId: "STU015", studentName: "Siddharth Menon", class: "9", section: "B", feeType: "Exam Fee", amount: 1000, paidAmount: 0, dueDate: "2026-07-01", status: "pending" },
];

export const collectionSummary = {
  totalCollected: 1245000,
  totalPending: 385000,
  totalOverdue: 142000,
  collectionRate: 76.4,
};
