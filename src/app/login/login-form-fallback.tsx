"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 로딩 폴백 컴포넌트
export default function LoginFormFallback() {
  return (
    <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg">
      <h1 className="text-2xl font-headline font-bold mb-2">로그인</h1>
      <p className="text-muted-foreground mb-6">
        계정에 로그인하여 SCON을 시작하세요.
      </p>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">이메일</Label>
          <Input
            id="email"
            type="email"
            placeholder="example@lawfulshift.com"
            disabled
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            disabled
          />
        </div>
        <Button className="w-full" disabled>
          로그인
        </Button>
      </div>
    </div>
  );
}

