"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
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
  { name: "Classroom Chat", href: "/teacher-chat", icon: MessageSquare },
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
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Radora Next
            </span>
            <span className="text-[11px] text-sidebar-foreground/60">
              Teacher Portal
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarSeparator className="bg-sidebar-border" />

      <SidebarContent className="px-2 pt-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-foreground/40 px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.name}
                      className="h-9 transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarSeparator className="bg-sidebar-border mb-2" />
        <SidebarMenu>

          <SidebarMenuItem>
            <SidebarMenuButton
              render={<button type="button" suppressHydrationWarning />}
              onClick={logout}
              tooltip="Sign Out"
              className="h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator className="bg-sidebar-border my-2" />
        <div className="flex items-center gap-3 px-2 group-data-[collapsible=icon]:hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-[11px] font-bold text-white uppercase">
            {initials}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-sidebar-foreground truncate max-w-[120px]">
              {userName}
            </span>
            <span className="text-[11px] text-sidebar-foreground/50 truncate max-w-[120px]">
              {userEmail}
            </span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
