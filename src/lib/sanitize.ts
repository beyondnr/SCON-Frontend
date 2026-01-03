/**
 * [Script Purpose]
 * XSS 방어를 위한 사용자 입력 검증 및 이스케이프 유틸리티
 * - 사용자 입력 데이터 이스케이프
 * - HTML 태그 제거
 */

/**
 * 사용자 입력을 안전하게 이스케이프
 * HTML 태그를 이스케이프하여 XSS 공격 방어
 * 
 * @param input - 이스케이프할 사용자 입력 문자열
 * @returns 이스케이프된 안전한 문자열
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 기본 이스케이프
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
 * HTML 콘텐츠를 안전하게 이스케이프
 * 
 * @param html - 이스케이프할 HTML 문자열
 * @returns 이스케이프된 안전한 문자열
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 기본 이스케이프
    return sanitizeInput(html);
  }
  
  // 클라이언트 사이드에서는 DOM을 이용한 이스케이프
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * URL을 안전하게 검증
 * 
 * @param url - 검증할 URL 문자열
 * @returns 안전한 URL 또는 null
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    // 허용된 프로토콜만 허용
    const allowedProtocols = ['http:', 'https:', 'mailto:'];
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

