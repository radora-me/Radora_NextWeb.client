"use client";

import { useMemo, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle, CheckCircle2, ClipboardCheck, Eye, FileX, Loader2, Search, Save, UserPlus, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TeacherStudentProfileModal } from "@/features/teacher/components/teacher-student-profile-modal";
import { useAdminAssignStudent, useAdminCourseAttendance, useAdminStudentAcademicRecord, useAdminStudentClasses, useAdminStudents, useAdminSubmitAttendance, type AdminAttendanceStatus } from "@/features/admin/services/admin-student-management.service";

const now = new Date();
const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("-");

const STATUS_CONFIG: { status: AdminAttendanceStatus; label: string; icon: typeof CheckCircle; active: string; inactive: string }[] = [
  { status: "PRESENT", label: "Present", icon: CheckCircle, active: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500", inactive: "text-zinc-500 hover:text-emerald-600 hover:border-emerald-300" },
  { status: "ABSENT", label: "Absent", icon: XCircle, active: "bg-rose-500 hover:bg-rose-600 text-white border-rose-500", inactive: "text-zinc-500 hover:text-rose-600 hover:border-rose-300" },
  { status: "LEAVE", label: "Leave", icon: FileX, active: "bg-violet-500 hover:bg-violet-600 text-white border-violet-500", inactive: "text-zinc-500 hover:text-violet-600 hover:border-violet-300" },
];

const statusClass = (status: string) => status === "PRESENT"
  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
  : status === "ABSENT" ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-violet-50 text-violet-700 border-violet-200";

const isInternalId = (value?: string | null) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));
const classLabel = (title?: string | null, section?: string | null) => {
  const safeTitle = title && !isInternalId(title) ? title : "Unassigned class";
  const safeSection = section && !isInternalId(section) ? section : "";
  return `${safeTitle}${safeSection ? ` / Section ${safeSection}` : ""}`;
};

