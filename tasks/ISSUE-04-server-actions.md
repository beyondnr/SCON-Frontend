---
title: "[Feat] Migrate Form Submissions to Server Actions"
labels: ["feature", "nextjs", "server-actions"]
assignees: []
---

## 배경 (Context)
현재 폼 제출 로직이 클라이언트 사이드 API 호출 방식으로 구현될 가능성이 있거나, 계획되어 있습니다. Next.js 15의 Server Actions를 활용하면 번들 사이즈를 줄이고 보안성을 높일 수 있습니다.

**출처:** `component_structure_analysis.md` (4.2 장기 아키텍처 제안)

## 목표 (Goals)
- 클라이언트 사이드 폼 처리를 Server Actions로 전환합니다.
- 온보딩 프로세스 등 주요 폼 데이터 처리 로직 개선.

## 작업 상세 (Tasks)
- [ ] `src/features/onboarding/actions.ts` 파일 생성
- [ ] 온보딩 각 단계별 데이터 저장 로직을 Server Action으로 구현 (`'use server'`)
- [ ] `OnboardingWizard` 및 하위 스텝 컴포넌트에서 `form action` 또는 `useActionState` (React 19) 적용
- [ ] 에러 핸들링 및 로딩 상태 처리 (pending state)

## 참고 사항 (Notes)
- Next.js 15 및 React 19의 최신 폼 처리 패턴을 준수합니다.
- Zod 검증 로직을 Server Action 내부에서 재사용합니다.

