"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle, XCircle, Users, Save,
  Loader2, PartyPopper, History, FileX, CalendarCheck, Calendar, RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useTeacherCourses,
  useCourseAttendance,
  useSubmitAttendance,
  useUpdateStudentAttendance,
  useTeacherHolidays,
  useStudentAttendanceHistory,
} from "@/features/attendance/services";
import type { StudentAttendanceRecord } from "@/types/api.types";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LEAVE";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// ── Status button config ──────────────────────────────────────────────────────
const STATUS_CONFIG: {
  status: AttendanceStatus;
  label: string;
  icon: React.ElementType;
  active: string;
  inactive: string;
}[] = [
  {
    status: "PRESENT",
    label: "Present",
    icon: CheckCircle,
    active: "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500",
    inactive: "text-zinc-500 hover:text-emerald-600 hover:border-emerald-300",
  },
  {
    status: "ABSENT",
    label: "Absent",
    icon: XCircle,
    active: "bg-rose-500 hover:bg-rose-600 text-white border-rose-500",
    inactive: "text-zinc-500 hover:text-rose-600 hover:border-rose-300",
  },
  {
    status: "LEAVE",
    label: "Leave",
    icon: FileX,
    active: "bg-violet-500 hover:bg-violet-600 text-white border-violet-500",
    inactive: "text-zinc-500 hover:text-violet-600 hover:border-violet-300",
  },
];

