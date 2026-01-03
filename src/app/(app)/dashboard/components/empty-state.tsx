"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  onAddEmployee?: () => void;
  errorType?: 'FORBIDDEN' | 'NOT_FOUND' | null;
  message?: string;
  /**
   * [확장 고려] 커스텀 메시지 지원
   * 향후 1인 자영업자 모드에서 다른 메시지 표시 시 사용
   */
  title?: string;
  description?: string;
  ctaText?: string;
}

export function EmptyState({ 
  onAddEmployee, 
  errorType, 
  message,
  title,
  description,
  ctaText,
}: EmptyStateProps) {
  const router = useRouter();

  // 권한 에러인 경우
  if (errorType === 'FORBIDDEN') {
    return (
      <Card className="border-dashed border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <Lock className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">접근 권한이 없습니다</CardTitle>
          <CardDescription className="mt-2">
            {message || '해당 매장에 대한 접근 권한이 없습니다. 다른 매장을 선택해주세요.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push('/dashboard')} size="lg" variant="outline">
            대시보드로 이동
          </Button>
        </CardContent>
      </Card>
    );
  }

  // 기본 Empty State (직원 없음)
  // [확장 고려] 커스텀 메시지가 제공되면 사용, 없으면 기본 메시지
  const displayTitle = title || '첫 직원을 등록하고 스케줄을 만들어보세요';
  const displayDescription = description || '직원을 등록하면 근무표를 작성할 수 있습니다.';
  const displayCtaText = ctaText || '직원 등록하기';

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <Users className="h-10 w-10 text-muted-foreground" />
        </div>
        <CardTitle className="text-2xl">{displayTitle}</CardTitle>
        <CardDescription className="mt-2">
          {displayDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        {onAddEmployee && (
          <Button onClick={onAddEmployee} size="lg">
            {displayCtaText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

