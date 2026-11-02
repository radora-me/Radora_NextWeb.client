"use client";

import {
  Activity, ArrowRight, Award, BookOpen, CalendarDays, CheckCircle2,
  ClipboardCheck, Clock3, GraduationCap, MessageSquare, Sparkles, Users,
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DemoNotice } from "@/features/walkthrough/components/tour-pages-shared";
import {
  demoStudentDashboard, demoTeacherAssignments, demoTeacherCourses,
  type DemoPageId,
} from "@/features/walkthrough/data/demo-data";

type RoleDashboardProps = {
  onLock: (feature: string, description: string) => void;
  onNavigate: (page: DemoPageId) => void;
  isTarget: (id: string) => boolean;
};

const focusRing = (active: boolean) => active
  ? "rounded-2xl ring-2 ring-indigo-500 ring-offset-4 ring-offset-background shadow-[0_0_0_8px_rgba(99,102,241,0.08)]"
  : "";

export function TeacherDashboardDemo({ onLock, onNavigate, isTarget }: RoleDashboardProps) {
  return (
    <div data-tour="teacher-overview" className={`space-y-6 ${focusRing(isTarget("teacher-overview"))}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Teacher Dashboard"
          description="Welcome back! Here’s a live overview of your classes."
        />
        <Badge variant="outline" className="h-8 gap-2 border-indigo-200 bg-indigo-50 px-3 text-indigo-700">
          <GraduationCap className="size-4" /> Teacher view
        </Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value="150" change="across 5 classes" trend="positive" icon={Users} />
        <StatCard title="My Classes" value="5" change="150 students enrolled" trend="positive" icon={BookOpen} />
        <StatCard title="Assignments to Grade" value="18" change="pending submissions" trend="negative" icon={ClipboardCheck} />
        <StatCard title="Avg Class Size" value="30" change="students per class" trend="positive" icon={Activity} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Class performance comparison</CardTitle>
            <CardDescription>Fictional class averages · rating out of 10</CardDescription>
          </div>
          <Badge variant="secondary">Demo data</Badge>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full" aria-label="Teacher class performance chart">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 760, height: 256 }}>
              <BarChart data={demoTeacherCourses} margin={{ top: 8, right: 12, left: -12, bottom: 4 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e7e9f0" />
                <XAxis dataKey="section" tickLine={false} axisLine={false} fontSize={11} />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} fontSize={11} />
                <Tooltip formatter={(value) => [`${value}/10`, "Average rating"]} />
                <Bar dataKey="rating" name="Average rating" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><BookOpen className="size-4 text-indigo-600" /> My Classes</CardTitle>
              <CardDescription className="mt-1">Your classes and current student reach</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("students")}>Students <ArrowRight className="ml-1 size-3.5" /></Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {demoTeacherCourses.map((course) => (
              <div key={course.section} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{course.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{course.section}</p>
                </div>
                <Badge variant="secondary" className="shrink-0 bg-indigo-50 text-indigo-700">{course.students} students</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="size-4 text-violet-600" /> Recent Assignments</CardTitle>
              <CardDescription className="mt-1">A quick view of submissions and grading</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("exams")}>Assessments <ArrowRight className="ml-1 size-3.5" /></Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {demoTeacherAssignments.map((assignment) => {
              const progress = assignment.total ? Math.round((assignment.submitted / assignment.total) * 100) : 0;
              return (
                <article key={assignment.title} className="border-b py-3 last:border-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{assignment.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{assignment.course}</p>
                    </div>
                    <Badge variant="outline" className={assignment.status === "Draft" ? "shrink-0 border-amber-200 bg-amber-50 text-amber-700" : "shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700"}>{assignment.status}</Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${progress}%` }} /></div>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{assignment.submitted}/{assignment.total} · {assignment.due}</span>
                  </div>
                </article>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onNavigate("attendance")}><ClipboardCheck className="mr-2 size-4" /> View attendance</Button>
        <Button variant="outline" onClick={() => onLock("Creating assignments", "Publishing and grading assignments are disabled in this fictional demo.")}><Sparkles className="mr-2 size-4" /> Create assignment</Button>
      </div>
      <DemoNotice>Teacher dashboard figures, classes and assignments are synthetic. All actions stay inside this demo.</DemoNotice>
    </div>
  );
}

