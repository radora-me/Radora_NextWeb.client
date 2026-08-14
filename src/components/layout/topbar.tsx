"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { GlobalSearch } from "./global-search";
import { useAuth } from "@/features/auth/context/auth-context";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/teachers": "Teachers",
  "/attendance": "Attendance",
  "/exams": "Exams & Grades",
  "/timetable": "Timetable",
  "/fees": "Fee Management",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

function getBreadcrumb(pathname: string): string {
  for (const [route, label] of Object.entries(routeLabels)) {
    if (pathname.startsWith(route)) return label;
  }
  return "Dashboard";
}

export function Topbar() {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);
  const { user, logout } = useAuth();

  const router = useRouter();
  const userName = user?.name || "User";
  const userIdentifier = user?.email || user?.rollNumber || "user@radora.com";
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "US";

  const handleProfile = () => {
    if (user?.role === "teacher") router.push("/teacher-profile");
    else if (user?.role === "student") router.push("/student-profile");
    else router.push("/dashboard");
  };

  const handleNotifications = () => {
    if (user?.role === "teacher") router.push("/teacher-notifications");
    else if (user?.role === "student") router.push("/student-notifications");
    else router.push("/notifications");
  };

  return (
    <header suppressHydrationWarning className="flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Radora</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium">{breadcrumb}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="hidden md:block">
          <GlobalSearch />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 cursor-pointer"
          onClick={handleNotifications}
          title="Open Notice Board / Notifications"
        >
          <Bell className="h-4 w-4 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-indigo-600 text-white border-2 border-background">
            3
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-2 rounded-md pl-1.5 pr-2 hover:bg-muted cursor-pointer">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-[10px] font-bold text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium sm:inline-block">
                {userName}
              </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {userIdentifier}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-600 cursor-pointer" 
              onClick={logout}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
