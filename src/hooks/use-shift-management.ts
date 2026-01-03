/**
 * [Script Purpose]
 * 시프트 편집 관리 Hook
 * - 시프트 편집 다이얼로그 상태 관리
 * - 직원 선택 다이얼로그 상태 관리
 * - 시프트 추가/수정/삭제 핸들러
 */

import { useState, useCallback } from 'react';
import { Employee, TimeRange } from '@/lib/types';

export interface ShiftInfo {
  employee: Employee;
  day: string; // YYYY-MM-DD
  timeRange: TimeRange | null;
}

export interface SelectEmployeeState {
  isOpen: boolean;
  date: string;
  time: string;
  unavailableIds: string[];
}

/**
 * 시프트 편집 관리 Hook
 * 
 * @returns 시프트 편집 관련 상태 및 핸들러
 */
export function useShiftManagement() {
  const [editingShift, setEditingShift] = useState<ShiftInfo | null>(null);
  const [selectEmployeeState, setSelectEmployeeState] = useState<SelectEmployeeState>({
    isOpen: false,
    date: '',
    time: '',
    unavailableIds: [],
  });

  /**
   * 시프트 편집 다이얼로그 열기
   */
  const openEditDialog = useCallback((employee: Employee, day: string, timeRange: TimeRange | null) => {
    setEditingShift({ employee, day, timeRange });
  }, []);

  /**
   * 시프트 편집 다이얼로그 닫기
   */
  const closeEditDialog = useCallback(() => {
    setEditingShift(null);
  }, []);

  /**
   * 직원 선택 다이얼로그 열기
   */
  const openSelectEmployeeDialog = useCallback(
    (date: string, time: string, unavailableIds: string[]) => {
      setSelectEmployeeState({
        isOpen: true,
        date,
        time,
        unavailableIds,
      });
    },
    []
  );

  /**
   * 직원 선택 다이얼로그 닫기
   */
  const closeSelectEmployeeDialog = useCallback(() => {
    setSelectEmployeeState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    editingShift,
    selectEmployeeState,
    openEditDialog,
    closeEditDialog,
    openSelectEmployeeDialog,
    closeSelectEmployeeDialog,
  };
}

