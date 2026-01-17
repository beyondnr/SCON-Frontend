/**
 * [Script Purpose]
 * API Logger Utility
 * 
 * Provides clean, grouped console logging for API requests, responses, and errors
 * - logRequest: Log API request details
 * - logResponse: Log API response with duration
 * - logError: Log API error with optional duration
 * 
 * Environment variable control: NEXT_PUBLIC_ENABLE_API_LOGGING
 * - Development: Enabled by default
 * - Production: Disabled by default
 */

import type { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Environment variable control
const ENABLE_LOGGING = process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';

// Enable logging if explicitly set to true OR in development mode (unless explicitly disabled)
const shouldLog = isDevelopment || ENABLE_LOGGING;

/**
 * Sanitize sensitive data from request/response
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
 * Sanitize sensitive headers
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
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Log API Request
 * 
 * @param config - Axios request config
 */
export function logRequest(config: AxiosRequestConfig): void {
  if (!shouldLog) return;

  const method = (config.method?.toUpperCase() || 'GET').padEnd(7);
  const url = config.url || '';
  const fullURL = `${config.baseURL || ''}${url}`;
  // Request ID를 config._requestId에서 먼저 읽고, 없으면 헤더에서 읽기
  const requestId = (config as any)._requestId || 
    (config.headers && typeof config.headers.get === 'function' 
      ? config.headers.get('X-Request-ID') 
      : (config.headers as Record<string, unknown>)?.['X-Request-ID']) || 'N/A';
  const groupTitle = `${method} ${fullURL} [${requestId}]`;

  console.groupCollapsed(`🚀 ${groupTitle}`);
  console.log('📤 Request:', {
    requestId, // Request ID 추가
    method: config.method?.toUpperCase(),
    url: fullURL,
    headers: sanitizeHeaders(config.headers as Record<string, unknown>),
    params: config.params,
    data: sanitizeData(config.data),
  });
  console.groupEnd();
}

/**
 * Log API Response
 * 
 * @param response - Axios response
 * @param duration - Request duration in milliseconds
 */
export function logResponse(response: AxiosResponse, duration: number): void {
  if (!shouldLog) return;

  const method = (response.config.method?.toUpperCase() || 'GET').padEnd(7);
  const url = response.config.url || '';
  const fullURL = `${response.config.baseURL || ''}${url}`;
  const status = response.status;
  const statusIcon = status >= 200 && status < 300 ? '✅' : '⚠️';
  // Request ID를 config._requestId에서 먼저 읽고, 없으면 헤더에서 읽기
  const requestId = (response.config as any)._requestId || 
    (response.config.headers && typeof response.config.headers.get === 'function'
      ? response.config.headers.get('X-Request-ID')
      : (response.config.headers as Record<string, unknown>)?.['X-Request-ID']) || 'N/A';
  const groupTitle = `${method} ${fullURL} [${requestId}]`;

  console.groupCollapsed(`${statusIcon} ${groupTitle} ${status} (${formatDuration(duration)})`);
  console.log('📥 Response:', {
    requestId, // Request ID 추가
    status,
    statusText: response.statusText,
    duration: formatDuration(duration),
    headers: sanitizeHeaders(response.headers as Record<string, unknown>),
    data: sanitizeData(response.data),
  });
  console.groupEnd();
}

/**
 * Log API Error
 * 
 * @param error - Axios error
 * @param duration - Optional request duration in milliseconds
 */
export function logError(error: AxiosError, duration?: number): void {
  if (!shouldLog) return;

  const method = (error.config?.method?.toUpperCase() || 'UNKNOWN').padEnd(7);
  const url = error.config?.url || 'UNKNOWN';
  const fullURL = error.config 
    ? `${error.config.baseURL || ''}${url}` 
    : 'UNKNOWN';
  const status = error.response?.status;
  const statusIcon = '❌';
  const durationText = duration ? ` (${formatDuration(duration)})` : '';
  // Request ID를 config._requestId에서 먼저 읽고, 없으면 헤더에서 읽기
  const requestId = error.config 
    ? ((error.config as any)._requestId || 
      (error.config.headers && typeof error.config.headers.get === 'function'
        ? error.config.headers.get('X-Request-ID')
        : (error.config.headers as Record<string, unknown>)?.['X-Request-ID']) || 'N/A')
    : 'N/A';
  const groupTitle = `${method} ${fullURL} [${requestId}]`;

  console.group(`${statusIcon} ${groupTitle} ${status || 'NO RESPONSE'}${durationText}`);
  console.error('💥 Error:', {
    requestId, // Request ID 추가
    message: error.message,
    status,
    statusText: error.response?.statusText,
    duration: duration ? formatDuration(duration) : undefined,
    responseData: error.response?.data ? sanitizeData(error.response.data) : undefined,
  });
  console.groupEnd();
}
