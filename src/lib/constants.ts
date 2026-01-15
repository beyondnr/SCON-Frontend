/**
 * [Script Purpose]
 * 애플리케이션 전반에서 사용되는 상수 값을 정의합니다.
 */

export const SHIFT_PRESETS = {
  morning: { start: '10:00', end: '18:00', label: '오전조' },
  afternoon: { start: '13:00', end: '21:00', label: '오후조' },
} as const;

/**
 * 대시보드 Empty State 관련 상수
 * 
 * [확장 고려사항]
 * - 현재: 직원이 0명일 때 Empty State 표시 (다중 직원 모드)
 * - 향후: 1인 운영업자 지원 시 MIN_EMPLOYEES_FOR_DASHBOARD를 1로 변경 가능
 * - 또는 비즈니스 모드에 따라 동적으로 결정 가능
 */
export const DASHBOARD_CONSTANTS = {
  /**
   * 대시보드 기능 사용을 위한 최소 직원 수
   * 현재: 1명 이상 필요 (직원이 0명일 때 Empty State 표시)
   * 향후 1인 운영업자 지원 시 0으로 변경 가능
   */
  MIN_EMPLOYEES_FOR_DASHBOARD: 1,
  
  /**
   * Empty State 표시 조건
   * 현재: 직원 수가 MIN_EMPLOYEES_FOR_DASHBOARD 미만일 때
   */
  shouldShowEmptyState: (employeeCount: number): boolean => {
    return employeeCount < DASHBOARD_CONSTANTS.MIN_EMPLOYEES_FOR_DASHBOARD;
  },
} as const;

/**
 * [향후 확장용] Empty State 메시지 가져오기
 * 
 * 현재는 기본 메시지만 반환하지만 향후 비즈니스 모드에 따라
 * 다른 메시지를 반환하도록 확장 가능
 * 
 * @example
 * // 현재 사용
 * getEmptyStateMessage() // 기본 메시지
 * 
 * // 향후 확장 시
 * getEmptyStateMessage('single-owner') // 1인 운영업자 메시지
 */
export function getEmptyStateMessage(mode?: 'multi-employee' | 'single-owner') {
  // 현재는 기본 메시지만 반환
  // 향후 mode에 따라 다른 메시지 반환 가능
  return {
    title: '첫 직원을 등록하고 스케줄을 만들어보세요',
    description: '직원을 등록하면 근무표를 작성할 수 있습니다.',
    ctaText: '직원 등록하기',
  };
}

/**
 * 요일 상수 정의
 * 스케줄 데이터 처리를 위한 유틸리티
 */
export const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'] as const;

/**
 * 스케줄 휴무 옵션
 * "휴무 없음" 포함
 */
export const HOLIDAY_OPTIONS = ['휴무 없음', ...DAYS_OF_WEEK] as const;