export function TeacherAttendance() {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-CA");
  const twoDaysAgoStr = new Date(now.getTime() - 48 * 60 * 60 * 1000).toLocaleDateString("en-CA");

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState(todayStr);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPastDate, setSelectedPastDate] = useState(todayStr);
  const [localAttendance, setLocalAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<{ rollNumber: string; name: string } | null>(null);

  // 1. Fetch teacher courses
  const { data: courses, isLoading: coursesLoading } = useTeacherCourses();

  // Auto-select first course
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // 2. Fetch attendance for selected course + date
  const dateObj = new Date(dateStr + "T12:00:00");
  const {
    data: attendanceData,
    isLoading: attendanceLoading,
    refetch: refetchAttendance,
  } = useCourseAttendance(selectedCourseId, dateObj);

  // Sync fetched data into local state
  useEffect(() => {
    if (attendanceData) setLocalAttendance(attendanceData);
  }, [attendanceData]);

  const { mutate: submitAttendance, isPending: isSubmitting } = useSubmitAttendance();
  const { mutateAsync: updateStudentAttendance } = useUpdateStudentAttendance();
  const { data: holidays } = useTeacherHolidays();
  const { data: attendanceHistory, isLoading: historyLoading } = useStudentAttendanceHistory(
    selectedCourseId,
    historyStudent?.rollNumber ?? null
  );

  // Check if attendance is already submitted for all students
  const isAllMarked = localAttendance.length > 0 && localAttendance.every((s) => s.isMarked);

  // Check if any student status was modified compared to fetched data
  const hasStatusChanges = localAttendance.some((student) => {
    const original = attendanceData?.find((a) => a.studentId === student.studentId);
    return !original || original.status !== student.status;
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSingleSave = async (student: StudentAttendanceRecord) => {
    if (!selectedCourseId) return;
    if (dateStr < twoDaysAgoStr || dateStr > todayStr) {
      toast.error("Attendance can only be updated within the 48-hour time bound.");
      return;
    }
    setSavingStudentId(student.studentId);
    try {
      await updateStudentAttendance({
        courseId: selectedCourseId,
        rollNumber: student.rollNumber,
        status: student.status as AttendanceStatus,
        date: dateStr,
      });
      toast.success(`${student.name}'s attendance updated to ${student.status}.`);
      refetchAttendance();
    } catch (err: any) {
      toast.error(`Failed to update: ${err.message}`);
    } finally {
      setSavingStudentId(null);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: AttendanceStatus) => {
    setLocalAttendance((prev) =>
      prev.map((s) => (s.studentId === studentId ? { ...s, status: newStatus } : s))
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setLocalAttendance((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = () => {
    if (!selectedCourseId) return;
    if (dateStr < twoDaysAgoStr || dateStr > todayStr) {
      toast.error("Attendance can only be marked or updated within the 48-hour time bound.");
      return;
    }
    submitAttendance(
      {
        courseId: selectedCourseId,
        date: dateStr,
        students: localAttendance.map((s) => ({ studentId: s.studentId, status: s.status })),
      },
      {
        onSuccess: () => {
          toast.success("Attendance submitted successfully!");
          refetchAttendance();
        },
        onError: (err) => {
          toast.error(`Failed to submit: ${err.message}`);
        },
      }
    );
  };

  // ── History summary badges ───────────────────────────────────────────────────

  const historySummaryItems = attendanceHistory
    ? [
        { label: "Present", value: attendanceHistory.summary.present, cls: "bg-emerald-50 text-emerald-700" },
        { label: "Absent",  value: attendanceHistory.summary.absent,  cls: "bg-rose-50 text-rose-700"    },
        { label: "Leave",   value: attendanceHistory.summary.leave,   cls: "bg-violet-50 text-violet-700" },
        { label: "Rate",    value: `${attendanceHistory.summary.percentage}%`, cls: "bg-indigo-50 text-indigo-700" },
      ]
    : [];

  // ── Course label helper ──────────────────────────────────────────────────────

  const courseLabel = (course: {
    title?: string | null;
    description?: string | null;
    className?: string | null;
    section?: string | null;
  }) => {
    const title = course.className?.trim() || course.title?.trim() || "Class";
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(title);
    const base = isUUID ? "Class" : title;
    const section = course.section?.trim() || course.description?.trim();
    return section ? `${base} — Section ${section}` : base;
  };

  const selectedCourse = courses?.find(
    (course) => course.id === selectedCourseId,
  );

  // ── Status badge colour for history records ──────────────────────────────────

  const statusBadgeClass = (status: string) => {
    if (status === "PRESENT") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "ABSENT")  return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "LEAVE")   return "bg-violet-50 text-violet-700 border-violet-200";
    return "bg-zinc-100 text-zinc-600";
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mark Attendance"
        description="Quickly log today's attendance for your classes."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ── Controls ── */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-end gap-4 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        >
          {/* Class selector */}
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Users className="w-4 h-4 text-indigo-500" />
              Select Class
            </label>
            <Select
              value={selectedCourseId || ""}
              onValueChange={(v) => setSelectedCourseId(v)}
              disabled={coursesLoading}
            >
              <SelectTrigger className="w-full sm:w-[350px]">
                <SelectValue placeholder={coursesLoading ? "Loading classes…" : "Select a class"}>
                  {selectedCourse ? courseLabel(selectedCourse) : null}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {courseLabel(course)}
                    {" "}({course.studentCount ?? course._count?.enrollments ?? 0} student{(course.studentCount ?? course._count?.enrollments ?? 0) !== 1 ? "s" : ""})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date display & indicator */}
          {dateStr === todayStr ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-medium shrink-0">
              <CalendarCheck className="w-4 h-4" />
              Today ({new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })})
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium shrink-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Editing: {new Date(dateStr + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs text-amber-700 hover:bg-amber-100 hover:text-amber-900"
                onClick={() => setDateStr(todayStr)}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reset to Today
              </Button>
            </div>
          )}
        </motion.div>

        {/* ── Student table ── */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden"
        >
          {/* Holiday banner */}
          {holidays && holidays.length > 0 && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 flex-wrap">
              <PartyPopper className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-semibold text-amber-700">Upcoming Holidays:</span>
              {holidays.slice(0, 4).map((h) => (
                <Badge key={h.id} variant="outline" className="text-[11px] bg-amber-100 text-amber-800 border-amber-200">
                  {h.title} · {new Date(h.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </Badge>
              ))}
            </div>
          )}

          {/* Table header row */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                Student List
                {attendanceLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
              </h3>
              {isAllMarked && !hasStatusChanges && (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 px-2.5 py-0.5 text-xs font-medium">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Already Submitted
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleMarkAll("PRESENT")}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
            >
              Mark All Present
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Roll No.</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="text-center min-w-[320px]">Attendance Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceLoading ? (
                  <>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-8 w-24" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                ) : localAttendance.length > 0 ? (
                  localAttendance.map((student) => (
                    <TableRow
                      key={student.studentId}
                      className="cursor-pointer hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors"
                      onClick={() =>
                        setHistoryStudent({ rollNumber: student.rollNumber, name: student.name })
                      }
                    >
                      <TableCell className="font-medium text-zinc-500">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                        {student.isMarked && (
                          <span className="ml-2 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            Marked
                          </span>
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          {STATUS_CONFIG.map(({ status, label, icon: Icon, active, inactive }) => (
                            <Button
                              key={status}
                              type="button"
                              variant={student.status === status ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleStatusChange(student.studentId, status)}
                              className={student.status === status ? active : inactive}
                            >
                              <Icon className="w-4 h-4 mr-1.5" />
                              {label}
                            </Button>
                          ))}

                          {/* Per-student save button (shows for past dates or when marked) */}
                          {(student.isMarked || dateStr !== todayStr) && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSingleSave(student)}
                              disabled={savingStudentId === student.studentId}
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 ml-1 shrink-0"
                              title="Save status for this student"
                            >
                              {savingStudentId === student.studentId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Save className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                      {!selectedCourseId
                        ? "Please select a class to view students."
                        : "No students found in this class."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* ── Action buttons (Update Attendance + Submit Attendance) ── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-zinc-800 dark:text-indigo-400 dark:hover:bg-zinc-900"
            onClick={() => {
              setSelectedPastDate(dateStr);
              setShowUpdateModal(true);
            }}
          >
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            Update Attendance
          </Button>

          <Button
            size="lg"
            className={
              isAllMarked && !hasStatusChanges && dateStr === todayStr
                ? "w-full sm:w-auto bg-emerald-500 text-white cursor-not-allowed opacity-90"
                : "w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 dark:shadow-none"
            }
            onClick={handleSubmit}
            disabled={isSubmitting || localAttendance.length === 0 || (isAllMarked && !hasStatusChanges && dateStr === todayStr)}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : isAllMarked && !hasStatusChanges && dateStr === todayStr ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {isAllMarked && !hasStatusChanges && dateStr === todayStr
              ? "Attendance Already Submitted"
              : dateStr !== todayStr
              ? "Submit Past Attendance"
              : isAllMarked && hasStatusChanges
              ? "Save Updated Attendance"
              : "Submit Attendance"}
          </Button>
        </motion.div>
      </motion.div>

      {/* ── Student Attendance History Modal ── */}
      <Dialog open={!!historyStudent} onOpenChange={(open) => !open && setHistoryStudent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-indigo-500" />
              {historyStudent?.name} — Attendance History
            </DialogTitle>
          </DialogHeader>

          {historyLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : attendanceHistory ? (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-2">
                {historySummaryItems.map((s) => (
                  <Card key={s.label} className={`p-3 text-center border-0 ${s.cls}`}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs font-medium">{s.label}</p>
                  </Card>
                ))}
              </div>

              {/* Records list */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {attendanceHistory.records.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100"
                  >
                    <span className="text-zinc-600">
                      {new Date(r.date).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <Badge variant="outline" className={statusBadgeClass(r.status)}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-8 text-sm">
              No attendance records found for this student.
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Select Previous Date Modal ── */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-white">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Update Past Attendance
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select a date to view and update student attendance records. Edits are restricted to the <strong>48-hour window</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Date (Within 48 Hours)
              </label>
              <Input
                type="date"
                min={twoDaysAgoStr}
                max={todayStr}
                value={selectedPastDate}
                onChange={(e) => setSelectedPastDate(e.target.value)}
                className="w-full"
              />
              <p className="text-[11px] text-slate-400">
                Allowed date range: {twoDaysAgoStr} to {todayStr}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <Button variant="outline" size="sm" onClick={() => setShowUpdateModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                if (!selectedPastDate) {
                  toast.error("Please select a valid date.");
                  return;
                }
                if (selectedPastDate < twoDaysAgoStr || selectedPastDate > todayStr) {
                  toast.error("Attendance can only be updated within the 48-hour time bound.");
                  return;
                }
                setDateStr(selectedPastDate);
                setShowUpdateModal(false);
                toast.info(`Loaded attendance records for ${selectedPastDate}`);
              }}
            >
              Load Records
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
