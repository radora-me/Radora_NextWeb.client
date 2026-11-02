export type DemoPageId =
  | "dashboard"
  | "teacher-dashboard"
  | "student-dashboard"
  | "students"
  | "teachers"
  | "attendance"
  | "exams"
  | "timetable"
  | "events"
  | "fees"
  | "library"
  | "notifications";

export const demoAttendanceTrend = [
  { month: "Jan", rate: 91 },
  { month: "Feb", rate: 94 },
  { month: "Mar", rate: 92 },
  { month: "Apr", rate: 96 },
  { month: "May", rate: 95 },
  { month: "Jun", rate: 97 },
];

export const demoClassPerformance = [
  { name: "Class 6", score: 82 },
  { name: "Class 7", score: 88 },
  { name: "Class 8", score: 79 },
  { name: "Class 9", score: 91 },
  { name: "Class 10", score: 86 },
];

export const demoTeacherCourses = [
  { title: "Mathematics", section: "Class 8 · Section A", students: 32, rating: 8.7 },
  { title: "Mathematics", section: "Class 9 · Section B", students: 29, rating: 8.4 },
  { title: "Science", section: "Class 8 · Section B", students: 31, rating: 8.9 },
  { title: "Science", section: "Class 10 · Section A", students: 28, rating: 8.2 },
  { title: "Advisory", section: "Class 7 · Section A", students: 30, rating: 8.6 },
];

export const demoTeacherAssignments = [
  { title: "Fractions & ratios practice", course: "Mathematics · Class 8A", due: "Due tomorrow", submitted: 27, total: 32, status: "Published" },
  { title: "Forces and motion review", course: "Science · Class 8B", due: "Due 12 Nov", submitted: 24, total: 31, status: "Published" },
  { title: "Geometry checkpoint", course: "Mathematics · Class 9B", due: "Draft", submitted: 0, total: 29, status: "Draft" },
  { title: "Lab observation journal", course: "Science · Class 10A", due: "Due 14 Nov", submitted: 21, total: 28, status: "Published" },
];

export const demoStudentDashboard = {
  name: "Aarav Mehta",
  attendance: 94.2,
  streak: 8,
  nextClass: {
    subject: "Mathematics",
    teacher: "Ms. Mira Shah",
    room: "Room 302",
    time: "10:30 AM – 11:15 AM",
    startsIn: "Starts in 15 minutes",
  },
  announcements: [
    { title: "Science project deadline extended", author: "Ms. Neha Rao", time: "Today", tone: "indigo" },
    { title: "Tomorrow is a school holiday", author: "Radora Academy", time: "Yesterday", tone: "amber" },
    { title: "Library reading circle sign-ups", author: "Library team", time: "Monday", tone: "emerald" },
  ],
};

export const demoStudents = [
  { id: "DEMO-2401", name: "Aarav S.", grade: "Class 8 · A", attendance: "96%", status: "Active" },
  { id: "DEMO-2402", name: "Diya R.", grade: "Class 9 · B", attendance: "98%", status: "Active" },
  { id: "DEMO-2403", name: "Kabir M.", grade: "Class 7 · A", attendance: "91%", status: "Active" },
  { id: "DEMO-2404", name: "Meera P.", grade: "Class 10 · C", attendance: "94%", status: "Active" },
  { id: "DEMO-2405", name: "Vivaan K.", grade: "Class 8 · B", attendance: "87%", status: "Review" },
  { id: "DEMO-2406", name: "Anaya D.", grade: "Class 6 · A", attendance: "99%", status: "Active" },
];

export const demoTeachers = [
  { id: "STAFF-101", name: "Mira Shah", subject: "Mathematics", classes: "7A, 8A, 9B", status: "Active" },
  { id: "STAFF-102", name: "Arjun Das", subject: "Science", classes: "8B, 9A, 10A", status: "Active" },
  { id: "STAFF-103", name: "Neha Rao", subject: "English", classes: "6A, 7B, 8A", status: "On leave" },
  { id: "STAFF-104", name: "Ishaan Mehta", subject: "Social Studies", classes: "9B, 10B", status: "Active" },
  { id: "STAFF-105", name: "Tara Nair", subject: "Computer Science", classes: "8B, 9A, 10A", status: "Active" },
];

export const demoRecentActivity = [
  { title: "Attendance completed", detail: "Class 8 · Section A", time: "8 min ago", tone: "indigo" },
  { title: "Assessment results published", detail: "Science · Grade 9", time: "24 min ago", tone: "emerald" },
  { title: "New event added", detail: "Annual science showcase", time: "1 hr ago", tone: "violet" },
  { title: "Fee reminder scheduled", detail: "Term 2 · 18 families", time: "2 hrs ago", tone: "amber" },
];

