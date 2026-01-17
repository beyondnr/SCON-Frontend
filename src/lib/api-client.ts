/**
 * [Script Purpose]
 * 중앙화된 API 클라이언트
 * - 백엔드 API 호출 통합 관리
 * - 토큰 자동 추가 (요청 인터셉터)
 * - 에러 처리 자동화 (응답 인터셉터)
 * - ApiResponse<T> 래퍼 자동 처리
 */

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { ulid } from 'ulid';
import { toast } from '@/hooks/use-toast';
import { clearAuthTokens } from './local-storage-utils';
import { getUserFriendlyMessage } from './error-messages';
import { clientEnv } from './env';
import { logRequest, logResponse, logError } from './apiLogger';
import type { ApiResponse, ApiError, FieldError } from './types';

// API 클라이언트 인스턴스 생성
const apiClient = axios.create({
  baseURL: '/api', // 프록시 사용 시 상대 경로
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // HttpOnly Cookie 자동 전송
  timeout: 30000, // 30초 타임아웃
});

// 인증이 필요 없는 공개 API 경로 목록
const PUBLIC_API_PATHS = [
  '/v1/auth/signup',
  '/v1/auth/login',
  '/v1/auth/refresh',
  '/health',
];

/**
 * 해당 경로가 공개 API인지 확인
 */
function isPublicPath(url: string | undefined): boolean {
  if (!url) return false;
  return PUBLIC_API_PATHS.some(path => url.startsWith(path));
}

