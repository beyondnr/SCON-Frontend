import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import LoginForm from "./login-form";
import LoginFormFallback from "./login-form-fallback";

// Next.js 빌드 시 정적 생성 방지 (useSearchParams 사용 시 필수)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 메인 페이지 컴포넌트 (서버 컴포넌트)
export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