export function StudentDashboardDemo({ onLock, onNavigate, isTarget }: RoleDashboardProps) {
  const attendance = demoStudentDashboard.attendance;
  return (
    <div data-tour="student-overview" className={`space-y-6 ${focusRing(isTarget("student-overview"))}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title={`Welcome back, ${demoStudentDashboard.name.split(" ")[0]}!`}
          description="Here’s an overview of your schedule and progress."
        />
        <Badge variant="outline" className="h-8 gap-2 border-emerald-200 bg-emerald-50 px-3 text-emerald-700">
          <Award className="size-4" /> Student view
        </Badge>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-900/10 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm font-medium text-indigo-100">Next Upcoming Class</CardTitle>
              <Badge className="border border-white/20 bg-white/10 text-white">Today</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15"><BookOpen className="size-7" /></div>
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">{demoStudentDashboard.nextClass.subject}</h2>
                <p className="mt-1 text-sm text-indigo-100">{demoStudentDashboard.nextClass.teacher} <span aria-hidden="true">·</span> {demoStudentDashboard.nextClass.room}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/20 pt-4 text-sm">
              <span className="flex items-center gap-2"><Clock3 className="size-4 text-indigo-200" />{demoStudentDashboard.nextClass.time}</span>
              <span className="flex items-center gap-2"><CalendarDays className="size-4 text-indigo-200" />{demoStudentDashboard.nextClass.startsIn}</span>
            </div>
            <Button variant="secondary" className="w-full bg-white font-semibold text-indigo-700 hover:bg-indigo-50" onClick={() => onNavigate("timetable")}>
              View Full Timetable <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Monthly Attendance</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-3xl font-bold tracking-tight">{attendance.toFixed(1)}%</p><p className="mt-1 text-xs font-medium text-emerald-600">On track this month</p></div>
                <span className="flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="size-5" /></span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${attendance}%` }} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Learning Streak</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between gap-3">
              <div><p className="text-3xl font-bold tracking-tight">{demoStudentDashboard.streak} days</p><p className="mt-1 text-xs text-muted-foreground">A strong week of learning</p></div>
              <span className="flex size-11 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Activity className="size-5" /></span>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Communication</CardTitle>
            <CardDescription>Quick access to learning support and your class community.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <button type="button" onClick={() => onLock("AI Tutor", "The AI Study Assistant is available in the complete Radora platform.")} className="group flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700"><Sparkles className="size-5" /></span><span><span className="block text-sm font-semibold">AI Study Assistant</span><span className="mt-0.5 block text-xs text-muted-foreground">Personalized help with your learning</span></span></span>
              <span className="flex shrink-0 items-center gap-2 text-xs font-medium text-amber-700"><span className="rounded-full bg-amber-100 px-2 py-1">Locked</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" /></span>
            </button>
            <button type="button" onClick={() => onNavigate("notifications")} className="group flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors hover:border-emerald-200 hover:bg-emerald-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
              <span className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><MessageSquare className="size-5" /></span><span><span className="block text-sm font-semibold">Classroom updates</span><span className="mt-0.5 block text-xs text-muted-foreground">Notices and messages from your school</span></span></span>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div><CardTitle>Recent Announcements</CardTitle><CardDescription className="mt-1">Updates from your school community</CardDescription></div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("notifications")}>All updates <ArrowRight className="ml-1 size-3.5" /></Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {demoStudentDashboard.announcements.map((announcement) => (
              <article key={announcement.title} className={`border-l-2 py-1 pl-4 ${announcement.tone === "amber" ? "border-amber-500" : announcement.tone === "emerald" ? "border-emerald-500" : "border-indigo-500"}`}>
                <h3 className="text-sm font-semibold">{announcement.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{announcement.author} <span aria-hidden="true">·</span> {announcement.time}</p>
              </article>
            ))}
          </CardContent>
        </Card>
      </div>

      <Button variant="outline" onClick={() => onNavigate("timetable")}><CalendarDays className="mr-2 size-4" /> Open my schedule</Button>
      <DemoNotice>Student details, schedule and progress are fictional demo data. Nothing here reads or changes student records.</DemoNotice>
    </div>
  );
}
