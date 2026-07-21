"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Users,
  UserX,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import {
  todayAttendance,
  attendanceSummaries,
  weeklyTrend,
} from "@/features/attendance/data/mock-attendance";
import type { AttendanceRecord } from "@/types/api.types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type AttendanceStatus = AttendanceRecord["status"];

const STATUS_STYLES: Record<
  AttendanceStatus,
  { bg: string; text: string; label: string }
> = {
  present: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-400",
    label: "Present",
  },
  absent: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-700 dark:text-red-400",
    label: "Absent",
  },
  late: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-700 dark:text-amber-400",
    label: "Late",
  },
  excused: {
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-700 dark:text-sky-400",
    label: "Excused",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function AttendancePage() {
  // ---- class / section selector state ----
  const classOptions = useMemo(
    () => [...new Set(todayAttendance.map((d) => d.class))],
    []
  );
  const [selectedClass, setSelectedClass] = useState(
    todayAttendance[0]?.class ?? classOptions[0]
  );

  const sectionOptions = useMemo(
    () =>
      todayAttendance
        .filter((d) => d.class === selectedClass)
        .map((d) => d.section),
    [selectedClass]
  );
  const [selectedSection, setSelectedSection] = useState(
    todayAttendance[0]?.section ?? sectionOptions[0]
  );

  // ---- attendance records for selected class/section ----
  const currentAttendance = useMemo(
    () =>
      todayAttendance.find(
        (d) => d.class === selectedClass && d.section === selectedSection
      ) ?? todayAttendance[0],
    [selectedClass, selectedSection]
  );

  // ---- local editable records ----
  const [records, setRecords] = useState<AttendanceRecord[]>(
    currentAttendance.records
  );

  // Sync records when class/section changes
  const handleClassChange = (cls: string | null) => {
    const c = cls ?? classOptions[0];
    setSelectedClass(c);
    const firstSection =
      todayAttendance.find((d) => d.class === c)?.section ?? "A";
    setSelectedSection(firstSection);
    const att = todayAttendance.find(
      (d) => d.class === c && d.section === firstSection
    );
    if (att) setRecords(att.records);
  };

  const handleSectionChange = (sec: string | null) => {
    const s = sec ?? sectionOptions[0];
    setSelectedSection(s);
    const att = todayAttendance.find(
      (d) => d.class === selectedClass && d.section === s
    );
    if (att) setRecords(att.records);
  };

  const toggleStatus = (studentId: string, newStatus: AttendanceStatus) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId ? { ...r, status: newStatus } : r
      )
    );
  };

  // ---- computed stats from current records ----
  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const totalStudents = records.length;
  const attendanceRate =
    totalStudents > 0
      ? (((presentCount + lateCount) / totalStudents) * 100).toFixed(1)
      : "0";

  // ---- aggregate today stats across ALL classes ----
  const todayTotalPresent = todayAttendance.reduce(
    (s, d) => s + d.presentCount,
    0
  );
  const todayTotalAbsent = todayAttendance.reduce(
    (s, d) => s + d.absentCount,
    0
  );
  const todayTotalLate = todayAttendance.reduce((s, d) => s + d.lateCount, 0);
  const todayTotal = todayAttendance.reduce(
    (s, d) => s + d.records.length,
    0
  );
  const todayRate =
    todayTotal > 0
      ? (((todayTotalPresent + todayTotalLate) / todayTotal) * 100).toFixed(1)
      : "0";

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* ---- Header ---- */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Attendance"
          description="Track and manage daily attendance records."
        />
      </motion.div>

      {/* ---- Stats Row ---- */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Present"
          value={String(todayTotalPresent)}
          change="+2.4%"
          trend="positive"
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Absent"
          value={String(todayTotalAbsent)}
          change="-1.2%"
          trend="negative"
          icon={UserX}
        />
        <StatCard
          title="Late Arrivals"
          value={String(todayTotalLate)}
          change="-0.5%"
          trend="positive"
          icon={Clock}
        />
        <StatCard
          title="Attendance Rate"
          value={`${todayRate}%`}
          change="+1.1%"
          trend="positive"
          icon={ClipboardCheck}
        />
      </motion.div>

      {/* ---- Tabs ---- */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="mark" className="space-y-4">
          <TabsList>
            <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
            <TabsTrigger value="overview">Class Overview</TabsTrigger>
          </TabsList>

          {/* ================================================================
              Mark Attendance Tab
          ================================================================ */}
          <TabsContent value="mark">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-indigo-500" />
                    Mark Attendance — Class {selectedClass}-{selectedSection}
                  </CardTitle>

                  {/* Selectors */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={selectedClass}
                      onValueChange={handleClassChange}
                    >
                      <SelectTrigger className="h-9 w-28 text-xs">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classOptions.map((c) => (
                          <SelectItem key={c} value={c}>
                            Class {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={selectedSection}
                      onValueChange={handleSectionChange}
                    >
                      <SelectTrigger className="h-9 w-24 text-xs">
                        <SelectValue placeholder="Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            Section {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Quick summary for selected class */}
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {totalStudents} students
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {presentCount}{" "}
                    present
                  </span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <UserX className="h-3.5 w-3.5" /> {absentCount} absent
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" /> {lateCount} late
                  </span>
                  <span>
                    Attendance rate:{" "}
                    <strong className="text-foreground">{attendanceRate}%</strong>
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record, idx) => {
                      const style = STATUS_STYLES[record.status];
                      return (
                        <TableRow key={record.studentId}>
                          <TableCell className="font-medium text-muted-foreground">
                            {idx + 1}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {record.rollNumber}
                          </TableCell>
                          <TableCell className="font-medium">
                            {record.studentName}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`${style.bg} ${style.text} border-0`}
                            >
                              {style.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(
                                [
                                  "present",
                                  "absent",
                                  "late",
                                  "excused",
                                ] as AttendanceStatus[]
                              ).map((status) => {
                                const s = STATUS_STYLES[status];
                                const isActive = record.status === status;
                                return (
                                  <Button
                                    key={status}
                                    size="xs"
                                    variant={isActive ? "default" : "outline"}
                                    className={
                                      isActive
                                        ? `${s.bg} ${s.text} border-0 hover:opacity-90`
                                        : "text-muted-foreground"
                                    }
                                    onClick={() =>
                                      toggleStatus(record.studentId, status)
                                    }
                                  >
                                    {s.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Save action */}
                <div className="mt-6 flex items-center justify-between border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    Showing {records.length} students for Class{" "}
                    {selectedClass}-{selectedSection}
                  </p>
                  <Button className="gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Save Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ================================================================
              Class Overview Tab
          ================================================================ */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Class Attendance Overview — {attendanceSummaries[0]?.month}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead className="text-center">
                        Total Students
                      </TableHead>
                      <TableHead className="text-center">
                        Avg. Attendance
                      </TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceSummaries.map((summary) => {
                      const avg = summary.avgAttendance;
                      let colorClass =
                        "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40";
                      let statusLabel = "Excellent";

                      if (avg < 90) {
                        colorClass =
                          "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40";
                        statusLabel = "Needs Attention";
                      } else if (avg < 94) {
                        colorClass =
                          "text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/40";
                        statusLabel = "Average";
                      }

                      return (
                        <TableRow
                          key={`${summary.class}-${summary.section}`}
                        >
                          <TableCell className="font-medium">
                            Class {summary.class}
                          </TableCell>
                          <TableCell>{summary.section}</TableCell>
                          <TableCell className="text-center">
                            {summary.totalStudents}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${colorClass}`}
                            >
                              {avg.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={`${colorClass} border-0`}
                            >
                              {statusLabel}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
