/**
 * [Script Purpose]
 * 페이지뷰 추적을 위한 클라이언트 컴포넌트
 * Server Component에서도 사용 가능하도록 분리
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logPageView } from '@/lib/analytics';

interface PageViewTrackerProps {
  title?: string;
}

/**
 * 페이지뷰 추적 컴포넌트
 * Server Component에서도 사용 가능
 */
export function PageViewTracker({ title }: PageViewTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    // 페이지뷰 로깅
    logPageView(pathname, title || document.title);
  }, [pathname, title]);

  return null;
}
