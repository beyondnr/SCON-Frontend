// File: studio/src/lib/utils.ts
/**
 * [Script Purpose]
 * 애플리케이션 전반에서 사용되는 공통 유틸리티 함수들을 정의합니다.
 * 스타일 병합(Tailwind), 통화 포맷팅, 시간 포맷팅 등의 기능을 제공합니다.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachWeekOfInterval, addDays, format, isSameMonth } from "date-fns"
import { SHIFT_PRESETS } from "./constants"
import { Employee, TimeRange } from "./types"

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

export const EMPLOYEE_COLORS = [
  "#E07A5F", // Warm Red
  "#D4A373", // Earthy Orange
  "#F2CC8F", // Muted Yellow
  "#81B29A", // Soft Green
  "#7D8CC4", // Slate Blue
  "#A68A64", // Warm Brown
  "#BC6C25", // Terracotta
  "#E29578", // Soft Salmon
];

export function getRandomEmployeeColor(usedColors: string[] = []): string {
  // Filter out colors that are already used
  const availableColors = EMPLOYEE_COLORS.filter(color => !usedColors.includes(color));
  
  // If all colors are used, fall back to the full list (or handle as needed)
  const colorsToChooseFrom = availableColors.length > 0 ? availableColors : EMPLOYEE_COLORS;
  
  const randomIndex = Math.floor(Math.random() * colorsToChooseFrom.length);
  return colorsToChooseFrom[randomIndex];
}

/**
 * [Function Purpose]
 * 이름을 마스킹 처리합니다.
 * - 2글자: 두 번째 글자 마스킹 (예: 김철 -> 김*)
 * - 3글자 이상: 첫 글자와 마지막 글자를 제외한 가운데 글자를 '*'로 변경 (예: 홍길동 -> 홍*동, 남궁민수 -> 남**수)
 * 
 * @param name - 마스킹할 이름
 * @returns 마스킹된 이름
 */
export function maskName(name: string): string {
  if (!name || name.length <= 1) return name;
  
  if (name.length === 2) {
    return name[0] + '*';
  }
  
  const firstChar = name[0];
  const lastChar = name[name.length - 1];
  const middleLength = name.length - 2;
  
  return firstChar + '*'.repeat(middleLength) + lastChar;
}

// --- Mock Token Logic for Security Simulation ---

/**
 * Generates a mock base64 encoded JSON token.
 * In a real app, this would be a signed JWT from the server.
 */
export function generateMockToken(empId: string): string {
  const payload = {
    empId,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
    nonce: Math.random().toString(36).substring(7), // Random string
  };
  return btoa(JSON.stringify(payload));
}

/**
 * Validates a mock token.
 * Checks if it can be decoded, if it's expired, and if it has a valid structure.
 */
export function validateMockToken(token: string): { valid: boolean; empId?: string; reason?: string } {
  try {
    const decoded = JSON.parse(atob(token));
    
    if (!decoded.empId || !decoded.exp) {
      return { valid: false, reason: "Invalid token structure" };
    }

    if (Date.now() > decoded.exp) {
      return { valid: false, reason: "Token expired" };
    }

    return { valid: true, empId: decoded.empId };
  } catch (e) {
    return { valid: false, reason: "Malformed token" };
  }
}

// --- Date & Shift Utilities ---

/**
 * [Function Purpose]
 * 특정 월의 주차별 날짜 범위를 반환합니다.
 * 월요일 시작 기준으로 주를 나눕니다.
 * 
 * @param year - 연도
 * @param month - 월 (0-indexed: 0=1월, 11=12월)
 * @returns 주차별 정보 배열 ({ id, start, end, label, dates })
 */
export function getWeeksInMonth(year: number, month: number) {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));

  // 월요일 시작으로 설정 (weekStartsOn: 1)
  const weeks = eachWeekOfInterval(
    { start: monthStart, end: monthEnd },
    { weekStartsOn: 1 }
  );

  return weeks.map((weekStart, index) => {
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const dates: Date[] = [];
    let current = weekStart;
    
    // 주간 날짜 배열 생성
    while (current <= weekEnd) {
      dates.push(current);
      current = addDays(current, 1);
    }

    return {
      id: index,
      start: weekStart,
      end: weekEnd,
      label: `${index + 1}주차`,
      dates,
      // 해당 주가 현재 월에 속하는지 여부 (표시용)
      isCurrentMonth: isSameMonth(weekStart, monthStart) || isSameMonth(weekEnd, monthStart)
    };
  });
}

/**
 * [Function Purpose]
 * 시간 문자열("HH:mm")을 분 단위 정수로 변환합니다.
 */
export function parseMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

/**
 * [Function Purpose]
 * 직원의 기본 근무 시간(Start/End)을 반환합니다.
 */
export function getEmployeeShiftTime(employee: Employee): { start: string; end: string } {
  if (employee.shiftPreset === 'custom') {
    return {
      start: employee.customShiftStart || '09:00',
      end: employee.customShiftEnd || '18:00',
    };
  }
  // shiftPreset이 없으면 기본값 'morning' 사용
  const preset = employee.shiftPreset ? SHIFT_PRESETS[employee.shiftPreset] : SHIFT_PRESETS.morning;
  return { start: preset.start, end: preset.end };
}

/**
 * [Function Purpose]
 * 배치된 시간이 직원의 기본 근무 시간을 벗어나는지 확인합니다.
 */
export function isOutsideShiftTime(employee: Employee, timeRange: TimeRange | null): boolean {
  if (!timeRange) return false;

  const shift = getEmployeeShiftTime(employee);
  const shiftStart = parseMinutes(shift.start);
  const shiftEnd = parseMinutes(shift.end);
  const rangeStart = parseMinutes(timeRange.start);
  const rangeEnd = parseMinutes(timeRange.end);
  
  // 근무 시작이 기본 시작보다 빠르거나, 근무 종료가 기본 종료보다 늦으면 위반
  return rangeStart < shiftStart || rangeEnd > shiftEnd;
}

/**
 * [Function Purpose]
 * 근무 시간 위반 경고 메시지를 생성합니다.
 */
export function getShiftWarningMessage(employee: Employee): string {
  const shift = getEmployeeShiftTime(employee);
  return `${employee.name}님의 기본 근무 시간은 ${shift.start}~${shift.end}입니다.`;
}
