"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, MoreHorizontal, Eye, ChevronLeft, ChevronRight,
  BookOpen, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { mockTeachers } from "@/features/teachers/data/mock-teachers";
import { useSearchTeacher } from "@/features/students/api";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "on-leave": "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

const departments = [
  "Science", "Mathematics", "English", "Hindi", "Social Studies",
  "Computer Science", "Physical Education", "Arts", "Commerce",
];

const PAGE_SIZE = 10;

const CreateTeacherModal = dynamic(
  () => import("./create-teacher-modal").then((m) => m.CreateTeacherModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <Loader2 className="animate-spin text-white h-8 w-8" />
      </div>
    ),
  }
);

const AssignClassModal = dynamic(
  () => import("./assign-class-modal").then((m) => m.AssignClassModal),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <Loader2 className="animate-spin text-white h-8 w-8" />
      </div>
    ),
  }
);

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignTeacherEmail, setAssignTeacherEmail] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Load teachers from localStorage
  useEffect(() => {
    const loadTeachers = () => {
      const stored = localStorage.getItem("radora_teachers");
      if (stored) {
        setTeachers(JSON.parse(stored));
      } else {
        localStorage.setItem("radora_teachers", JSON.stringify(mockTeachers));
        setTeachers(mockTeachers);
      }
    };

    loadTeachers();

    window.addEventListener("storage", loadTeachers);
    return () => window.removeEventListener("storage", loadTeachers);
  }, []);

  // Debounced search term for API query
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 600);
    return () => clearTimeout(handler);
  }, [search]);

  // Backend search hook
  const { data: searchedTeacher } = useSearchTeacher(
    debouncedSearch,
    !!debouncedSearch && debouncedSearch.includes("@") // only search if it looks like an email
  );

  // Sync searched teacher into local state
  useEffect(() => {
    if (searchedTeacher) {
      const exists = teachers.some(
        (t) => t.email.toLowerCase() === searchedTeacher.email.toLowerCase()
      );
      if (!exists) {
        const names = (searchedTeacher.name || "").split(" ");
        const firstName = names[0] || "Teacher";
        const lastName = names.slice(1).join(" ") || "";

        const normalized = {
          id: searchedTeacher.id,
          firstName,
          lastName,
          name: searchedTeacher.name,
          email: searchedTeacher.email,
          department: "Science",
          subject: searchedTeacher.courses?.[0]?.title || "General",
          experience: "3 Years",
          status: "active",
          courses: searchedTeacher.courses || [],
        };

        const updated = [normalized, ...teachers];
        setTeachers(updated);
        localStorage.setItem("radora_teachers", JSON.stringify(updated));
      }
    }
  }, [searchedTeacher, teachers]);

  const filtered = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch =
        !search ||
        `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase()) ||
        (t.subject && t.subject.toLowerCase().includes(search.toLowerCase()));
      const matchesDept = deptFilter === "all" || t.department === deptFilter;
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [teachers, search, deptFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <AnimatePresence>
        {showCreateModal && <CreateTeacherModal onClose={() => setShowCreateModal(false)} />}
        {assignTeacherEmail && (
          <AssignClassModal
            teacherEmail={assignTeacherEmail}
            onClose={() => setAssignTeacherEmail(null)}
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
          title="Teachers"
          description="Manage teacher profiles and assignments."
          action={
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          }
        />

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or subject..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v ?? "all"); setPage(0); }}>
                <SelectTrigger className="h-9 w-36 text-xs"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(0); }}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="on-leave">On Leave</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead>Teacher</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No teachers found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((teacher) => (
                  <TableRow key={teacher.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell>
                      <Link href={`/teachers/${teacher.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-medium">
                            {teacher.firstName[0]}{teacher.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-xs text-muted-foreground">{teacher.email}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{teacher.department}</TableCell>
                    <TableCell className="text-sm">{teacher.subject}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{teacher.experience}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[11px] ${statusStyles[teacher.status] || ""}`}>
                        {teacher.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link href={`/teachers/${teacher.id}`} className="flex items-center">
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setAssignTeacherEmail(teacher.email)}>
                            <div className="flex items-center">
                              <BookOpen className="mr-2 h-3.5 w-3.5" /> Assign Class
                            </div>
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
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} teachers
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
