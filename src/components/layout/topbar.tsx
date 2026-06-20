"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
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

  const userName = user?.name || "User";
  const userIdentifier = user?.email || user?.rollNumber || "user@radora.com";
  const initials = userName.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "US";

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background/95 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1 h-8 w-8 text-muted-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-muted-foreground">Radora</span>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium">{breadcrumb}</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="h-8 w-56 pl-8 text-xs bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative h-8 w-8">
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
            <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Settings</DropdownMenuItem>
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
