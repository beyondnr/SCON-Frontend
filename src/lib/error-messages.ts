/**
 * [Script Purpose]
 * 백엔드 에러 메시지를 사용자 친화적인 메시지로 변환
 * API 응답의 에러 메시지를 더 읽기 쉬운 형태로 매핑
 */

/**
 * 백엔드 에러 메시지 → 사용자 친화적 메시지 매핑
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // 인증 관련
  '이미 사용 중인 이메일입니다': '이미 가입된 이메일입니다. 로그인해주세요.',
  'Email already exists': '이미 가입된 이메일입니다. 로그인해주세요.',
  '비밀번호가 일치하지 않습니다': '이메일 또는 비밀번호를 확인해주세요.',
  'Invalid password': '이메일 또는 비밀번호를 확인해주세요.',
  '등록되지 않은 이메일입니다': '이메일 또는 비밀번호를 확인해주세요.',
  'User not found': '이메일 또는 비밀번호를 확인해주세요.',
  'Owner not found with email': '이메일 또는 비밀번호를 확인해주세요.',
  
  // 유효성 검증 관련
  '유효하지 않은 이메일 형식입니다': '올바른 이메일 형식을 입력해주세요.',
  'Invalid email format': '올바른 이메일 형식을 입력해주세요.',
  '비밀번호는 8자 이상이어야 합니다': '비밀번호는 8자 이상 입력해주세요.',
  'Password must be at least 8 characters': '비밀번호는 8자 이상 입력해주세요.',
  'Password must contain letters, numbers, and special characters': '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
  
  // 매장 관련
  'Store not found': '매장을 찾을 수 없습니다.',
  '매장을 찾을 수 없습니다': '매장 정보가 없습니다. 다시 시도해주세요.',
  
  // 직원 관련
  'Employee not found': '직원을 찾을 수 없습니다.',
  '직원을 찾을 수 없습니다': '직원 정보가 없습니다. 다시 시도해주세요.',
  
  // 권한 관련
  'Access denied': '접근 권한이 없습니다.',
  'Forbidden': '접근 권한이 없습니다.',
  '본인 소유 매장이 아님': '해당 매장에 대한 접근 권한이 없습니다.',
  '본인 소유 매장의 직원이 아님': '해당 직원 정보에 대한 접근 권한이 없습니다.',
  
  // 리소스별 403 메시지
  'EMPLOYEE_FORBIDDEN': '해당 매장의 직원 정보에 대한 접근 권한이 없습니다.',
  'SCHEDULE_FORBIDDEN': '해당 매장의 스케줄에 대한 접근 권한이 없습니다.',
  'STORE_FORBIDDEN': '해당 매장에 대한 접근 권한이 없습니다.',
  
  // 토큰 관련
  'Token expired': '세션이 만료되었습니다. 다시 로그인해주세요.',
  'Invalid token': '세션이 유효하지 않습니다. 다시 로그인해주세요.',
  
  // 서버 오류
  'Internal server error': '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  'Service unavailable': '서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.',
};

/**
 * 에러 메시지를 사용자 친화적인 메시지로 변환
 * 매핑이 없는 경우 원본 메시지 반환
 * 
 * @param errorMessage - 백엔드에서 받은 에러 메시지
 * @returns 사용자 친화적인 에러 메시지
 */
export function getUserFriendlyMessage(errorMessage: string): string {
  // 정확히 일치하는 메시지가 있는지 확인
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }
  
  // 부분 일치 확인 (대소문자 무시)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  // 매핑이 없으면 원본 메시지 반환
  return errorMessage;
}

