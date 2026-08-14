"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreHorizontal, Eye, ChevronLeft, ChevronRight,
  User, Hash, LockKeyhole, Eye as EyeIcon, EyeOff, CheckCircle2, AlertCircle, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { mockStudents } from "@/features/students/data/mock-students";
import { useCreateStudent, useSearchStudent } from "@/features/students/services";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  graduated: "bg-blue-100 text-blue-700 border-blue-200",
  transferred: "bg-amber-100 text-amber-700 border-amber-200",
};

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

export function StudentsPage() {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  // Load students from local storage
  useEffect(() => {
    const loadStudents = () => {
      const stored = localStorage.getItem("radora_students");
      if (stored) {
        setStudents(JSON.parse(stored));
      } else {
        localStorage.setItem("radora_students", JSON.stringify(mockStudents));
        setStudents(mockStudents);
      }
    };

    loadStudents();

    window.addEventListener("storage", loadStudents);
    return () => window.removeEventListener("storage", loadStudents);
  }, []);

  // Debounced search for API query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 600);
    return () => clearTimeout(handler);
  }, [search]);

  // Backend search hook
  const { data: searchedStudent } = useSearchStudent(
    debouncedSearch,
    !!debouncedSearch && debouncedSearch.length >= 3 // only search if at least 3 chars
  );

  // Sync searched student from DB into state/localStorage
  useEffect(() => {
    if (searchedStudent) {
      const exists = students.some(
        (s) => s.rollNumber.toUpperCase() === searchedStudent.rollNumber.toUpperCase()
      );
      if (!exists) {
        const names = (searchedStudent.name || "").split(" ");
        const firstName = names[0] || "Student";
        const lastName = names.slice(1).join(" ") || "";

        const normalized = {
          id: searchedStudent.id,
          firstName,
          lastName,
          name: searchedStudent.name,
          email: `${searchedStudent.rollNumber.toLowerCase()}@radora.edu`,
          rollNumber: searchedStudent.rollNumber,
          class: searchedStudent.className || "10",
          section: "A",
          status: "active",
          guardianName: "Guardian",
          guardianPhone: "+91 98765 43210",
        };

        const updated = [normalized, ...students];
        setStudents(updated);
        localStorage.setItem("radora_students", JSON.stringify(updated));
      }
    }
  }, [searchedStudent, students]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !search ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === "all" || s.class === classFilter;
      const matchesSection = sectionFilter === "all" || s.section === sectionFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });
  }, [students, search, classFilter, sectionFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <AnimatePresence>
        {showCreateModal && <CreateStudentModal onClose={() => setShowCreateModal(false)} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <PageHeader
          title="Students"
          description="Manage student records and enrollment."
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

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or roll number..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={classFilter} onValueChange={(v) => { setClassFilter(v ?? "all"); setPage(0); }}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Class" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>Class {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sectionFilter} onValueChange={(v) => { setSectionFilter(v ?? "all"); setPage(0); }}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Section" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {["A", "B", "C", "D"].map((s) => (
                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(0); }}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Guardian</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No students found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((student) => (
                  <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link href={`/students/${student.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-medium">
                            {student.firstName[0]}{student.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{student.class}-{student.section}</TableCell>
                    <TableCell className="text-sm font-mono">{student.rollNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] ${statusStyles[student.status] || ""}`}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div>
                        <p className="text-sm">{student.guardianName}</p>
                        <p className="text-xs text-muted-foreground">{student.guardianPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/students/${student.id}`} className="flex items-center">
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} students
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
        </Card>
      </motion.div>
    </>
  );
}
