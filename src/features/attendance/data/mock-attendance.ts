import type { Student } from "@/types";

// Attendance record for a single student on a given day
export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: "present" | "absent" | "late" | "excused";
}

export interface DailyAttendance {
  date: string;
  class: string;
  section: string;
  records: AttendanceRecord[];
  presentCount: number;
  absentCount: number;
  lateCount: number;
}

// Monthly summary per class
export interface AttendanceSummary {
  class: string;
  section: string;
  totalStudents: number;
  avgAttendance: number;
  month: string;
}

// Generate attendance records for a class
function generateRecords(className: string, section: string): AttendanceRecord[] {
  const names: Record<string, string[]> = {
    "10-A": ["Aarav Sharma", "Diya Patel", "Vihaan Gupta", "Ananya Iyer", "Arjun Mehta", "Isha Nair", "Kabir Singh", "Mira Joshi", "Rohan Verma", "Priya Kumar", "Aditya Rao", "Kavya Desai", "Neil Bhat", "Riya Pandey", "Siddharth Menon", "Tara Kulkarni", "Vikram Reddy", "Zara Khan", "Arnav Saxena", "Pooja Hegde", "Harsh Tiwari", "Nisha Aggarwal", "Dev Chauhan", "Sanya Deshpande", "Karan Bhatt"],
    "10-B": ["Ayaan Mishra", "Divya Sharma", "Ishaan Patel", "Jiya Gupta", "Laksh Nair", "Meera Singh", "Om Verma", "Pihu Joshi", "Reyansh Kumar", "Sara Rao", "Tanish Desai", "Uma Bhat", "Vivaan Pandey", "Wren Menon", "Yash Kulkarni", "Aanya Reddy", "Bhavya Khan", "Chirag Saxena", "Dhruv Hegde", "Eva Tiwari", "Farhan Aggarwal", "Gauri Chauhan", "Hemant Deshpande", "Inaya Bhatt", "Jay Mishra"],
    "9-A": ["Advait Sharma", "Bhumi Patel", "Chetan Gupta", "Deepika Iyer", "Eshan Mehta", "Falguni Nair", "Gaurav Singh", "Hina Joshi", "Ishan Verma", "Jasmine Kumar", "Kishore Rao", "Lavanya Desai", "Manav Bhat", "Nandini Pandey", "Oscar Menon", "Pallavi Kulkarni", "Qasim Reddy", "Radhika Khan", "Sameer Saxena", "Tanvi Hegde", "Uday Tiwari", "Vandana Aggarwal", "Wasim Chauhan", "Xena Deshpande", "Yuvraj Bhatt"],
  };

  const classKey = `${className}-${section}`;
  const studentNames = names[classKey] || names["10-A"];

  return studentNames.map((name, i) => {
    const rand = Math.random();
    let status: AttendanceRecord["status"] = "present";
    if (rand > 0.92) status = "absent";
    else if (rand > 0.87) status = "late";
    else if (rand > 0.84) status = "excused";

    return {
      studentId: `STU${String(i + 1).padStart(3, "0")}`,
      studentName: name,
      rollNumber: String(1001 + i),
      status,
    };
  });
}

export const todayAttendance: DailyAttendance[] = [
  (() => {
    const records = generateRecords("10", "A");
    return {
      date: new Date().toISOString().split("T")[0],
      class: "10",
      section: "A",
      records,
      presentCount: records.filter((r) => r.status === "present").length,
      absentCount: records.filter((r) => r.status === "absent").length,
      lateCount: records.filter((r) => r.status === "late").length,
    };
  })(),
  (() => {
    const records = generateRecords("10", "B");
    return {
      date: new Date().toISOString().split("T")[0],
      class: "10",
      section: "B",
      records,
      presentCount: records.filter((r) => r.status === "present").length,
      absentCount: records.filter((r) => r.status === "absent").length,
      lateCount: records.filter((r) => r.status === "late").length,
    };
  })(),
  (() => {
    const records = generateRecords("9", "A");
    return {
      date: new Date().toISOString().split("T")[0],
      class: "9",
      section: "A",
      records,
      presentCount: records.filter((r) => r.status === "present").length,
      absentCount: records.filter((r) => r.status === "absent").length,
      lateCount: records.filter((r) => r.status === "late").length,
    };
  })(),
];

export const attendanceSummaries: AttendanceSummary[] = [
  { class: "12", section: "A", totalStudents: 30, avgAttendance: 96.2, month: "June 2026" },
  { class: "12", section: "B", totalStudents: 28, avgAttendance: 93.8, month: "June 2026" },
  { class: "11", section: "A", totalStudents: 32, avgAttendance: 94.5, month: "June 2026" },
  { class: "11", section: "B", totalStudents: 30, avgAttendance: 91.2, month: "June 2026" },
  { class: "10", section: "A", totalStudents: 25, avgAttendance: 95.1, month: "June 2026" },
  { class: "10", section: "B", totalStudents: 25, avgAttendance: 92.7, month: "June 2026" },
  { class: "9", section: "A", totalStudents: 25, avgAttendance: 93.4, month: "June 2026" },
  { class: "9", section: "B", totalStudents: 27, avgAttendance: 90.8, month: "June 2026" },
  { class: "8", section: "A", totalStudents: 30, avgAttendance: 94.9, month: "June 2026" },
  { class: "8", section: "B", totalStudents: 28, avgAttendance: 91.5, month: "June 2026" },
  { class: "7", section: "A", totalStudents: 32, avgAttendance: 95.8, month: "June 2026" },
  { class: "7", section: "B", totalStudents: 30, avgAttendance: 93.2, month: "June 2026" },
];

export const weeklyTrend = [
  { day: "Mon", present: 94, absent: 6 },
  { day: "Tue", present: 96, absent: 4 },
  { day: "Wed", present: 93, absent: 7 },
  { day: "Thu", present: 95, absent: 5 },
  { day: "Fri", present: 91, absent: 9 },
];
