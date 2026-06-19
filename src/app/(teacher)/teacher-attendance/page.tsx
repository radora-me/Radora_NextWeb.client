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
import { CheckCircle, XCircle, Clock, FileWarning, Calendar, Users, Save, Loader2 } from "lucide-react";
import { useTeacherCourses, useCourseAttendance, useSubmitAttendance, StudentAttendanceRecord } from "@/features/teacher/api";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY";

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

export default function MarkAttendancePage() {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [dateStr, setDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [localAttendance, setLocalAttendance] = useState<StudentAttendanceRecord[]>([]);

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
          alert("Attendance submitted successfully!");
          refetchAttendance(); // Refresh to get updated 'isMarked' flags
        },
        onError: (err) => {
          alert(`Failed to submit attendance: ${err.message}`);
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
              Select Course
            </label>
            <Select
              value={selectedCourseId || ""}
              onValueChange={(v) => setSelectedCourseId(v)}
              disabled={coursesLoading}
            >
              <SelectTrigger className="w-full sm:w-[350px]">
                <SelectValue placeholder={coursesLoading ? "Loading courses..." : "Select a course"} />
              </SelectTrigger>
              <SelectContent>
                {courses?.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title} ({course._count.enrollments} students)
                  </SelectItem>
                ))}
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
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                      Loading roster...
                    </TableCell>
                  </TableRow>
                ) : localAttendance.length > 0 ? (
                  localAttendance.map((student) => (
                    <TableRow key={student.studentId}>
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
                          <Button
                            type="button"
                            variant={student.status === "HALF_DAY" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(student.studentId, "HALF_DAY")}
                            className={student.status === "HALF_DAY" ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "text-zinc-500"}
                          >
                            <FileWarning className="w-4 h-4 mr-1.5" />
                            Half Day
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                      {!selectedCourseId ? "Please select a course to view students." : "No students found in this course."}
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
    </div>
  );
}
