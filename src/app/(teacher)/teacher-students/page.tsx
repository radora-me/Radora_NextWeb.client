"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, MessageSquare, Loader2, RefreshCw } from "lucide-react";

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
import { useTeacherStudents } from "@/features/teacher/api";

export default function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");

  const { data: students, isLoading, isError, refetch } = useTeacherStudents();

  // Extract unique classes for the filter dropdown
  const uniqueClasses = Array.from(new Set(students?.map(s => s.className).filter(Boolean))) || [];

  const filteredStudents = students?.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || student.className === classFilter;
    return matchesSearch && matchesClass;
  }) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-6"
    >
      <div className="flex justify-between items-start">
        <PageHeader 
          title="My Students" 
          description="Manage and view details for all the students enrolled in your courses."
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()} 
          disabled={isLoading}
          className="bg-white"
        >
          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

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
          <Select value={classFilter} onValueChange={(v) => setClassFilter(v ?? "all")}>
            <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Filter by Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {uniqueClasses.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
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
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300">Enrolled Courses</TableHead>
                  <TableHead className="font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="h-6 w-6 animate-spin mb-2 text-indigo-500" />
                        <p>Loading your students...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-red-500 bg-red-50 p-4 rounded-lg mx-4">
                        <p className="font-medium">Failed to load students.</p>
                        <p className="text-sm">Please ensure you are connected to the network.</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-4 bg-white">
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell className="font-medium text-indigo-600 dark:text-indigo-400">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-slate-600 dark:text-slate-400">
                        {student.className || <span className="text-slate-400 italic">Unassigned</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {student.courses.length > 0 ? (
                            student.courses.map(course => (
                              <Badge key={course.id} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-0">
                                {course.title}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-slate-400 italic">No courses</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                            <Eye className="h-4 w-4 mr-1.5" />
                            <span className="hidden sm:inline">Profile</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                            <MessageSquare className="h-4 w-4 mr-1.5" />
                            <span className="hidden sm:inline">Message</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-slate-500 dark:text-slate-400">
                      {students?.length === 0 ? "You have no students enrolled in your courses." : "No students found matching your filters."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
