// File: studio/src/hooks/use-mobile.tsx
/**
 * [Script Purpose]
 * 현재 뷰포트가 모바일 사이즈인지 감지하는 커스텀 훅입니다.
 * 반응형 레이아웃 처리에 사용됩니다.
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * [Function Purpose]
 * 화면 너비가 모바일 브레이크포인트(768px) 미만인지 여부를 반환합니다.
 * 창 크기 변경 이벤트를 감지하여 실시간으로 상태를 업데이트합니다.
 * 
 * @returns boolean - 모바일 여부
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
