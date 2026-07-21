"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Eye, ChevronLeft, ChevronRight,
  User, Hash, Loader2, AlertCircle, UserSearch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStudent } from "@/features/students/services";
import { toast } from "sonner";

const PAGE_SIZE = 10;

const CreateStudentModal = dynamic(
  () => import("./create-student-modal").then((m) => m.CreateStudentModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <Loader2 className="animate-spin text-white h-8 w-8" />
      </div>
    ),
  }
);

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Cache of found students within this session
  const [foundStudents, setFoundStudents] = useState<any[]>([]);

  // Debounce the search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search.trim()), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Search by roll number via API
  const {
    data: searchedStudent,
    isLoading: isSearching,
    isError: searchError,
    error: searchErrorObj,
  } = useSearchStudent(debouncedSearch, debouncedSearch.length >= 2);

  // Add found student to session cache
  useEffect(() => {
    if (searchedStudent) {
      setFoundStudents((prev) => {
        const exists = prev.some((s) => s.id === searchedStudent.id);
        if (exists) return prev;
        return [searchedStudent, ...prev];
      });
    }
  }, [searchedStudent]);

  // Display list: if there's an active search show matched result; otherwise show cache
  const displayList = debouncedSearch.length >= 2
    ? searchedStudent ? [searchedStudent] : []
    : foundStudents;

  const totalPages = Math.ceil(displayList.length / PAGE_SIZE);
  const paginated = displayList.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const notFound = debouncedSearch.length >= 2 && !isSearching && !searchedStudent && !searchError;

  return (
    <>
      <AnimatePresence>
        {showCreateModal && (
          <CreateStudentModal
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <PageHeader
          title="Students"
          description="Search and manage student records."
          action={
            <Button
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          }
        />

        {/* Search bar */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Hash className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by Roll Number (e.g. STU015)..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            {isSearching && <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />}
          </div>
          <p className="text-xs text-muted-foreground mt-2 pl-0.5">
            Enter a student's roll number to look them up. Once found, they appear in the list below.
          </p>
        </Card>

        {/* Not found notice */}
        {notFound && (
          <Card className="border-amber-100 bg-amber-50">
            <CardContent className="p-4 flex items-center gap-3 text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">No student found with roll number <span className="font-semibold">"{debouncedSearch}"</span>.</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Roll Number</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="w-[80px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                    <UserSearch className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                    <p className="font-medium">Search for students</p>
                    <p className="text-xs mt-1">Type a roll number above to find a student.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((student: any) => (
                  <TableRow key={student.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{student.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {student.rollNumber}
                    </TableCell>
                    <TableCell>
                      {student.className ? (
                        <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 text-xs">
                          Class {student.className}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/students/${student.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, displayList.length)} of {displayList.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 0} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                  <Button key={i} variant={page === i ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(i)}>
                    {i + 1}
                  </Button>
                ))}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </>
  );
}
