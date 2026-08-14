"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2, BookOpen, Users, GraduationCap, Pencil, Check, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import { useTeacherCourses } from "@/features/attendance/services/teacher-attendance.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function TeacherProfile() {
  const { user, loading: authLoading } = useAuth();
  const { data: courses, isLoading: coursesLoading, isError } = useTeacherCourses();

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when user loads
  if (user && formData.name === "" && !isEditing) {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      phone: "",
    });
  }

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call since backend doesn't support updates yet
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      // In a real scenario we would update the auth context here or refetch
    }, 1000);
  };

  if (authLoading || coursesLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-[250px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <Skeleton className="h-10 w-[120px]" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 pt-6 border-t">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-[150px]" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow p-8 space-y-4">
          <Skeleton className="h-6 w-[200px] mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-red-500 bg-red-50 p-8 rounded-xl m-6 border border-red-100">
        <h2 className="text-xl font-bold">Error loading profile</h2>
        <p className="text-sm mt-2 opacity-80 mb-4">Please check your connection and try again.</p>
        <Link href="/teacher-dashboard">
          <Button variant="outline" className="bg-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  const totalStudents = courses?.reduce((acc, curr) => acc + (curr._count?.enrollments || 0), 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6 max-w-5xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/teacher-dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16 shadow-sm">
            <AvatarImage src={user.image || ""} alt={user.name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-lg font-bold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {user.name}
              </h1>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Active Teacher
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <span>Employee ID: {user.id.substring(0, 8).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-blue-800/70 font-medium">Email</p>
              <p className="text-sm font-bold text-blue-900 truncate">{user.email}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-indigo-100 bg-gradient-to-br from-indigo-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-100 p-2">
              <BookOpen className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-indigo-800/70 font-medium">Assigned Classes</p>
              <p className="text-lg font-bold text-indigo-900">{courses?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-800/70 font-medium">Total Students</p>
              <p className="text-lg font-bold text-emerald-900">{totalStudents}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="bg-slate-100/50">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base text-slate-800">Personal Information</CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>
                    <X className="h-3.5 w-3.5 mr-2" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Check className="h-3.5 w-3.5 mr-2" />} 
                    Save Changes
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Full Name</label>
                      <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="h-9" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Email Address</label>
                      <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="h-9" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-500 uppercase">Phone Number</label>
                      <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="—" className="h-9" />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoField label="Full Name" value={formData.name || user.name} />
                    <InfoField label="Email Address" value={formData.email || user.email || "—"} />
                    <InfoField label="Phone Number" value={formData.phone || "—"} />
                  </>
                )}
                
                <InfoField label="Gender" value="—" />
                <InfoField label="Blood Group" value="—" />
                <InfoField label="Date of Joining" value="—" />
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Address
                </h3>
                <p className="text-sm text-slate-500">—</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Assigned Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isError ? (
                <div className="p-8 text-center text-red-500">
                  <p>Failed to load assigned classes.</p>
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {courses.map((course) => {
                    // Guard against UUID-looking titles
                    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(course.title?.trim() ?? "");
                    const label = isUUID
                      ? `Class${course.description ? ` — Section ${course.description}` : ""}`
                      : `${course.title}${course.description ? ` — Section ${course.description}` : ""}`;

                    return (
                      <div key={course.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
                            <GraduationCap className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{label}</p>
                            <p className="text-sm text-slate-500">
                              {course._count.enrollments} student{course._count.enrollments !== 1 ? "s" : ""} enrolled
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-white text-slate-600 shrink-0">Active</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>You have no classes assigned to you.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
