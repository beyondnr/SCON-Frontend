"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { setCurrentStoreId } from "@/lib/local-storage-utils";
import apiClient from "@/lib/api-client";
import { LoginResponse, ApiStore } from "@/lib/api-mappers";
import { logger } from "@/lib/logger";
import { logEvent, setUserId, setStoreId } from "@/lib/analytics";

// 백엔드 연동 여부 설정 (환경 변수로 관리 권장)
// true: 백엔드 API 호출, false: 로컬 테스트 모드
const ENABLE_BACKEND_API = true;

// useSearchParams를 사용하는 컴포넌트 (클라이언트 컴포넌트)
export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  
  // 리다이렉트 경로 가져오기 (middleware에서 설정한 쿼리 파라미터)
  // useSearchParams를 useEffect 내부에서만 사용하여 빌드 시점 문제 방지
  const [redirectPath, setRedirectPath] = useState('/dashboard');
  
  useEffect(() => {
    // 클라이언트 사이드에서만 실행되도록 보장
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';
      setRedirectPath(redirect);
    }
  }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("이메일을 입력해주세요.");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("올바른 이메일 형식을 입력해주세요.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email) || !validatePassword(password)) {
      return;
    }

    setIsLoading(true);

    try {
      if (ENABLE_BACKEND_API) {
        // 백엔드 API 호출 모드 (apiClient 사용)
        logger.debug("Attempting login", { email });
        
        const response = await apiClient.post<LoginResponse>('/v1/auth/login', { 
          email, 
          password 
        });
        
        // 토큰은 HttpOnly Cookie로 자동 저장됨 (백엔드에서 Set-Cookie 헤더로 설정)
        // 응답 본문에는 토큰이 포함되지 않을 수 있음 (보안 강화)
        logger.debug("Login successful", { 
          ownerId: response.data?.ownerId 
        });

        // 로그인 성공 이벤트
        logEvent('login', {
          method: 'email',
          login_timestamp: new Date().toISOString(),
        });

        // 사용자 ID 설정 (API 응답에서 ownerId 추출)
        // ⚠️ 주의: api-client.ts의 인터셉터가 ApiResponse<T> 래퍼를 처리하므로
        // response.data는 실제 data 필드 값 (ownerId 포함)
        if (response.data?.ownerId) {
          setUserId(response.data.ownerId);
        }

        // 로그인 성공 후 매장 목록 조회 및 첫 번째 매장 ID 저장
        try {
          const storesResponse = await apiClient.get<ApiStore[]>('/v1/stores');
          
          // 매장 목록이 있고 첫 번째 매장이 있으면 storeId 저장 (기존 로직 + GA4)
          if (storesResponse.data && storesResponse.data.length > 0 && storesResponse.data[0].id) {
            setCurrentStoreId(String(storesResponse.data[0].id));
            setStoreId(String(storesResponse.data[0].id)); // GA4용
            logger.debug("Store ID set", { 
              storeId: storesResponse.data[0].id 
            });
          }
        } catch (error) {
          logger.error("Failed to fetch stores", error);
          // 매장 조회 실패해도 로그인은 성공으로 처리
        }
      } else {
        // 로컬 테스트 모드 - API 호출 건너뛰기
        logger.debug("Local mode - skipping login API call", { email });
        
        // 로컬 테스트용 임시 storeId 설정
        const localStoreId = `local-store-${Date.now()}`;
        setCurrentStoreId(localStoreId);
      }

      toast({
        title: "로그인 성공",
        description: "대시보드로 이동합니다.",
      });

      // 리다이렉트 경로가 있으면 해당 경로로, 없으면 대시보드로 이동
      router.push(redirectPath);
    } catch (error) {
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
      logger.error("Login error", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-headline font-bold mb-2">로그인</h1>
      <p className="text-muted-foreground mb-6">
        계정에 로그인하여 SCON을 시작하세요.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@lawfulshift.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError("");
            }}
            onBlur={() => validateEmail(email)}
            className={emailError ? "border-destructive" : ""}
            disabled={isLoading}
          />
          {emailError && (
            <p className="text-xs text-destructive">{emailError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              onBlur={() => validatePassword(password)}
              className={passwordError ? "border-destructive pr-10" : "pr-10"}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs text-destructive">{passwordError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              로그인 중...
            </>
          ) : (
            "로그인"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-muted-foreground">계정이 없으신가요? </span>
        <Link href="/onboarding" className="text-primary hover:underline">
          무료로 시작하기
        </Link>
      </div>
    </div>
  );
}

