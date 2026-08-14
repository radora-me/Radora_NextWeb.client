"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, MapPin, Loader2, GraduationCap,
  AlertCircle, Hash, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchStudent } from "@/features/students/services";

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function StudentProfilePage() {
  // The [id] route param is actually the rollNumber passed from the students list
  const params = useParams();
  const rollNumber = decodeURIComponent(params.id as string);

  const {
    data: student,
    isLoading,
    isError,
  } = useSearchStudent(rollNumber, !!rollNumber);

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-red-500">
        <AlertCircle className="h-12 w-12" />
        <h2 className="text-xl font-semibold">Student Not Found</h2>
        <p className="text-muted-foreground text-sm">
          No student with roll number &quot;{rollNumber}&quot; found.
        </p>
        <Link href="/students">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-lg font-bold">
              {getInitials(student.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{student.name}</h1>
              <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-200">
                {student.role}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5" />{student.rollNumber}
              </span>
              {student.className && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />Class {student.className}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2">
              <Hash className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Roll Number</p>
              <p className="text-sm font-medium font-mono">{student.rollNumber}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <GraduationCap className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="text-sm font-medium">{student.className || "Not assigned"}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <User className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Role</p>
              <p className="text-sm font-medium capitalize">{student.role}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Student Details</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoField label="Full Name" value={student.name} />
                <InfoField label="Roll Number" value={student.rollNumber} />
                <InfoField label="Class" value={student.className} />
              </div>

              {!student.className && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-sm">
                  <p className="font-semibold mb-1">⚠️ No class assigned</p>
                  <p className="text-xs">This student has not been enrolled in any class yet. Use the Teacher portal to enroll students.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
              <GraduationCap className="h-10 w-10 mx-auto text-slate-300 mb-3" />
              <p className="text-lg font-semibold">Academic Records</p>
              <p className="text-sm text-muted-foreground">
                Academic history, grades, and report cards will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
              <p className="text-lg font-semibold">Attendance Records</p>
              <p className="text-sm text-muted-foreground">
                Daily attendance records and patterns will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
