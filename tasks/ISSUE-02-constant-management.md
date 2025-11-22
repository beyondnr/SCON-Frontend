---
title: "[Refactor] Centralize Constants and Magic Strings"
labels: ["refactor", "maintenance"]
assignees: []
---

## 배경 (Context)
코드 전반에 걸쳐 라벨, 설정값, 메시지 등이 하드코딩되어 있습니다(`mock-data.ts` 제외). 이는 텍스트 변경 시 여러 파일을 수정해야 하는 불편함을 초래하며 다국어 지원 등의 확장을 어렵게 합니다.

**출처:** `component_structure_analysis.md` (4.1 단기 개선 사항 - 매직 넘버/스트링 제거)

## 목표 (Goals)
- 하드코딩된 문자열과 상수를 중앙에서 관리합니다.
- 코드의 가독성과 유지보수성을 향상시킵니다.

## 작업 상세 (Tasks)
- [ ] `src/constants/` 디렉토리 생성 (또는 `features/shared/constants.ts`)
- [ ] `DashboardPage`, `ReportsPage` 등에서 사용되는 하드코딩된 UI 텍스트 식별
- [ ] 상수 파일로 문자열 이동
- [ ] 컴포넌트에서 상수 참조하도록 수정

## 참고 사항 (Notes)
- 우선적으로 반복되는 라벨이나 비즈니스 룰에 관련된 수치 등을 상수로 변환합니다.

