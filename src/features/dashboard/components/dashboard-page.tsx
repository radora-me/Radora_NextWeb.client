"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  attendanceData,
  gradeDistribution,
  upcomingEvents,
  recentActivities,
} from "@/features/dashboard/data/mock-dashboard";
import { useHolidays } from "@/features/dashboard/services";
import { useAuth } from "@/features/auth/context/auth-context";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

const eventTypeColors: Record<string, string> = {
  exam: "bg-red-100 text-red-700 border-red-200",
  holiday: "bg-emerald-100 text-emerald-700 border-emerald-200",
  meeting: "bg-blue-100 text-blue-700 border-blue-200",
  event: "bg-purple-100 text-purple-700 border-purple-200",
  deadline: "bg-amber-100 text-amber-700 border-amber-200",
};

const attendanceChartConfig = {
  attendance: {
    label: "Attendance %",
    color: "var(--color-chart-1)",
  },
};

const gradeChartConfig = {
  students: {
    label: "Students",
    color: "var(--color-chart-1)",
  },
};

export function DashboardPage() {
  const [studentCount, setStudentCount] = useState(1247);
  const [teacherCount, setTeacherCount] = useState(86);

  const { user } = useAuth();
  const { data: dbHolidays } = useHolidays(user?.role as any);

  useEffect(() => {
    // Load student counts
    const storedStudents = localStorage.getItem("radora_students");
    if (storedStudents) {
      try {
        const parsed = JSON.parse(storedStudents);
        if (Array.isArray(parsed)) setStudentCount(parsed.length);
      } catch (e) {
        console.error(e);
      }
    }

    // Load teacher counts
    const storedTeachers = localStorage.getItem("radora_teachers");
    if (storedTeachers) {
      try {
        const parsed = JSON.parse(storedTeachers);
        if (Array.isArray(parsed)) setTeacherCount(parsed.length);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const mergedEvents = useMemo(() => {
    if (!dbHolidays || dbHolidays.length === 0) return upcomingEvents;

    const formattedHolidays = dbHolidays.map((h: any) => ({
      id: h.id,
      title: h.title,
      date: h.date.split("T")[0],
      type: "holiday" as const,
      description: "School closed — registered holiday",
    }));

    const all = [...formattedHolidays, ...upcomingEvents];
    return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dbHolidays]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your school."
      />

      {/* KPI Stat Cards */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard
          title="Total Students"
          value={studentCount.toLocaleString("en-IN")}
          change="+12%"
          trend="positive"
          icon={GraduationCap}
        />
        <StatCard
          title="Total Teachers"
          value={teacherCount.toLocaleString("en-IN")}
          change="+3%"
          trend="positive"
          icon={Users}
        />
        <StatCard
          title="Attendance Rate"
          value="94.2%"
          change="-1.5%"
          trend="negative"
          icon={ClipboardCheck}
        />
        <StatCard
          title="Revenue"
          value="₹12.4L"
          change="+8.2%"
          trend="positive"
          icon={CreditCard}
        />
      </motion.div>

      {/* Charts Row */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        {/* Attendance Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Attendance Trend
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>+2.1%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly average attendance rate
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={attendanceChartConfig} className="h-[220px] w-full">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
                <YAxis domain={[85, 100]} tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  fill="url(#attendanceGrad)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Grade Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Grade Distribution
              </CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>Total: 330 students</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Current term performance overview
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ChartContainer config={gradeChartConfig} className="h-[220px] w-full">
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="grade" tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} fontSize={11} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Events & Activity Row */}
      <motion.div
        {...fadeIn}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-2"
      >
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {mergedEvents.slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="text-center leading-tight min-w-[40px]">
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleString("en", { month: "short" })}
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(event.date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] shrink-0 ${eventTypeColors[event.type] || ""}`}
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {recentActivities.slice(0, 7).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Avatar className="h-7 w-7 mt-0.5 shrink-0">
                    <AvatarFallback className="bg-muted text-[10px] font-medium">
                      {activity.user
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {activity.action}
                      </span>{" "}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
