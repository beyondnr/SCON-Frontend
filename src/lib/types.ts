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
};

export type EmployeeRole = '직원' | '매니저';

/**
 * [Type Definition]
 * 직원 개인 정보를 나타냅니다.
 */
export type Employee = {
  id: string;
  name: string;
  hourlyRate: number;
  role: EmployeeRole;
  avatarUrl?: string;
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
 * 주간 스케줄 구조를 정의합니다.
 * 요일 -> 직원ID -> 근무시간 매핑 구조입니다.
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
