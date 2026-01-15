/**
 * [Script Purpose]
 * 프론트엔드와 백엔드 간 API 데이터 변환 유틸리티
 * - 필드명 매핑 (예: hourlyRate ↔ hourlyWage)
 * - 값 형식 변환 (예: "morning" ↔ "MORNING")
 * - 요일 변환 (예: "월" ↔ "MONDAY")
 */

import { Employee, Store } from './types';

// ============================================
// 요일 변환 매핑
// ============================================

const DAY_KO_TO_EN: Record<string, string> = {
  '월': 'MONDAY',
  '화': 'TUESDAY',
  '수': 'WEDNESDAY',
  '목': 'THURSDAY',
  '금': 'FRIDAY',
  '토': 'SATURDAY',
  '일': 'SUNDAY',
};

const DAY_EN_TO_KO: Record<string, string> = {
  'MONDAY': '월',
  'TUESDAY': '화',
  'WEDNESDAY': '수',
  'THURSDAY': '목',
  'FRIDAY': '금',
  'SATURDAY': '토',
  'SUNDAY': '일',
};

/**
 * 요일 한글 → 영어 변환 (예: "월" → "MONDAY")
 */
export function dayToEnglish(day: string): string {
  return DAY_KO_TO_EN[day] || day;
}

/**
 * 요일 영어 → 한글 변환 (예: "MONDAY" → "월")
 */
export function englishToDay(day: string): string {
  return DAY_EN_TO_KO[day] || day;
}

// ============================================
// 직원 (Employee) 변환
// ============================================

/**
 * 백엔드 API 직원 응답 형식 타입
 */