export function AdminStudentManagement() {
  const { data: classes = [], isLoading: classesLoading } = useAdminStudentClasses();
  const { data: students = [], isLoading: studentsLoading, isError } = useAdminStudents();
  const [courseIndex, setCourseIndex] = useState("");
  const selectedCourse = courseIndex === "" ? null : classes[Number(courseIndex)];
  const courseId = selectedCourse?.id || null;
  const [search, setSearch] = useState("");
  const [selectedRoll, setSelectedRoll] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [attendanceEdits, setAttendanceEdits] = useState<Record<string, AdminAttendanceStatus>>({});
  const { mutate: assignStudent, isPending: isAssigning } = useAdminAssignStudent();
  const { mutate: submitAttendance, isPending: isSubmittingAttendance } = useAdminSubmitAttendance();

  const selectedClass = selectedCourse;
  const { data: attendance = [], isLoading: attendanceLoading, refetch: refetchAttendance } = useAdminCourseAttendance(courseId, today);
  const localAttendance = useMemo(() => attendance.map((student) => ({
    ...student,
    status: attendanceEdits[`${courseId}:${student.studentId}`] || student.status,
  })), [attendance, attendanceEdits, courseId]);
  const results = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students
      .filter((student) => {
        const matchesSearch = !query || student.name.toLowerCase().includes(query) || student.rollNumber.toLowerCase().includes(query);
        const enrolled = Boolean(courseId && student.courses.some((course) => course.id === courseId));
        return matchesSearch && (enrolled || Boolean(query));
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [courseId, search, students]);

  const selectedStudent = students.find((student) => student.rollNumber === selectedRoll) || null;
  const selectedAttendance = localAttendance.find((student) => student.rollNumber === selectedRoll);
  const { data: academicRecord, isLoading: academicLoading } = useAdminStudentAcademicRecord(selectedRoll);
  const visibleAttendance = localAttendance.filter((student) => {
    const query = search.trim().toLowerCase();
    return !query || student.name.toLowerCase().includes(query) || student.rollNumber.toLowerCase().includes(query);
  });
  const hasStatusChanges = localAttendance.some((student) => attendance.find((item) => item.studentId === student.studentId)?.status !== student.status);
  const attendanceSummary = {
    present: localAttendance.filter((student) => student.status === "PRESENT").length,
    absent: localAttendance.filter((student) => student.status === "ABSENT").length,
    leave: localAttendance.filter((student) => student.status === "LEAVE").length,
  };

  const openProfile = (rollNumber: string) => {
    setSelectedRoll(rollNumber);
    setProfileOpen(true);
  };

  const handleStatusChange = (studentId: string, status: AdminAttendanceStatus) => {
    setAttendanceEdits((current) => ({ ...current, [`${courseId}:${studentId}`]: status }));
  };

  const handleSubmitAttendance = () => {
    if (!courseId || !localAttendance.length) return;
    submitAttendance({
      courseId,
      date: today,
      students: localAttendance.map((student) => ({ studentId: student.studentId, status: student.status })),
    }, {
      onSuccess: () => { toast.success("Attendance submitted and parent notifications triggered."); refetchAttendance(); },
      onError: (error) => toast.error(error.message),
    });
  };

  const handleMarkAllPresent = () => {
    setAttendanceEdits((current) => {
      const next = { ...current };
      localAttendance.forEach((student) => { next[`${courseId}:${student.studentId}`] = "PRESENT"; });
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Management</h1>
        <p className="text-sm text-muted-foreground">Select a class, search any student, and manage their profile and attendance.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-indigo-500" />Select class and section</CardTitle></CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row">
          <Select value={courseIndex} onValueChange={(value) => { setCourseIndex(value || ""); setSelectedRoll(null); }}>
            <SelectTrigger className="sm:max-w-md"><SelectValue placeholder={classesLoading ? "Loading classes..." : "Choose a class"} /></SelectTrigger>
            <SelectContent>
              {classes.map((item, index) => <SelectItem key={item.id} value={String(index)}>{classLabel(item.title, item.description)} ({item.studentCount ?? item._count.enrollments} students)</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="relative flex-1 sm:max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Search by name or roll number" value={search} onChange={(event) => setSearch(event.target.value)} disabled={!courseId} /></div>
        </CardContent>
      </Card>

      {!courseId ? (
        <Card><CardContent className="flex min-h-40 flex-col items-center justify-center gap-2 text-center text-muted-foreground"><BookOpen className="h-8 w-8 text-slate-300" /><p>Select a class to load its students.</p></CardContent></Card>
      ) : isError ? (
        <Card><CardContent className="flex min-h-40 items-center justify-center gap-2 text-red-500"><AlertCircle className="h-5 w-5" />Unable to load students.</CardContent></Card>
      ) : (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Users className="h-4 w-4 text-indigo-500" />Students {selectedClass ? `— ${classLabel(selectedClass.title, selectedClass.description)}` : ""}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {studentsLoading ? <div className="space-y-3 p-6"><Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" /></div> : results.length === 0 ? <div className="p-10 text-center text-sm text-muted-foreground">No students found. Search by name or roll number.</div> : <Table><TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Roll Number</TableHead><TableHead>Class</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{results.map((student) => { const enrolled = student.courses.some((course) => course.id === courseId); const studentCourse = student.courses.find((course) => course.id === courseId); return <TableRow key={student.rollNumber} className={selectedRoll === student.rollNumber ? "bg-indigo-50/60" : ""}><TableCell className="font-medium">{student.name}</TableCell><TableCell className="font-mono text-xs">{student.rollNumber}</TableCell><TableCell>{studentCourse ? classLabel(studentCourse.title, studentCourse.description) : <span className="text-muted-foreground">Not enrolled</span>}</TableCell><TableCell>{enrolled ? <Badge className="gap-1 bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3" />Enrolled</Badge> : <Badge variant="outline">Other class</Badge>}</TableCell><TableCell><div className="flex justify-end gap-2"><Button size="sm" variant="outline" onClick={() => openProfile(student.rollNumber)}><Eye className="mr-1 h-3.5 w-3.5" />Profile</Button>{!enrolled && <Button size="sm" loading={isAssigning} onClick={() => assignStudent({ rollNumber: student.rollNumber, courseId: courseId! }, { onSuccess: () => toast.success("Student assigned to this class"), onError: (error) => toast.error(error.message) })}>{isAssigning ? "Assigning..." : <><UserPlus className="mr-1 h-3.5 w-3.5" />Assign</>}</Button>}</div></TableCell></TableRow>; })}</TableBody></Table>}
          </CardContent>
        </Card>
      )}

      {courseId && (
        <Card>
          <CardHeader className="border-b bg-zinc-50/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="h-4 w-4 text-emerald-500" />Update attendance</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">Submit the class attendance through the teacher workflow. Parent email notifications will be sent automatically.</p>
              </div>
              <div className="flex gap-2 text-xs"><Badge className="bg-emerald-100 text-emerald-700">{attendanceSummary.present} Present</Badge><Badge className="bg-rose-100 text-rose-700">{attendanceSummary.absent} Absent</Badge><Badge className="bg-violet-100 text-violet-700">{attendanceSummary.leave} Leave</Badge></div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
              <p className="text-sm font-medium">Today&apos;s student list {attendanceLoading && <Loader2 className="ml-1 inline h-4 w-4 animate-spin text-indigo-500" />}</p>
              <Button size="sm" variant="outline" onClick={handleMarkAllPresent} disabled={attendanceLoading || !localAttendance.length} className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"><CheckCircle className="mr-1.5 h-4 w-4" />Mark all present</Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow><TableHead>Roll No.</TableHead><TableHead>Student Name</TableHead><TableHead className="min-w-[360px] text-center">Attendance Status</TableHead></TableRow></TableHeader>
                <TableBody>
                  {attendanceLoading ? <TableRow><TableCell><Skeleton className="h-4 w-12" /></TableCell><TableCell><Skeleton className="h-4 w-40" /></TableCell><TableCell><div className="flex justify-center gap-2"><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /><Skeleton className="h-8 w-24" /></div></TableCell></TableRow> : visibleAttendance.length === 0 ? <TableRow><TableCell colSpan={3} className="h-28 text-center text-sm text-muted-foreground">No attendance students match your search.</TableCell></TableRow> : visibleAttendance.map((student) => <TableRow key={student.studentId} className={selectedRoll === student.rollNumber ? "bg-indigo-50/50" : ""} onClick={() => setSelectedRoll(student.rollNumber)}><TableCell className="font-medium text-zinc-500">{student.rollNumber}</TableCell><TableCell className="font-medium">{student.name}{student.isMarked && <Badge variant="outline" className="ml-2 text-[10px]">Recorded</Badge>}</TableCell><TableCell onClick={(event) => event.stopPropagation()}><div className="flex justify-center gap-2">{STATUS_CONFIG.map(({ status, label, icon: Icon, active, inactive }) => <Button key={status} type="button" size="sm" variant={student.status === status ? "default" : "outline"} onClick={() => handleStatusChange(student.studentId, status)} className={student.status === status ? active : inactive}><Icon className="mr-1.5 h-4 w-4" />{label}</Button>)}</div></TableCell></TableRow>)}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-3 border-t bg-zinc-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{hasStatusChanges ? "Unsaved changes ready to submit." : "Attendance is synchronized with the server."}</p><Button size="lg" loading={isSubmittingAttendance} onClick={handleSubmitAttendance} disabled={attendanceLoading || !localAttendance.length} className="bg-indigo-600 text-white hover:bg-indigo-700">{isSubmittingAttendance ? "Submitting..." : <><Save className="mr-2 h-4 w-4" />Submit attendance & notify parents</>}</Button></div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="h-4 w-4 text-emerald-500" />Attendance access — {selectedStudent.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
                <div><p className="font-medium">Current selected-class status</p><p className="text-xs text-muted-foreground">{selectedAttendance?.status || "Not recorded"}</p></div>
                <Badge variant="outline" className={selectedAttendance ? statusClass(selectedAttendance.status) : ""}>{selectedAttendance?.status || "NOT RECORDED"}</Badge>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">All attendance history</p>
                {academicLoading ? <Skeleton className="h-16" /> : academicRecord?.attendance.length ? <div className="max-h-64 space-y-2 overflow-y-auto">{academicRecord.attendance.map((record, index) => <div key={`${record.date}-${record.course?.id || "full-day"}-${index}`} className="flex items-center justify-between rounded border px-3 py-2 text-sm"><div><span>{new Date(record.date).toLocaleDateString("en-IN")}</span><p className="text-xs text-muted-foreground">{record.course ? classLabel(record.course.title, record.course.description) : "Full day"} · {record.mode.replace("_", " ")}</p></div><Badge variant="outline" className={statusClass(record.status)}>{record.status}</Badge></div>)}</div> : <p className="text-sm text-muted-foreground">No attendance records have been recorded for this student.</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <Card>
          <CardHeader className="border-b bg-slate-50/70">
            <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="h-4 w-4 text-purple-500" />Homework &amp; assignment record — {selectedStudent.name}</CardTitle>
            <p className="text-xs text-muted-foreground">Live submissions, grades, marks, feedback, deadlines, and assignment status from the database.</p>
          </CardHeader>
          <CardContent>
            {academicLoading ? <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-32" /></div> : academicRecord ? <div className="space-y-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-lg bg-indigo-50 p-3"><p className="text-xl font-bold text-indigo-700">{academicRecord.summary.total}</p><p className="text-xs text-indigo-700/70">Assigned</p></div><div className="rounded-lg bg-amber-50 p-3"><p className="text-xl font-bold text-amber-700">{academicRecord.summary.pending}</p><p className="text-xs text-amber-700/70">Pending</p></div><div className="rounded-lg bg-emerald-50 p-3"><p className="text-xl font-bold text-emerald-700">{academicRecord.summary.graded}</p><p className="text-xs text-emerald-700/70">Graded</p></div><div className="rounded-lg bg-purple-50 p-3"><p className="text-xl font-bold text-purple-700">{academicRecord.summary.averagePercentage}%</p><p className="text-xs text-purple-700/70">Average grade</p></div></div>{academicRecord.assignments.length ? <div className="overflow-x-auto rounded-lg border"><Table><TableHeader><TableRow><TableHead>Homework / Assignment</TableHead><TableHead>Class</TableHead><TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Grade</TableHead><TableHead>Feedback</TableHead></TableRow></TableHeader><TableBody>{academicRecord.assignments.map((assignment) => <TableRow key={assignment.id}><TableCell><p className="font-medium">{assignment.title}</p><p className="max-w-xs truncate text-xs text-muted-foreground">{assignment.description || assignment.instructions || "No description"}</p></TableCell><TableCell className="text-sm">{classLabel(assignment.course.title, assignment.course.description)}</TableCell><TableCell className="whitespace-nowrap text-sm">{assignment.dueAt ? new Date(assignment.dueAt).toLocaleDateString("en-IN") : "No due date"}</TableCell><TableCell><Badge variant="outline" className={assignment.submission ? statusClass(assignment.submission.status === "GRADED" ? "PRESENT" : "LEAVE") : "bg-amber-50 text-amber-700 border-amber-200"}>{assignment.submission?.status || "PENDING"}</Badge></TableCell><TableCell className="whitespace-nowrap text-sm">{assignment.grade ? `${assignment.grade.marks}/${assignment.grade.totalMarks ?? "—"} (${assignment.grade.percentage ?? 0}%)` : "Not graded"}</TableCell><TableCell className="max-w-xs text-sm text-muted-foreground">{assignment.submission?.feedback || "—"}</TableCell></TableRow>)}</TableBody></Table></div> : <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No homework or assignments have been recorded for this student.</p>}</div> : <p className="text-sm text-muted-foreground">Academic record unavailable.</p>}
          </CardContent>
        </Card>
      )}

      <TeacherStudentProfileModal rollNumber={selectedRoll} open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
}
