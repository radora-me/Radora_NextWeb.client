import { NextResponse } from 'next/server';
import { auth } from '@/auth';

// Define the route prefixes for each role
const studentRoutePrefixes = [
  '/student-dashboard',
  '/student-attendance',
  '/student-timetable',
  '/student-ai-chat',
  '/student-classroom-chat',
];

const teacherRoutePrefixes = [
  '/teacher-dashboard',
  '/teacher-students',
  '/teacher-attendance',
  '/teacher-homework',
  '/teacher-chat',
];

const adminRoutePrefixes = [
  '/dashboard',
  '/attendance',
  '/timetable',
  '/exams',
  '/fees',
  '/notifications',
  '/settings',
  '/students',
  '/teachers',
];

const authRoutePrefixes = ['/login', '/register'];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role; // "admin" | "teacher" | "student"
  const sessionError = req.auth?.error;

  const isAuthRoute = authRoutePrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));
  const isStudentRoute = studentRoutePrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));
  const isTeacherRoute = teacherRoutePrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));
  const isAdminRoute = adminRoutePrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));

  // Force logout if session has a token error (refresh token expired)
  if (isLoggedIn && (sessionError === 'RefreshTokenExpired' || sessionError === 'RefreshTokenError')) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // 1. If on an auth route and already logged in, redirect to respective dashboard
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'student') {
        return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
      } else if (role === 'teacher') {
        return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
      }
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // 2. If trying to access a protected route while NOT logged in, redirect to login
  if (!isLoggedIn && (isStudentRoute || isTeacherRoute || isAdminRoute)) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Strict Role-Based Access Control for logged-in users
  if (isLoggedIn) {
    // If a student tries to access admin/teacher routes
    if (role === 'student' && (isAdminRoute || isTeacherRoute)) {
      return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
    }

    // If a teacher tries to access admin/student routes
    if (role === 'teacher' && (isAdminRoute || isStudentRoute)) {
      return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
    }

    // If an admin tries to access student/teacher routes
    if (role === 'admin' && (isStudentRoute || isTeacherRoute)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

// Configure middleware to run on all paths except Next.js internals and static files
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
