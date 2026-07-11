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
import { CheckCircle, XCircle, Clock, Calendar, Users, Save, Loader2, PartyPopper, History, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTeacherCourses, useCourseAttendance, useSubmitAttendance, useUpdateStudentAttendance, useTeacherHolidays, useStudentAttendanceHistory, StudentAttendanceRecord } from "@/features/attendance/services";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export function TeacherAttendance() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [localAttendance, setLocalAttendance] = useState<StudentAttendanceRecord[]>([]);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [historyStudent, setHistoryStudent] = useState<{ rollNumber: string; name: string } | null>(null);

  // 1. Fetch Teacher Courses for Dropdown
  const { data: courses, isLoading: coursesLoading } = useTeacherCourses();

  // Automatically select the first course if none is selected
  useEffect(() => {
    if (courses && courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // 2. Fetch Attendance for the selected course and date
  const dateObj = new Date(dateStr);
  const { data: attendanceData, isLoading: attendanceLoading, refetch: refetchAttendance } = useCourseAttendance(
    selectedCourseId,
    dateObj
  );

  // Sync fetched data to local state for editing
  useEffect(() => {
    if (attendanceData) {
      setLocalAttendance(attendanceData);
    }
  }, [attendanceData]);

  const { mutate: submitAttendance, isPending: isSubmitting } = useSubmitAttendance();
  const { mutateAsync: updateStudentAttendance } = useUpdateStudentAttendance();
  const { data: holidays } = useTeacherHolidays();
  const { data: attendanceHistory, isLoading: historyLoading } = useStudentAttendanceHistory(
    selectedCourseId,
    historyStudent?.rollNumber ?? null
  );

  const handleSingleSave = async (student: StudentAttendanceRecord) => {
    if (!selectedCourseId) return;
    setSavingStudentId(student.studentId);
    try {
      await updateStudentAttendance({
        courseId: selectedCourseId,
        rollNumber: student.rollNumber,
        status: student.status as "PRESENT" | "ABSENT" | "LATE",
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
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    setLocalAttendance((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSubmit = () => {
    if (!selectedCourseId) return;

    submitAttendance(
      {
        courseId: selectedCourseId,
        date: dateStr,
        students: localAttendance.map(s => ({ studentId: s.studentId, status: s.status })),
      },
      {
        onSuccess: () => {
          toast.success("Attendance submitted successfully!");
          refetchAttendance(); // Refresh to get updated 'isMarked' flags
        },
        onError: (err) => {
          toast.error(`Failed to submit attendance: ${err.message}`);
        }
      }
    );
  };

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
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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
                <SelectValue placeholder={coursesLoading ? "Loading classes..." : "Select a class"} />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => {
                  // Guard against UUID-looking titles (bad data entry)
                  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(course.title?.trim() ?? "");
                  const label = isUUID
                    ? `Class${course.description ? ` — Section ${course.description}` : ""}`
                    : `${course.title}${course.description ? ` — Section ${course.description}` : ""}`;
                  return (
                    <SelectItem key={course.id} value={course.id}>
                      {label} ({course._count.enrollments} student{course._count.enrollments !== 1 ? "s" : ""})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
              <Calendar className="w-4 h-4 text-indigo-500" />
              Date
            </label>
            <Input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full sm:w-[250px]"
            />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Holidays banner */}
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
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              Student List
              {attendanceLoading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleMarkAll("PRESENT")} className="text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-900/30">
                Mark All Present
              </Button>
            </div>
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
                      className="cursor-pointer"
                      onClick={() => setHistoryStudent({ rollNumber: student.rollNumber, name: student.name })}
                    >
                      <TableCell className="font-medium text-zinc-500">{student.rollNumber}</TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                        {student.isMarked && (
                          <span className="ml-2 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            Already Marked
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            variant={student.status === "PRESENT" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(student.studentId, "PRESENT")}
                            className={student.status === "PRESENT" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "text-zinc-500"}
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Present
                          </Button>
                          <Button
                            type="button"
                            variant={student.status === "ABSENT" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(student.studentId, "ABSENT")}
                            className={student.status === "ABSENT" ? "bg-rose-500 hover:bg-rose-600 text-white" : "text-zinc-500"}
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            Absent
                          </Button>
                          <Button
                            type="button"
                            variant={student.status === "LATE" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(student.studentId, "LATE")}
                            className={student.status === "LATE" ? "bg-amber-500 hover:bg-amber-600 text-white" : "text-zinc-500"}
                          >
                            <Clock className="w-4 h-4 mr-1.5" />
                            Late
                          </Button>
                          {student.isMarked && student.canEdit && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSingleSave(student)}
                              disabled={savingStudentId === student.studentId}
                              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 ml-1"
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
                      {!selectedCourseId ? "Please select a class to view students." : "No students found in this class."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end pt-4">
          <Button 
            onClick={handleSubmit} 
            size="lg" 
            disabled={isSubmitting || localAttendance.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md disabled:bg-indigo-400"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Submit Attendance
          </Button>
        </motion.div>
      </motion.div>

      {/* Student Attendance History Modal */}
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
                {[
                  { label: "Present", value: attendanceHistory.summary.present, cls: "bg-emerald-50 text-emerald-700" },
                  { label: "Absent", value: attendanceHistory.summary.absent, cls: "bg-rose-50 text-rose-700" },
                  { label: "Late", value: attendanceHistory.summary.late, cls: "bg-amber-50 text-amber-700" },
                  { label: "Rate", value: `${attendanceHistory.summary.percentage}%`, cls: "bg-indigo-50 text-indigo-700" },
                ].map((s) => (
                  <Card key={s.label} className={`p-3 text-center border-0 ${s.cls}`}>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs font-medium">{s.label}</p>
                  </Card>
                ))}
              </div>
              {/* Records list */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
                {attendanceHistory.records.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-100">
                    <span className="text-zinc-600">{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</span>
                    <Badge variant="outline" className={
                      r.status === "PRESENT" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      r.status === "ABSENT" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      r.status === "LATE" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-zinc-100 text-zinc-600"
                    }>
                      {r.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-zinc-500 py-8 text-sm">No attendance records found for this student.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
