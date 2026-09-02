import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware — Route Protection & RBAC
 *
 * Security model:
 *  - `radora_access_token` and `radora_refresh_token` are HttpOnly cookies.
 *    The Edge middleware cannot read them (they are forwarded to the origin).
 *    Their PRESENCE is what middleware checks — we detect them via cookie name.
 *
 *  - `radora_role` is a plain (non-HttpOnly) cookie containing only the role
 *    string ("admin" | "teacher" | "student"). It contains NO sensitive data
 *    and is used solely for routing decisions at the edge. An attacker who
 *    tampers with it only changes their own redirect destination — they still
 *    cannot access any protected data because the backend validates the
 *    HttpOnly access token on every API request.
 */

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

export function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Check presence of the HttpOnly access token cookie.
  // We can see its name but NOT its value in Edge middleware — that's intentional.
  const hasToken = !!req.cookies.get('radora_access_token')?.value;

  // Read the plain role cookie (non-sensitive, contains only role string)
  const role = req.cookies.get('radora_role')?.value;

  const isLoggedIn = hasToken && !!role;

  const isAuthRoute    = authRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isStudentRoute = studentRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isTeacherRoute = teacherRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));
  const isAdminRoute   = adminRoutePrefixes.some(p => nextUrl.pathname.startsWith(p));

  // Already logged in → redirect away from auth pages
  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'student') return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
      if (role === 'teacher') return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // Not logged in → block protected routes
  if (!isLoggedIn && (isStudentRoute || isTeacherRoute || isAdminRoute)) {
    const loginUrl = new URL('/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for logged-in users
  if (isLoggedIn) {
    if (role === 'student' && (isAdminRoute || isTeacherRoute)) {
      return NextResponse.redirect(new URL('/student-dashboard', nextUrl));
    }
    if (role === 'teacher' && (isAdminRoute || isStudentRoute)) {
      return NextResponse.redirect(new URL('/teacher-dashboard', nextUrl));
    }
    if (role === 'admin' && (isStudentRoute || isTeacherRoute)) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
