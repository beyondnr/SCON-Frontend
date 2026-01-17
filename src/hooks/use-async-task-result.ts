/**
 * [Script Purpose]
 * 비동기 작업 결과 조회 Hook
 * - 완료된 비동기 작업의 결과 데이터 조회
 * - 로딩 상태 및 에러 처리
 */

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

/**
 * 비동기 작업 결과 조회 Hook
 * 
 * @template T - 결과 데이터 타입
 * @returns 결과 데이터 및 조회 함수
 */
export function useAsyncTaskResult<T>() {
  const [result, setResult] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  /**
   * 작업 결과 조회
   * 
   * @param taskId - 작업 ID
   * @returns 결과 데이터
   */
  const fetchTaskResult = useCallback(async (taskId: string): Promise<T> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.get<T>(`/v1/tasks/${taskId}/result`);
      setResult(response.data);
      return response.data;
    } catch (error) {
      const err = error as Error;
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    result,
    isLoading,
    error,
    fetchTaskResult,
  };
}