export interface ApiEmployee {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  hourlyWage?: number;
  employmentType: 'MANAGER' | 'EMPLOYEE';
  shiftPreset?: 'MORNING' | 'AFTERNOON' | 'CUSTOM';
  customShiftStartTime?: string;
  customShiftEndTime?: string;
  personalHoliday?: string;
  storeId?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 백엔드 API 직원 요청 형식 타입
 */
export interface ApiEmployeeRequest {
  name: string;
  phone?: string;
  email?: string;
  consentVerified?: boolean;
  hourlyWage?: number;
  employmentType: 'MANAGER' | 'EMPLOYEE';
  shiftPreset?: 'MORNING' | 'AFTERNOON' | 'CUSTOM';
  customShiftStartTime?: string;
  customShiftEndTime?: string;
  personalHoliday?: string | null;
}

/**
 * 프론트엔드 Employee → 백엔드 API 요청 형식 변환
 */
export function employeeToApiFormat(employee: Partial<Employee>): ApiEmployeeRequest {
  // name은 필수 필드이므로 빈 문자열이면 undefined로 처리하지 않고 그대로 전송
  // (백엔드에서 validation 에러를 반환하도록)
  const name = employee.name?.trim();
  if (!name) {
    throw new Error('직원 이름은 필수입니다.');
  }

  // hourlyWage는 0도 유효한 값이므로 undefined가 아닌 경우 숫자로 전송
  const hourlyWage = employee.hourlyRate !== undefined && employee.hourlyRate !== null
    ? employee.hourlyRate
    : undefined;

  return {
    name: name,
    phone: employee.phoneNumber?.trim() || undefined, // phoneNumber → phone, 빈 문자열은 undefined
    email: employee.email?.trim() || undefined, // 빈 문자열은 undefined
    hourlyWage: hourlyWage,
    employmentType: employee.role === '매니저' ? 'MANAGER' : 'EMPLOYEE',
    shiftPreset: employee.shiftPreset 
      ? employee.shiftPreset.toUpperCase() as 'MORNING' | 'AFTERNOON' | 'CUSTOM'
      : undefined,
    customShiftStartTime: employee.customShiftStart || undefined,
    customShiftEndTime: employee.customShiftEnd || undefined,
    personalHoliday: employee.personalHoliday && employee.personalHoliday !== '휴무 없음'
      ? dayToEnglish(employee.personalHoliday)
      : null,
    consentVerified: true, // 기본값
  };
}

/**
 * 백엔드 API 응답 → 프론트엔드 Employee 형식 변환
 * 
 * 필드명 변환:
 * - phone → phoneNumber
 * - hourlyWage → hourlyRate
 * - employmentType → role (MANAGER/EMPLOYEE → 매니저/직원)
 * - shiftPreset → shiftPreset (대문자 → 소문자)
 * - customShiftStartTime → customShiftStart
 * - customShiftEndTime → customShiftEnd
 * - personalHoliday → personalHoliday (영문 요일 → 한글 요일)
 * 
 * 주의: color 필드는 프론트엔드에서만 사용하므로 API 응답에 포함되지 않음
 * 컴포넌트에서 필요 시 getRandomEmployeeColor 함수로 생성
 */
export function apiEmployeeToFrontend(apiEmployee: ApiEmployee): Employee {
  return {
    id: String(apiEmployee.id),
    name: apiEmployee.name,
    email: apiEmployee.email || '',
    phoneNumber: apiEmployee.phone || '',
    hourlyRate: apiEmployee.hourlyWage || 0, // hourlyWage → hourlyRate
    role: apiEmployee.employmentType === 'MANAGER' ? '매니저' : '직원',
    shiftPreset: apiEmployee.shiftPreset?.toLowerCase() as 'morning' | 'afternoon' | 'custom' | undefined,
    customShiftStart: apiEmployee.customShiftStartTime,
    customShiftEnd: apiEmployee.customShiftEndTime,
    personalHoliday: apiEmployee.personalHoliday 
      ? englishToDay(apiEmployee.personalHoliday)
      : '휴무 없음',
    // color는 API 응답에 없으므로 undefined (컴포넌트에서 필요 시 생성)
    color: undefined,
  };
}

// ============================================
// 매장 (Store) 변환
// ============================================

/**
 * 백엔드 API 매장 응답 형식 타입
 */
export interface ApiStore {
  id: number;
  name: string;
  businessType: string;
  address?: string;
  openTime?: string;
  closeTime?: string;
  storeHoliday?: string;
  ownerId: number;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 백엔드 API 매장 요청 형식 타입
 * 
 * 주의: API는 openTime, closeTime을 사용하지만, 프론트엔드는 openingTime, closingTime을 사용
 * 변환 함수에서 자동으로 필드명 변환됨
 */
export interface ApiStoreRequest {
  name: string;
  businessType: string;
  openTime?: string; // API는 openTime 사용 (openingTime 아님)
  closeTime?: string; // API는 closeTime 사용 (closingTime 아님)
  storeHoliday?: string | null;
}

/**
 * 프론트엔드 Store → 백엔드 API 요청 형식 변환
 * 
 * 필드명 변환:
 * - openingTime → openTime
 * - closingTime → closeTime
 * - weeklyHoliday → storeHoliday (한글 요일 → 영문 요일)
 * 
 * 시간 형식 변환:
 * - 프론트엔드: "HH:mm" 형식 (예: "09:00")
 * - API: "HH:mm:ss" 형식 (예: "09:00:00")
 */
export function storeToApiFormat(store: Store): ApiStoreRequest {
  // 시간 형식 변환: "HH:mm" → "HH:mm:00" (이미 ":00"이 포함되어 있으면 그대로 사용)
  const formatTimeForApi = (time: string | undefined): string | undefined => {
    if (!time) return undefined;
    // 이미 "HH:mm:ss" 형식인 경우 그대로 반환
    if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return time;
    }
    // "HH:mm" 형식인 경우 ":00" 추가
    if (time.match(/^\d{2}:\d{2}$/)) {
      return `${time}:00`;
    }
    // 그 외의 경우 그대로 반환 (백엔드에서 validation 처리)
    return time;
  };

