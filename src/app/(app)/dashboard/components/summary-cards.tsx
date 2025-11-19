import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, FileClock } from "lucide-react";

type SummaryCardsProps = {
    totalPayroll: number;
    pendingSchedules: number;
};

export function SummaryCards({ totalPayroll, pendingSchedules }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">이번 주 예상 인건비</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}원</div>
                    <p className="text-xs text-muted-foreground">전주 대비 +5.2%</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">승인 대기 스케줄</CardTitle>
                    <FileClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingSchedules} 건</div>
                     <p className="text-xs text-muted-foreground">3월 2주차 스케줄</p>
                </CardContent>
            </Card>
        </div>
    );
}
