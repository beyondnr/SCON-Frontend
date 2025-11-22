---
title: "[Refactor] PayrollTable to Compound Component Pattern"
labels: ["refactor", "ui", "complex-component"]
assignees: []
---

## 배경 (Context)
`PayrollTable` 컴포넌트가 테이블 행, 확장 영역, 액션 등 다양한 요소를 포함하며 복잡해지고 있습니다. Compound Component 패턴을 적용하여 컴포넌트의 유연성과 가독성을 높일 필요가 있습니다.

**출처:** `component_structure_analysis.md` (4.2 장기 아키텍처 제안)

## 목표 (Goals)
- 단일 거대 컴포넌트를 역할별로 분리하고 조합 가능한 형태로 리팩토링합니다.
- `PayrollTable`의 사용성을 개선합니다.

## 작업 상세 (Tasks)
- [ ] `src/app/(app)/reports/components/payroll-table/` 디렉토리 구조 재정비
- [ ] Context API를 활용하여 테이블 상태 공유 (필요 시)
- [ ] 하위 컴포넌트 분리:
    - `PayrollTable.Root`
    - `PayrollTable.Header`
    - `PayrollTable.Row`
    - `PayrollTable.Cell`
    - `PayrollTable.Expansion`
- [ ] 기존 `PayrollTable`을 위 컴포넌트들의 조합으로 재구현

## 참고 코드 (Reference)
```tsx
<PayrollTable.Root data={data}>
  <PayrollTable.Header />
  <PayrollTable.Body>
    {(item) => (
      <PayrollTable.Row item={item}>
        <PayrollTable.Cell>{item.name}</PayrollTable.Cell>
         {/* ... */}
      </PayrollTable.Row>
    )}
  </PayrollTable.Body>
</PayrollTable.Root>
```

