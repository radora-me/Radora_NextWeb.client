"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, MessageSquare, Loader2, RefreshCw, UserPlus, Users, GraduationCap } from "lucide-react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/shared/page-header";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTeacherStudents } from "@/features/students/services";
import { Skeleton } from "@/components/ui/skeleton";

const AddStudentModal = dynamic(
  () =>
    import("@/features/teacher/components/add-student-modal").then(
      (m) => m.AddStudentModal
    ),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    ),
  }
);

export function TeacherStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: students, isLoading, isError, refetch } = useTeacherStudents();

  // Extract unique classes for the filter dropdown
  const uniqueClasses =
    Array.from(new Set(students?.map((s) => {
      // Prefer className field, fall back to first enrolled course title
      return s.className || s.courses?.[0]?.title || null;
    }).filter(Boolean))) || [];

  const filteredStudents =
    students?.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const displayClass = student.className || student.courses?.[0]?.title || "";
      const matchesClass =
        classFilter === "all" || displayClass === classFilter;
      return matchesSearch && matchesClass;
    }) || [];

  return (
    <>
      <AnimatePresence>
        {showAddModal && (
          <AddStudentModal onClose={() => { setShowAddModal(false); refetch(); }} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader
            title="My Students"
            description="Manage and view details for all the students enrolled in your courses."
          />
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        {!isLoading && !isError && students && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
          >
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Total Students</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <GraduationCap className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{uniqueClasses.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Classes</p>
              </div>
            </div>
            <div className="hidden sm:flex rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{filteredStudents.length}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Showing</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or roll number..."
              className="pl-9 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select
              value={classFilter}
              onValueChange={(v) => setClassFilter(v ?? "all")}
            >
              <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Students Table */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                  <TableRow className="border-slate-200 dark:border-slate-800">
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Roll Number</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Name</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Class</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Section</TableHead>
                    <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="p-0">
                        <div className="space-y-4 py-4 px-6">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl">
                              <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                  <Skeleton className="h-4 w-[150px]" />
                                  <Skeleton className="h-3 w-[100px]" />
                                </div>
                              </div>
                              <Skeleton className="h-8 w-[100px] rounded-md" />
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : isError ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-red-500 bg-red-50 p-4 rounded-lg mx-4">
                          <p className="font-medium">Failed to load students.</p>
                          <p className="text-sm">Please ensure you are connected to the network.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => refetch()}
                            className="mt-4 bg-white"
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          {student.rollNumber}
                        </TableCell>
                        <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {(() => {
                            // Derive class from className field OR first enrolled course title
                            const cls = student.className || student.courses?.[0]?.title;
                            if (cls) {
                              return <span className="font-medium text-slate-800 dark:text-slate-200">{cls}</span>;
                            }
                            return <span className="text-slate-400 italic text-sm">Unassigned</span>;
                          })()}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400">
                          {(() => {
                            // Derive section from first enrolled course description
                            const section = student.courses?.[0]?.description;
                            if (section) {
                              return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">{section}</Badge>;
                            }
                            return <span className="text-slate-400 italic text-sm">—</span>;
                          })()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                            >
                              <Eye className="h-4 w-4 mr-1.5" />
                              <span className="hidden sm:inline">Profile</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                            >
                              <MessageSquare className="h-4 w-4 mr-1.5" />
                              <span className="hidden sm:inline">Message</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-40 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <Users className="h-7 w-7 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {students?.length === 0
                                ? "No students in your classes yet"
                                : "No students match your search"}
                            </p>
                            <p className="text-sm mt-1">
                              {students?.length === 0
                                ? "Click \"Add Student\" to enroll students into your courses."
                                : "Try adjusting your search or filter."}
                            </p>
                          </div>
                          {students?.length === 0 && (
                            <Button
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => setShowAddModal(true)}
                            >
                              <UserPlus className="mr-2 h-4 w-4" />
                              Add First Student
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
}
