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
  openTime?: string;
  closeTime?: string;
  storeHoliday?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 백엔드 API 매장 요청 형식 타입
 */
export interface ApiStoreRequest {
  name: string;
  businessType: string;
  openingTime?: string;
  closingTime?: string;
  storeHoliday?: string | null;
}

/**
 * 프론트엔드 Store → 백엔드 API 요청 형식 변환
 */
export function storeToApiFormat(store: Store): ApiStoreRequest {
  return {
    name: store.name,
    businessType: store.businessType,
    openingTime: store.openingTime,
    closingTime: store.closingTime,
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
 */
export interface SignupResponse {
  ownerId: number;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
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
 */
export interface LoginResponse {
  ownerId: number;
  email: string;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
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
 */
export interface ApiSchedule {
  id: number;
  weekStartDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SENT';
  storeId: number;
  createdAt?: string;
  updatedAt?: string;
}

