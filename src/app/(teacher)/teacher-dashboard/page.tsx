"use client";

import { motion } from "framer-motion";
import { Users, BookOpen, ClipboardCheck, Percent, Clock, MapPin, User, FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const schedule = [
  { id: 1, subject: "Mathematics - Grade 10", time: "09:00 AM - 10:30 AM", room: "Room 101" },
  { id: 2, subject: "Physics - Grade 11", time: "11:00 AM - 12:30 PM", room: "Lab 3" },
  { id: 3, subject: "Mathematics - Grade 12", time: "01:30 PM - 03:00 PM", room: "Room 105" },
  { id: 4, subject: "Science - Grade 9", time: "03:15 PM - 04:45 PM", room: "Room 102" },
];

const submissions = [
  { id: 1, student: "Alice Johnson", assignment: "Calculus Worksheet 4", time: "10 mins ago" },
  { id: 2, student: "Bob Smith", assignment: "Physics Lab Report", time: "1 hour ago" },
  { id: 3, student: "Charlie Brown", assignment: "Algebra Quiz", time: "2 hours ago" },
];

export default function TeacherDashboardPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <PageHeader 
        title="Teacher Dashboard" 
        description="Welcome back! Here's an overview of your day."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Students"
          value="120"
          change="+4%"
          trend="positive"
          icon={Users}
        />
        <StatCard
          title="Classes Today"
          value="4"
          change="+1"
          trend="positive"
          icon={BookOpen}
        />
        <StatCard
          title="Assignments to Grade"
          value="15"
          change="-5"
          trend="positive"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Avg Attendance"
          value="92%"
          change="-2%"
          trend="negative"
          icon={Percent}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {schedule.map((cls) => (
                <div key={cls.id} className="flex flex-col gap-1 border-b pb-4 last:border-0 last:pb-0">
                  <div className="font-semibold text-primary">{cls.subject}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {cls.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {cls.room}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submissions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-medium">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {sub.student}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      {sub.assignment}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sub.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
