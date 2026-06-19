"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Calendar,
  Award,
  TrendingUp,
  Plus,
  BarChart3,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  mockExams,
  mockGrades,
  classPerformance,
} from "@/features/exams/data/mock-exams";

/* ---------- helpers ---------- */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(start: string, end: string) {
  const fmt = (t: string) => {
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour > 12 ? hour - 12 : hour}:${m} ${suffix}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  upcoming: {
    label: "Upcoming",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  },
  ongoing: {
    label: "Ongoing",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

const gradeColors: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  A: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "B+": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  B: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  C: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  D: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

/* ---------- animation variants ---------- */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/* ---------- page component ---------- */

export function ExamsPage() {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  /* unique subject list */
  const subjects = useMemo(
    () => Array.from(new Set(mockExams.map((e) => e.subject))).sort(),
    []
  );

  /* filtered exams */
  const filteredExams = useMemo(() => {
    return mockExams.filter((exam) => {
      if (subjectFilter !== "all" && exam.subject !== subjectFilter) return false;
      if (statusFilter !== "all" && exam.status !== statusFilter) return false;
      return true;
    });
  }, [subjectFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* ---- Header ---- */}
      <PageHeader
        title="Exams & Grades"
        description="Manage exam schedules, grade entry, and report cards."
        action={
          <Button size="sm" className="gap-1.5">
            <Plus className="size-4" />
            Create Exam
          </Button>
        }
      />

      {/* ---- Stats Row ---- */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatCard
            title="Total Exams"
            value="12"
            change="+3"
            trend="positive"
            icon={FileText}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Upcoming"
            value="7"
            change="+2"
            trend="positive"
            icon={Calendar}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Completed"
            value="4"
            change="+1"
            trend="positive"
            icon={Award}
          />
        </motion.div>
        <motion.div variants={item}>
          <StatCard
            title="Average Score"
            value="79.4%"
            change="+2.1%"
            trend="positive"
            icon={TrendingUp}
          />
        </motion.div>
      </motion.div>

      {/* ---- Tabs ---- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <Tabs defaultValue="schedule" className="space-y-4">
          <TabsList>
            <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
            <TabsTrigger value="grades">Grade Book</TabsTrigger>
            <TabsTrigger value="performance">Class Performance</TabsTrigger>
          </TabsList>

          {/* ===== TAB 1: Exam Schedule ===== */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base font-semibold">
                  Exam Schedule
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={subjectFilter}
                    onValueChange={(v) => setSubjectFilter(v ?? "all")}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue placeholder="Subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v ?? "all")}
                  >
                    <SelectTrigger className="h-8 w-32 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className="text-right">Marks</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No exams match your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredExams.map((exam) => {
                          const cfg = statusConfig[exam.status];
                          return (
                            <TableRow key={exam.id}>
                              <TableCell className="font-medium">
                                {exam.name}
                              </TableCell>
                              <TableCell>{exam.subject}</TableCell>
                              <TableCell>{exam.class}</TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatDate(exam.date)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                {formatTime(exam.startTime, exam.endTime)}
                              </TableCell>
                              <TableCell>{exam.room}</TableCell>
                              <TableCell className="text-right">
                                {exam.totalMarks}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={cfg.className}
                                >
                                  {cfg.label}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB 2: Grade Book ===== */}
          <TabsContent value="grades">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Grade Book — Unit Test 1 (Mathematics, Class 10-A)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Roll No</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-right w-28">Marks</TableHead>
                        <TableHead className="w-56">Percentage</TableHead>
                        <TableHead className="text-center w-20">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockGrades.map((entry) => {
                        const pct = entry.percentage;
                        const colorCls =
                          gradeColors[entry.grade] ??
                          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
                        const barColor =
                          pct >= 90
                            ? "bg-emerald-500"
                            : pct >= 75
                              ? "bg-blue-500"
                              : pct >= 60
                                ? "bg-amber-500"
                                : pct >= 40
                                  ? "bg-orange-500"
                                  : "bg-red-500";

                        return (
                          <TableRow key={entry.studentId}>
                            <TableCell className="font-mono text-muted-foreground">
                              {entry.rollNumber}
                            </TableCell>
                            <TableCell className="font-medium">
                              {entry.studentName}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {entry.marks}
                              <span className="text-muted-foreground">
                                /{entry.totalMarks}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-muted">
                                  <div
                                    className={`h-full rounded-full transition-all ${barColor}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="min-w-[40px] text-xs tabular-nums text-muted-foreground">
                                  {pct}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="secondary"
                                className={colorCls}
                              >
                                {entry.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== TAB 3: Class Performance ===== */}
          <TabsContent value="performance">
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {classPerformance.map((cp) => {
                const pct = cp.avgPercentage;
                const ringColor =
                  pct >= 80
                    ? "text-emerald-500"
                    : pct >= 70
                      ? "text-blue-500"
                      : "text-amber-500";
                return (
                  <motion.div key={cp.class} variants={item}>
                    <Card className="hover:shadow-md transition-shadow duration-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Class
                            </p>
                            <p className="text-xl font-bold">{cp.class}</p>
                          </div>
                          <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/30">
                            <BarChart3 className="size-5 text-indigo-500" />
                          </div>
                        </div>

                        {/* avg percentage visual */}
                        <div className="mt-4 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              Avg. Percentage
                            </span>
                            <span className={`font-semibold ${ringColor}`}>
                              {pct}%
                            </span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full transition-all ${
                                pct >= 80
                                  ? "bg-emerald-500"
                                  : pct >= 70
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* stats */}
                        <div className="mt-4 flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <Award className="size-3.5 text-emerald-500" />
                            <span className="font-medium">
                              {cp.toppers}
                            </span>
                            <span className="text-muted-foreground">
                              toppers
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="size-3.5 text-red-500 rotate-180" />
                            <span className="font-medium">{cp.failed}</span>
                            <span className="text-muted-foreground">
                              failed
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
