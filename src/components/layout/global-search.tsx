"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  GraduationCap,
  Users,
  CalendarCheck,
  FileText,
  Clock,
  CreditCard,
  Bell,
  Settings,
  BookOpen,
  MessageSquare,
  User,
  Bot,
  Hash,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/context/auth-context";
import { useTeacherStudents } from "@/features/students/services";
import { TeacherStudentProfileModal } from "@/features/teacher/components/teacher-student-profile-modal";

interface NavigationPage {
  title: string;
  path: string;
  category: string;
  icon: React.ElementType;
  roles: ("admin" | "teacher" | "student")[];
}

const GLOBAL_PAGES: NavigationPage[] = [
  // Admin pages
  { title: "Dashboard", path: "/dashboard", category: "Navigation", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Students Directory", path: "/students", category: "Navigation", icon: GraduationCap, roles: ["admin"] },
  { title: "Teachers Directory", path: "/teachers", category: "Navigation", icon: Users, roles: ["admin"] },
  { title: "Attendance", path: "/attendance", category: "Navigation", icon: CalendarCheck, roles: ["admin"] },
  { title: "Exams & Grades", path: "/exams", category: "Navigation", icon: FileText, roles: ["admin"] },
  { title: "Timetable", path: "/timetable", category: "Navigation", icon: Clock, roles: ["admin"] },
  { title: "Fee Management", path: "/fees", category: "Navigation", icon: CreditCard, roles: ["admin"] },
  { title: "Notifications", path: "/notifications", category: "Navigation", icon: Bell, roles: ["admin"] },
  { title: "Settings", path: "/settings", category: "Navigation", icon: Settings, roles: ["admin"] },

  // Teacher pages
  { title: "Teacher Dashboard", path: "/teacher-dashboard", category: "Navigation", icon: LayoutDashboard, roles: ["teacher"] },
  { title: "My Students", path: "/teacher-students", category: "Navigation", icon: GraduationCap, roles: ["teacher"] },
  { title: "Mark Attendance", path: "/teacher-attendance", category: "Navigation", icon: CalendarCheck, roles: ["teacher"] },
  { title: "Homework & Grades", path: "/teacher-homework", category: "Navigation", icon: BookOpen, roles: ["teacher"] },
  { title: "Classroom Chat", path: "/teacher-chat", category: "Navigation", icon: MessageSquare, roles: ["teacher"] },
  { title: "Notifications", path: "/teacher-notifications", category: "Navigation", icon: Bell, roles: ["teacher"] },
  { title: "My Profile", path: "/teacher-profile", category: "Navigation", icon: User, roles: ["teacher"] },

  // Student pages
  { title: "Student Dashboard", path: "/student-dashboard", category: "Navigation", icon: LayoutDashboard, roles: ["student"] },
  { title: "AI Tutor Chat", path: "/student-ai-chat", category: "Navigation", icon: Bot, roles: ["student"] },
  { title: "Classroom Chat", path: "/student-classroom-chat", category: "Navigation", icon: MessageSquare, roles: ["student"] },
  { title: "My Attendance", path: "/student-attendance", category: "Navigation", icon: CalendarCheck, roles: ["student"] },
  { title: "My Homework", path: "/student-homework", category: "Navigation", icon: BookOpen, roles: ["student"] },
  { title: "My Timetable", path: "/student-timetable", category: "Navigation", icon: Clock, roles: ["student"] },
  { title: "Notifications", path: "/student-notifications", category: "Navigation", icon: Bell, roles: ["student"] },
  { title: "My Profile", path: "/student-profile", category: "Navigation", icon: User, roles: ["student"] },
];

export function GlobalSearch() {
  const router = useRouter();
  const { user } = useAuth();
  const userRole = (user?.role as "admin" | "teacher" | "student") || "admin";

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Student Profile Modal State for Teachers
  const [selectedStudentRoll, setSelectedStudentRoll] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch teacher students if user is a teacher or admin
  const { data: students } = useTeacherStudents();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cleanQuery = query.trim().toLowerCase();

  // Filter navigation pages matching role + query
  const matchingPages = GLOBAL_PAGES.filter(
    (page) =>
      page.roles.includes(userRole) &&
      (cleanQuery === "" || page.title.toLowerCase().includes(cleanQuery))
  );

  // Filter students matching query (name or roll number or class)
  const matchingStudents = cleanQuery
    ? (students || []).filter(
        (s) =>
          s.name.toLowerCase().includes(cleanQuery) ||
          s.rollNumber.toLowerCase().includes(cleanQuery) ||
          s.className.toLowerCase().includes(cleanQuery)
      )
    : [];

  const handleSelectPage = (path: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(path);
  };

  const handleSelectStudent = (rollNumber: string) => {
    setIsOpen(false);
    setQuery("");

    if (userRole === "teacher") {
      // Open teacher student profile modal
      setSelectedStudentRoll(rollNumber);
      setShowProfileModal(true);
    } else {
      // Admin or Student: navigate to student directory / details
      router.push(`/students?search=${encodeURIComponent(rollNumber)}`);
    }
  };

  return (
    <>
      <div ref={containerRef} suppressHydrationWarning className="relative w-56 lg:w-72">
        <div suppressHydrationWarning className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            suppressHydrationWarning
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search students, roll no, pages..."
            className="h-8 w-full pl-8 pr-12 text-xs bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-indigo-500"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-4 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-[9px]">⌘</span>K
          </kbd>
        </div>

        {/* ── Search Dropdown Popover ── */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 max-h-[380px] overflow-y-auto rounded-xl border border-slate-200 bg-white dark:bg-zinc-950 dark:border-zinc-800 shadow-2xl p-2 space-y-3">
            {/* ── Section 1: Navigation Pages ── */}
            {matchingPages.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Pages
                </p>
                <div className="space-y-0.5">
                  {matchingPages.map((page) => {
                    const Icon = page.icon;
                    return (
                      <button
                        key={page.path}
                        onClick={() => handleSelectPage(page.path)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-700 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                          <span className="font-medium truncate">{page.title}</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Section 2: Students Match ── */}
            {cleanQuery && (
              <div className="pt-1 border-t border-slate-100 dark:border-zinc-900">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Students ({matchingStudents.length})
                </p>

                {matchingStudents.length > 0 ? (
                  <div className="space-y-0.5">
                    {matchingStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectStudent(s.rollNumber)}
                        className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs hover:bg-indigo-50 dark:hover:bg-zinc-900 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={s.profilePhotoUrl || ""} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                              {s.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                              {s.name}
                            </p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Hash className="h-2.5 w-2.5" />
                              <span>Roll: {s.rollNumber}</span>
                              {s.className && <span>· Class {s.className}</span>}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[9px] bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                        >
                          Profile
                        </Badge>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="px-2.5 py-2 text-xs text-slate-400 italic">
                    No students match &quot;{query}&quot;
                  </p>
                )}
              </div>
            )}

            {/* Empty state if nothing matches */}
            {matchingPages.length === 0 && matchingStudents.length === 0 && (
              <div className="p-4 text-center text-xs text-slate-400">
                No matching pages or students found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Teacher Student Profile Modal ── */}
      <TeacherStudentProfileModal
        rollNumber={selectedStudentRoll}
        open={showProfileModal}
        onOpenChange={(open) => {
          setShowProfileModal(open);
          if (!open) setSelectedStudentRoll(null);
        }}
      />
    </>
  );
}
