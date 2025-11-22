---
title: "[UI] Abstract Common UI Patterns"
labels: ["ui", "refactor", "components"]
assignees: []
---

## 배경 (Context)
코드 품질 분석 결과, 여러 페이지에서 반복되는 UI 패턴이 발견되었습니다. 이를 공통 컴포넌트로 추상화하여 중복 코드를 제거하고 일관성을 유지해야 합니다.

**출처:** `CODE_QUALITY_ASSESSMENT.md` (3. 반복 패턴 분석 및 재사용 제안)

## 목표 (Goals)
- 반복되는 UI 패턴을 재사용 가능한 컴포넌트로 분리합니다.
- 디자인 일관성 유지 및 개발 생산성 향상.

## 작업 상세 (Tasks)

### 1. Page Header Pattern
- [ ] `src/components/layout/page-header.tsx` 생성
- [ ] Title, Description, Action Slot을 포함하는 컴포넌트 구현
- [ ] `dashboard/page.tsx`, `reports/page.tsx` 등에 적용

### 2. Centered Layout Pattern
- [ ] `src/components/layout/centered-layout.tsx` 생성
- [ ] 화면 중앙 정렬을 위한 래퍼 컴포넌트 구현
- [ ] `onboarding/page.tsx`, `app/page.tsx` 등에 적용

### 3. Icon Card Header
- [ ] `src/components/ui/icon-card-header.tsx` (또는 적절한 위치) 생성
- [ ] 아이콘과 제목이 함께 있는 카드 헤더 패턴 구현
- [ ] `settings/page.tsx`, `FeatureCard` 등에 적용

## 참고 코드 (Reference)
```tsx
// PageHeader 예시
<PageHeader 
    title="Dashboard" 
    description="Overview of your metrics" 
    action={<Button>Add</Button>} 
/>
```

