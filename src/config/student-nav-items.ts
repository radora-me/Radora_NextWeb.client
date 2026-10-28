import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Clock,
  Bot,
  MessageSquare,
  BookOpen,
  ClipboardCheck,
  Bell,
  CreditCard,
  Trophy,
} from "lucide-react";

export const studentNavItems = [
  {
    title: "Dashboard",
    href: "/student-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Attendance",
    href: "/student-attendance",
    icon: Clock,
  },
  {
    title: "Homework",
    href: "/student-homework",
    icon: BookOpen,
  },
  {
    title: "Proctored Tests",
    href: "/student-tests",
    icon: ClipboardCheck,
  },
  {
    title: "Class Leaderboard",
    href: "/student-leaderboard",
    icon: Trophy,
  },
  {
    title: "Timetable",
    href: "/student-timetable",
    icon: Calendar,
  },
  {
    title: "Events & Gallery",
    href: "/student-events",
    icon: CalendarDays,
  },
  {
    title: "AI Assistant",
    href: "/student-ai-chat",
    icon: Bot,
    badge: "New",
  },
  {
    title: "Classroom Chat",
    href: "/student-classroom-chat",
    icon: MessageSquare,
  },
  {
    title: "Notice Board",
    href: "/student-notifications",
    icon: Bell,
  },
  {
    title: "Fees & Payments",
    href: "/student-fees",
    icon: CreditCard,
  },
];
