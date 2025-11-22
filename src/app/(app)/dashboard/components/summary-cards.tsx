// File: studio/src/app/(app)/dashboard/components/summary-cards.tsx

/**
 * [Script Purpose]
 * 대시보드 상단에 주요 비즈니스 지표(KPI)를 카드 형태로 표시하는 컴포넌트입니다.
 * 
 * [Visual Hierarchy]
 * - Primary Style: 총 예상 인건비 (중요도 높음, Primary Color 사용)
 * - Secondary Style: 승인 대기 스케줄 (중요도 중간, Warning/Orange Color 사용)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, FileClock, TrendingUp } from "lucide-react";

/**
 * [Props Definition]
 * @param totalPayroll - 계산된 총 주간 예상 급여액
 * @param pendingSchedules - 승인이 필요한 스케줄 건수
 */
type SummaryCardsProps = {
    totalPayroll: number;
    pendingSchedules: number;
};

export function SummaryCards({ totalPayroll, pendingSchedules }: SummaryCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* KPI Card 1: Total Payroll */}
            <Card className="overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">이번 주 예상 인건비</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(totalPayroll)}원</div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-green-600 font-medium">+5.2%</span> 
                        <span>지난주 대비</span>
                    </p>
                </CardContent>
            </Card>
            
            {/* KPI Card 2: Pending Approvals */}
            <Card className="overflow-hidden border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">승인 대기 스케줄</CardTitle>
                    <div className="p-2 bg-orange-500/10 rounded-full">
                        <FileClock className="h-5 w-5 text-orange-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-foreground">{pendingSchedules} 건</div>
                    <p className="text-sm text-muted-foreground mt-1">
                        3월 2주차 스케줄
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
