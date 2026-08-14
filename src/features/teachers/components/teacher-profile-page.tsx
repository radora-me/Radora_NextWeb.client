"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Briefcase, Loader2,
  BookOpen, Plus, GraduationCap, CheckCircle2, Save, X, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminTeacher, useUpdateAdminTeacher } from "@/features/admin/services/admin.service";
import { toast } from "sonner";

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

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function TeacherProfilePage() {
  const params = useParams();
  const teacherId = params.id as string;
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const {
    data: teacher,
    isLoading,
    isError,
    refetch,
  } = useAdminTeacher(teacherId || null);

  const { mutate: updateTeacher, isPending: isUpdating } = useUpdateAdminTeacher();

  // Sync form state when teacher data loads
  useEffect(() => {
    if (teacher && !isEditing) {
      setEditName(teacher.name || "");
      setEditEmail(teacher.email || "");
      setEditAddress(teacher.address || "");
    }
  }, [teacher, isEditing]);

  const handleSave = () => {
    if (!teacherId) return;
    updateTeacher(
      { teacherId, name: editName, email: editEmail, address: editAddress },
      {
        onSuccess: () => {
          toast.success("Teacher profile updated successfully!");
          setIsEditing(false);
          refetch();
        },
        onError: (err: any) => {
          toast.error(err.message || "Failed to update teacher profile.");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    if (teacher) {
      setEditName(teacher.name || "");
      setEditEmail(teacher.email || "");
      setEditAddress(teacher.address || "");
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-red-500">
        <AlertCircle className="h-12 w-12" />
        <h2 className="text-xl font-semibold">Teacher Not Found</h2>
        <p className="text-muted-foreground text-sm">Could not load teacher data from the server.</p>
        <Link href="/teachers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers
          </Button>
        </Link>
      </div>
    );
  }

  const courses = teacher.courses || [];

  return (
    <>
      <AnimatePresence>
        {showAssignModal && (
          <AssignClassModal
            teacherEmail={teacher.email}
            onClose={() => {
              setShowAssignModal(false);
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
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link href="/teachers">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-lg font-bold">
                {teacher.name?.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2) || "TC"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{teacher.name}</h1>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  Active
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{teacher.email}</span>
                <span>ID: {teacher.id.substring(0, 8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setShowAssignModal(true)}
            >
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              Assign Class
            </Button>
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-slate-500"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{teacher.email}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-2">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Classes Assigned</p>
                <p className="text-sm font-medium">{courses.length} class{courses.length !== 1 ? "es" : ""}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-2">
                <MapPin className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium truncate">{teacher.address || "—"}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="classes">
              Assigned Classes
              {courses.length > 0 && (
                <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-indigo-100 px-1 text-[10px] font-semibold text-indigo-700">
                  {courses.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {isEditing ? "✏️ Editing Teacher Profile" : "Personal Information"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher-name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Full Name *
                      </Label>
                      <Input
                        id="teacher-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Teacher's full name"
                        className="focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="teacher-email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Email Address *
                      </Label>
                      <Input
                        id="teacher-email"
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="teacher@school.com"
                        className="focus-visible:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="teacher-address" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Address
                      </Label>
                      <Input
                        id="teacher-address"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="Full address"
                        className="focus-visible:ring-indigo-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <InfoField label="Full Name" value={teacher.name} />
                    <InfoField label="Email Address" value={teacher.email} />
                    <InfoField label="Address" value={teacher.address} />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Assigned Classes</CardTitle>
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => setShowAssignModal(true)}
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Assign New Class
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-14 text-center"
                  >
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                      <BookOpen className="h-7 w-7 text-indigo-400" />
                    </div>
                    <p className="text-base font-semibold text-foreground">No classes assigned yet</p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                      Click &quot;Assign New Class&quot; to link this teacher to a class and section.
                    </p>
                    <Button
                      className="mt-5 bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={() => setShowAssignModal(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Assign First Class
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map((course, index) => {
                      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(course.title?.trim() ?? "");
                      const label = isUUID
                        ? `Class${course.description ? ` — Section ${course.description}` : ""}`
                        : `${course.title}${course.description ? ` — Section ${course.description}` : ""}`;
                      return (
                        <motion.div
                          key={course.id || index}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-white p-4 space-y-3 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                                <GraduationCap className="h-5 w-5 text-indigo-600" />
                              </div>
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Active
                              </Badge>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {course._count?.enrollments ?? 0} student{(course._count?.enrollments ?? 0) !== 1 ? "s" : ""} enrolled
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: courses.length * 0.05 }}
                    >
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="w-full h-full min-h-[112px] rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/40 p-4 flex flex-col items-center justify-center gap-2 text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="text-xs font-medium">Assign Another Class</span>
                      </button>
                    </motion.div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </>
  );
}
