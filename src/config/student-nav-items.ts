import {
  LayoutDashboard,
  Calendar,
  Clock,
  Bot,
  MessageSquare,
  BookOpen,
  Bell,
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
    title: "Timetable",
    href: "/student-timetable",
    icon: Calendar,
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
];
