"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProvider, useOnboarding } from "./onboarding-context";
import { OnboardingProgress } from "./components/onboarding-progress";
import Step1Account from "./components/step1-account";
import Step2Store from "./components/step2-store";
import Step3Employees from "./components/step3-employees";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/layout/logo";
import { Form } from "@/components/ui/form";

const steps = [
  { id: 1, component: Step1Account },
  { id: 2, component: Step2Store },
  { id: 3, component: Step3Employees },
];

function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const { form, formData, validateAndGoNext } = useOnboarding();
  const router = useRouter();
  const { toast } = useToast();

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
    if (isValid) {
      console.log("Onboarding complete:", JSON.stringify(formData, null, 2));
      toast({
        title: "온보딩 완료!",
        description: "매장 설정이 완료되었습니다. 대시보드로 이동합니다.",
        variant: "default",
      });
      router.push("/dashboard");
    }
  };

  const CurrentStepComponent = steps.find((s) => s.id === currentStep)
    ?.component as React.ElementType;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex justify-center">
            <Logo />
        </div>
        <div className="bg-card p-6 md:p-8 rounded-xl shadow-lg">
          <OnboardingProgress currentStep={currentStep} totalSteps={steps.length} />
          <Form {...form}>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8">
              <CurrentStepComponent />
            </form>
          </Form>
          <div className="mt-8 flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 1}
            >
              이전
            </Button>
            {currentStep < steps.length ? (
              <Button onClick={handleNext}>다음</Button>
            ) : (
              <Button onClick={handleFinish}>완료</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingWizard />
    </OnboardingProvider>
  );
}
