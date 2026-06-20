import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected route prefixes per role
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

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  
  // Read token and user info from cookies
  const accessToken = req.cookies.get('radora_access_token')?.value;
  const userCookie = req.cookies.get('radora_user')?.value;
  
  const isLoggedIn = !!accessToken && !!userCookie;
  
  let role: string | undefined;
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      role = parsed?.role;
    } catch (e) {
      console.error("Failed to parse user cookie in middleware", e);
    }
  }

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

  // Not logged in → block protected routes and redirect to login
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
