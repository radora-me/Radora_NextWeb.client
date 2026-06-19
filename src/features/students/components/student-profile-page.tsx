"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockStudents } from "@/features/students/data/mock-students";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  graduated: "bg-blue-100 text-blue-700 border-blue-200",
  transferred: "bg-amber-100 text-amber-700 border-amber-200",
};

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

export function StudentProfilePage() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("radora_students");
    const list = stored ? JSON.parse(stored) : mockStudents;
    const found = list.find((s: any) => s.id === params.id);
    setStudent(found || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-xl font-semibold">Student Not Found</h2>
        <p className="text-muted-foreground">The student you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/students">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/students">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-lg font-bold">
              {(student.firstName?.[0] || student.name?.[0] || "S").toUpperCase()}
              {(student.lastName?.[0] || "").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {student.firstName || student.name} {student.lastName || ""}
              </h1>
              <Badge variant="outline" className={statusStyles[student.status]}>
                {student.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>Class {student.class}-{student.section}</span>
              <span>Roll #{student.rollNumber}</span>
              <span>ID: {student.id}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2">
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium truncate">{student.email}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2">
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{student.phone}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admission Date</p>
              <p className="text-sm font-medium">
                {new Date(student.admissionDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoField label="First Name" value={student.firstName || student.name} />
                <InfoField label="Last Name" value={student.lastName || ""} />
                <InfoField label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                <InfoField label="Gender" value={student.gender ? (student.gender.charAt(0).toUpperCase() + student.gender.slice(1)) : "—"} />
                <InfoField label="Blood Group" value={student.bloodGroup} />
                <InfoField label="Nationality" value={student.nationality} />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </h3>
                <p className="text-sm">{student.address}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-4">Guardian Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <InfoField label="Guardian Name" value={student.guardianName} />
                  <InfoField label="Relation" value={student.guardianRelation} />
                  <InfoField label="Phone" value={student.guardianPhone} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
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

        <TabsContent value="fees">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
              <p className="text-lg font-semibold">Fee Records</p>
              <p className="text-sm text-muted-foreground">
                Fee payment history and pending dues will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
