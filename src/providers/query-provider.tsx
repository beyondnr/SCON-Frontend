/**
 * [Script Purpose]
 * React Query (TanStack Query) Provider 설정
 * - QueryClient 인스턴스 생성 및 기본 옵션 설정
 * - 전역 캐싱 및 에러 처리 설정
 */

"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

/**
 * QueryClient 인스턴스 생성 함수
 * 각 요청마다 새로운 인스턴스를 생성하지 않도록 useState로 관리
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 데이터가 stale로 간주되기까지의 시간 (5분)
        staleTime: 1000 * 60 * 5,
        // 캐시에서 제거되기까지의 시간 (10분)
        gcTime: 1000 * 60 * 10, // v5에서는 cacheTime 대신 gcTime 사용
        // 자동 리페칭 설정
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페칭 비활성화
        refetchOnReconnect: true, // 네트워크 재연결 시 자동 리페칭
        refetchOnMount: true, // 컴포넌트 마운트 시 리페칭
        // 재시도 설정
        retry: (failureCount, error: unknown) => {
          // 네트워크 에러가 아닌 경우 1회만 재시도
          if (error instanceof Error && error.message.includes('Network')) {
            return failureCount < 3;
          }
          return failureCount < 1;
        },
      },
      mutations: {
        // Mutation 재시도 설정
        retry: 1,
      },
    },
  });
}

/**
 * React Query Provider 컴포넌트
 * 앱의 루트 레이아웃에서 사용하여 모든 하위 컴포넌트에 React Query 기능 제공
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // QueryClient를 useState로 관리하여 리렌더링 시에도 동일한 인스턴스 유지
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

