import { UserRole } from "./index";

export interface AdminProfileResponse {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AdminProfile {
    id: string;
    name: string;
    email: string;
    role: string;
}

export interface AdminTeacher {
    id: string;
    name: string;
    email: string;
    address: string | null;
    courses: {
        id: string;
        title: string;
        description: string | null;
        _count: { enrollments: number };
        }[];
}

export interface AdminStudent {
    id: string;
    name: string;
    rollNumber: string;
    className: string | null;
    profilePhotoUrl: string | null;
    role: string;
}

export interface Holiday {
    id: string;
    title: string;
    date: string;
    createdAt: string;
    updatedAt: string;
}

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

export interface AttendanceSummary {
    class: string;
    section: string;
    totalStudents: number;
    avgAttendance: number;
    month: string;
}

export interface LeaveRecord {
    id: string;
    studentId: string;
    fromDate: string;
    toDate: string;
    reason: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: string;
    updatedAt: string;
}

export interface AttendanceAttendanceRecord {
    id?: string;
    date: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    remarks?: string;
}

export interface StudentAttendanceOverview {
    overallAttendance: number;
    eligibility: string;
    totalClasses: number;
    attendedClasses: number;
    presentClasses: number;
    absentClasses: number;
    leaveClasses: number;
    records: AttendanceAttendanceRecord[];
    holidays: {
        id: string;
        title: string;
        date: string;
        }[];
}

export interface TeacherAttendanceCourse {
    id: string;
    title: string;
    description: string;
    _count: { enrollments: number };
}

export interface StudentAttendanceRecord {
    studentId: string;
    name: string;
    rollNumber: string;
    status: "PRESENT" | "ABSENT" | "LEAVE";
    isMarked: boolean;
    canEdit: boolean;
    createdAt: string | null;
}

export interface AttendanceHoliday {
    id: string;
    title: string;
    date: string;
}

export interface StudentAttendanceHistory {
    rollNumber: string;
    name: string;
    records: {
        date: string;
        status: "PRESENT" | "ABSENT" | "LEAVE";
        markedBy: string | null;
        }[];
    summary: {
        total: number;
        present: number;
        absent: number;
        leave: number;
        percentage: number;
        };
}

export interface CourseStudent {
    id: string;
    name: string;
    rollNumber: string;
    profilePhotoUrl: string | null;
}

export interface User {
    id: string;
    name: string;
    email?: string | null;
    rollNumber?: string | null;
    role: UserRole;
    image?: string | null;
}

export interface ChatRoom {
    id: string;
    title: string;
    description: string;
    teacherName: string;
    memberCount: number;
    messageCount: number;
    role: "teacher" | "student";
}

export interface ChatMessage {
    id: string;
    content: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        role: string;
        profilePhotoUrl: string | null;
        };
}

export interface RoomMessagesResponse {
    room: ChatRoom;
    messages: ChatMessage[];
}

export interface DashboardHoliday {
    id: string;
    title: string;
    date: string;
    createdBy?: string;
    createdAt?: string;
}

export interface Exam {
    id: string;
    name: string;
    subject: string;
    class: string;
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    totalMarks: number;
    status: "upcoming" | "ongoing" | "completed";
}

export interface GradeEntry {
    studentId: string;
    studentName: string;
    rollNumber: string;
    marks: number;
    totalMarks: number;
    grade: string;
    percentage: number;
}

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

export interface StudentHomework {
    id: string;
    title: string;
    description: string | null;
    instructions: string | null;
    dueAt: string | null;
    allowLateSubmission: boolean;
    totalMarks: number | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    createdAt: string;
    updatedAt: string;
    teacher: {
        id: string;
        name: string;
        email: string | null;
        };
    course: {
        id: string;
        title: string;
        description: string | null;
        };
    attachments: {
        id: string;
        fileName: string;
        mimeType: string;
        size: number;
        publicUrl: string;
        downloadUrl: string;
        }[];
    canSubmit: boolean;
    canResubmit: boolean;
    mySubmission: {
        id: string;
        studentId: string;
        submittedAt: string;
        status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
        marks: number | null;
        feedback: string | null;
        gradedAt: string | null;
        attachments: {
          id: string;
          fileName: string;
          mimeType: string;
          size: number;
          publicUrl: string;
        }[];
        } | null;
}

export interface StudentSubmission {
    id: string;
    studentId: string;
    submittedAt: string | null;
    status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
    marks: number | null;
    feedback: string | null;
    gradedAt: string | null;
    attachments: {
        id: string;
        fileName: string;
        mimeType: string;
        size: number;
        publicUrl: string;
        }[];
}

export interface SubmitHomeworkPayload {
    textSubmission?: string;
    attachments?: {
        fileName: string;
        mimeType: string;
        base64: string;
        }[];
}

