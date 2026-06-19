import type { Event, Activity } from '@/types';

// Monthly attendance data for area chart (last 12 months)
export const attendanceData = [
  { month: 'Jul', attendance: 92 },
  { month: 'Aug', attendance: 94 },
  { month: 'Sep', attendance: 91 },
  { month: 'Oct', attendance: 95 },
  { month: 'Nov', attendance: 93 },
  { month: 'Dec', attendance: 88 },
  { month: 'Jan', attendance: 90 },
  { month: 'Feb', attendance: 94 },
  { month: 'Mar', attendance: 96 },
  { month: 'Apr', attendance: 95 },
  { month: 'May', attendance: 93 },
  { month: 'Jun', attendance: 94 },
];

// Grade distribution data for bar chart
export const gradeDistribution = [
  { grade: 'A+', students: 45 },
  { grade: 'A', students: 78 },
  { grade: 'B+', students: 92 },
  { grade: 'B', students: 65 },
  { grade: 'C', students: 38 },
  { grade: 'D', students: 12 },
];

// Revenue data for the fee chart
export const revenueData = [
  { month: 'Jul', collected: 850000, pending: 150000 },
  { month: 'Aug', collected: 920000, pending: 130000 },
  { month: 'Sep', collected: 880000, pending: 170000 },
  { month: 'Oct', collected: 950000, pending: 100000 },
  { month: 'Nov', collected: 910000, pending: 140000 },
  { month: 'Dec', collected: 870000, pending: 180000 },
  { month: 'Jan', collected: 960000, pending: 90000 },
  { month: 'Feb', collected: 940000, pending: 110000 },
  { month: 'Mar', collected: 980000, pending: 70000 },
  { month: 'Apr', collected: 970000, pending: 80000 },
  { month: 'May', collected: 930000, pending: 120000 },
  { month: 'Jun', collected: 950000, pending: 100000 },
];

// Upcoming events
export const upcomingEvents: Event[] = [
  { id: '1', title: 'Mid-Term Examinations', date: '2026-06-20', type: 'exam', description: 'Classes 6-12' },
  { id: '2', title: 'Science Fair Exhibition', date: '2026-07-05', type: 'event', description: 'Annual science fair for all classes' },
  { id: '3', title: 'Independence Day Celebration', date: '2026-08-15', type: 'holiday', description: 'National holiday — school closed' },
  { id: '4', title: 'Parent-Teacher Meeting', date: '2026-07-12', type: 'meeting', description: 'Classes 9-12 PTM' },
  { id: '5', title: 'Fee Payment Deadline', date: '2026-06-30', type: 'deadline', description: 'Last date for Q2 fee payment' },
  { id: '6', title: 'Annual Sports Day', date: '2026-08-25', type: 'event', description: 'Inter-house sports competition' },
  { id: '7', title: 'Final Term Exams', date: '2026-09-15', type: 'exam', description: 'Classes 1-12 final examinations' },
  { id: '8', title: 'Gandhi Jayanti', date: '2026-10-02', type: 'holiday', description: 'National holiday — school closed' },
  { id: '9', title: 'Staff Development Workshop', date: '2026-07-20', type: 'meeting', description: 'Professional development for all staff' },
  { id: '10', title: 'Report Card Submission', date: '2026-07-25', type: 'deadline', description: 'Deadline for teachers to submit grades' },
];

// Recent activities
export const recentActivities: Activity[] = [
  { id: '1', user: 'Priya Menon', action: 'marked attendance', target: 'Class 10A — Physics', timestamp: '2 minutes ago', avatar: undefined },
  { id: '2', user: 'Rajesh Kumar', action: 'submitted grades', target: 'Class 12B — Mathematics', timestamp: '15 minutes ago', avatar: undefined },
  { id: '3', user: 'Ananya Iyer', action: 'enrolled new student', target: 'Vedant Patil — Class 6A', timestamp: '32 minutes ago', avatar: undefined },
  { id: '4', user: 'Suresh Nair', action: 'approved leave request', target: 'Kavita Desai — 3 days', timestamp: '1 hour ago', avatar: undefined },
  { id: '5', user: 'Deepa Sharma', action: 'updated timetable', target: 'Class 8C — Wednesday', timestamp: '1 hour ago', avatar: undefined },
  { id: '6', user: 'Admin', action: 'collected fee payment', target: '₹25,000 — Arjun Mehta', timestamp: '2 hours ago', avatar: undefined },
  { id: '7', user: 'Manoj Verma', action: 'shared exam schedule', target: 'Mid-Term — Classes 6-12', timestamp: '3 hours ago', avatar: undefined },
  { id: '8', user: 'Lakshmi Rao', action: 'updated student record', target: 'Aisha Khan — Class 9B', timestamp: '3 hours ago', avatar: undefined },
  { id: '9', user: 'Admin', action: 'sent notification', target: 'Fee reminder to 47 parents', timestamp: '4 hours ago', avatar: undefined },
  { id: '10', user: 'Pooja Singh', action: 'marked attendance', target: 'Class 7A — English', timestamp: '5 hours ago', avatar: undefined },
  { id: '11', user: 'Vikram Reddy', action: 'created assignment', target: 'Class 11A — Chemistry', timestamp: '6 hours ago', avatar: undefined },
  { id: '12', user: 'Neha Gupta', action: 'updated library records', target: '15 new books added', timestamp: 'Yesterday', avatar: undefined },
];
