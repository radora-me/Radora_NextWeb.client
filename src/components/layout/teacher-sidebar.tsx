"use client";

import { useMemo } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  MessageSquare,
  Trophy,
  User,
  Users,
} from "lucide-react";

import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { useAuth } from "@/features/auth/context/auth-context";
import type { PortalNavItem } from "@/types";

/**
 * Teacher portal navigation. Labels, hrefs and icons are unchanged from the
 * previous sidebar; only the section grouping is new (see `nav-groups.ts`).
 */
const navigation: PortalNavItem[] = [
  { title: "Dashboard", href: "/teacher-dashboard", icon: LayoutDashboard },
  { title: "My Students", href: "/teacher-students", icon: Users },
  { title: "Attendance", href: "/teacher-attendance", icon: CalendarCheck },
  { title: "Homework & Grades", href: "/teacher-homework", icon: BookOpen },
  { title: "Proctored Tests", href: "/teacher-tests", icon: ClipboardCheck },
  { title: "Class Leaderboard", href: "/teacher-leaderboard", icon: Trophy },
  { title: "Classroom Chat", href: "/teacher-chat", icon: MessageSquare },
  { title: "Events & Gallery", href: "/teacher-events", icon: CalendarDays },
  { title: "Notice Board", href: "/teacher-notifications", icon: Bell },
];

/** Routes a subject teacher keeps — same filter as before, unchanged. */
const subjectTeacherRoutes = [
  "/teacher-homework",
  "/teacher-tests",
  "/teacher-leaderboard",
  "/teacher-chat",
  "/teacher-notifications",
  "/teacher-dashboard",
];

export function TeacherSidebar() {
  const { user } = useAuth();

  const items = useMemo<PortalNavItem[]>(() => {
    if (user?.isSubjectTeacher) {
      return navigation.filter((item) => subjectTeacherRoutes.includes(item.href));
    }

    return navigation;
  }, [user?.isSubjectTeacher]);

  return (
    <PortalSidebar
      portalLabel="Teaching"
      homeHref="/teacher-dashboard"
      items={items}
      accountHref="/teacher-profile"
      accountLabel="My Profile"
      accountIcon={User}
    />
  );
}
