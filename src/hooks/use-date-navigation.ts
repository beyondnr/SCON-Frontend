/**
 * [Script Purpose]
 * 날짜 및 주차 네비게이션 관리 Hook
 * - 현재 선택된 월/주차 상태 관리
 * - 월/주차 변경 핸들러
 * - 주차 정보 계산
 */

import { useState, useMemo, useEffect } from 'react';
import { addMonths, subMonths, format } from 'date-fns';
import { getWeeksInMonth } from '@/lib/utils';

interface Week {
  weekIndex: number;
  dates: Date[];
}

/**
 * 날짜 및 주차 네비게이션 Hook
 * 
 * @param initialDate - 초기 날짜 (기본값: 현재 날짜)
 * @returns 날짜 네비게이션 관련 상태 및 핸들러
 */
export function useDateNavigation(initialDate?: Date) {
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  // 현재 월의 주차 정보 계산
  const weeks = useMemo(() => {
    return getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // 주차 변경 시 유효성 검사
  useEffect(() => {
    if (currentWeekIndex >= weeks.length) {
      setCurrentWeekIndex(0);
    }
  }, [weeks, currentWeekIndex]);

  const currentWeek = weeks[currentWeekIndex] || weeks[0];

  // 이전 월로 이동
  const handlePrevMonth = () => {
    setCurrentDate((prev) => subMonths(prev, 1));
    setCurrentWeekIndex(0);
  };

  // 다음 월로 이동
  const handleNextMonth = () => {
    setCurrentDate((prev) => addMonths(prev, 1));
    setCurrentWeekIndex(0);
  };

  // 특정 날짜로 이동
  const goToDate = (date: Date) => {
    setCurrentDate(date);
    setCurrentWeekIndex(0);
  };

  return {
    currentDate,
    currentWeekIndex,
    setCurrentWeekIndex,
    weeks,
    currentWeek,
    handlePrevMonth,
    handleNextMonth,
    goToDate,
  };
}

