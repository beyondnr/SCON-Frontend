/**
 * [Script Purpose]
 * 페이지 헤더 컴포넌트
 * - 페이지 제목, 설명, 액션 버튼을 포함하는 공통 헤더 패턴
 * - 반응형 레이아웃 지원
 * - 대시보드, 리포트 등 여러 페이지에서 재사용
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /**
   * 페이지 제목
   */
  title: string;
  /**
   * 페이지 설명 (선택사항)
   */
  description?: string;
  /**
   * 우측 액션 영역 (버튼 등)
   */
  action?: ReactNode;
  /**
   * 추가 클래스명
   */
  className?: string;
}

/**
 * 페이지 헤더 컴포넌트
 * 
 * @example
 * ```tsx
 * <PageHeader
 *   title="근무표 대시보드"
 *   description="월간 근무표를 작성하고 관리하세요."
 *   action={<Button>새로고침</Button>}
 * />
 * ```
 */
export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6',
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-headline text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-base md:text-lg text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 w-full md:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}

