import { Exam } from "@/types/api.types";
import { GradeEntry } from "@/types/api.types";
export const mockExams: Exam[] = [
  { id: "EX001", name: "Mid-Term Examination", subject: "Mathematics", class: "10-A", date: "2026-06-20", startTime: "09:00", endTime: "12:00", room: "Hall A", totalMarks: 100, status: "upcoming" },
  { id: "EX002", name: "Mid-Term Examination", subject: "Physics", class: "10-A", date: "2026-06-22", startTime: "09:00", endTime: "12:00", room: "Hall A", totalMarks: 100, status: "upcoming" },
  { id: "EX003", name: "Mid-Term Examination", subject: "Chemistry", class: "10-A", date: "2026-06-24", startTime: "09:00", endTime: "12:00", room: "Hall B", totalMarks: 100, status: "upcoming" },
  { id: "EX004", name: "Mid-Term Examination", subject: "English", class: "10-A", date: "2026-06-26", startTime: "09:00", endTime: "11:00", room: "Hall A", totalMarks: 100, status: "upcoming" },
  { id: "EX005", name: "Mid-Term Examination", subject: "Hindi", class: "10-A", date: "2026-06-28", startTime: "09:00", endTime: "11:00", room: "Hall B", totalMarks: 100, status: "upcoming" },
  { id: "EX006", name: "Unit Test 2", subject: "Mathematics", class: "12-A", date: "2026-06-18", startTime: "10:00", endTime: "11:30", room: "Room 201", totalMarks: 50, status: "upcoming" },
  { id: "EX007", name: "Unit Test 2", subject: "Physics", class: "12-A", date: "2026-06-19", startTime: "10:00", endTime: "11:30", room: "Room 201", totalMarks: 50, status: "upcoming" },
  { id: "EX008", name: "Unit Test 1", subject: "Mathematics", class: "10-A", date: "2026-05-10", startTime: "09:00", endTime: "10:30", room: "Room 101", totalMarks: 50, status: "completed" },
  { id: "EX009", name: "Unit Test 1", subject: "Physics", class: "10-A", date: "2026-05-12", startTime: "09:00", endTime: "10:30", room: "Room 102", totalMarks: 50, status: "completed" },
  { id: "EX010", name: "Unit Test 1", subject: "English", class: "10-A", date: "2026-05-14", startTime: "09:00", endTime: "10:30", room: "Room 101", totalMarks: 50, status: "completed" },
  { id: "EX011", name: "Unit Test 1", subject: "Chemistry", class: "9-A", date: "2026-05-11", startTime: "10:00", endTime: "11:30", room: "Lab 1", totalMarks: 50, status: "completed" },
  { id: "EX012", name: "Practical Exam", subject: "Physics", class: "12-A", date: "2026-07-05", startTime: "09:00", endTime: "13:00", room: "Physics Lab", totalMarks: 30, status: "upcoming" },
];

export const mockGrades: GradeEntry[] = [
  { studentId: "STU001", studentName: "Aarav Sharma", rollNumber: "1001", marks: 87, totalMarks: 100, grade: "A", percentage: 87 },
  { studentId: "STU002", studentName: "Diya Patel", rollNumber: "1002", marks: 94, totalMarks: 100, grade: "A+", percentage: 94 },
  { studentId: "STU003", studentName: "Vihaan Gupta", rollNumber: "1003", marks: 72, totalMarks: 100, grade: "B+", percentage: 72 },
  { studentId: "STU004", studentName: "Ananya Iyer", rollNumber: "1004", marks: 91, totalMarks: 100, grade: "A+", percentage: 91 },
  { studentId: "STU005", studentName: "Arjun Mehta", rollNumber: "1005", marks: 65, totalMarks: 100, grade: "B", percentage: 65 },
  { studentId: "STU006", studentName: "Isha Nair", rollNumber: "1006", marks: 78, totalMarks: 100, grade: "B+", percentage: 78 },
  { studentId: "STU007", studentName: "Kabir Singh", rollNumber: "1007", marks: 83, totalMarks: 100, grade: "A", percentage: 83 },
  { studentId: "STU008", studentName: "Mira Joshi", rollNumber: "1008", marks: 96, totalMarks: 100, grade: "A+", percentage: 96 },
  { studentId: "STU009", studentName: "Rohan Verma", rollNumber: "1009", marks: 58, totalMarks: 100, grade: "C", percentage: 58 },
  { studentId: "STU010", studentName: "Priya Kumar", rollNumber: "1010", marks: 88, totalMarks: 100, grade: "A", percentage: 88 },
  { studentId: "STU011", studentName: "Aditya Rao", rollNumber: "1011", marks: 45, totalMarks: 100, grade: "D", percentage: 45 },
  { studentId: "STU012", studentName: "Kavya Desai", rollNumber: "1012", marks: 76, totalMarks: 100, grade: "B+", percentage: 76 },
  { studentId: "STU013", studentName: "Neil Bhat", rollNumber: "1013", marks: 82, totalMarks: 100, grade: "A", percentage: 82 },
  { studentId: "STU014", studentName: "Riya Pandey", rollNumber: "1014", marks: 69, totalMarks: 100, grade: "B", percentage: 69 },
  { studentId: "STU015", studentName: "Siddharth Menon", rollNumber: "1015", marks: 91, totalMarks: 100, grade: "A+", percentage: 91 },
];

export const classPerformance = [
  { class: "12-A", avgPercentage: 82.5, toppers: 5, failed: 1 },
  { class: "12-B", avgPercentage: 78.3, toppers: 3, failed: 2 },
  { class: "11-A", avgPercentage: 80.1, toppers: 4, failed: 1 },
  { class: "11-B", avgPercentage: 75.8, toppers: 2, failed: 3 },
  { class: "10-A", avgPercentage: 79.4, toppers: 4, failed: 2 },
  { class: "10-B", avgPercentage: 76.9, toppers: 3, failed: 2 },
  { class: "9-A", avgPercentage: 81.2, toppers: 5, failed: 1 },
  { class: "9-B", avgPercentage: 74.6, toppers: 2, failed: 3 },
];
