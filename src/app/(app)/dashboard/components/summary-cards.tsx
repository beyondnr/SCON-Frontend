// File: studio/src/app/(app)/dashboard/components/summary-cards.tsx

/**
 * [Script Purpose]
 * 대시보드 상단에 주요 비즈니스 지표(KPI)를 카드 형태로 표시하는 컴포넌트입니다.
 * 
 * [Visual Hierarchy]
 * - Primary Style: 총 예상 인건비 (중요도 높음, Primary Color 사용)
 * - Secondary Style: 오늘의 근무자 (중요도 중간, Primary Color 사용)
 * 
 * [Responsive Behavior]
 * - 모바일: Collapsible 형태로 요약 정보 접기/펼치기 가능
 * - 데스크탑: 2열 그리드로 카드 형태 표시
 */

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrency } from "@/lib/utils";
import { ChevronDown, ChevronUp, DollarSign, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { ApiEmployee } from "@/lib/api-mappers";
import { MonthlySchedule } from "@/lib/types";
import { useIsMobile } from "@/hooks/use-is-mobile";

/**
 * [Props Definition]
 * @param totalPayroll - 계산된 총 주간 예상 급여액 (하위 호환성 유지)
 * @param totalHours - 총 주간 근무 시간 (하위 호환성 유지)
 * @param employees - 직원 목록 (API 연동)
 * @param monthlySchedule - 월간 스케줄 데이터 (API 연동)
 * @param currentDate - 현재 날짜 (API 연동)
 */
type SummaryCardsProps = {
    // 기존 Props (하위 호환성 유지)
    totalPayroll?: number;
    totalHours?: number;
    // 새로운 Props (API 연동)
    employees?: ApiEmployee[];
    monthlySchedule?: MonthlySchedule;
    currentDate?: Date;
};

export function SummaryCards({ 
    totalPayroll = 0,
    totalHours = 0,
    employees = [],
    monthlySchedule,
    currentDate = new Date(),
}: SummaryCardsProps) {
    const isMobile = useIsMobile();
    const [isExpanded, setIsExpanded] = useState(false);

    // 오늘의 근무자 수 계산 (스케줄 데이터가 있는 경우)
    const todayWorkersCount = useMemo(() => {
        if (!monthlySchedule || !monthlySchedule.schedule) return 0;
        const today = format(currentDate, 'yyyy-MM-dd');
        const todaySchedule = monthlySchedule.schedule[today];
        if (!todaySchedule) return 0;
        return Object.keys(todaySchedule).length;
    }, [monthlySchedule, currentDate]);

    // 예상 인건비 (향후 구현 또는 기존 Mock 데이터 사용)
    const estimatedLaborCost = totalPayroll;

    // 데스크탑/모바일 공통으로 사용되는 카드 UI
    const renderCards = () => (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {/* KPI Card 1: Today's Workers */}
            <Card className="overflow-hidden border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">오늘의 근무자</CardTitle>
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Users className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-foreground">{todayWorkersCount}명</div>
                    <p className="text-sm text-muted-foreground mt-1">
                        {employees.length > 0 ? `총 ${employees.length}명 중` : '직원 정보 없음'}
                    </p>
                </CardContent>
            </Card>
            
            {/* KPI Card 2: Estimated Labor Cost */}
            <Card className="overflow-hidden border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">예상 인건비</CardTitle>
                    <div className="p-2 bg-green-500/10 rounded-full">
                        <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(estimatedLaborCost)}원</div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        {totalPayroll > 0 && (
                            <>
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <span className="text-green-600 font-medium">+5.2%</span> 
                                <span>지난주 대비</span>
                            </>
                        )}
                        {totalPayroll === 0 && <span>향후 구현 예정</span>}
                    </p>
                </CardContent>
            </Card>
        </div>
    );

    // 모바일: Collapsible 형태로 요약 정보 접기/펼치기
    if (isMobile) {
        return (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                {/* 접힌 상태에서 보이는 요약 바 */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium">오늘 {todayWorkersCount}명</span>
                        </div>
                        <span className="text-muted-foreground">·</span>
                        <div className="flex items-center gap-1.5">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">{formatCurrency(estimatedLaborCost)}원</span>
                        </div>
                    </div>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                            ) : (
                                <ChevronDown className="h-4 w-4" />
                            )}
                            <span className="sr-only">상세 정보 {isExpanded ? '접기' : '펼치기'}</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                
                {/* 펼쳐졌을 때 보이는 상세 카드 */}
                <CollapsibleContent className="pt-3 animate-accordion-down">
                    {renderCards()}
                </CollapsibleContent>
            </Collapsible>
        );
    }

    // 데스크탑: 기존 2열 그리드
    return renderCards();
}
