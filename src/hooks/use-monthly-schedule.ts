/**
 * [Script Purpose]
 * 월간 스케줄 관리 Hook
 * - 월간 스케줄 상태 관리
 * - 스케줄 업데이트 로직 (추가, 수정, 삭제)
 * - 자동 채우기, 패턴 복사, 이메일 발송 기능
 */

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { MonthlySchedule, Employee, TimeRange } from '@/lib/types';
import { getEmployeeShiftTime } from '@/lib/utils';
import { mockEmployees } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

interface Week {
  dates: Date[];
}

/**
 * 월간 스케줄 관리 Hook
 * 
 * @param initialSchedule - 초기 스케줄 데이터
 * @returns 스케줄 상태 및 업데이트 함수들
 */
export function useMonthlySchedule(initialSchedule?: MonthlySchedule) {
  const { toast } = useToast();
  const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule>(
    initialSchedule || {
      id: 'temp-id',
      yearMonth: format(new Date(), 'yyyy-MM'),
      schedule: {},
      isModifiedAfterSent: false,
    }
  );

  /**
   * 특정 날짜의 스케줄 업데이트
   */
  const updateScheduleForDate = useCallback(
    (date: string, employeeId: string, timeRange: TimeRange | null) => {
      setMonthlySchedule((prev) => {
        const newSchedule = { ...prev.schedule };
        if (!newSchedule[date]) {
          newSchedule[date] = {};
        }

        if (timeRange) {
          newSchedule[date][employeeId] = timeRange;
        } else {
          delete newSchedule[date][employeeId];
        }

        return {
          ...prev,
          schedule: newSchedule,
          isModifiedAfterSent: true,
        };
      });
    },
    []
  );

  /**
   * 여러 직원을 특정 날짜/시간에 추가
   */
  const addEmployeesToSchedule = useCallback(
    (date: string, employees: Employee[]) => {
      setMonthlySchedule((prev) => {
        const newSchedule = { ...prev.schedule };
        if (!newSchedule[date]) {
          newSchedule[date] = {};
        }

        employees.forEach((emp) => {
          const shiftTime = getEmployeeShiftTime(emp);
          newSchedule[date][emp.id] = shiftTime;
        });

        return {
          ...prev,
          schedule: newSchedule,
          isModifiedAfterSent: true,
        };
      });

      toast({
        title: '직원 추가 완료',
        description: `${employees.length}명의 직원이 추가되었습니다.`,
      });
    },
    [toast]
  );

  /**
   * 자동 채우기: 빈 스케줄을 직원의 기본 근무 시간으로 채움
   */
  const autoFillSchedule = useCallback(
    (weeks: Week[]) => {
      setMonthlySchedule((prev) => {
        const newSchedule = { ...prev.schedule };

        // 이번 달의 모든 날짜 순회
        const allDates = weeks.flatMap((week) => week.dates);

        allDates.forEach((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');

          // 날짜별 객체가 없으면 생성
          if (!newSchedule[dateKey]) {
            newSchedule[dateKey] = {};
          }

          mockEmployees.forEach((emp) => {
            // 이미 스케줄이 있으면 건너뜀 (사용자 입력 존중)
            if (newSchedule[dateKey][emp.id]) return;

            // 스케줄이 없으면 기본 시간으로 채움
            const shiftTime = getEmployeeShiftTime(emp);
            newSchedule[dateKey][emp.id] = shiftTime;
          });
        });

        return {
          ...prev,
          schedule: newSchedule,
          isModifiedAfterSent: true,
        };
      });

      toast({
        title: '자동 채우기 완료',
        description: '빈 근무 일정을 기본 근무 시간으로 채웠습니다.',
      });
    },
    [toast]
  );

  /**
   * 주차 패턴 복사: 현재 주차의 패턴을 다른 주차에 복사
   */
  const copyWeekPattern = useCallback(
    (sourceWeek: Week, targetWeeks: Week[]) => {
      setMonthlySchedule((prev) => {
        const newSchedule = { ...prev.schedule };

        // 소스 데이터 추출 (현재 주차)
        const sourceData = sourceWeek.dates.map((date) => {
          const dateKey = format(date, 'yyyy-MM-dd');
          return newSchedule[dateKey] || {};
        });

        // 타겟 주차에 덮어쓰기
        targetWeeks.forEach((targetWeek) => {
          targetWeek.dates.forEach((targetDate, dayIndex) => {
            if (dayIndex < sourceData.length) {
              const targetDateKey = format(targetDate, 'yyyy-MM-dd');
              // 해당 요일의 소스 데이터 복사
              newSchedule[targetDateKey] = { ...sourceData[dayIndex] };
            }
          });
        });

        return {
          ...prev,
          schedule: newSchedule,
          isModifiedAfterSent: true,
        };
      });

      toast({
        title: '패턴 복사 완료',
        description: `${targetWeeks.length}개 주차에 근무표가 복사되었습니다.`,
      });
    },
    [toast]
  );

  /**
   * 이메일 발송 처리
   */
  const sendScheduleEmail = useCallback(
    (onSuccess?: () => void) => {
      // Simulate API call
      setTimeout(() => {
        setMonthlySchedule((prev) => ({
          ...prev,
          lastSentAt: new Date().toISOString(),
          isModifiedAfterSent: false,
        }));

        toast({
          title: '발송 완료',
          description: '모든 직원에게 근무표가 성공적으로 발송되었습니다.',
        });

        onSuccess?.();
      }, 1500);
    },
    [toast]
  );

  return {
    monthlySchedule,
    setMonthlySchedule,
    updateScheduleForDate,
    addEmployeesToSchedule,
    autoFillSchedule,
    copyWeekPattern,
    sendScheduleEmail,
  };
}