export interface HomeworkAssignment {
    id: string;
    title: string;
    description: string;
    instructions: string;
    dueAt: string;
    allowLateSubmission: boolean;
    totalMarks: number;
    status: "PUBLISHED" | "DRAFT";
    createdAt: string;
    updatedAt: string;
    course: { id: string; title: string; description?: string | null; };
    submissionsCount: number;
    gradedCount: number;
}

export interface TeacherSubmissionData {
    homework: HomeworkAssignment;
    totalStudents: number;
    submittedCount: number;
    gradedCount: number;
    pendingCount: number;
    students: {
        student: {
          id: string;
          name: string;
          rollNumber: string;
          className: string | null;
          profilePhotoUrl: string | null;
        };
        status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
        hasSubmission: boolean;
        submission: {
          id: string;
          studentId: string;
          textSubmission: string | null;
          submittedAt: string;
          status: "PENDING" | "SUBMITTED" | "LATE" | "GRADED";
          marks: number | null;
          feedback: string | null;
          gradedAt: string | null;
          attachments: {
            id: string;
            fileName: string;
            mimeType: string;
            size: number;
            publicUrl: string;
          }[];
        } | null;
        }[];
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "announcement" | "alert" | "reminder" | "message";
    sender: string;
    recipients: string;
    date: string;
    read: boolean;
    priority: "high" | "medium" | "low";
}

export interface NoticeAttachment {
    id: string;
    fileName: string;
    publicUrl: string;
}

export interface Notice {
    id: string;
    title: string;
    content: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
        };
    attachments: NoticeAttachment[];
}

export interface AiTutorContextResponse {
    student: {
        id: string;
        name: string;
        rollNumber: string;
        className: string;
        section: string;
        courses: { id: string; title: string }[];
        };
    attendance: {
        overallAttendance: number;
        presentClasses: number;
        absentClasses: number;
        leaveClasses: number;
        streak: number;
        recentRecords: { date: string; status: string; subject: string }[];
        };
    suggestedPrompts: string[];
}

export interface AiTutorChatResponse {
    reply: string;
    usedFallback: boolean;
    fallbackReason?: string;
    cached: boolean;
    context: AiTutorContextResponse;
    suggestedPrompts: string[];
}

export interface StudentDashboardResponse {
    studentName: string;
    attendancePercentage: number;
    streak: number;
    level: {
        level: number;
        title: string;
        xpToNext: number;
        progress: number;
        };
    fees: {
        status: string;
        amount: number;
        academicYear: string;
        };
    upcomingClasses: any[];
    badges: any[];
    aiTutor: {
        subject: string;
        summary: string;
        };
}

export interface CreateStudentPayload {
    name: string;
    rollNumber: string;
    password: string;
}

export interface CreateStudentResponse {
    message: string;
    userId: string;
}

export interface SearchedStudent {
    id: string;
    name: string;
    rollNumber: string;
    className: string;
    profilePhotoUrl: string | null;
    role: string;
}

export interface TeacherCourse {
    id: string;
    title: string;
    description: string;
}

export interface TeacherStudent {
    id: string;
    name: string;
    rollNumber: string;
    className: string;
    profilePhotoUrl: string | null;
    courses: TeacherCourse[];
    addedAt: string;
}

export interface TeacherFoundStudent {
    id: string;
    name: string;
    rollNumber: string;
    className: string;
    profilePhotoUrl: string | null;
    courses: TeacherCourse[];
    existingTeacherIds: string[];
}

export interface TeacherProfileResponse {
    id: string;
    name: string;
    email: string;
    address: string | null;
    courses: {
        id: string;
        title: string;
        description: string | null;
        _count: { enrollments: number };
        }[];
}

export interface AssignClassPayload {
    teacherEmail: string;
    className: string;
    section: string;
}

export interface CreateTeacherPayload {
    name: string;
    email: string;
    password: string;
}

export interface CreateTeacherResponse {
    message: string;
    userId: string;
}

export interface SearchedTeacher {
    id: string;
    name: string;
    email: string;
    courses: {
        id: string;
        title: string;
        description: string;
        }[];
}

export interface TimetableSlot {
    id: string;
    day: string;
    period: number;
    startTime: string;
    endTime: string;
    subject: string;
    teacher: string;
    room: string;
    type: "lecture" | "lab" | "break" | "assembly" | "sports" | "library";
}

export interface ClassTimetable {
    class: string;
    section: string;
    slots: TimetableSlot[];
}
export interface StudentProfileData {
  id: string;
  name: string;
  rollNumber?: string;
  className?: string;
  profilePhotoUrl?: string | null;
  status?: string;
  // StudentProfile sub-document fields (Prisma model)
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  parentName?: string | null;
  parentEmail?: string | null;
  parentPhone?: string | null;
  parentRelation?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  emergencyPhone?: string | null;
}

