/**
 * [Script Purpose]
 * 테스트 유틸리티 함수
 * - 테스트용 헬퍼 함수 및 Mock 데이터
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * 테스트용 QueryClient 생성
 * 각 테스트마다 새로운 인스턴스를 생성하여 격리 보장
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // 테스트에서는 재시도 비활성화
        gcTime: 0, // v5에서는 cacheTime 대신 gcTime 사용
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/**
 * React Query Provider를 포함한 커스텀 렌더 함수
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

