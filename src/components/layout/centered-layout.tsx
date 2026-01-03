/**
 * [Script Purpose]
 * 중앙 정렬 레이아웃 컴포넌트
 * - 화면 중앙에 콘텐츠를 배치하는 공통 레이아웃 패턴
 * - 온보딩, 랜딩 페이지, 가용성 페이지 등에서 재사용
 * - 반응형 최대 너비 설정 지원
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';

interface CenteredLayoutProps {
  /**
   * 레이아웃 내부 콘텐츠
   */
  children: ReactNode;
  /**
   * 최대 너비 설정
   * @default '2xl'
   */
  maxWidth?: MaxWidth;
  /**
   * 추가 클래스명
   */
  className?: string;
  /**
   * 패딩 제거 여부
   * @default false
   */
  noPadding?: boolean;
}

const maxWidthClasses: Record<MaxWidth, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-full',
};

/**
 * 중앙 정렬 레이아웃 컴포넌트
 * 
 * @example
 * ```tsx
 * <CenteredLayout maxWidth="2xl">
 *   <Card>
 *     <CardContent>콘텐츠</CardContent>
 *   </Card>
 * </CenteredLayout>
 * ```
 */
export function CenteredLayout({
  children,
  maxWidth = '2xl',
  className,
  noPadding = false,
}: CenteredLayoutProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-h-screen items-center justify-center bg-muted/40',
        !noPadding && 'p-4'
      )}
    >
      <div className={cn('w-full', maxWidthClasses[maxWidth], className)}>
        {children}
      </div>
    </div>
  );
}

