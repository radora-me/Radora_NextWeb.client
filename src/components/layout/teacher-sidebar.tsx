"use client";

import Link from "next/link";
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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
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
];

export function TeacherSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user = session?.user;
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
          <div className="flex h-9 w-9 group-data-[state=collapsed]:h-8 group-data-[state=collapsed]:w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover/header:scale-105">
            <GraduationCap className="h-5 w-5 group-data-[state=collapsed]:h-4 group-data-[state=collapsed]:w-4 text-white" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
              Radora
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
              render={<Link href="/settings" />}
              tooltip="Settings"
              className="h-9 transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<button type="button" suppressHydrationWarning />}
              onClick={() => signOut({ callbackUrl: "/login" })}
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
