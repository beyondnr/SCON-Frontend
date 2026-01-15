"use client";

/**
 * [Script Purpose]
 * 화면 크기에 따라 모바일 여부를 판단하는 커스텀 훅입니다.
 * 
 * [Usage]
 * - 모바일 전용 UI 렌더링 분기에 사용
 * - 기본 breakpoint: 768px (Tailwind md)
 * 
 * [Note]
 * - SSR에서는 false를 반환 (hydration mismatch 방지)
 * - 클라이언트 마운트 후 실제 값으로 업데이트
 */

import { useState, useEffect } from "react";

/**
 * 화면 크기가 지정된 breakpoint 미만인지 확인하는 훅
 * @param breakpoint - 모바일로 판단할 최대 너비 (기본값: 768px)
 * @returns 모바일 여부 (true: 모바일, false: 데스크탑)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  // SSR 및 초기 렌더링 시 false로 시작 (hydration mismatch 방지)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 초기 체크
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // 마운트 시 즉시 체크
    checkIsMobile();

    // 리사이즈 이벤트 리스너 등록
    window.addEventListener("resize", checkIsMobile);

    // 클린업
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, [breakpoint]);

  return isMobile;
}
