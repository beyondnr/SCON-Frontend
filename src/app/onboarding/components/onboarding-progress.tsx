import { Progress } from "@/components/ui/progress";

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  const progressValue = (currentStep / totalSteps) * 100;

  const stepLabels = ["계정 정보", "매장 정보", "직원 등록"];

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-foreground">
          {stepLabels[currentStep-1]}
        </p>
        <p className="text-sm text-muted-foreground">
          {currentStep} / {totalSteps} 단계
        </p>
      </div>
      <Progress value={progressValue} className="w-full" />
    </div>
  );
}
