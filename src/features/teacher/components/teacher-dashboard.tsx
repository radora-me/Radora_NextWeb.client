"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, ClipboardCheck, Percent,
  BookMarked, GraduationCap, Loader2, AlertCircle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherStudents } from "@/features/students/services";
import {
  useTeacherCourses,
  useTeacherHomeworkList,
} from "@/features/teacher/services/teacher-dashboard.service";

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export function TeacherDashboard() {
  // ── Data fetching ──
  const {
    data: students,
    isLoading: studentsLoading,
    isError: studentsError,
  } = useTeacherStudents();

  const {
    data: courses,
    isLoading: coursesLoading,
    isError: coursesError,
  } = useTeacherCourses();

  const {
    data: homeworkList,
    isLoading: homeworkLoading,
    isError: homeworkError,
  } = useTeacherHomeworkList();

  // ── Derived stats ──
  const totalStudents = useMemo(() => students?.length ?? 0, [students]);

  const totalClasses = useMemo(() => courses?.length ?? 0, [courses]);

  const assignmentsToGrade = useMemo(() => {
    if (!homeworkList) return 0;
    // Count total un-graded submissions across all PUBLISHED homework
    return homeworkList
      .filter((hw) => hw.status === "PUBLISHED")
      .reduce((acc, hw) => acc + (hw.submissionsCount - hw.gradedCount), 0);
  }, [homeworkList]);

  // Avg students per course as a proxy for "coverage" —
  // Avg Attendance requires per-course attendance data (expensive).
  // Instead, show total enrolled / total courses as a clean metric.
  const avgEnrollment = useMemo(() => {
    if (!courses || courses.length === 0) return null;
    const total = courses.reduce((sum, c) => sum + (c._count?.enrollments ?? 0), 0);
    return Math.round(total / courses.length);
  }, [courses]);

  const isLoading = studentsLoading || coursesLoading || homeworkLoading;

  // ── Recent homework (sorted by latest, show top 4) ──
  const recentHomework = useMemo(() => {
    if (!homeworkList) return [];
    return [...homeworkList]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [homeworkList]);

  // ── Enrolled courses list ──
  const sortedCourses = useMemo(() => {
    if (!courses) return [];
    return [...courses].sort((a, b) => b._count.enrollments - a._count.enrollments);
  }, [courses]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <PageHeader
        title="Teacher Dashboard"
        description="Welcome back! Here's a live overview of your classes."
      />

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={totalStudents.toString()}
              change={studentsError ? "Error loading" : `across ${totalClasses} class${totalClasses !== 1 ? "es" : ""}`}
              trend={studentsError ? "negative" : "positive"}
              icon={Users}
            />
            <StatCard
              title="My Classes"
              value={totalClasses.toString()}
              change={coursesError ? "Error loading" : `${totalStudents} students enrolled`}
              trend={coursesError ? "negative" : "positive"}
              icon={BookOpen}
            />
            <StatCard
              title="Assignments to Grade"
              value={assignmentsToGrade.toString()}
              change={
                homeworkError
                  ? "Error loading"
                  : assignmentsToGrade === 0
                  ? "All caught up!"
                  : `pending submission${assignmentsToGrade !== 1 ? "s" : ""}`
              }
              trend={assignmentsToGrade === 0 ? "positive" : "negative"}
              icon={ClipboardCheck}
            />
            <StatCard
              title="Avg Class Size"
              value={avgEnrollment !== null ? avgEnrollment.toString() : "—"}
              change={coursesError ? "Error loading" : `students per class`}
              trend="positive"
              icon={Percent}
            />
          </>
        )}
      </div>

      {/* ── Bottom Section ── */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* ── My Classes ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="h-4 w-4 text-indigo-500" />
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : coursesError ? (
              <div className="flex items-center gap-2 text-red-500 text-sm py-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Failed to load classes. Please refresh.
              </div>
            ) : sortedCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No classes assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {sortedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-800">{course.title}</p>
                      {course.description && (
                        <p className="text-xs text-muted-foreground">
                          Section {course.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs"
                    >
                      {course._count.enrollments} student{course._count.enrollments !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Recent Assignments ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookMarked className="h-4 w-4 text-purple-500" />
              Recent Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {homeworkLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-44" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : homeworkError ? (
              <div className="flex items-center gap-2 text-red-500 text-sm py-4">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Failed to load assignments. Please refresh.
              </div>
            ) : recentHomework.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No assignments created yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((hw) => {
                  const pending = hw.submissionsCount - hw.gradedCount;
                  return (
                    <div
                      key={hw.id}
                      className="flex items-start justify-between py-2 border-b last:border-0 gap-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-slate-800 truncate">{hw.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {hw.course.title}
                          {hw.dueAt && (
                            <> · Due {new Date(hw.dueAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={
                            hw.status === "PUBLISHED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                              : "bg-slate-50 text-slate-500 border-slate-200 text-[10px]"
                          }
                        >
                          {hw.status === "PUBLISHED" ? "Published" : "Draft"}
                        </Badge>
                        {pending > 0 && (
                          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200">
                            {pending} to grade
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
