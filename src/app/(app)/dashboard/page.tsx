import { Button } from "@/components/ui/button";
import { ScheduleGrid } from "./components/schedule-grid";
import { SummaryCards } from "./components/summary-cards";
import { mockPayrolls, mockSchedule } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

function ApproveButton() {
    "use client";
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

export default function DashboardPage() {
    const totalPayroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);
    const pendingSchedules = 1;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">스케줄 대시보드</h1>
                    <p className="text-muted-foreground">이번 주 스케줄을 검토하고 승인하세요.</p>
                </div>
                <ApproveButton />
            </div>
            
            <SummaryCards totalPayroll={totalPayroll} pendingSchedules={pendingSchedules} />
            <ScheduleGrid schedule={mockSchedule} />
        </div>
    );
}
