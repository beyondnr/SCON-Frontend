/**
 * [Script Purpose]
 * 환경 변수 검증 및 타입 안정성 보장
 * - Zod를 사용한 환경 변수 스키마 검증
 * - 타입 안전한 환경 변수 접근 제공
 * - 누락된 필수 환경 변수 시 명시적 에러 발생
 */

import { z } from 'zod';

/**
 * 클라이언트 사이드에서 접근 가능한 환경 변수 스키마
 * NEXT_PUBLIC_* 접두사가 붙은 변수만 클라이언트에서 접근 가능
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z
    .string()
    .url('NEXT_PUBLIC_API_BASE_URL은 유효한 URL이어야 합니다.')
    .default('http://localhost:8080'),
});

/**
 * 서버 사이드 전용 환경 변수 스키마
 * NEXT_PUBLIC_* 접두사가 없는 변수는 서버에서만 접근 가능
 */
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      errorMap: () => ({ message: 'NODE_ENV는 development, production, test 중 하나여야 합니다.' }),
    })
    .default('development'),
});

/**
 * 클라이언트 환경 변수 타입
 */
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * 서버 환경 변수 타입
 */
export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * 클라이언트 환경 변수 검증 및 반환
 * 클라이언트 사이드에서만 사용 (NEXT_PUBLIC_* 변수)
 * 
 * @throws {Error} 필수 환경 변수가 누락되거나 유효하지 않은 경우
 * @returns 검증된 클라이언트 환경 변수 객체
 */
export function getClientEnv(): ClientEnv {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`환경 변수 검증 실패:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * 서버 환경 변수 검증 및 반환
 * 서버 사이드에서만 사용
 * 
 * @throws {Error} 필수 환경 변수가 누락되거나 유효하지 않은 경우
 * @returns 검증된 서버 환경 변수 객체
 */
export function getServerEnv(): ServerEnv {
  try {
    return serverEnvSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`서버 환경 변수 검증 실패:\n${errorMessages}`);
    }
    throw error;
  }
}

/**
 * 클라이언트 환경 변수 (검증된 값)
 * 빌드 타임에 검증되므로 안전하게 사용 가능
 */
export const clientEnv = getClientEnv();

/**
 * 서버 환경 변수 (검증된 값)
 * 서버 사이드에서만 접근 가능
 */
export const serverEnv = typeof window === 'undefined' ? getServerEnv() : null;

