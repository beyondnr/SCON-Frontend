/**
 * [Script Purpose]
 * localStorage 기반 데이터 영속성 유틸리티
 * 백엔드 연동 전 프론트엔드 단독 테스트를 위한 로컬 스토리지 관리
 */

import { Employee, Store } from "./types";

// localStorage 키 상수
export const STORAGE_KEYS = {
  EMPLOYEES: "scon_employees",
  STORE: "scon_store",
  ONBOARDING_COMPLETED: "scon_onboarding_completed",
  CURRENT_STORE_ID: "currentStoreId",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

/**
 * 직원 목록을 localStorage에서 로드
 */
export function loadEmployees(): Employee[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
    if (!stored) return [];
    return JSON.parse(stored) as Employee[];
  } catch (error) {
    console.error("Failed to load employees from localStorage:", error);
    return [];
  }
}

/**
 * 직원 목록을 localStorage에 저장
 */
export function saveEmployees(employees: Employee[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
  } catch (error) {
    console.error("Failed to save employees to localStorage:", error);
  }
}

/**
 * 매장 정보를 localStorage에서 로드
 */
export function loadStore(): Store | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STORE);
    if (!stored) return null;
    return JSON.parse(stored) as Store;
  } catch (error) {
    console.error("Failed to load store from localStorage:", error);
    return null;
  }
}

/**
 * 매장 정보를 localStorage에 저장
 */
export function saveStore(store: Store): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.STORE, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save store to localStorage:", error);
  }
}

/**
 * 온보딩 완료 여부 확인
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return stored === "true";
  } catch (error) {
    console.error("Failed to check onboarding status:", error);
    return false;
  }
}

/**
 * 온보딩 완료 상태 설정
 */
export function setOnboardingCompleted(completed: boolean): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, String(completed));
  } catch (error) {
    console.error("Failed to set onboarding status:", error);
  }
}

/**
 * 현재 매장 ID 가져오기
 */
export function getCurrentStoreId(): string | null {
  if (typeof window === "undefined") return null;
  
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_STORE_ID);
  } catch (error) {
    console.error("Failed to get current store ID:", error);
    return null;
  }
}

/**
 * storeId 유효성 검증
 * @param storeId - 검증할 storeId (string 또는 number)
 * @returns 유효한 경우 number, 유효하지 않은 경우 null
 */
export function validateStoreId(storeId: string | number | null | undefined): number | null {
  if (!storeId) return null;
  
  const id = typeof storeId === 'string' ? Number(storeId) : storeId;
  
  if (isNaN(id) || id <= 0) {
    return null;
  }
  
  return id;
}

/**
 * 현재 매장 ID 설정
 */
export function setCurrentStoreId(storeId: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_STORE_ID, storeId);
  } catch (error) {
    console.error("Failed to set current store ID:", error);
  }
}

/**
 * 액세스 토큰 가져오기
 * 
 * @deprecated HttpOnly Cookie 방식을 사용하므로 이 함수는 더 이상 사용되지 않습니다.
 * 토큰은 백엔드에서 HttpOnly Cookie로 설정되며, JavaScript로 접근할 수 없습니다.
 * 하위 호환성을 위해 유지되지만, 실제로는 항상 null을 반환합니다.
 */
export function getAccessToken(): string | null {
  // HttpOnly Cookie를 사용하므로 localStorage에서 토큰을 읽을 수 없음
  // 하위 호환성을 위해 null 반환
  return null;
}

/**
 * 액세스 토큰 설정
 * 
 * @deprecated HttpOnly Cookie 방식을 사용하므로 이 함수는 더 이상 사용되지 않습니다.
 * 토큰은 백엔드에서 HttpOnly Cookie로 설정됩니다.
 * 하위 호환성을 위해 유지되지만, 실제로는 아무 작업도 수행하지 않습니다.
 */
export function setAccessToken(token: string): void {
  // HttpOnly Cookie를 사용하므로 localStorage에 토큰을 저장하지 않음
  // 하위 호환성을 위해 함수는 유지하지만 아무 작업도 수행하지 않음
}

/**
 * 리프레시 토큰 가져오기
 * 
 * @deprecated HttpOnly Cookie 방식을 사용하므로 이 함수는 더 이상 사용되지 않습니다.
 * 토큰은 백엔드에서 HttpOnly Cookie로 설정되며, JavaScript로 접근할 수 없습니다.
 * 하위 호환성을 위해 유지되지만, 실제로는 항상 null을 반환합니다.
 */
export function getRefreshToken(): string | null {
  // HttpOnly Cookie를 사용하므로 localStorage에서 토큰을 읽을 수 없음
  // 하위 호환성을 위해 null 반환
  return null;
}

/**
 * 리프레시 토큰 설정
 * 
 * @deprecated HttpOnly Cookie 방식을 사용하므로 이 함수는 더 이상 사용되지 않습니다.
 * 토큰은 백엔드에서 HttpOnly Cookie로 설정됩니다.
 * 하위 호환성을 위해 유지되지만, 실제로는 아무 작업도 수행하지 않습니다.
 */
export function setRefreshToken(token: string): void {
  // HttpOnly Cookie를 사용하므로 localStorage에 토큰을 저장하지 않음
  // 하위 호환성을 위해 함수는 유지하지만 아무 작업도 수행하지 않음
}

/**
 * 모든 인증 토큰 삭제 (로그아웃 시 사용)
 * 
 * 주의: HttpOnly Cookie를 사용하는 경우, 쿠키는 백엔드에서 삭제해야 합니다.
 * 이 함수는 localStorage의 토큰만 삭제하며, 쿠키 삭제는 백엔드 로그아웃 API에서 처리됩니다.
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  
  try {
    // localStorage의 토큰 삭제 (혹시 남아있을 수 있는 경우 대비)
    // HttpOnly Cookie는 백엔드에서 삭제되므로 클라이언트에서 직접 삭제 불가
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch (error) {
    console.error("Failed to clear auth tokens:", error);
  }
}

/**
 * 테스트 초기화: 모든 SCON 관련 데이터 삭제
 */
export function clearAllSconData(): void {
  if (typeof window === "undefined") return;
  
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear SCON data:", error);
  }
}

