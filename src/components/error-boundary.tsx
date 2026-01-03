/**
 * [Script Purpose]
 * 전역 Error Boundary 컴포넌트
 * - React 컴포넌트 트리에서 발생하는 에러를 포착하여 처리
 * - 사용자에게 친화적인 에러 메시지 표시
 * - 에러 로깅 및 복구 옵션 제공
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary 클래스 컴포넌트
 * React의 Error Boundary는 클래스 컴포넌트로만 구현 가능
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * 에러 발생 시 상태 업데이트
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 에러 정보 수집 및 로깅
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅
    logger.error('Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // 상태 업데이트
    this.setState({
      error,
      errorInfo,
    });

    // 커스텀 에러 핸들러 호출
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  /**
   * 에러 상태 초기화 (재시도)
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * 렌더링
   */
  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-2xl">오류가 발생했습니다</CardTitle>
              </div>
              <CardDescription>
                예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 홈으로 돌아가주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {this.state.error && (
                <div className="space-y-2">
                  <div className="rounded-md bg-destructive/10 p-3">
                    <p className="font-mono text-sm text-destructive">
                      {this.state.error.message || '알 수 없는 오류'}
                    </p>
                  </div>
                  {/* 개발 환경에서만 상세 스택 트레이스 표시 */}
                  {process.env.NODE_ENV === 'development' && this.state.error.stack && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                        상세 정보 (개발 모드)
                      </summary>
                      <pre className="mt-2 max-h-60 overflow-auto rounded-md bg-muted p-3 text-xs">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={this.handleReset} variant="default" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                다시 시도
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/">
                  <Home className="h-4 w-4" />
                  홈으로
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 함수형 컴포넌트 래퍼 (선택사항)
 * 더 간단한 사용을 위한 헬퍼 컴포넌트
 */
export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  onError 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}) {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