// 요청 인터셉터: HttpOnly Cookie는 자동으로 전송되므로 별도 처리 불필요
// 공개 API의 경우에도 쿠키는 전송되지만, 백엔드에서 무시하므로 문제없음
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 요청 시작 시간 저장 (응답 시간 계산용)
    (config as any)._startTime = Date.now();
    
    // ULID 기반 Request ID 생성 및 헤더 추가
    // ULID는 시간 정보를 포함하므로 정렬에 유리함
    const requestId = ulid();
    // 헤더 설정 (타입 안정성을 위해 set 메서드 사용)
    config.headers.set('X-Request-ID', requestId);
    
    // Request ID를 config에 저장 (로깅 시 사용)
    (config as any)._requestId = requestId;
    
    // API 요청 로깅 (Request ID가 포함된 config 전달)
    logRequest(config);
    
    // HttpOnly Cookie는 withCredentials: true로 자동 전송됨
    // Authorization 헤더는 백엔드에서 쿠키를 읽어 처리하므로 프론트엔드에서 설정 불필요
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: API 응답 형식 처리 및 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown> | unknown>) => {
    // 응답 시간 계산
    const startTime = (response.config as any)._startTime;
    const duration = startTime ? Date.now() - startTime : 0;
    
    // API 응답 로깅
    logResponse(response, duration);
    
    // ApiResponse<T> 래퍼 처리
    // 대부분의 API는 { status, message, data, timestamp } 형식
    // 예: { status: 201, message: "...", data: { ownerId: 1, email: "..." }, timestamp: "..." }
    // 처리 후: response.data = { ownerId: 1, email: "..." }
    // 따라서 컴포넌트에서는 signupResponse.data?.ownerId로 직접 접근 가능
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      const apiResponse = response.data as ApiResponse<unknown>;
      return { ...response, data: apiResponse.data };
    }
    // 스케줄 조회 API 등은 배열을 직접 반환 (ApiResponse 래퍼 없음)
    // 예: 월간 스케줄 조회 API는 ApiSchedule[] 배열을 직접 반환
    // 이 경우 response.data는 이미 배열이므로 그대로 반환
    return response;
  },
  async (error: AxiosError<ApiError | string>) => {
    // 응답 시간 계산 (가능한 경우)
    const startTime = error.config ? (error.config as any)._startTime : undefined;
    const duration = startTime ? Date.now() - startTime : undefined;
    
    // API 에러 로깅 (try-catch로 보호하여 로깅 실패가 에러 처리에 영향 없도록)
    try {
      logError(error, duration);
    } catch (logError) {
      // 로깅 실패 시에도 기존 에러 처리 로직은 정상 실행
      console.error('[API Logger Error] Failed to log error:', logError);
    }
    
    const status = error.response?.status;
    const responseData = error.response?.data as ApiError | string | undefined;
    
    // 에러 메시지 추출
    let errorMessage = '알 수 없는 오류가 발생했습니다.';
    if (responseData && typeof responseData === 'object' && 'message' in responseData) {
      const apiError = responseData as ApiError;
      errorMessage = getUserFriendlyMessage(apiError.message || apiError.error || errorMessage);
    } else if (typeof responseData === 'string') {
      errorMessage = getUserFriendlyMessage(responseData);
    }

    // 400 Bad Request
    if (status === 400) {
      const apiError = responseData as ApiError | undefined;
      const fieldErrors = apiError?.fieldErrors;
      if (fieldErrors && fieldErrors.length > 0) {
        const firstError = fieldErrors[0];
        toast({
          title: '입력 오류',
          description: `${firstError.field}: ${firstError.message}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: '요청 오류',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
    // 401 Unauthorized - 토큰 갱신 시도
    else if (status === 401) {
      const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
      
      // 토큰 갱신 시도 (원래 요청이 있고, 아직 재시도하지 않은 경우)
      const retryKey = '_retry' as keyof InternalAxiosRequestConfig;
      if (originalRequest && !(originalRequest as any)[retryKey]) {
        (originalRequest as any)[retryKey] = true;
        
        try {
          // Refresh Token은 HttpOnly Cookie에 저장되어 있으므로 자동 전송됨
          // 백엔드에서 쿠키의 refreshToken을 읽어 새 accessToken을 쿠키로 설정
          await axios.post(
            '/api/v1/auth/refresh',
            {}, // 요청 본문 불필요 (쿠키에서 refreshToken 읽음)
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Request-ID': ulid(), // 토큰 갱신 요청에도 Request ID 추가
              },
              withCredentials: true, // 쿠키 자동 전송
            }
          );
          
          // 새 토큰은 쿠키로 설정되므로, 원래 요청 재시도
          return apiClient(originalRequest);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그아웃 처리
          clearAuthTokens();
          toast({
            title: '세션 만료',
            description: '로그인 세션이 만료되었습니다. 다시 로그인해주세요.',
            variant: 'destructive',
          });
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        }
      }
      
      // 토큰 갱신 불가능한 경우 로그인 페이지로 리다이렉트
      toast({
        title: '인증 필요',
        description: '로그인이 필요합니다.',
        variant: 'destructive',
      });
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    // 403 Forbidden
    else if (status === 403) {
      // 에러 메시지 추출 (리소스별 메시지가 있으면 사용)
      const forbiddenMessage = errorMessage || '해당 리소스에 대한 접근 권한이 없습니다.';
      
      toast({
        title: '권한 없음',
        description: forbiddenMessage,
        variant: 'destructive',
      });
      
      // 매장 목록으로 리다이렉트 (2초 후)
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          // 현재 경로가 매장 관련 페이지인 경우에만 리다이렉트
          const currentPath = window.location.pathname;
          if (currentPath.includes('/stores') || 
              currentPath.includes('/dashboard') || 
              currentPath.includes('/settings') || 
              currentPath.includes('/reports')) {
            window.location.href = '/dashboard';
          }
        }, 2000);
      }
      
      // 에러 객체에 타입 정보 추가 (컴포넌트에서 사용 가능)
      (error as AxiosError & { errorType?: string }).errorType = 'FORBIDDEN';
    }
    // 404 Not Found
    else if (status === 404) {
      toast({
        title: '리소스 없음',
        description: '요청한 리소스를 찾을 수 없습니다.',
        variant: 'destructive',
      });
    }
    // 500 Internal Server Error
    else if (status && status >= 500) {
      // 백엔드 서버 연결 확인을 위한 상세 메시지
      const backendUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL;
      toast({
        title: '서버 오류',
        description: `서버 오류가 발생했습니다. 백엔드 서버(${backendUrl})가 실행 중인지 확인해주세요.`,
        variant: 'destructive',
      });
    }
    // 네트워크 에러 (서버 연결 불가)
    else if (!error.response) {
      const backendUrl = clientEnv.NEXT_PUBLIC_API_BASE_URL;
      toast({
        title: '네트워크 오류',
        description: `서버에 연결할 수 없습니다. 백엔드 서버(${backendUrl})가 실행 중인지 확인해주세요.`,
        variant: 'destructive',
      });
    }
    // 기타 에러
    else {
      toast({
        title: '오류 발생',
        description: errorMessage,
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;

