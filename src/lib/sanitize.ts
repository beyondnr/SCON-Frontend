/**
 * [Script Purpose]
 * 사용자 입력 검증 및 XSS 방어를 위한 유틸리티 함수입니다.
 * 
 * [Usage]
 * - 사용자 입력이 직접 렌더링되는 경우 sanitizeInput 사용
 * - HTML 콘텐츠가 필요한 경우 sanitizeHtml 사용 (DOMPurify 권장)
 */

/**
 * 사용자 입력 문자열을 이스케이프하여 XSS 공격을 방어합니다.
 * 
 * @param input - 사용자 입력 문자열
 * @returns 이스케이프된 문자열
 * 
 * @example
 * const userInput = "<script>alert('XSS')</script>";
 * const sanitized = sanitizeInput(userInput);
 * // 결과: "&lt;script&gt;alert('XSS')&lt;/script&gt;"
 */
export function sanitizeInput(input: string): string {
  if (typeof document === 'undefined') {
    // 서버 사이드 렌더링 환경에서는 기본 이스케이프
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  
  // 클라이언트 사이드에서는 DOM을 이용한 이스케이프
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * HTML 콘텐츠를 정제하여 XSS 공격을 방어합니다.
 * 
 * 주의: React는 기본적으로 모든 텍스트를 이스케이프하므로,
 * dangerouslySetInnerHTML을 사용할 때만 이 함수가 필요합니다.
 * 
 * @param html - HTML 문자열
 * @returns 정제된 HTML 문자열
 * 
 * @example
 * // DOMPurify 사용 권장 (더 강력한 보안)
 * import DOMPurify from 'dompurify';
 * const sanitized = DOMPurify.sanitize(userHtml);
 * 
 * // 또는 기본 이스케이프 사용
 * const sanitized = sanitizeHtml(userHtml);
 */
export function sanitizeHtml(html: string): string {
  if (typeof document === 'undefined') {
    // 서버 사이드에서는 기본 이스케이프만 수행
    return sanitizeInput(html);
  }
  
  // 클라이언트 사이드에서는 기본 이스케이프
  // 더 강력한 보안이 필요한 경우 DOMPurify 라이브러리 사용 권장
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * URL을 검증하여 안전한지 확인합니다.
 * 
 * @param url - 검증할 URL 문자열
 * @returns 안전한 URL인지 여부
 * 
 * @example
 * if (sanitizeUrl('https://example.com')) {
 *   // 안전한 URL
 * }
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return '';
    }
    
    // javascript:, data: 같은 위험한 프로토콜 차단
    if (parsedUrl.protocol === 'javascript:' || parsedUrl.protocol === 'data:') {
      return '';
    }
    
    return parsedUrl.toString();
  } catch {
    // 잘못된 URL 형식
    return '';
  }
}