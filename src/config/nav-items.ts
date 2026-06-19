import {
  LayoutDashboard,
  GraduationCap,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  CreditCard,
  Bell,
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
    title: 'Exams & Grades',
    href: '/exams',
    icon: FileText,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Timetable',
    href: '/timetable',
    icon: Calendar,
    roles: ['admin', 'teacher', 'student'],
  },
  {
    title: 'Fee Management',
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
