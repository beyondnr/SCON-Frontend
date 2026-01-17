/**
 * [Script Purpose]
 * API Request/Response Logging Utility
 * 
 * 프론트엔드의 모든 API 요청/응답을 체계적으로 로깅하기 위한 유틸리티
 * - logFrontendRequest: 프론트엔드 요청 로깅
 * - logFrontendResponse: 프론트엔드 응답 로깅
 * - logFrontendError: 프론트엔드 에러 로깅
 * 
 * 환경 변수 기반 온오프 제어 및 민감 정보 마스킹 지원
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { clientEnv } from './env';

// 환경 변수 기반 로거 활성화 여부 (env.ts에서 검증된 값 사용)
const ENABLE_REQUEST_LOGGING = clientEnv.NEXT_PUBLIC_ENABLE_API_REQUEST_LOGGING === 'true';
const ENABLE_RESPONSE_LOGGING = clientEnv.NEXT_PUBLIC_ENABLE_API_RESPONSE_LOGGING === 'true';

// 개발 환경에서는 기본적으로 활성화
const isDevelopment = process.env.NODE_ENV === 'development';
const shouldLogRequest = isDevelopment || ENABLE_REQUEST_LOGGING;
const shouldLogResponse = isDevelopment || ENABLE_RESPONSE_LOGGING;

/**
 * 민감 정보를 마스킹한 객체 반환
 * 참고: 기존 logger.ts의 sanitizeData()와 유사한 로직이나, 
 * API 로깅 전용으로 독립 구현 (기존 logger.ts는 Record<string, unknown>만 처리)
 */
function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data as Record<string, unknown> };
  const sensitiveKeys = ['password', 'accessToken', 'refreshToken', 'token'];

  sensitiveKeys.forEach(key => {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * 헤더에서 민감 정보 제거
 * 참고: 현재 프로젝트는 HttpOnly Cookie 사용으로 Authorization 헤더는 없을 수 있음
 * 하지만 향후 변경 대비 및 방어적 프로그래밍을 위해 유지
 */
function sanitizeHeaders(headers?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!headers) return headers;

  const sanitized = { ...headers };
  const sensitiveHeaders = ['authorization', 'Authorization', 'cookie', 'Cookie'];

  sensitiveHeaders.forEach(key => {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * 프론트엔드 요청 로깅
 */
export function logFrontendRequest(config: AxiosRequestConfig): void {
  if (!shouldLogRequest) return;

  const logData = {
    timestamp: new Date().toISOString(),
    type: 'FRONTEND_REQUEST',
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL || ''}${config.url || ''}`,
    headers: sanitizeHeaders(config.headers as Record<string, unknown>),
    params: config.params,
    data: sanitizeData(config.data),
  };

  console.log('[API Request]', JSON.stringify(logData, null, 2));
}

/**
 * 프론트엔드 응답 로깅
 */
export function logFrontendResponse(
  response: AxiosResponse,
  duration?: number
): void {
  if (!shouldLogResponse) return;

  const logData = {
    timestamp: new Date().toISOString(),
    type: 'FRONTEND_RESPONSE',
    status: response.status,
    statusText: response.statusText,
    method: response.config.method?.toUpperCase(),
    url: response.config.url,
    fullURL: `${response.config.baseURL || ''}${response.config.url || ''}`,
    headers: sanitizeHeaders(response.headers as Record<string, unknown>),
    data: sanitizeData(response.data),
    duration: duration ? `${duration}ms` : undefined,
  };

  console.log('[API Response]', JSON.stringify(logData, null, 2));
}

/**
 * 프론트엔드 에러 로깅
 * 에러는 항상 로깅 (프로덕션에서도)
 */
export function logFrontendError(error: AxiosError): void {
  const logData = {
    timestamp: new Date().toISOString(),
    type: 'FRONTEND_ERROR',
    status: error.response?.status,
    statusText: error.response?.statusText,
    method: error.config?.method?.toUpperCase(),
    url: error.config?.url,
    fullURL: error.config 
      ? `${error.config.baseURL || ''}${error.config.url || ''}` 
      : undefined,
    errorMessage: error.message,
    responseData: error.response?.data ? sanitizeData(error.response.data) : undefined,
  };

  console.error('[API Error]', JSON.stringify(logData, null, 2));
}