  return {
    name: store.name,
    businessType: store.businessType,
    openTime: formatTimeForApi(store.openingTime),
    closeTime: formatTimeForApi(store.closingTime),
    storeHoliday: store.weeklyHoliday && store.weeklyHoliday !== '휴무 없음'
      ? dayToEnglish(store.weeklyHoliday)
      : null,
  };
}

/**
 * 백엔드 API 응답 → 프론트엔드 Store 형식 변환
 */
export function apiStoreToFrontend(apiStore: ApiStore): Store {
  return {
    name: apiStore.name,
    businessType: apiStore.businessType,
    openingTime: apiStore.openTime || '',
    closingTime: apiStore.closeTime || '',
    weeklyHoliday: apiStore.storeHoliday 
      ? englishToDay(apiStore.storeHoliday)
      : '휴무 없음',
  };
}

// ============================================
// 인증 (Auth) 관련 타입
// ============================================

/**
 * 회원가입 요청 타입
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  isAgreedToTerms: boolean;
}

/**
 * 회원가입 응답 타입
 * 
 * 주의: accessToken, refreshToken은 HttpOnly Cookie로 설정되므로
 * 응답 본문에 포함되지 않습니다.
 */
export interface SignupResponse {
  ownerId: number;
  email: string;
  // accessToken, refreshToken은 HttpOnly Cookie로 설정됨 (응답 본문에 없음)
  // tokenType, expiresIn도 백엔드에서 제거될 수 있음
}

/**
 * 로그인 요청 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 로그인 응답 타입
 * 
 * 주의: accessToken, refreshToken은 HttpOnly Cookie로 설정되므로
 * 응답 본문에 포함되지 않습니다.
 */
export interface LoginResponse {
  ownerId: number;
  email: string;
  // accessToken, refreshToken은 HttpOnly Cookie로 설정됨 (응답 본문에 없음)
  // tokenType, expiresIn도 백엔드에서 제거될 수 있음
}

// ============================================
// 사용자 (Owner) 프로필 관련 타입
// ============================================

/**
 * 사용자 프로필 응답 타입
 */
export interface ApiOwnerProfile {
  ownerId: number;
  email: string;
  name?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 사용자 프로필 수정 요청 타입
 */
export interface UpdateOwnerProfileRequest {
  name?: string;
  phone?: string;
}

// ============================================
// 스케줄 (Schedule) 관련 타입
// ============================================

/**
 * 백엔드 스케줄 응답 타입
 * 
 * 참고: 백엔드 작업 계획서 확인 결과, status는 'DRAFT', 'PUBLISHED', 'ARCHIVED'를 사용
 * 'SENT'는 사용하지 않으므로 'ARCHIVED'로 변경
 */
export interface ApiSchedule {
  id: number;
  weekStartDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  storeId: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 타입 alias (하위 호환성을 위해 유지)
 * @deprecated ApiSchedule 사용 권장
 */
export type ScheduleResponseDto = ApiSchedule;

/**
 * 스케줄 상세 조회 응답 타입
 * 백엔드 작업 계획서(`INTG-BE-Phase6-schedule-edit.md`) 참고
 */
export interface ScheduleDetailResponseDto {
  id: number;
  weekStartDate: string; // "yyyy-MM-dd" 형식
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  storeId: number;
  shifts: ShiftDto[]; // Shift 정보 배열
  createdAt: string; // ISO 8601 형식
  updatedAt: string; // ISO 8601 형식
}

/**
 * Shift 응답 타입
 */
export interface ShiftDto {
  id: number; // Shift ID (필요 시 사용)
  employeeId: number; // 직원 ID
  date: string; // "yyyy-MM-dd" 형식
  startTime: string; // "HH:mm:ss" 형식
  endTime: string; // "HH:mm:ss" 형식
}

/**
 * 스케줄 수정 요청 타입
 * 백엔드 작업 계획서(`INTG-BE-Phase6-schedule-edit.md`) 참고
 */
export interface UpdateScheduleRequestDto {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; // 선택적, 기본값은 DRAFT
  shifts: ShiftRequestDto[]; // 현재 주차의 모든 Shift 정보 (Full Replace 방식)
}

/**
 * Shift 요청 타입
 */
export interface ShiftRequestDto {
  employeeId: number; // 직원 ID (필수)
  date: string; // "yyyy-MM-dd" 형식 (필수)
  startTime: string; // "HH:mm:ss" 형식 (필수)
  endTime: string; // "HH:mm:ss" 형식 (필수)
  // 주의: id 필드는 없음 (새로 생성되는 Shift는 id 불필요)
}
