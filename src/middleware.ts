/**
 * [Script Purpose]
 * Next.js Middleware for route protection
 * - 인증이 필요한 페이지 접근 제어
 * - 로그인되지 않은 사용자는 /login으로 리다이렉트
 * - 공개 페이지(/, /login, /onboarding)는 접근 허용
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 공개 경로 목록 (인증 없이 접근 가능)
 */
const PUBLIC_PATHS = ['/', '/login', '/onboarding'];

/**
 * 보호된 경로 목록 (인증 필요)
 */
const PROTECTED_PATHS = ['/dashboard', '/my-page', '/reports', '/settings', '/availability'];

/**
 * 경로가 공개 경로인지 확인
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

/**
 * 경로가 보호된 경로인지 확인
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'));
}

/**
 * 인증 상태 확인 (쿠키 기반)
 * HttpOnly Cookie는 JavaScript에서 읽을 수 없으므로,
 * 백엔드가 설정한 인증 쿠키의 존재 여부로 확인
 * 
 * 일반적인 인증 쿠키 이름:
 * - accessToken
 * - refreshToken
 * - auth-token
 * - session
 */
function isAuthenticated(request: NextRequest): boolean {
  // 백엔드가 설정한 인증 쿠키 확인
  // 실제 쿠키 이름은 백엔드 구현에 따라 다를 수 있음
  const cookies = request.cookies;
  
  // 일반적인 인증 쿠키 이름들 확인
  const authCookieNames = [
    'accessToken',
    'refreshToken',
    'auth-token',
    'session',
    'token',
  ];
  
  // 쿠키 중 하나라도 존재하면 인증된 것으로 간주
  // HttpOnly Cookie는 JavaScript에서 읽을 수 없지만, 
  // middleware에서는 request.cookies를 통해 확인 가능
  return authCookieNames.some(name => cookies.has(name));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 항상 허용
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // 보호된 경로 접근 시 인증 확인
  if (isProtectedPath(pathname)) {
    const authenticated = isAuthenticated(request);

    if (!authenticated) {
      // 인증되지 않은 경우 로그인 페이지로 리다이렉트
      const loginUrl = new URL('/login', request.url);
      // 원래 요청한 경로를 쿼리 파라미터로 저장 (로그인 후 리다이렉트용)
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 인증된 사용자 또는 공개 경로는 통과
  return NextResponse.next();
}

/**
 * Middleware가 실행될 경로 설정
 */
export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청 경로에 매칭:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public 폴더의 파일들
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

