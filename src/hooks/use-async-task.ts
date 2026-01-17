/**
 * [Script Purpose]
 * 비동기 작업 상태 관리 및 폴링 Hook
 * - 비동기 API 작업의 진행 상태 추적
 * - 주기적인 폴링으로 작업 완료 감지
 * - 메모리 누수 방지를 위한 cleanup 처리
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AsyncTaskResponseDto } from '@/lib/api-mappers';
import apiClient from '@/lib/api-client';

interface UseAsyncTaskOptions {
  pollInterval?: number; // 기본: 1000ms
  maxPollingTime?: number; // 기본: 30000ms
  onComplete?: (result: AsyncTaskResponseDto) => void;
  onError?: (error: Error) => void;
}

/**
 * 비동기 작업 상태 관리 Hook
 * 
 * @param options - Hook 옵션
 * @returns 작업 상태 및 폴링 제어 함수
 */
export function useAsyncTask(options: UseAsyncTaskOptions = {}) {
  const {
    pollInterval = 1000,
    maxPollingTime = 30000,
    onComplete,
    onError,
  } = options;
  
  const [taskStatus, setTaskStatus] = useState<AsyncTaskResponseDto | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isMountedRef = useRef(true);
  
  /**
   * 컴포넌트 언마운트 시 cleanup
   */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingTimerRef.current) {
        clearTimeout(pollingTimerRef.current);
        pollingTimerRef.current = null;
      }
    };
  }, []);
  
  /**
   * 작업 상태 조회
   */
  const checkTaskStatus = useCallback(async (taskId: string): Promise<AsyncTaskResponseDto> => {
    const response = await apiClient.get<AsyncTaskResponseDto>(`/v1/tasks/${taskId}`);
    return response.data;
  }, []);
  
  /**
   * 폴링 시작
   */
  const startPolling = useCallback(async (taskId: string) => {
    if (!isMountedRef.current) return;
    
    setIsPolling(true);
    startTimeRef.current = Date.now();
    
    const poll = async () => {
      // 컴포넌트 언마운트 체크
      if (!isMountedRef.current) {
        if (pollingTimerRef.current) {
          clearTimeout(pollingTimerRef.current);
          pollingTimerRef.current = null;
        }
        return;
      }
      
      // 최대 대기 시간 확인
      if (startTimeRef.current && Date.now() - startTimeRef.current > maxPollingTime) {
        stopPolling();
        const error = new Error('작업 대기 시간이 초과되었습니다.');
        onError?.(error);
        return;
      }
      
      try {
        const status = await checkTaskStatus(taskId);
        
        // 컴포넌트 언마운트 체크 (비동기 작업 후)
        if (!isMountedRef.current) {
          return;
        }
        
        setTaskStatus(status);
        
        if (status.status === 'COMPLETED') {
          stopPolling();
          onComplete?.(status);
        } else if (status.status === 'FAILED') {
          stopPolling();
          const error = new Error(status.error?.message || '작업이 실패했습니다.');
          onError?.(error);
        } else if (status.status === 'IN_PROGRESS') {
          // 계속 폴링
          pollingTimerRef.current = setTimeout(poll, pollInterval);
        } else {
          // CANCELLED 등의 다른 상태
          stopPolling();
        }
      } catch (error) {
        // 컴포넌트 언마운트 체크
        if (!isMountedRef.current) {
          return;
        }
        stopPolling();
        onError?.(error as Error);
      }
    };
    
    // 첫 폴링 시작
    poll();
  }, [checkTaskStatus, pollInterval, maxPollingTime, onComplete, onError]);
  
  /**
   * 폴링 중지
   */
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearTimeout(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
    if (isMountedRef.current) {
      setIsPolling(false);
      startTimeRef.current = null;
    }
  }, []);
  
  return {
    taskStatus,
    isPolling,
    startPolling,
    stopPolling,
  };
}
