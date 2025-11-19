"use client";

import { createContext, useContext, useState, PropsWithChildren } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const accountSchema = z.object({
  email: z.string().email({ message: "올바른 이메일 형식을 입력해주세요." }),
  password: z
    .string()
    .min(6, { message: "비밀번호는 6자 이상이어야 합니다." }),
});

const storeSchema = z.object({
  name: z.string().min(1, { message: "매장명을 입력해주세요." }),
  businessType: z.string().min(1, { message: "업종을 선택해주세요." }),
  openingTime: z.string().min(1, { message: "영업 시작 시간을 입력해주세요." }),
  closingTime: z.string().min(1, { message: "영업 종료 시간을 입력해주세요." }),
});

const employeeSchema = z.object({
  name: z.string().min(1, { message: "직원 이름을 입력해주세요." }),
  hourlyRate: z.coerce.number().min(1, { message: "시급을 입력해주세요." }),
  role: z.string().min(1, { message: "역할을 선택해주세요." }),
});

export const onboardingSchema = z.object({
  account: accountSchema,
  store: storeSchema,
  employees: z.array(employeeSchema).min(1, { message: "최소 1명 이상의 직원을 등록해야 합니다." }),
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
        email: "",
        password: "",
      },
      store: {
        name: "",
        businessType: "",
        openingTime: "09:00",
        closingTime: "22:00",
      },
      employees: [{ name: "", hourlyRate: 9860, role: "직원" }],
    },
    mode: "onBlur",
  });

  const validateAndGoNext = async (step: number) => {
    switch (step) {
      case 1:
        return await form.trigger("account");
      case 2:
        return await form.trigger("store");
      case 3:
        return await form.trigger("employees");
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
