"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "../onboarding-context";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

export default function Step1Account() {
  const { form } = useOnboarding();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    message: string;
  }>({ isValid: false, message: "" });

  const password = form.watch("account.password");
  const agreedToTerms = form.watch("account.agreedToTerms");
  const agreedToPrivacy = form.watch("account.agreedToPrivacy");
  const allAgreed = agreedToTerms && agreedToPrivacy;

  // 비밀번호 실시간 검증
  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordValidation({ isValid: false, message: "" });
      return;
    }
    if (value.length < 8) {
      setPasswordValidation({ isValid: false, message: "비밀번호는 8자 이상이어야 합니다." });
      return;
    }
    if (value.length > 20) {
      setPasswordValidation({ isValid: false, message: "비밀번호는 20자 이하여야 합니다." });
      return;
    }
    if (!passwordRegex.test(value)) {
      setPasswordValidation({ isValid: false, message: "영문, 숫자, 특수문자를 포함해야 합니다." });
      return;
    }
    setPasswordValidation({ isValid: true, message: "" });
  };

  const handlePasswordChange = (value: string) => {
    form.setValue("account.password", value);
    validatePassword(value);
  };

  const handleAllAgree = (checked: boolean) => {
    form.setValue("account.agreedToTerms", checked);
    form.setValue("account.agreedToPrivacy", checked);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-headline font-bold">사장님 서비스 가입</h2>
      
      <FormField
        control={form.control}
        name="account.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이름</FormLabel>
            <FormControl>
              <Input placeholder="홍길동" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="account.email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <FormControl>
              <Input type="email" placeholder="example@lawfulshift.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="account.password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="8~20자, 영문+숫자+특수문자"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    handlePasswordChange(e.target.value);
                  }}
                  className={passwordValidation.isValid ? "pr-10" : ""}
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
                {passwordValidation.isValid && (
                  <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                )}
              </div>
            </FormControl>
            {passwordValidation.message && (
              <p className="text-sm text-destructive">{passwordValidation.message}</p>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="account.passwordConfirm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>비밀번호 확인</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  type={showPasswordConfirm ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력해주세요"
                  {...field}
                />
                {field.value && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 약관 동의 섹션 */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="all-agree"
            checked={allAgreed}
            onCheckedChange={(checked) => handleAllAgree(checked === true)}
          />
          <label
            htmlFor="all-agree"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            전체 동의
          </label>
        </div>
        
        <div className="space-y-3 pl-6">
          <FormField
            control={form.control}
            name="account.agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    이용약관 동의 <span className="text-destructive">(필수)</span>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="account.agreedToPrivacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    개인정보처리방침 동의 <span className="text-destructive">(필수)</span>
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>
        {(form.formState.errors.account?.agreedToTerms || form.formState.errors.account?.agreedToPrivacy) && (
          <p className="text-sm text-destructive pl-6">
            약관에 동의해주세요.
          </p>
        )}
      </div>

      {/* 하단 로그인 링크 */}
      <div className="pt-4 text-center text-sm text-muted-foreground">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          로그인
        </Link>
      </div>
    </div>
  );
}
