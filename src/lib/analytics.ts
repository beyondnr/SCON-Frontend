/**
 * [Script Purpose]
 * Google Analytics 4 (GA4) 이벤트 추적 유틸리티
 * 
 * - GA4 초기화 및 설정
 * - 세션 ID 생성 및 관리
 * - 공통 매개변수 자동 추가
 * - 이벤트 및 페이지뷰 로깅
 */

'use client';

import ReactGA from 'react-ga4';
import { v4 as uuidv4 } from 'uuid';
import { clientEnv } from './env';

// GA4 초기화 여부
let isInitialized = false;

// 세션 ID 관리
let currentSessionId: string | null = null;
const SESSION_STORAGE_KEY = 'ga_session_id';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30분

/**
 * GA4 초기화
 */
export const initGA = (): void => {
  // 이미 초기화된 경우 스킵
  if (isInitialized) {
    return;
  }

  // 환경 변수 확인
  const measurementId = clientEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const enabled = clientEnv.NEXT_PUBLIC_GA4_ENABLED === 'true';

  if (!enabled || !measurementId) {
    console.warn('[GA4] GA4 is disabled or measurement ID is not set');
    return;
  }

  try {
    ReactGA.initialize(measurementId, {
      testMode: process.env.NODE_ENV === 'development', // 개발 환경에서는 테스트 모드
    });

    // 세션 ID 복원 또는 생성
    currentSessionId = getOrCreateSessionId();

    isInitialized = true;
    console.log('[GA4] Initialized successfully');
  } catch (error) {
    console.error('[GA4] Failed to initialize:', error);
  }
};

/**
 * 세션 ID 가져오기 또는 생성
 */
export const getOrCreateSessionId = (): string => {
  // 브라우저 환경 확인
  if (typeof window === 'undefined') {
    return `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
  }

  // 기존 세션 ID 확인 (sessionStorage)
  const storedSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
  const storedTimestamp = sessionStorage.getItem(`${SESSION_STORAGE_KEY}_timestamp`);

  if (storedSessionId && storedTimestamp) {
    const timestamp = parseInt(storedTimestamp, 10);
    const now = Date.now();

    // 세션 타임아웃 확인 (30분)
    if (now - timestamp < SESSION_TIMEOUT_MS) {
      currentSessionId = storedSessionId;
      return storedSessionId;
    }
  }

  // 새 세션 ID 생성
  const newSessionId = `session_${Date.now()}_${uuidv4().slice(0, 8)}`;
  sessionStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
  sessionStorage.setItem(`${SESSION_STORAGE_KEY}_timestamp`, Date.now().toString());

  currentSessionId = newSessionId;
  return newSessionId;
};

/**
 * 사용자 ID 가져오기 (로그인 상태에서만)
 * 
 * ⚠️ 중요: SCON 프로젝트는 HttpOnly Cookie 인증을 사용하므로
 * localStorage에서 user_id를 직접 읽을 수 없음.
 * API 응답에서 ownerId를 받아 setUserId()로 설정한 후 사용.
 */
const getUserId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  // HttpOnly Cookie 사용으로 인해 API 응답에서 받은 ownerId를
  // localStorage에 저장하여 사용 (setUserId() 함수 참고)
  return localStorage.getItem('ga_user_id') || null;
};

/**
 * 매장 ID 가져오기
 * 
 * ⚠️ 중요: SCON 프로젝트의 local-storage-utils.ts에서
 * CURRENT_STORE_ID 키로 관리되므로 동일한 키 사용
 */
const getStoreId = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  // local-storage-utils.ts의 STORAGE_KEYS.CURRENT_STORE_ID와 동일
  return localStorage.getItem('currentStoreId') || null;
};

/**
 * 공통 매개변수 자동 추가
 */
const addCommonParameters = (parameters: Record<string, any>): Record<string, any> => {
  const userId = getUserId();
  const storeId = getStoreId();
  const sessionId = getOrCreateSessionId();

  return {
    session_id: sessionId,
    ...(userId && { user_id: userId }),
    ...(storeId && { store_id: storeId }),
    ...parameters,
  };
};

/**
 * 이벤트 로깅
 */
export const logEvent = (
  eventName: string,
  parameters: Record<string, any> = {}
): void => {
  if (!isInitialized) {
    console.warn('[GA4] GA4 is not initialized. Call initGA() first.');
    return;
  }

  try {
    const enrichedParameters = addCommonParameters(parameters);
    ReactGA.event(eventName, enrichedParameters);
    
    // 개발 환경에서만 콘솔 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Event logged:', eventName, enrichedParameters);
    }
  } catch (error) {
    console.error('[GA4] Failed to log event:', eventName, error);
  }
};

/**
 * 페이지뷰 로깅
 */
export const logPageView = (path: string, title?: string): void => {
  if (!isInitialized) {
    console.warn('[GA4] GA4 is not initialized. Call initGA() first.');
    return;
  }

  try {
    ReactGA.send({
      hitType: 'pageview',
      page: path,
      title: title || (typeof document !== 'undefined' ? document.title : ''),
      ...addCommonParameters({}),
    });

    // 개발 환경에서만 콘솔 로그 출력
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA4] Pageview logged:', path, title);
    }
  } catch (error) {
    console.error('[GA4] Failed to log pageview:', path, error);
  }
};

/**
 * 사용자 ID 설정 (로그인 시)
 * 
 * ⚠️ 중요: HttpOnly Cookie 인증 사용으로 API 응답에서 ownerId 추출 필요
 * 
 * @param userId - API 응답에서 받은 ownerId (number 또는 string)
 */
export const setUserId = (userId: string | number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const userIdString = String(userId);
  // GA4 전용 키 사용 (기존 인증 시스템과 분리)
  localStorage.setItem('ga_user_id', userIdString);
  
  if (isInitialized) {
    ReactGA.set({ user_id: userIdString });
  }
};

/**
 * 사용자 ID 제거 (로그아웃 시)
 */
export const clearUserId = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('ga_user_id');
  
  if (isInitialized) {
    ReactGA.set({ user_id: null });
  }
};

/**
 * 매장 ID 설정 (온보딩 완료 시)
 * 
 * ⚠️ 중요: local-storage-utils.ts의 setCurrentStoreId()와 동일한 키 사용
 * 이 함수는 GA4 전용이지만, 기존 시스템과 일관성을 위해 동일한 키 사용
 */
export const setStoreId = (storeId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  // local-storage-utils.ts의 STORAGE_KEYS.CURRENT_STORE_ID와 동일
  localStorage.setItem('currentStoreId', storeId);
};
