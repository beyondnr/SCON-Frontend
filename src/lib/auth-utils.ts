/**
 * [Script Purpose]
 * 인증 관련 유틸리티 함수
 * 로그아웃 등 인증 관련 공통 로직을 중앙화하여 재사용 가능하도록 구현
 */

"use client";

import { clearAuthTokens } from "./local-storage-utils";
import apiClient from "./api-client";

/**
 * 로그아웃 처리
 * - 백엔드 로그아웃 API 호출 시도 (실패해도 클라이언트 측 로그아웃 진행)
 * - 토큰 삭제
 * - 로그인 페이지로 리다이렉트
 * 
 * @throws {Error} 리다이렉트 실패 시 에러 발생 가능
 */
export async function handleLogout(): Promise<void> {
  try {
    // 백엔드에 로그아웃 요청 (HttpOnly Cookie 삭제 및 토큰 무효화)
    // 백엔드에서 Set-Cookie 헤더로 쿠키를 만료시킴
    try {
      await apiClient.post("/v1/auth/logout");
    } catch (error) {
      // 로그아웃 API가 없거나 실패해도 클라이언트 측 로그아웃은 진행
      console.warn("[Logout] Backend logout API failed or not available:", error);
    }
  } catch (error) {
    // 네트워크 에러 등은 무시하고 클라이언트 측 로그아웃 진행
    console.warn("[Logout] Failed to call logout API:", error);
  } finally {
    // localStorage의 토큰 삭제 (혹시 남아있을 수 있는 경우 대비)
    // HttpOnly Cookie는 백엔드에서 삭제되므로 클라이언트에서 직접 삭제 불가
    clearAuthTokens();
    
    // 로그인 페이지로 리다이렉트
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

