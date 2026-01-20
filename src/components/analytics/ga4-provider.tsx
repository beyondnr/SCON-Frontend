/**
 * [Script Purpose]
 * GA4 초기화를 위한 클라이언트 컴포넌트
 * RootLayout에서 사용 (Server Component이므로 분리 필요)
 */

'use client';

import { useEffect } from 'react';
import { initGA } from '@/lib/analytics';

/**
 * GA4 초기화를 위한 클라이언트 컴포넌트
 * RootLayout에서 사용 (Server Component이므로 분리 필요)
 */
export function GA4Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // GA4 초기화
    initGA();
  }, []);

  return <>{children}</>;
}
