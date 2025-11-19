import { ScheduleGrid } from "./components/schedule-grid";
import { SummaryCards } from "./components/summary-cards";
import { mockPayrolls, mockSchedule } from "@/lib/mock-data";
import { ApproveButton } from "./components/approve-button";

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