export const demoFeeRows = [
  { invoice: "DEMO-INV-042", group: "Class 8 · A", item: "Term 2 tuition", amount: "₹24,500", due: "12 Nov 2026", status: "Due soon" },
  { invoice: "DEMO-INV-043", group: "Class 9 · B", item: "Lab and activity fee", amount: "₹8,200", due: "15 Nov 2026", status: "Pending" },
  { invoice: "DEMO-INV-044", group: "Class 6 · A", item: "Term 2 tuition", amount: "₹21,000", due: "18 Nov 2026", status: "Paid" },
  { invoice: "DEMO-INV-045", group: "Class 10 · C", item: "Term 2 tuition", amount: "₹27,000", due: "20 Nov 2026", status: "Pending" },
];

export const demoNotifications = [
  { category: "Attendance", title: "Daily attendance summary is ready", detail: "All sections have submitted today’s register.", time: "Today · 10:42 AM", unread: true },
  { category: "Academics", title: "Assessment window opens Monday", detail: "The Term 2 assessment calendar is available to staff.", time: "Today · 9:15 AM", unread: true },
  { category: "Fees", title: "Fee collection reached 82%", detail: "Term 2 collection is tracking ahead of the previous term.", time: "Yesterday · 4:20 PM", unread: false },
  { category: "Events", title: "Science showcase registration is open", detail: "Families can review the event schedule in the portal.", time: "Yesterday · 1:05 PM", unread: false },
];

export const demoEvents = [
  { day: "06", month: "NOV", title: "Staff planning day", detail: "Main campus · 9:00 AM", kind: "Internal" },
  { day: "12", month: "NOV", title: "Term 2 family meetings", detail: "All grades · 2:30 PM", kind: "Community" },
  { day: "18", month: "NOV", title: "Annual science showcase", detail: "Activity hall · 10:00 AM", kind: "Academic" },
  { day: "24", month: "NOV", title: "Inter-house athletics", detail: "Sports ground · 8:30 AM", kind: "Community" },
];

export const demoBooks = [
  { id: "LIB-3201", title: "The Curious Garden", author: "Peter Brown", category: "Fiction", availability: "Available" },
  { id: "LIB-3202", title: "A Short History of Nearly Everything", author: "Bill Bryson", category: "Science", availability: "Issued" },
  { id: "LIB-3203", title: "The Boy Who Harnessed the Wind", author: "William Kamkwamba", category: "Biography", availability: "Available" },
  { id: "LIB-3204", title: "Hidden Figures", author: "Margot Lee Shetterly", category: "History", availability: "Available" },
];

export const demoTimetable = [
  { time: "08:30", mon: "Assembly", tue: "Mathematics", wed: "Science", thu: "English", fri: "Arts" },
  { time: "09:15", mon: "Mathematics", tue: "English", wed: "Social Studies", thu: "Science", fri: "Mathematics" },
  { time: "10:15", mon: "Science", tue: "Computer Lab", wed: "Mathematics", thu: "Arts", fri: "English" },
  { time: "11:15", mon: "English", tue: "Social Studies", wed: "English", thu: "Mathematics", fri: "Science" },
  { time: "12:15", mon: "Sports", tue: "Science", wed: "Computer Lab", thu: "Social Studies", fri: "Club hour" },
];

export const demoExams = [
  { name: "Term 2 Mathematics", group: "Class 8 · Sections A–C", date: "16 Nov 2026", state: "Scheduled" },
  { name: "Science practical review", group: "Class 9 · Sections A–B", date: "18 Nov 2026", state: "Draft" },
  { name: "English comprehension", group: "Class 7 · Sections A–C", date: "20 Nov 2026", state: "Scheduled" },
];

export const tourSteps = [
  { id: "analytics", page: "dashboard" as const, title: "Your school at a glance", description: "Enrollment, attendance and fee collection come together in one clear daily overview." },
  { id: "teacher-overview", page: "teacher-dashboard" as const, title: "A teacher’s daily overview", description: "Classes, student reach, assessment work and class performance are easy to scan in one place." },
  { id: "student-overview", page: "student-dashboard" as const, title: "A student’s day, in one view", description: "The next class, attendance progress, learning shortcuts and announcements are brought together." },
  { id: "students", page: "students" as const, title: "A complete student picture", description: "Find the class, attendance and student status details your team needs in one place." },
  { id: "attendance", page: "attendance" as const, title: "Attendance, made visible", description: "Review attendance patterns by class and spot trends across the term." },
  { id: "fees", page: "fees" as const, title: "Fee tracking without guesswork", description: "See collection progress, upcoming dues and payment status at a glance." },
  { id: "advanced-insights", page: "dashboard" as const, title: "More insight when you need it", description: "Advanced financial analysis is available in the full Radora platform." },
];
