"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { OnboardingProvider, useOnboarding } from "./onboarding-context";
import { OnboardingProgress } from "./components/onboarding-progress";
import Step1Account from "./components/step1-account";
import Step2Store from "./components/step2-store";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/layout/logo";
import { Form } from "@/components/ui/form";
import { CenteredLayout } from "@/components/layout/centered-layout";
import apiClient from "@/lib/api-client";
import { SignupResponse, ApiStore, AsyncTaskResponseDto } from "@/lib/api-mappers";
import { setCurrentStoreId } from "@/lib/local-storage-utils";
import { logger } from "@/lib/logger";
import { useAsyncTask } from "@/hooks/use-async-task";
import { useAsyncTaskResult } from "@/hooks/use-async-task-result";

const steps = [
  { id: 1, component: Step1Account },
  { id: 2, component: Step2Store },
];

function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { form, formData, validateAndGoNext } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();

  // 비동기 작업 관리
  const { startPolling, stopPolling, taskStatus, isPolling } = useAsyncTask({
    pollInterval: 1000,
    maxPollingTime: 30000,
    onComplete: async (status: AsyncTaskResponseDto) => {
      // 작업 완료 시 결과 조회 및 대시보드 이동
      await fetchStoreResultAndNavigate(status.taskId);
    },
    onError: (error) => {
      setIsLoading(false);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
    },
  });

  const { fetchTaskResult } = useAsyncTaskResult<ApiStore>();

  /**
   * 매장 생성 결과 조회 및 대시보드 이동
   */
  const fetchStoreResultAndNavigate = useCallback(async (taskId: string) => {
    try {
      const storeResult = await fetchTaskResult(taskId);
      
      // 매장 ID 저장
      if (storeResult?.id) {
        setCurrentStoreId(String(storeResult.id));
        logger.debug("Store created and ID saved", { 
          storeId: storeResult.id 
        });
      }
      
      toast({
        title: "온보딩 완료!",
        description: "매장 설정이 완료되었습니다. 대시보드로 이동합니다.",
        variant: "default",
      });
      
      // 대시보드로 이동
      router.push("/dashboard");
    } catch (error) {
      logger.error("Onboarding error", error);
      setIsLoading(false);
    }
  }, [fetchTaskResult, toast, router]);

  const handleNext = async () => {
    const isValid = await validateAndGoNext(currentStep);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    try {
      setIsLoading(true);

      // 1. 회원가입 API 호출
      // 주의: phone 필드는 현재 온보딩 폼에 없으므로 undefined 처리
      const signupData = {
        email: formData.account.email,
        password: formData.account.password,
        name: formData.account.name,
        phone: undefined, // 현재 폼에 phone 필드 없음 (선택 필드)
        isAgreedToTerms: formData.account.agreedToTerms && formData.account.agreedToPrivacy,
      };

      const signupResponse = await apiClient.post<SignupResponse>('/v1/auth/signup', signupData);
      
      // 토큰은 HttpOnly Cookie로 자동 저장됨
      // 주의: api-client.ts의 응답 인터셉터가 ApiResponse<T> 래퍼를 처리하므로
      // signupResponse.data는 실제 data 필드 값 (ownerId, email 포함)
      logger.debug("Signup successful", { 
        ownerId: signupResponse.data?.ownerId 
      });

      // 2. 매장 생성 API 호출
      // 중요: API 명세서에 따르면 필드명은 openTime, closeTime (not openingTime, closingTime)
      // 참고: api-mappers.ts의 ApiStoreRequest 타입은 openingTime/closingTime을 사용하지만
      // 실제 API는 openTime/closeTime을 사용하므로 직접 변환 필요
      const storeData = {
        name: formData.store.name,
        businessType: formData.store.businessType || undefined, // 폼에서는 필수, API에서는 선택
        address: undefined, // 온보딩에서 주소 입력 없음
        openTime: formData.store.openingTime 
          ? `${formData.store.openingTime}:00` 
          : undefined,
        closeTime: formData.store.closingTime 
          ? `${formData.store.closingTime}:00` 
          : undefined,
        storeHoliday: undefined, // 온보딩에서 휴무일 입력 없음
      };

      // 2. 매장 생성 API 호출 (비동기: POST /v1/stores/async)
      const storeResponse = await apiClient.post<AsyncTaskResponseDto>(
        '/v1/stores/async',
        storeData
      );

      const taskId = storeResponse.data.taskId;

      // 즉시 피드백
      toast({
        title: '매장 생성 시작',
        description: '매장 정보를 저장하는 중입니다.',
      });

      // 폴링 시작 (완료 시 자동으로 대시보드 이동)
      await startPolling(taskId);
    } catch (error) {
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
      logger.error("Onboarding error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)
    ?.component as React.ElementType;

  return (
    <CenteredLayout maxWidth="2xl">
      <div className="mb-8 flex justify-center">
        <Logo />
      </div>
      <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg">
        <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="mt-8">
            <fieldset disabled={isLoading} className="space-y-6">
              <CurrentStepComponent />
            </fieldset>
          </form>
        </Form>
        {/* 진행 상태 표시 (폴링 중일 때만) */}
        {isPolling && taskStatus && (
          <div className="mt-6 space-y-2">
            <Progress value={taskStatus.progress || 0} />
            <p className="text-sm text-muted-foreground text-center">
              매장 정보를 저장하는 중... ({taskStatus.progress || 0}%)
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 1 || isLoading || isPolling}
          >
            이전
          </Button>
          {currentStep < steps.length ? (
            currentStep === 2 ? (
              <Button 
                onClick={handleFinish}
                disabled={isLoading || isPolling || currentStep !== 2}
              >
                {(isLoading || isPolling) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    가입 중...
                  </>
                ) : (
                  "가입 완료"
                )}
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                disabled={isLoading}
              >
                다음
              </Button>
            )
          ) : (
            <Button 
              onClick={handleFinish}
              disabled={isLoading || isPolling}
            >
              {(isLoading || isPolling) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  완료 중...
                </>
              ) : (
                "완료"
              )}
            </Button>
          )}
        </div>
      </div>
    </CenteredLayout>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
