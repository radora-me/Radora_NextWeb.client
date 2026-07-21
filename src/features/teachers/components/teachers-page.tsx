"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Eye, ChevronLeft, ChevronRight,
  BookOpen, Loader2, AlertCircle, GraduationCap,
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
import {
  useAdminTeachers,
  useUpdateAdminTeacher,
} from "@/features/admin/services/admin.service";
import { useAssignClass } from "@/features/teachers/services";
import { toast } from "sonner";

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

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
}

function classLabel(title: string, desc?: string | null) {
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(title?.trim() ?? "");
  return isUUID
    ? `Class${desc ? ` ${desc}` : ""}`
    : `${title}${desc ? ` — ${desc}` : ""}`;
}

export function TeachersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [assignTeacherEmail, setAssignTeacherEmail] = useState<string | null>(null);

  const { data: teachers, isLoading, isError, refetch } = useAdminTeachers();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (teachers ?? []).filter(
      (t) =>
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.courses.some((c) => classLabel(c.title, c.description).toLowerCase().includes(q))
    );
  }, [teachers, search]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <>
      <AnimatePresence>
        {showCreateModal && (
          <CreateTeacherModal
            onClose={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}
        {assignTeacherEmail && (
          <AssignClassModal
            teacherEmail={assignTeacherEmail}
            onClose={() => {
              setAssignTeacherEmail(null);
              refetch();
            }}
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
          description="Manage teacher profiles and class assignments."
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

        {/* Search */}
        <Card className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or class..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-8 h-9 text-sm"
            />
          </div>
        </Card>

        {/* Loading */}
        {isLoading && (
          <Card>
            <CardContent className="p-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b last:border-0">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-red-100 bg-red-50">
            <CardContent className="p-6 flex items-center gap-3 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">Failed to load teachers. Please refresh.</p>
            </CardContent>
          </Card>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Assigned Classes</TableHead>
                  <TableHead className="hidden md:table-cell">Students</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                      {search ? "No teachers match your search." : "No teachers found. Add one to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((teacher) => {
                    const totalStudents = teacher.courses.reduce(
                      (acc, c) => acc + (c._count?.enrollments ?? 0),
                      0
                    );
                    return (
                      <TableRow key={teacher.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-100 text-purple-700 text-xs font-semibold">
                                {getInitials(teacher.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{teacher.name}</p>
                              {teacher.address && (
                                <p className="text-xs text-muted-foreground truncate max-w-[180px]">{teacher.address}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{teacher.email}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {teacher.courses.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {teacher.courses.slice(0, 3).map((c) => (
                                <Badge
                                  key={c.id}
                                  variant="secondary"
                                  className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-200"
                                >
                                  {classLabel(c.title, c.description)}
                                </Badge>
                              ))}
                              {teacher.courses.length > 3 && (
                                <Badge variant="secondary" className="text-[10px]">
                                  +{teacher.courses.length - 3}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">None assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{totalStudents}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                              onClick={() => setAssignTeacherEmail(teacher.email)}
                            >
                              <BookOpen className="mr-1 h-3 w-3" />
                              Assign
                            </Button>
                            <Link href={`/teachers/${teacher.id}`}>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
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
        )}
      </motion.div>
    </>
  );
}
