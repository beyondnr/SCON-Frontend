---
title: "[Refactor] Data Fetching Abstraction for Dashboard"
labels: ["refactor", "dashboard", "hooks"]
assignees: []
---

## 배경 (Context)
현재 `DashboardPage` 내부에 `setTimeout`을 사용한 Mock 데이터 로딩 로직이 하드코딩되어 있습니다. 이는 UI 컴포넌트와 비즈니스 로직이 강하게 결합되어 있어 가독성을 저하시키고 유지보수를 어렵게 합니다.

**출처:** `component_structure_analysis.md` (4.1 단기 개선 사항)

## 목표 (Goals)
- 데이터 로딩 로직을 Custom Hook으로 분리하여 관심사를 분리합니다.
- 향후 실제 API 연동 시 변경을 용이하게 합니다.

## 작업 상세 (Tasks)
- [ ] `src/features/dashboard/hooks/useScheduleData.ts` (또는 적절한 경로) 파일 생성
- [ ] `DashboardPage`의 `useState`, `useEffect` 로직을 Custom Hook으로 이동
- [ ] 데이터 로딩 상태(`isLoading`), 에러 상태(`error`), 데이터(`data`)를 반환하도록 구현
- [ ] `DashboardPage`에서 Custom Hook을 사용하도록 수정

## 참고 사항 (Notes)
```typescript
// AS-IS
const [isLoading, setIsLoading] = useState(true);
// ... useEffect ...

// TO-BE
const { data, isLoading } = useScheduleData();
```

