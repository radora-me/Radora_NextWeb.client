import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
  '/teacher-notifications',
  '/teacher-profile',
];

const librarianRoutePrefixes = [
  '/librarian-dashboard',
  '/librarian-books',
  '/librarian-issues',
  '/librarian-profile',
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
  '/finance',
];

const authRoutePrefixes = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const hasToken = !!req.cookies.get('radora_access_token')?.value;
  const role = req.cookies.get('radora_role')?.value;
  const isLoggedIn = hasToken;

  const isAuthRoute      = authRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isStudentRoute   = studentRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isTeacherRoute   = teacherRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isLibrarianRoute = librarianRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isAdminRoute     = adminRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'student')   return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
      if (role === 'teacher')   return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
      if (role === 'librarian') return NextResponse.redirect(new URL('/librarian-dashboard', nextUrl));
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && (isStudentRoute || isTeacherRoute || isAdminRoute || isLibrarianRoute)) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn) {
    if (role === 'student' && (isAdminRoute || isTeacherRoute || isLibrarianRoute)) {
      return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
    }
    if (role === 'teacher' && (isAdminRoute || isStudentRoute || isLibrarianRoute)) {
      return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
    }
    if (role === 'librarian' && (isAdminRoute || isStudentRoute || isTeacherRoute)) {
      return NextResponse.redirect(new URL('/librarian-dashboard', nextUrl));
    }
    if (role === 'admin' && (isStudentRoute || isTeacherRoute || isLibrarianRoute)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
