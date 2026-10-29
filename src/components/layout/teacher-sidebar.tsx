"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarCheck,
  CalendarDays,
  BookOpen,
  ClipboardCheck,
  Trophy,
  MessageSquare,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { useAuth } from "@/features/auth/context/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const navigation = [
  { name: "Dashboard", href: "/teacher-dashboard", icon: LayoutDashboard },
  { name: "My Students", href: "/teacher-students", icon: Users },
  { name: "Attendance", href: "/teacher-attendance", icon: CalendarCheck },
  { name: "Homework & Grades", href: "/teacher-homework", icon: BookOpen },
  { name: "Proctored Tests", href: "/teacher-tests", icon: ClipboardCheck },
  { name: "Class Leaderboard", href: "/teacher-leaderboard", icon: Trophy },
  { name: "Classroom Chat", href: "/teacher-chat", icon: MessageSquare },
  { name: "Events & Gallery", href: "/teacher-events", icon: CalendarDays },
  { name: "Notice Board", href: "/teacher-notifications", icon: Bell },
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userName = user?.name || "Teacher";
  const userEmail = user?.email || "teacher@radora.com";
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "TE";

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4 group-data-[state=collapsed]:px-2 group-data-[state=collapsed]:py-4">
        <Link href="/teacher-dashboard" className="flex items-center gap-3 group/header group-data-[state=collapsed]:justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Image src="/logo/Next.png" alt="Logo" width={48} height={48} className="object-cover rounded-xl" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">
              Radora Next
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Teacher Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-sidebar-foreground/40 px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.filter((item) => !user?.isSubjectTeacher || ["/teacher-homework", "/teacher-tests", "/teacher-leaderboard", "/teacher-chat", "/teacher-notifications", "/teacher-dashboard"].includes(item.href)).map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.name}
                      className="h-10 text-base transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
