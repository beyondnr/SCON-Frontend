"use client";

import { createContext, useContext, useState, PropsWithChildren } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/;

const accountSchema = z.object({
  name: z.string().min(1, { message: "이름을 입력해주세요." }),
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 8자 이상이어야 합니다." })
    .max(20, { message: "비밀번호는 20자 이하여야 합니다." })
    .regex(passwordRegex, { message: "영문, 숫자, 특수문자를 포함해야 합니다." }),
  passwordConfirm: z.string().min(1, { message: "비밀번호 확인을 입력해주세요." }),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: "약관에 동의해주세요.",
  }),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "개인정보처리방침에 동의해주세요.",
  }),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "비밀번호가 일치하지 않습니다.",
  path: ["passwordConfirm"],
});

const storeSchema = z.object({
  name: z.string().min(1, { message: "매장명을 입력해주세요." }),
  businessType: z.string().min(1, { message: "업종을 선택해주세요." }),
  openingTime: z.string().min(1, { message: "영업 시작 시간을 입력해주세요." }),
  closingTime: z.string().min(1, { message: "영업 종료 시간을 입력해주세요." }),
  weeklyHoliday: z.string().optional(), // 정기 휴무일 (선택)
});

export const onboardingSchema = z.object({
  account: accountSchema,
  store: storeSchema,
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

type OnboardingContextType = {
  formData: OnboardingData;
  form: UseFormReturn<OnboardingData>;
  validateAndGoNext: (step: number) => Promise<boolean>;
};

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: PropsWithChildren) {
  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      account: {
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        agreedToTerms: false,
        agreedToPrivacy: false,
      },
      store: {
        name: "",
        businessType: "",
        openingTime: "09:00",
        closingTime: "22:00",
        weeklyHoliday: "휴무 없음",
      },
    },
    mode: "onBlur",
  });

  const validateAndGoNext = async (step: number) => {
    switch (step) {
      case 1:
        return await form.trigger("account");
      case 2:
        return await form.trigger("store");
      default:
        return false;
    }
  };

  const value = {
    formData: form.watch(),
    form,
    validateAndGoNext,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
