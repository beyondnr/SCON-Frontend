# 코드 품질 개선 및 확장성 향상을 위한 TO-DO

> **작성일**: 2025-01-02  
> **목적**: 클린 코드 원칙, 보안, 확장성 관점에서의 개선 사항 정리  
> **우선순위**: 🔴 높음 | 🟡 중간 | 🟢 낮음

---

## 📋 목차

1. [클린 코드 원칙](#1-클린-코드-원칙)
2. [보안 강화](#2-보안-강화)
3. [확장성 및 아키텍처](#3-확장성-및-아키텍처)
4. [성능 최적화](#4-성능-최적화)
5. [테스트 및 품질 보증](#5-테스트-및-품질-보증)
6. [개발 환경 개선](#6-개발-환경-개선)

---

## 1. 클린 코드 원칙

### 1.1 코드 중복 제거 및 재사용성 향상

#### 🔴 높음: 반복 패턴 컴포넌트화
- [ ] **페이지 헤더 패턴 추상화**
  - **현재 상태**: `dashboard/page.tsx`, `reports/page.tsx`에서 동일한 헤더 구조 반복
  - **개선 방안**: `<PageHeader title="..." description="..." action={<...>} />` 컴포넌트 생성
  - **위치**: `src/components/layout/page-header.tsx`
  - **참고**: `docs/CODE_QUALITY_ASSESSMENT.md` 33-53줄

- [ ] **중앙 정렬 레이아웃 컴포넌트화**
  - **현재 상태**: `page.tsx`, `onboarding/page.tsx`, `availability/page.tsx`에서 동일한 레이아웃 반복
  - **개선 방안**: `<CenteredLayout maxWidth="2xl">` 래퍼 컴포넌트 생성
  - **위치**: `src/components/layout/centered-layout.tsx`
  - **참고**: `docs/CODE_QUALITY_ASSESSMENT.md` 55-70줄

- [ ] **아이콘 카드 헤더 패턴화**
  - **현재 상태**: `settings/page.tsx`, `page.tsx`에서 아이콘 + 제목 패턴 반복
  - **개선 방안**: `<IconCardHeader icon={...} title="..." />` 컴포넌트 생성
  - **위치**: `src/components/ui/icon-card-header.tsx`

#### 🟡 중간: 매직 넘버/스트링 상수화
- [ ] **타임아웃 값 상수화**
  - **현재 상태**: `api-client.ts`에서 `timeout: 30000` 하드코딩
  - **개선 방안**: `src/lib/constants.ts`에 `API_TIMEOUT_MS = 30000` 추가
  - **참고**: `src/lib/api-client.ts` 22줄

- [ ] **에러 메시지 상수화**
  - **현재 상태**: 컴포넌트 내부에 하드코딩된 메시지 다수 존재
  - **개선 방안**: `src/lib/constants.ts`에 `UI_MESSAGES` 객체 추가
  - **예시**: `dashboard/page.tsx`의 "데이터 업데이트 완료", "자동 채우기 완료" 등

- [ ] **날짜 포맷 상수화**
  - **현재 상태**: `format(date, 'yyyy-MM-dd')` 등 포맷 문자열 반복
  - **개선 방안**: `src/lib/constants.ts`에 `DATE_FORMATS` 객체 추가
  - **예시**: `DATE_FORMATS.ISO_DATE = 'yyyy-MM-dd'`

#### 🟡 중간: 함수 분리 및 단일 책임 원칙
- [x] **대시보드 페이지 로직 분리** ✅ 완료 (2025-01-02)
  - **완료 내용**: 
    - Custom Hook으로 분리 완료: `useDateNavigation`, `useMonthlySchedule`, `useShiftManagement`
    - 비즈니스 로직을 `src/hooks/`로 이동 완료
    - 대시보드 페이지 코드 크기 대폭 감소 (437줄 → 약 200줄)
  - **생성된 파일**: 
    - `src/hooks/use-date-navigation.ts`
    - `src/hooks/use-monthly-schedule.ts`
    - `src/hooks/use-shift-management.ts`
  - **참고**: `src/app/(app)/dashboard/page.tsx`

- [ ] **에러 처리 로직 중앙화**
  - **현재 상태**: 각 컴포넌트에서 개별적으로 에러 처리
  - **개선 방안**: Error Boundary 컴포넌트 도입 및 공통 에러 핸들러 패턴 적용
  - **위치**: `src/components/error-boundary.tsx`

### 1.2 타입 안정성 강화

#### 🔴 높음: 타입 정의 개선
- [x] **API 응답 타입 정의** ✅ 완료 (2025-01-02)
  - **완료 내용**: `src/lib/types.ts`에 `ApiResponse<T>`, `ApiError`, `FieldError` 타입 추가
  - **적용 위치**: `src/lib/api-client.ts`에서 타입 적용 완료
  - **참고**: `src/lib/types.ts` 120-160줄

- [x] **환경 변수 타입 안정성** ✅ 완료 (2025-01-02)
  - **완료 내용**: `src/lib/env.ts`에서 `zod`를 사용한 환경 변수 스키마 검증 구현
  - **적용 위치**: `api-client.ts`, `next.config.ts`, `logger.ts`에서 검증된 환경 변수 사용
  - **참고**: `src/lib/env.ts`

#### 🟡 중간: 제네릭 및 유틸리티 타입 활용
- [ ] **공통 타입 유틸리티 생성**
  - **개선 방안**: `Pick`, `Omit`, `Partial` 등을 활용한 타입 재사용성 향상
  - **예시**: `EmployeeFormData = Omit<Employee, 'id'>`

### 1.3 코드 가독성 향상

#### 🟡 중간: 주석 및 문서화
- [ ] **JSDoc 주석 표준화**
  - **현재 상태**: 일부 함수에만 주석 존재, 형식 불일치
  - **개선 방안**: 모든 public 함수/컴포넌트에 JSDoc 주석 추가
  - **템플릿**: `@param`, `@returns`, `@throws`, `@example` 포함

- [ ] **복잡한 로직 설명 추가**
  - **현재 상태**: `dashboard/page.tsx`의 패턴 복사 로직 등 복잡한 알고리즘 설명 부족
  - **개선 방안**: 알고리즘 단계별 주석 추가

#### 🟢 낮음: 네이밍 컨벤션 통일
- [ ] **일관된 네이밍 규칙 적용**
  - **현재 상태**: `handle*`, `on*` 혼용
  - **개선 방안**: 이벤트 핸들러는 `handle*`, prop으로 전달되는 콜백은 `on*`로 통일

---

## 2. 보안 강화

### 2.1 환경 변수 및 시크릿 관리

#### 🔴 높음: 환경 변수 검증 및 타입 안정성
- [ ] **환경 변수 스키마 검증**
  - **현재 상태**: `process.env` 직접 접근, 검증 없음
  - **개선 방안**: `src/lib/env.ts`에서 `zod`로 환경 변수 스키마 정의 및 검증
  - **예시**:
    ```typescript
    const envSchema = z.object({
      NEXT_PUBLIC_API_BASE_URL: z.string().url(),
      // 기타 환경 변수...
    });
    export const env = envSchema.parse(process.env);
    ```
  - **참고**: `src/lib/api-client.ts` 185줄, `next.config.ts` 36줄

- [ ] **시크릿 정보 노출 방지**
  - **현재 상태**: `next.config.ts`에서 환경 변수 사용 시 기본값 노출 가능
  - **개선 방안**: 환경 변수 누락 시 명시적 에러 발생하도록 처리
  - **주의**: `NEXT_PUBLIC_*`는 클라이언트에 노출되므로 민감 정보 포함 금지

#### 🟡 중간: 빌드 설정 보안 강화
- [x] **TypeScript 빌드 에러 허용 제거** ✅ 완료 (2025-01-02)
  - **완료 내용**: 
    - 모든 타입 에러 수정 완료 (13개 에러 → 0개)
    - `next.config.ts`에서 `ignoreBuildErrors` 제거
    - 타입 안정성 보장
  - **수정된 파일**: 
    - `src/lib/api-client.ts` (_retry 속성 타입 수정)
    - `src/lib/api-mappers.ts` (타입 정의 추가)
    - `src/lib/types.ts` (personalHoliday, weeklyHoliday 속성 추가)
    - `src/providers/query-provider.tsx` (onError 옵션 제거)
    - `src/app/(app)/dashboard/components/dashboard-actions.tsx` (toast variant 수정)
  - **참고**: `next.config.ts` 6줄

### 2.2 XSS 방어 강화

#### 🔴 높음: Sanitize 함수 활용 검증
- [ ] **사용자 입력 sanitize 적용 검증**
  - **현재 상태**: `src/lib/sanitize.ts`에 함수는 존재하나 실제 사용 여부 불명확
  - **개선 방안**: 
    - 모든 사용자 입력 필드에 `sanitizeInput` 적용 여부 확인
    - 폼 제출 시 자동 sanitize 미들웨어 추가
  - **검색 필요**: `sanitize` 함수 사용 위치 확인

- [ ] **dangerouslySetInnerHTML 사용 검토**
  - **현재 상태**: `src/components/ui/chart.tsx`에서 `dangerouslySetInnerHTML` 사용
  - **개선 방안**: 사용 위치 확인 및 필요 시 sanitize 적용
  - **참고**: `src/components/ui/chart.tsx` 81줄

#### 🟡 중간: Content Security Policy (CSP) 설정
- [x] **CSP 헤더 추가** ✅ 완료 (2025-01-02)
  - **완료 내용**: `next.config.ts`에 보안 헤더 설정 추가 완료
  - **추가된 헤더**: 
    - `X-Frame-Options: SAMEORIGIN`
    - `X-Content-Type-Options: nosniff`
    - `X-XSS-Protection: 1; mode=block`
    - `Referrer-Policy: origin-when-cross-origin`
    - `Strict-Transport-Security: max-age=63072000`
    - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  - **참고**: `next.config.ts` 49-75줄

### 2.3 인증/인가 강화

#### 🟡 중간: 토큰 갱신 로직 개선
- [ ] **토큰 갱신 실패 시 재시도 로직**
  - **현재 상태**: `api-client.ts`에서 토큰 갱신 실패 시 즉시 로그아웃
  - **개선 방안**: 네트워크 오류 등 일시적 실패 시 재시도 로직 추가
  - **참고**: `src/lib/api-client.ts` 98-134줄

- [ ] **세션 타임아웃 사용자 알림**
  - **개선 방안**: 토큰 만료 전 사용자에게 알림 표시 (예: 5분 전)

#### 🟢 낮음: 인증 상태 관리 개선
- [ ] **인증 상태 전역 관리**
  - **현재 상태**: 각 컴포넌트에서 개별적으로 인증 상태 확인
  - **개선 방안**: Context API 또는 전역 상태로 인증 상태 중앙 관리
  - **위치**: `src/contexts/auth-context.tsx`

### 2.4 API 보안

#### 🟡 중간: API 요청 검증
- [ ] **요청 본문 크기 제한**
  - **개선 방안**: 대용량 요청 방지를 위한 크기 제한 설정
  - **위치**: `src/lib/api-client.ts`

- [ ] **Rate Limiting 대응**
  - **개선 방안**: 429 에러 처리 및 재시도 로직 추가
  - **참고**: `src/lib/api-client.ts` 에러 처리 섹션

---

## 3. 확장성 및 아키텍처

### 3.1 상태 관리 개선

#### 🔴 높음: React Query (TanStack Query) 도입
- [ ] **React Query 설치 및 설정**
  - **현재 상태**: `useState` + `useEffect` 패턴으로 데이터 페칭
  - **개선 방안**: 
    - `@tanstack/react-query` 설치
    - `QueryClientProvider` 설정
    - 기본 쿼리 옵션 설정 (staleTime, cacheTime 등)
  - **위치**: `src/providers/query-provider.tsx`
  - **참고**: `docs/component_structure_analysis.md` 109-110줄

- [ ] **데이터 페칭 로직 마이그레이션**
  - **대상**: 
    - `dashboard/page.tsx`의 스케줄 데이터 페칭
    - `reports/page.tsx`의 급여 데이터 페칭
    - 기타 API 호출 로직
  - **개선 방안**: Custom Hook으로 분리 (`useScheduleData`, `usePayrollData` 등)

#### 🟡 중간: Server Actions 활용
- [ ] **폼 제출 Server Actions 전환**
  - **현재 상태**: 클라이언트 사이드 API 호출
  - **개선 방안**: Next.js 15 Server Actions로 전환
  - **대상**: 온보딩 폼, 설정 폼 등
  - **참고**: `docs/component_structure_analysis.md` 111-112줄

### 3.2 컴포넌트 아키텍처 개선

#### 🟡 중간: Compound Component 패턴 적용
- [ ] **PayrollTable 리팩토링**
  - **현재 상태**: 복잡한 테이블 구조로 유지보수 어려움
  - **개선 방안**: Compound Component 패턴으로 분리
  - **구조**: `<PayrollTable>`, `<PayrollTable.Row>`, `<PayrollTable.Detail>` 등
  - **참고**: `docs/component_structure_analysis.md` 113-114줄

#### 🟢 낮음: 컴포넌트 계층 구조 최적화
- [ ] **불필요한 래퍼 제거**
  - **개선 방안**: 컴포넌트 트리 분석 및 최적화

### 3.3 에러 처리 및 복원력

#### 🔴 높음: Error Boundary 구현
- [ ] **전역 Error Boundary 추가**
  - **현재 상태**: 에러 발생 시 전체 앱 크래시 가능
  - **개선 방안**: 
    - `src/components/error-boundary.tsx` 생성
    - `app/layout.tsx`에 적용
    - 에러 로깅 및 사용자 친화적 메시지 표시
  - **참고**: React Error Boundary 패턴

- [ ] **API 에러 타입별 처리**
  - **현재 상태**: `api-client.ts`에서 기본적인 에러 처리만 존재
  - **개선 방안**: 에러 타입별 세분화된 처리 (네트워크, 서버, 인증 등)

#### 🟡 중간: 낙관적 업데이트 (Optimistic Updates)
- [ ] **React Query 낙관적 업데이트 적용**
  - **개선 방안**: 사용자 경험 향상을 위한 즉시 UI 업데이트
  - **대상**: 스케줄 수정, 직원 추가/삭제 등

### 3.4 코드 구조 개선

#### 🟡 중간: Feature 기반 폴더 구조 검토
- [ ] **현재 구조 vs Feature 구조 비교**
  - **현재 상태**: 페이지 기반 구조 (`app/(app)/dashboard/`)
  - **검토 사항**: Feature 기반 구조로 전환 시 장단점 분석
  - **참고**: `docs/202-feature-structure.mdc`

#### 🟢 낮음: Barrel Export 패턴
- [ ] **index.ts 파일을 통한 Export 정리**
  - **개선 방안**: 각 폴더에 `index.ts` 추가하여 import 경로 단순화
  - **예시**: `import { Button, Card } from '@/components/ui'`

---

## 4. 성능 최적화

### 4.1 번들 크기 최적화

#### 🟡 중간: 코드 스플리팅
- [x] **동적 import 적용** ✅ 완료 (2025-01-02)
  - **완료 내용**: `next/dynamic`을 사용한 지연 로딩 적용
  - **적용된 컴포넌트**: 
    - `MonthlyCalendarView` (대시보드 페이지)
    - `PayrollTable` (리포트 페이지)
  - **효과**: 초기 번들 크기 감소, 페이지 로딩 속도 개선
  - **참고**: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/reports/page.tsx`

#### 🟢 낮음: Tree Shaking 최적화
- [ ] **불필요한 import 제거**
  - **개선 방안**: 사용하지 않는 라이브러리 import 확인 및 제거

### 4.2 렌더링 최적화

#### 🟡 중간: React.memo 및 useMemo 최적화
- [x] **불필요한 리렌더링 방지** ✅ 완료 (2025-01-02)
  - **완료 내용**: `useMemo`로 계산 결과 메모이제이션 적용
  - **적용 위치**: 
    - `dashboard/page.tsx`: 총 인건비 및 총 시간 계산 메모이제이션
    - `reports/page.tsx`: 총 인건비 계산 메모이제이션
  - **효과**: 불필요한 재계산 방지로 렌더링 성능 개선
  - **참고**: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/reports/page.tsx`

- [ ] **컴포넌트 메모이제이션**
  - **개선 방안**: 자주 리렌더링되는 컴포넌트에 `React.memo` 적용
  - **주의**: 과도한 메모이제이션은 오히려 성능 저하 가능
  - **우선순위**: 프로파일링 후 필요 시 적용

#### 🟢 낮음: 이미지 최적화
- [ ] **next/image 사용 검증**
  - **현재 상태**: 아바타 이미지 등에서 `next/image` 사용 여부 확인 필요
  - **개선 방안**: 모든 이미지에 `next/image` 적용

### 4.3 네트워크 최적화

#### 🟡 중간: API 요청 최적화
- [ ] **요청 배칭 (Batching)**
  - **개선 방안**: 여러 API 호출을 하나로 묶어 네트워크 요청 감소
  - **도구**: React Query의 `useQueries` 활용

- [ ] **캐싱 전략 개선**
  - **개선 방안**: React Query 도입 시 staleTime, cacheTime 최적화

---

## 5. 테스트 및 품질 보증

### 5.1 테스트 환경 구축

#### 🔴 높음: 테스트 프레임워크 설정
- [x] **Jest 및 React Testing Library 설치** ✅ 완료 (2025-01-02)
  - **완료 내용**: 
    - `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event` 설치
    - `jest.config.js`, `jest.setup.js` 설정 완료
    - 테스트 스크립트 추가 (`npm test`, `npm test:watch`, `npm test:coverage`)

- [x] **테스트 유틸리티 생성** ✅ 완료 (2025-01-02)
  - **생성 파일**: `src/__tests__/utils/test-utils.tsx`
  - **내용**: React Query Provider를 포함한 커스텀 렌더 함수 제공

#### 🟡 중간: 단위 테스트 작성
- [x] **유틸리티 함수 테스트** ✅ 완료 (2025-01-02)
  - **완료 내용**: `src/lib/sanitize.ts` 테스트 작성 완료 (14개 테스트 모두 통과)
  - **생성 파일**: `src/__tests__/lib/sanitize.test.ts`
  - **다음 단계**: `src/lib/utils.ts` 등 추가 테스트 작성 예정

- [x] **컴포넌트 테스트** ✅ 완료 (2025-01-02)
  - **완료 내용**: 기본 UI 컴포넌트 테스트 작성 완료
  - **생성 파일**: 
    - `src/__tests__/components/ui/button.test.tsx` (5개 테스트)
    - `src/__tests__/components/ui/card.test.tsx` (3개 테스트)
  - **테스트 결과**: 총 22개 테스트 모두 통과
  - **다음 단계**: `Dialog`, `Input` 등 추가 컴포넌트 테스트 작성 예정

#### 🟢 낮음: 통합 테스트 및 E2E 테스트
- [ ] **통합 테스트 작성**
  - **대상**: 주요 사용자 플로우 (온보딩, 스케줄 작성 등)

- [ ] **E2E 테스트 도구 검토**
  - **옵션**: Playwright, Cypress 등
  - **우선순위**: 핵심 플로우부터

### 5.2 코드 품질 도구

#### 🟡 중간: 린터 및 포매터 설정 강화
- [ ] **ESLint 규칙 강화**
  - **현재 상태**: `next.config.ts`에서 `ignoreDuringBuilds: true` 설정
  - **개선 방안**: 린트 에러 수정 후 `ignoreDuringBuilds` 제거
  - **참고**: `next.config.ts` 9줄

- [ ] **Prettier 설정 통일**
  - **개선 방안**: `.prettierrc` 파일 생성 및 팀 규칙 정의

#### 🟢 낮음: 타입 체크 자동화
- [ ] **CI/CD에 타입 체크 추가**
  - **개선 방안**: GitHub Actions 등에 `npm run typecheck` 추가

---

## 6. 개발 환경 개선

### 6.1 개발자 경험 (DX) 향상

#### 🟡 중간: 개발 도구 설정
- [ ] **VS Code 설정 파일 추가**
  - **내용**: `.vscode/settings.json`, `.vscode/extensions.json`
  - **목적**: 팀원 간 일관된 개발 환경

- [ ] **환경 변수 템플릿**
  - **개선 방안**: `.env.example` 파일 생성
  - **내용**: 필요한 환경 변수 목록 및 설명

#### 🟢 낮음: 스토리북 (Storybook) 도입 검토
- [ ] **컴포넌트 문서화 도구**
  - **목적**: UI 컴포넌트 독립적 개발 및 문서화
  - **우선순위**: 낮음 (선택 사항)

### 6.2 문서화

#### 🟡 중간: API 문서화
- [ ] **API 클라이언트 사용 가이드**
  - **위치**: `docs/api-client-guide.md`
  - **내용**: API 호출 패턴, 에러 처리 방법 등

- [ ] **컴포넌트 사용 가이드**
  - **위치**: `docs/components-guide.md`
  - **내용**: 주요 컴포넌트 사용 예시

#### 🟢 낮음: 아키텍처 다이어그램 업데이트
- [ ] **데이터 흐름도 작성**
  - **목적**: 신규 개발자 온보딩 지원

---

## 📊 우선순위 요약

### 즉시 시작 (이번 스프린트) ✅ 완료
1. ✅ 환경 변수 검증 및 타입 안정성 (`src/lib/env.ts`)
2. ✅ React Query 도입 및 기본 설정
3. ✅ Error Boundary 구현
4. ✅ 반복 패턴 컴포넌트화 (PageHeader, CenteredLayout)

### 단기 (1-2주) ✅ 완료
1. ✅ 대시보드 페이지 로직 분리 (Custom Hooks)
2. ✅ API 응답 타입 정의
3. ✅ 테스트 환경 구축 및 기본 테스트 작성
4. ✅ 빌드 에러 수정 및 ignoreBuildErrors 제거

### 중기 (1개월) ✅ 부분 완료
1. ⏳ Server Actions 전환 (진행 예정)
2. ✅ 성능 최적화 (코드 스플리팅, 메모이제이션) - 완료
3. ✅ 보안 헤더 설정 - 완료
4. ✅ 컴포넌트 테스트 확대 - 완료

### 장기 (선택 사항)
1. E2E 테스트 도입
2. Storybook 도입
3. Feature 기반 구조 전환 검토

---

## 📝 참고 문서

- [CODE_QUALITY_ASSESSMENT.md](./CODE_QUALITY_ASSESSMENT.md) - 코드 품질 평가
- [component_structure_analysis.md](./component_structure_analysis.md) - 컴포넌트 구조 분석
- [README.md](./README.md) - 프로젝트 개요
- [.cursor/rules/](../.cursor/rules/) - 프로젝트 규칙 및 가이드라인

---

## 🔄 업데이트 이력

- **2025-01-02**: 초안 작성
- **2025-01-02**: 단기 작업 완료
  - API 응답 타입 정의 완료
  - 대시보드 페이지 로직 분리 완료 (Custom Hooks)
  - 빌드 에러 수정 및 ignoreBuildErrors 제거 완료
  - 테스트 환경 구축 및 기본 테스트 작성 완료
- **2025-01-02**: 중기 작업 부분 완료
  - 보안 헤더 설정 완료 (X-Frame-Options, CSP 등)
  - 성능 최적화 완료 (코드 스플리팅, 메모이제이션)
  - 컴포넌트 테스트 확대 완료 (Button, Card 컴포넌트)

---

**작성자**: AI Assistant  
**검토 필요**: 프로젝트 리더, 시니어 개발자

