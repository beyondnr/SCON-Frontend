"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ApproveButton() {
    const { toast } = useToast();

    const handleApprove = () => {
        const isSuccess = Math.random() > 0.3; // Simulate success/fail
        
        toast({ title: "스케줄 승인 중..." });

        setTimeout(() => {
            if(isSuccess) {
                toast({
                    title: "✅ 스케줄이 승인되었습니다.",
                    description: "직원들에게 알림이 전송되었습니다. (모의)",
                });
            } else {
                toast({
                    variant: "destructive",
                    title: "⚠️ 법규 위반 항목 발견!",
                    description: "김민준 직원의 주 52시간 근무를 초과했습니다. 스케줄을 조정해주세요.",
                });
            }
        }, 1500);
    };

    return <Button onClick={handleApprove}>스케줄 승인 및 알림 발송</Button>;
}
