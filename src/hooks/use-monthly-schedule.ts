/**
 * [Script Purpose]
 * 월간 스케줄 관리 Hook
 * - 월간 스케줄 상태 관리
 * - 스케줄 업데이트 로직 (추가, 수정, 삭제)
 * - 자동 채우기, 패턴 복사, 이메일 발송 기능
 */

import { useState, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { MonthlySchedule, Employee, TimeRange } from '@/lib/types';
import { getEmployeeShiftTime } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api-client';
import { getCurrentStoreId } from '@/lib/local-storage-utils';
import { 
  ApiSchedule, 
  ScheduleDetailResponseDto, 
  UpdateScheduleRequestDto,
  ShiftDto,
  ShiftRequestDto
} from '@/lib/api-mappers';
import { logger } from '@/lib/logger';

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
  const [weeklySchedules, setWeeklySchedules] = useState<ApiSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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
   * 월간 스케줄 조회
   * 
   * 중요: API는 주차별 스케줄 메타데이터만 반환하며, 일별 세부 스케줄(Shift)은 제공되지 않음
   * 백엔드 작업 계획서 확인 결과, 현재는 스케줄 상세 정보 API가 없으므로 초기 빈 스케줄로 시작
   */
  const fetchMonthlySchedule = useCallback(async (yearMonth: string) => {
    const storeId = getCurrentStoreId();
    if (!storeId) {
      setError(new Error('매장 정보를 찾을 수 없습니다.'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // API 호출 (배열 직접 반환, ApiResponse 래퍼 없음)
      // 주의: api-client.ts의 응답 인터셉터가 배열을 올바르게 처리하는지 확인 필요
      const response = await apiClient.get<ApiSchedule[]>(
        `/v1/schedules/monthly?storeId=${storeId}&yearMonth=${yearMonth}`
      );

      // 주차별 스케줄 메타데이터 저장
      const schedules = response.data || [];
      setWeeklySchedules(schedules);

      // ApiSchedule[]를 MonthlySchedule 형식으로 변환
      // 주의: API는 주차별 스케줄 메타데이터만 반환하며, 일별 세부 스케줄(Shift)은 제공되지 않음
      // 스케줄 상세 정보는 주차 선택 시 fetchScheduleDetail로 조회
      const convertedSchedule = convertScheduleResponseToMonthlySchedule(
        schedules,
        yearMonth
      );

      setMonthlySchedule(convertedSchedule);
      logger.debug("Monthly schedule fetched successfully", { 
        yearMonth, 
        scheduleCount: schedules.length 
      });
    } catch (error) {
      console.error("[useMonthlySchedule] Failed to fetch schedule:", error);
      setError(error as Error);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 자동 채우기: 빈 스케줄을 직원의 기본 근무 시간으로 채움
   * 
   * 주의: mockEmployees를 사용하지 않고, 직원 목록을 parameter로 받도록 수정 필요
   */
  const autoFillSchedule = useCallback(
    (weeks: Week[], employees?: Employee[]) => {
      // employees가 제공되지 않으면 자동 채우기 불가 (mockEmployees 제거)
      if (!employees || employees.length === 0) {
        toast({
          title: '자동 채우기 실패',
          description: '직원 정보가 없어 자동 채우기를 수행할 수 없습니다.',
          variant: 'destructive',
        });
        return;
      }

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

          employees.forEach((emp) => {
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

  /**
   * 주차 선택 시 해당 주차의 스케줄 ID 추출
   */
  const getScheduleIdForWeek = useCallback((weekStartDate: Date): number | null => {
    const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd');
    
    // weeklySchedules에서 해당 주차의 스케줄 찾기
    const schedule = weeklySchedules.find(
      s => format(new Date(s.weekStartDate), 'yyyy-MM-dd') === weekStartDateStr
    );
    
    return schedule?.id || null;
  }, [weeklySchedules]);

  /**
   * 스케줄 상세 조회
   */
  const fetchScheduleDetail = useCallback(async (scheduleId: number) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiClient.get<ScheduleDetailResponseDto>(
        `/v1/schedules/${scheduleId}`
      );

      // ScheduleDetailResponseDto를 MonthlySchedule 형식으로 변환
      const convertedSchedule = convertScheduleDetailToMonthlySchedule(
        response.data
      );

      // 기존 스케줄에 현재 주차의 스케줄 병합
      setMonthlySchedule((prev) => ({
        ...prev,
        ...convertedSchedule,
        schedule: {
          ...prev.schedule,
          ...convertedSchedule.schedule, // 현재 주차의 스케줄만 병합
        },
      }));
    } catch (error: any) {
      // 404 에러인 경우 빈 스케줄로 시작
      if (error.response?.status === 404) {
        logger.debug("[useMonthlySchedule] Schedule not found, starting with empty schedule");
        setMonthlySchedule((prev) => ({
          ...prev,
          id: String(scheduleId),
          isModifiedAfterSent: false,
        }));
        return;
      }
      
      console.error("[useMonthlySchedule] Failed to fetch schedule detail:", error);
      setError(error as Error);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 스케줄 저장 (현재 주차의 스케줄만 저장)
   */
  const saveSchedule = useCallback(async (
    schedule: MonthlySchedule,
    scheduleId: number,
    weekStartDate: Date
  ) => {
    if (!schedule) {
      throw new Error("스케줄 정보를 찾을 수 없습니다.");
    }

    if (!scheduleId) {
      throw new Error("스케줄 ID를 찾을 수 없습니다.");
    }

    try {
      setIsSaving(true);
      setError(null);

      // 프론트엔드 형식을 백엔드 형식으로 변환 (현재 주차만)
      const updateRequest = convertMonthlyScheduleToUpdateRequest(
        schedule,
        weekStartDate,
        weeklySchedules
      );

      const response = await apiClient.put<ScheduleDetailResponseDto>(
        `/v1/schedules/${scheduleId}`,
        updateRequest
      );

      // 성공 시 서버 상태 반영 (현재 주차의 스케줄만 업데이트)
      const convertedSchedule = convertScheduleDetailToMonthlySchedule(
        response.data
      );
      
      // 기존 스케줄에 현재 주차의 스케줄만 병합
      setMonthlySchedule((prev) => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          ...convertedSchedule.schedule, // 현재 주차의 스케줄만 병합
        },
        isModifiedAfterSent: false, // 저장 완료 후 수정 상태 초기화
      }));
    } catch (error) {
      console.error("[useMonthlySchedule] Failed to save schedule:", error);
      setError(error as Error);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
      throw error; // 상위 컴포넌트에서 처리할 수 있도록 에러 전달
    } finally {
      setIsSaving(false);
    }
  }, [weeklySchedules]);

  return {
    monthlySchedule,
    setMonthlySchedule,
    updateScheduleForDate,
    addEmployeesToSchedule,
    autoFillSchedule,
    copyWeekPattern,
    sendScheduleEmail,
    fetchMonthlySchedule,
    fetchScheduleDetail,
    getScheduleIdForWeek,
    saveSchedule,
    isLoading,
    isSaving,
    error,
  };
}

/**
 * ApiSchedule[]를 MonthlySchedule 형식으로 변환
 * 
 * 중요 제약사항 (백엔드 작업 계획서 참고):
 * - API는 주차별 스케줄 메타데이터(id, weekStartDate, status 등)만 반환
 * - 프론트엔드는 일별 세부 스케줄(Shift: { date -> employeeId -> TimeRange })이 필요
 * - 스케줄 상세 정보는 주차 선택 시 fetchScheduleDetail로 조회
 */
function convertScheduleResponseToMonthlySchedule(
  schedules: ApiSchedule[],
  yearMonth: string
): MonthlySchedule {
  return {
    id: schedules.length > 0 ? `monthly-schedule-${yearMonth}` : `empty-schedule-${yearMonth}`,
    yearMonth,
    schedule: {}, // 일별 세부 스케줄은 빈 객체로 시작 (주차 선택 시 상세 조회)
    isModifiedAfterSent: false,
  };
}

/**
 * ScheduleDetailResponseDto를 MonthlySchedule 형식으로 변환
 */
function convertScheduleDetailToMonthlySchedule(
  scheduleDetail: ScheduleDetailResponseDto | null
): MonthlySchedule {
  if (!scheduleDetail) {
    return {
      id: 'temp-id',
      yearMonth: format(new Date(), 'yyyy-MM'),
      schedule: {},
      isModifiedAfterSent: false,
    };
  }

  // Shift 정보를 프론트엔드 형식으로 변환
  const schedule: Record<string, Record<string, TimeRange>> = {};
  
  scheduleDetail.shifts.forEach((shift) => {
    const date = shift.date; // "yyyy-MM-dd"
    const employeeId = String(shift.employeeId);
    
    if (!schedule[date]) {
      schedule[date] = {};
    }
    
    // 시간 형식 변환: "HH:mm:ss" → "HH:mm"
    const startTime = shift.startTime.substring(0, 5); // "09:00:00" → "09:00"
    const endTime = shift.endTime.substring(0, 5); // "18:00:00" → "18:00"
    
    schedule[date][employeeId] = {
      start: startTime,
      end: endTime,
    };
  });

  // weekStartDate에서 yearMonth 추출
  const yearMonth = format(new Date(scheduleDetail.weekStartDate), 'yyyy-MM');

  return {
    id: String(scheduleDetail.id), // 숫자 ID를 문자열로 변환
    yearMonth,
    schedule,
    isModifiedAfterSent: scheduleDetail.status === 'PUBLISHED',
  };
}

/**
 * MonthlySchedule에서 현재 주차의 스케줄만 UpdateScheduleRequestDto 형식으로 변환
 */
function convertMonthlyScheduleToUpdateRequest(
  monthlySchedule: MonthlySchedule,
  weekStartDate: Date,
  weeklySchedules: ApiSchedule[]
): UpdateScheduleRequestDto {
  const shifts: ShiftRequestDto[] = [];
  
  // 현재 주차의 날짜 범위 계산 (월요일부터 일요일, 7일)
  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStartDate, i);
    weekDates.push(format(date, 'yyyy-MM-dd'));
  }

  // 현재 주차의 스케줄만 백엔드 형식으로 변환
  Object.entries(monthlySchedule.schedule).forEach(([scheduleDate, employees]) => {
    // 현재 주차의 날짜인 경우만 포함
    if (!weekDates.includes(scheduleDate)) {
      return;
    }
    
    Object.entries(employees).forEach(([empId, timeRange]) => {
      if (timeRange) {
        // 시간 형식 변환: "HH:mm" → "HH:mm:ss"
        const startTime = timeRange.start.length === 5 
          ? `${timeRange.start}:00` 
          : timeRange.start;
        const endTime = timeRange.end.length === 5 
          ? `${timeRange.end}:00` 
          : timeRange.end;
        
        shifts.push({
          employeeId: Number(empId), // string → number
          date: scheduleDate,
          startTime,
          endTime,
        });
      }
    });
  });

  // 현재 스케줄의 상태 확인 (PUBLISHED인 경우만 PUBLISHED 유지)
  const weekStartDateStr = format(weekStartDate, 'yyyy-MM-dd');
  const currentSchedule = weeklySchedules.find(
    s => format(new Date(s.weekStartDate), 'yyyy-MM-dd') === weekStartDateStr
  );
  const isPublished = currentSchedule?.status === 'PUBLISHED';

  return {
    status: isPublished ? 'PUBLISHED' : 'DRAFT',
    shifts,
  };
}

