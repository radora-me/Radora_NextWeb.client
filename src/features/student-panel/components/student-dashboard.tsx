"use client";

import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Bot, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { useStudentDashboard } from "@/features/student-panel/services";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function StudentDashboard() {
  const { data: dashboard, isLoading } = useStudentDashboard();

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <PageHeader
          title={`Welcome back, ${dashboard.studentName.split(" ")[0]}!`}
          description="Here's an overview of your schedule and progress."
        />
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Class Widget */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0 shadow-lg shadow-indigo-500/20">
            <CardHeader>
              <CardTitle className="text-indigo-100">Next Upcoming Class</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold tracking-tight">Mathematics</h3>
                  <p className="text-indigo-100 mt-1">Mr. Sharma • Room 302</p>
                </div>
              </div>
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-200" />
                  <span className="font-medium text-sm">10:30 AM - 11:15 AM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-indigo-200" />
                  <span className="font-medium text-sm">Starts in 15 mins</span>
                </div>
              </div>
              <Link href="/student-timetable">
                <Button variant="secondary" className="w-full mt-6 bg-white text-indigo-600 hover:bg-white/90">
                  View Full Timetable
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dashboard.attendancePercentage.toFixed(1)}%</div>
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    {dashboard.attendancePercentage >= 75 ? "On track" : "Needs improvement"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard.streak} Days</div>
              <p className="text-xs text-muted-foreground mt-1">Keep it up!</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>Get help or connect with your class.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/student-ai-chat" className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">AI Study Assistant</h4>
                  <p className="text-xs text-muted-foreground">Ask questions & get help</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href="/student-classroom-chat" className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Classroom Chat</h4>
                  <p className="text-xs text-muted-foreground">Discuss with your class</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Announcements / Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1">
              <h4 className="text-sm font-semibold">Science Project Deadline Extended</h4>
              <p className="text-xs text-muted-foreground">Mr. Gupta • Today</p>
            </div>
            <div className="space-y-2 border-l-2 border-amber-500 pl-4 py-1">
              <h4 className="text-sm font-semibold">Tomorrow is a Holiday</h4>
              <p className="text-xs text-muted-foreground">Principal Office • Yesterday</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
