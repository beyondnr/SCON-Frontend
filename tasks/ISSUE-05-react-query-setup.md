---
title: "[Chore] Setup React Query for Server State"
labels: ["chore", "architecture", "react-query"]
assignees: []
---

## 배경 (Context)
Firebase 등 실제 백엔드 연동 시 데이터 캐싱, 재시도, 백그라운드 동기화 등의 기능을 효율적으로 관리하기 위해 React Query (TanStack Query) 도입이 필요합니다. 현재의 `useState` + `useEffect` 패턴은 확장성에 한계가 있습니다.

**출처:** `component_structure_analysis.md` (4.2 장기 아키텍처 제안)

## 목표 (Goals)
- `@tanstack/react-query` 설치 및 환경 설정.
- 전역 QueryClientProvider 설정.

## 작업 상세 (Tasks)
- [ ] `@tanstack/react-query` 패키지 설치
- [ ] `src/lib/react-query.ts` (QueryClient 설정) 생성
- [ ] `src/app/providers.tsx` (또는 RootLayout)에 `QueryClientProvider` 적용
- [ ] DevTools 설정 (개발 환경 전용)

## 참고 사항 (Notes)
- Next.js App Router 환경에서의 Hydration 패턴을 고려하여 설정합니다.

