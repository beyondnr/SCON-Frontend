// File: studio/src/lib/types.ts
/**
 * [Script Purpose]
 * 애플리케이션 전반에서 사용되는 주요 데이터 모델의 TypeScript 인터페이스와 타입을 정의합니다.
 * 매장, 직원, 스케줄, 급여 등 핵심 도메인 모델을 포함합니다.
 */

/**
 * [Type Definition]
 * 매장의 기본 정보를 나타냅니다.
 */
export type Store = {
  name: string;
  businessType: string;
  openingTime: string;
  closingTime: string;
  // 매장 휴무일 (API 매핑용)
  weeklyHoliday?: string;
};

export type EmployeeRole = '직원' | '매니저';

export type ShiftPreset = 'morning' | 'afternoon' | 'custom';

/**
 * [Type Definition]
 * 직원 개인 정보를 나타냅니다.
 */
export type Employee = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  hourlyRate: number;
  role: EmployeeRole;
  avatarUrl?: string;
  color?: string;
  
  // 기본 근무 시간 설정
  shiftPreset?: ShiftPreset; // MVP에서는 optional로 시작, 추후 required 권장
  customShiftStart?: string; // "HH:mm"
  customShiftEnd?: string;   // "HH:mm"
  
  // 개인 휴무일 (API 매핑용)
  personalHoliday?: string;
};

export type TimeRange = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

/**
 * [Type Definition]
 * 직원의 특정 요일 근무 가능 시간을 나타냅니다.
 */
export type DailyAvailability = {
  day: string; // '월', '화', ...
  times: TimeRange[];
};

export type Availability = DailyAvailability[];

export type Shift = {
  employeeId: string;
  start: string; // "YYYY-MM-DDTHH:mm"
  end: "YYYY-MM-DDTHH:mm";
};

/**
 * [Type Definition]
 * 월간 스케줄 구조를 정의합니다.
 */
export type MonthlySchedule = {
  id: string;
  yearMonth: string; // "YYYY-MM"
  schedule: {
    [date: string]: { // "YYYY-MM-DD"
      [employeeId: string]: TimeRange | null;
    };
  };
  lastSentAt?: string; // ISO string
  isModifiedAfterSent: boolean;
};

/**
 * [Type Definition]
 * 주간 스케줄 구조를 정의합니다. (기존 유지, date 키가 'YYYY-MM-DD' 형식이 됨)
 * 요일/날짜 -> 직원ID -> 근무시간 매핑 구조입니다.
 */
export type Schedule = {
  [day: string]: {
    [employeeId: string]: TimeRange | null;
  };
};

/**
 * [Type Definition]
 * 직원의 급여 계산 결과를 나타냅니다.
 * 기본급, 각종 수당, 총 지급액 등을 포함합니다.
 */
export type Payroll = {
  employeeId: string;
  totalHours: number;
  basePay: number;
  weeklyHolidayAllowance: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  totalPay: number;
};

/**
 * [Type Definition]
 * 과거 급여 리포트 이력 정보를 나타냅니다.
 */
export type ReportHistoryItem = {
  id: string;
  period: string;
  totalHours: number;
  totalAmount: number;
};

/**
 * [Type Definition]
 * API 응답 래퍼 타입
 * 백엔드에서 반환하는 표준 응답 형식
 */
export interface ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T;
  timestamp?: string;
}

/**
 * [Type Definition]
 * API 에러 응답 타입
 */
export interface ApiError {
  status: number;
  message: string;
  error?: string;
  fieldErrors?: Array<{
    field: string;
    message: string;
  }>;
  timestamp?: string;
}

/**
 * [Type Definition]
 * 필드별 유효성 검증 에러
 */
export interface FieldError {
  field: string;
  message: string;
}

/**
 * [Type Definition]
 * API 에러 응답 (필드 에러 포함)
 */
export interface ApiErrorWithFields extends ApiError {
  fieldErrors: FieldError[];
}