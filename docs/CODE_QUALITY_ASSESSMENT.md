# Code Quality Assessment

## 1. 가독성 (Readability)
*   **구조**: 프로젝트 구조가 `app`, `components`, `lib` 등으로 역할에 따라 명확하게 분리되어 있어 탐색이 용이함.
*   **이름 규칙**: `DashboardPage`, `SummaryCards` 등 컴포넌트와 파일명이 파스칼 케이스(PascalCase)와 케밥 케이스(kebab-case)로 일관되게 작성되어 예측 가능함.
*   **들여쓰기**: 전반적으로 2-space 또는 4-space 들여쓰기가 일관되게 적용되어 있음.
*   **변수명**: `totalPayroll`, `pendingSchedules` 등 의미가 명확한 변수명을 사용하여 코드의 의도를 쉽게 파악할 수 있음.

## 2. 재사용성 (Reusability)
*   **컴포넌트화**: `ApproveButton`, `ReportActions` 등 기능 단위로 컴포넌트가 잘 분리되어 있어 재사용이 용이함.
*   **UI 라이브러리 활용**: Shadcn UI 기반의 `Button`, `Card` 등을 사용하여 디자인 일관성을 유지하면서 개발 생산성을 높임.
*   **유틸리티 함수**: `formatCurrency`, `cn` 등 자주 사용되는 로직을 `lib/utils.ts`로 분리하여 중복을 줄임.
*   **Mock Data**: 데이터 구조를 `lib/mock-data.ts`에 정의하여 여러 컴포넌트에서 동일한 데이터 구조를 활용할 수 있게 함.

## 3. 유지보수성 (Maintainability)
*   **타입 시스템**: TypeScript를 적극적으로 사용하여 `Store`, `Employee`, `Schedule`, `Payroll` 등의 타입을 정의함으로써 런타임 에러를 줄이고 유지보수성을 높임.
*   **중앙화된 데이터 관리**: Mock 데이터를 한 곳에서 관리하여 데이터 변경 시 수정 범위를 최소화함.
*   **환경 변수**: `next.config.ts` 등 설정 파일을 통해 환경별 설정을 관리할 수 있는 구조를 갖춤.
*   **관심사 분리**: 페이지(`page.tsx`)는 레이아웃과 데이터 흐름을 담당하고, 세부 UI는 하위 컴포넌트로 위임하여 코드 복잡도를 낮춤.

## 4. 일관성 (Consistency)
*   **스타일링**: Tailwind CSS를 전반적으로 사용하여 스타일링 방식이 통일되어 있음. `cn` 유틸리티를 통해 클래스 병합 로직도 일관되게 처리함.
*   **디렉토리 구조**: Next.js App Router의 관례를 따르는 폴더 구조(`(app)`, `components/ui` 등)를 유지하여 일관성을 확보함.
*   **코드 스타일**: import 순서, 컴포넌트 정의 방식(함수형 컴포넌트) 등이 프로젝트 전반에 걸쳐 일관됨.

## 5. 성능 (Performance)
*   **서버 컴포넌트 활용**: Next.js의 App Router 특성을 살려 기본적으로 서버 컴포넌트를 사용함으로써 클라이언트 번들 사이즈를 최적화함.
*   **이미지 최적화**: `next/image` 컴포넌트 사용이 권장되나, 현재 코드에서는 직접적인 `img` 태그 사용이나 이미지 로딩 최적화 부분은 추가 확인이 필요할 수 있음. (현재 Mock 데이터에서는 아바타 URL만 존재)
*   **불필요한 렌더링 방지**: 상태 관리가 필요한 부분(`OnboardingWizard` 등) 외에는 정적인 렌더링을 지향하여 성능을 확보함.

---

## 🔎 반복 패턴 분석 및 재사용 제안 (Repetitive Patterns & Suggestions)

코드베이스 분석 결과, 다음과 같은 반복 패턴이 식별되었으며 이를 공통 컴포넌트로 추상화할 것을 제안합니다.

### 1. 페이지 헤더 패턴 (Page Header Pattern)
여러 페이지에서 제목과 설명, 그리고 우측 액션 버튼을 배치하는 구조가 반복됩니다.

*   **발견된 곳**:
    *   `studio/src/app/(app)/dashboard/page.tsx`
    *   `studio/src/app/(app)/reports/page.tsx`
*   **반복 코드**:
    ```tsx
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
            <h1 className="text-3xl font-bold font-headline">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
        </div>
        {/* Action Component */}
    </div>
    ```
*   **제안**: `<PageHeader title="..." description="..." action={<...>} />` 형태의 컴포넌트로 분리

### 2. 중앙 정렬 레이아웃 (Centered Layout Pattern)
온보딩 및 랜딩 페이지, 가용성 페이지 등에서 화면 중앙에 콘텐츠를 배치하는 레이아웃이 반복됩니다.

*   **발견된 곳**:
    *   `studio/src/app/page.tsx`
    *   `studio/src/app/onboarding/page.tsx`
    *   `studio/src/app/availability/page.tsx`
*   **반복 코드**:
    ```tsx
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="w-full max-w-2xl">
             {/* Content */}
        </div>
    </div>
    ```
*   **제안**: `<CenteredLayout>` 래퍼 컴포넌트 도입

### 3. 아이콘이 포함된 카드 헤더 (Card Header with Icon)
설정 페이지 및 대시보드 요약 카드에서 아이콘과 텍스트가 가로로 배치되는 헤더 스타일이 반복됩니다.

*   **발견된 곳**:
    *   `studio/src/app/(app)/settings/page.tsx`
    *   `studio/src/app/page.tsx` (FeatureCard)
*   **반복 코드**:
    ```tsx
    <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
            <Icon className="..." />
            {title}
        </CardTitle>
    </CardHeader>
    ```
*   **제안**: `<IconCardHeader icon={...} title="..." />` 등으로 패턴화하여 일관성 유지
