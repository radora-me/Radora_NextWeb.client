"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Loader2, BookOpen, Target, Flame } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchJsonWithAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
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

import { Skeleton } from "@/components/ui/skeleton";

interface StudentCourse {
  id: string;
  title: string;
  description: string;
}

interface StudentProfileData {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  profilePhotoUrl: string | null;
  attendancePercentage: number;
  streak: number;
  courses: StudentCourse[];
}

export function useStudentProfile() {
  return useQuery<StudentProfileData>({
    queryKey: ["student-profile"],
    queryFn: () => fetchJsonWithAuth<StudentProfileData>("/student/profile"),
  });
}
export function StudentProfile() {
  const { data: profile, isLoading, isError } = useStudentProfile();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-8 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-[250px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
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
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-5 w-[120px]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center text-red-500 bg-red-50 p-8 rounded-xl m-6 border border-red-100">
        <h2 className="text-xl font-bold">Error loading profile</h2>
        <p className="text-sm mt-2 opacity-80 mb-4">Please check your connection and try again.</p>
        <Link href="/student-dashboard">
          <Button variant="outline" className="bg-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

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
          <Link href="/student-dashboard">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16 shadow-sm">
            <AvatarImage src={profile.profilePhotoUrl || ""} alt={profile.name} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-lg font-bold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {profile.name}
              </h1>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                Active Student
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-slate-500">
              <span className="font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                Class {profile.className} — Section {profile.section}
              </span>
              <span>Roll #{profile.rollNumber}</span>
              <span className="text-slate-400">ID: {profile.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-emerald-100 bg-gradient-to-br from-emerald-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-emerald-800/70 font-medium">Attendance</p>
              <p className="text-lg font-bold text-emerald-900">{profile.attendancePercentage}%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-orange-100 bg-gradient-to-br from-orange-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-100 p-2">
              <Flame className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-orange-800/70 font-medium">Current Streak</p>
              <p className="text-lg font-bold text-orange-900">{profile.streak} Days</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-blue-100 bg-gradient-to-br from-blue-50 to-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-800/70 font-medium">Enrolled Subjects</p>
              <p className="text-lg font-bold text-blue-900">{profile.courses.length}</p>
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
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoField label="Full Name" value={profile.name} />
                <InfoField label="Roll Number" value={profile.rollNumber} />
                <InfoField label="Date of Birth" value="—" />
                <InfoField label="Gender" value="—" />
                <InfoField label="Blood Group" value="—" />
                <InfoField label="Nationality" value="—" />
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2 text-slate-700">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  Address
                </h3>
                <p className="text-sm text-slate-500">—</p>
              </div>

              <Separator className="bg-slate-100" />

              <div>
                <h3 className="text-sm font-semibold mb-4 text-slate-700">Guardian Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <InfoField label="Guardian Name" value="—" />
                  <InfoField label="Relation" value="—" />
                  <InfoField label="Phone" value="—" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Enrolled Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {profile.courses.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {profile.courses.map((course: any) => (
                    <div key={course.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900">{course.title}</p>
                        <p className="text-sm text-slate-500">Section {course.description || "N/A"}</p>
                      </div>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">
                  <p>You are not currently enrolled in any subjects.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
