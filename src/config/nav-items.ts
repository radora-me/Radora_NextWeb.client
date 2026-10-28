import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  CalendarDays,
  WalletCards,
  Bell,
  CreditCard,
  Trophy,
} from 'lucide-react';

import type { NavItem } from '@/types';

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Students',
    href: '/students',
    icon: GraduationCap,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Student Management',
    href: '/admin-student-management',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Teachers',
    href: '/teachers',
    icon: Users,
    roles: ['admin'],
  },
  {
    title: 'Attendance',
    href: '/attendance',
    icon: ClipboardCheck,
    roles: ['admin', 'teacher'],
  },
  {
    title: 'Proctored Tests',
    href: '/exams',
    icon: FileText,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Class Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    roles: ['admin'],
  },
  {
    title: 'Timetable',
    href: '/timetable',
    icon: Calendar,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Events & Gallery',
    href: '/events',
    icon: CalendarDays,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Finance & Accounts',
    href: '/finance',
    icon: WalletCards,
    roles: ['admin'],
  },
  {
    title: 'Fees & Payments',
    href: '/fees',
    icon: CreditCard,
    roles: ['admin'],
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    roles: ['admin', 'teacher', 'student'],
    badge: '3',
  },
];
