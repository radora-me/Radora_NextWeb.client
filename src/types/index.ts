import type React from 'react';

export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  class: string;
  section: string;
  rollNumber: string;
  admissionDate: string;
  status: 'active' | 'inactive' | 'graduated' | 'transferred';
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  avatar?: string;
  bloodGroup?: string;
  nationality?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  department: string;
  subject: string;
  qualification: string;
  experience: string;
  joiningDate: string;
  status: 'active' | 'on-leave' | 'inactive';
  salary?: string;
  avatar?: string;
}

export interface DashboardStat {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'exam' | 'holiday' | 'meeting' | 'event' | 'deadline';
  description?: string;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
  avatar?: string;
}
