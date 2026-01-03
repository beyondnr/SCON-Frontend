/**
 * [Script Purpose]
 * 환경 변수 기반 로깅 제어 유틸리티
 * - 개발 환경에서만 디버그 로그 출력
 * - 프로덕션에서는 모든 로그 제거
 * - 민감 정보(비밀번호, 토큰)는 절대 로그하지 않음
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * 민감 정보를 제거한 데이터 반환
 */
function sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...data };
  const sensitiveKeys = ['password', 'accessToken', 'refreshToken', 'token', 'authorization'];
  
  sensitiveKeys.forEach(key => {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * 로거 유틸리티
 */
export const logger = {
  /**
   * 디버그 로그 (개발 환경에서만)
   */
  debug: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data ? sanitizeData(data) : '');
    }
  },
  
  /**
   * 정보 로그 (개발 환경에서만)
   */
  info: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data ? sanitizeData(data) : '');
    }
  },
  
  /**
   * 에러 로그 (프로덕션에서도 출력)
   */
  error: (message: string, error?: unknown) => {
    // 에러는 항상 로그 (프로덕션에서도)
    console.error(`[ERROR] ${message}`, error);
  },
  
  /**
   * 경고 로그 (개발 환경에서만)
   */
  warn: (message: string, data?: Record<string, unknown>) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data ? sanitizeData(data) : '');
    }
  },
};

