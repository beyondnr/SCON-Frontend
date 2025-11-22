// File: studio/src/lib/utils.ts
/**
 * [Script Purpose]
 * 프로젝트 전반에서 사용되는 공통 유틸리티 함수들을 정의합니다.
 * 스타일 병합(Tailwind), 통화 포맷팅, 시간 포맷팅 등의 기능을 제공합니다.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * [Function Purpose]
 * Tailwind CSS 클래스와 일반 CSS 클래스를 병합합니다.
 * 조건부 클래스 적용 및 충돌 해결(tailwind-merge)을 처리합니다.
 * 
 * @param inputs - 클래스 이름들의 배열 (문자열, 객체, 배열 등)
 * @returns 병합된 클래스 문자열
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * [Function Purpose]
 * 숫자를 한국 원화(KRW) 형식의 문자열로 변환합니다.
 * 예: 10000 -> "10,000"
 * 
 * @param amount - 변환할 금액 (number)
 * @returns 포맷팅된 금액 문자열
 */
export function formatCurrency(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

/**
 * [Function Purpose]
 * "HH:mm:ss" 또는 "HH:mm" 형식의 시간 문자열을 "HH:mm" 형식으로 통일하여 반환합니다.
 * 
 * @param time - 시간 문자열 (예: "09:00:00" or "09:00")
 * @returns "HH:mm" 형식의 문자열
 */
export function formatTime(time: string): string {
  const [hour, minute] = time.split(':');
  return `${hour}:${minute}`;
}
