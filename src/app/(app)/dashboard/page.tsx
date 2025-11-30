// File: studio/src/app/(app)/dashboard/page.tsx
"use client";

/**
 * [Script Purpose]
 * 근무표 대시보드 메인 페이지입니다.
 *
 * [Logic & Data Flow]
 * 1. 초기 데이터 로드: mock-data.ts에서 급여(payrolls)와 근무표(schedule) 데이터를 가져옵니다.
 * 2. 상태 관리 (useState):
 *    - data: 급여, 근무표, 승인 대기 건수를 통합 관리합니다.
 *    - isLoading: 데이터 갱신 중 UI 잠금 처리를 위함입니다.
 * 3. 데이터 갱신 (handleRefresh):
 *    - 네트워크 요청을 시뮬레이션(setTimeout)하여 승인 대기 건수를 랜덤하게 변경합니다.
 *    - 갱신 완료 후 Toast 알림을 제공합니다.
 * 4. 하위 컴포넌트 전달:
 *    - totalPayroll -> SummaryCards
 *    - pendingSchedules -> SummaryCards
 *    - schedule -> ScheduleGrid
 */

import { useState } from "react";
import { ScheduleGrid } from "./components/schedule-grid";
import { TimeScheduleTable } from "./components/time-schedule-table";
import { SummaryCards } from "./components/summary-cards";
import { mockPayrolls, mockSchedule } from "@/lib/mock-data";
import { DashboardActions } from "./components/dashboard-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
    const { toast } = useToast();
    
    // [State] UI 상태 및 데이터 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        payrolls: mockPayrolls,
        schedule: mockSchedule,
        pendingSchedules: 1
    });

    // [Derived State] 총 예상 인건비 계산 (렌더링 시마다 재계산)
    const totalPayroll = data.payrolls.reduce((sum, p) => sum + p.totalPay, 0);

    /**
     * [Function] 데이터 새로고침 핸들러
     * - 로딩 상태 활성화
     * - 비동기 작업 시뮬레이션 (1초)
     * - 데이터 상태 업데이트 (랜덤 값)
     * - Toast 피드백 제공
     */
    const handleRefresh = () => {
        setIsLoading(true);
        
        // Simulate network request
        setTimeout(() => {
            // Randomly update pending schedules to simulate change
            const newPending = Math.floor(Math.random() * 5);
            
            setData(prev => ({
                ...prev,
                pendingSchedules: newPending
            }));

            setIsLoading(false);
            
            toast({
                title: "데이터 업데이트 완료",
                description: "최신 근무표 및 급여 정보를 불러왔습니다.",
            });
        }, 1000);
    };

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight font-headline text-foreground">근무표 대시보드</h1>
                    <p className="text-lg text-muted-foreground">이번 주 근무표를 검토하고 승인하세요.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="icon"
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="h-10 w-10"
                        aria-label="새로고침"
                    >
                        <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin text-primary' : 'text-muted-foreground'}`} />
                    </Button>
                    <DashboardActions />
                </div>
            </div>
            
            {/* Summary Section: 주요 지표 카드 */}
            <section aria-label="요약 정보">
                <SummaryCards totalPayroll={totalPayroll} pendingSchedules={data.pendingSchedules} />
            </section>
            
            {/* Grid Section: 주간 근무표 테이블 */}
            <section aria-label="주간 근무표">
                <Tabs defaultValue="employee" className="w-full space-y-4">
                    <div className="flex justify-end">
                        <TabsList className="grid w-[300px] grid-cols-2">
                            <TabsTrigger value="employee">직원별 보기</TabsTrigger>
                            <TabsTrigger value="time">시간대별 보기</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="employee" className="mt-0">
                        <ScheduleGrid schedule={data.schedule} />
                    </TabsContent>
                    <TabsContent value="time" className="mt-0">
                        <TimeScheduleTable schedule={data.schedule} />
                    </TabsContent>
                </Tabs>
            </section>
        </div>
    );
}
