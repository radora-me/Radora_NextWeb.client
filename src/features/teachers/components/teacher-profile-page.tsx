"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { mockTeachers } from "@/features/teachers/data/mock-teachers";

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "on-leave": "bg-amber-100 text-amber-700 border-amber-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
};

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}

export function TeacherProfilePage() {
  const params = useParams();
  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("radora_teachers");
    const list = stored ? JSON.parse(stored) : mockTeachers;
    const found = list.find((t: any) => t.id === params.id);
    setTeacher(found || null);
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h2 className="text-xl font-semibold">Teacher Not Found</h2>
        <p className="text-muted-foreground">The teacher you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/teachers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers
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
          <Link href="/teachers">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-purple-600 text-white text-lg font-bold">
              {(teacher.firstName?.[0] || teacher.name?.[0] || "T").toUpperCase()}
              {(teacher.lastName?.[0] || "").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                {teacher.firstName || teacher.name} {teacher.lastName || ""}
              </h1>
              <Badge variant="outline" className={statusStyles[teacher.status]}>
                {teacher.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{teacher.department}</span>
              <span>{teacher.subject}</span>
              <span>ID: {teacher.id}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit Profile
        </Button>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              <Phone className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium">{teacher.phone}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-50 p-2">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium">
                {new Date(teacher.joiningDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-sm font-medium">{teacher.experience}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <InfoField label="First Name" value={teacher.firstName || teacher.name} />
                <InfoField label="Last Name" value={teacher.lastName || ""} />
                <InfoField label="Date of Birth" value={teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "—"} />
                <InfoField label="Gender" value={teacher.gender ? (teacher.gender.charAt(0).toUpperCase() + teacher.gender.slice(1)) : "—"} />
                <InfoField label="Department" value={teacher.department} />
                <InfoField label="Subject" value={teacher.subject} />
                <InfoField label="Salary" value={teacher.salary} />
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Address
                </h3>
                <p className="text-sm">{teacher.address}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InfoField label="Qualification" value={teacher.qualification} />
                <InfoField label="Experience" value={teacher.experience} />
                <InfoField label="Department" value={teacher.department} />
                <InfoField label="Specialization" value={teacher.subject} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
              <p className="text-lg font-semibold">Teaching Schedule</p>
              <p className="text-sm text-muted-foreground">
                Weekly timetable and class assignments will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card className="flex items-center justify-center py-16">
            <CardContent className="text-center space-y-2">
              <p className="text-lg font-semibold">Assigned Classes</p>
              <p className="text-sm text-muted-foreground">
                List of assigned classes and sections will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
