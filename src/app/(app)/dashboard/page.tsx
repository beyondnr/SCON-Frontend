"use client";

/**
 * [Script Purpose]
 * 근무표 대시보드 메인 페이지입니다.
 *
 * [Logic & Data Flow]
 * 1. 상태 관리:
 *    - Custom Hooks를 통한 상태 관리 분리
 *    - useDateNavigation: 날짜 및 주차 네비게이션
 *    - useMonthlySchedule: 월간 스케줄 데이터 관리
 *    - useShiftManagement: 시프트 편집 관리
 * 2. 뷰 모드:
 *    - 조회 모드 (Default): MonthlyCalendarView (월 전체)
 *    - 편집 모드: TimeScheduleTable / ScheduleGrid (주 단위 상세 편집)
 */

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { ScheduleGrid } from "./components/schedule-grid";
import { TimeScheduleTable } from "./components/time-schedule-table";
import { SummaryCards } from "./components/summary-cards";
import { mockPayrolls } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Copy, Mail, Pencil, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditShiftDialog } from "./components/edit-shift-dialog";
import { MonthNavigator } from "./components/month-navigator";
import { WeekTabs } from "./components/week-tabs";
import { CopyWeekPatternDialog } from "./components/copy-week-pattern-dialog";
import { SendScheduleDialog } from "./components/send-schedule-dialog";
import { AutoFillButton } from "./components/auto-fill-button";
import { mockEmployees } from "@/lib/mock-data";
import { SelectEmployeeDialog } from "./components/select-employee-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useDateNavigation } from "@/hooks/use-date-navigation";
import { useMonthlySchedule } from "@/hooks/use-monthly-schedule";
import { useShiftManagement } from "@/hooks/use-shift-management";
import { format } from "date-fns";

// 코드 스플리팅: 대용량 컴포넌트 지연 로딩
const MonthlyCalendarView = dynamic(
  () => import("./components/monthly-calendar-view").then((mod) => ({ default: mod.MonthlyCalendarView })),
  {
    loading: () => <div className="flex items-center justify-center h-96">로딩 중...</div>,
    ssr: false, // 클라이언트 사이드에서만 렌더링
  }
);

export default function DashboardPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

    // Custom Hooks
    const {
        currentDate,
        currentWeekIndex,
        setCurrentWeekIndex,
        weeks,
        currentWeek,
        handlePrevMonth,
        handleNextMonth,
    } = useDateNavigation();

    const {
        monthlySchedule,
        updateScheduleForDate,
        addEmployeesToSchedule,
        autoFillSchedule,
        copyWeekPattern,
        sendScheduleEmail,
    } = useMonthlySchedule();

    const {
        editingShift,
        selectEmployeeState,
        openEditDialog,
        closeEditDialog,
        openSelectEmployeeDialog,
        closeSelectEmployeeDialog,
    } = useShiftManagement();

    // [Derived State] 총 예상 인건비 (Mock 유지) - 메모이제이션
    const { totalPayroll, totalHours } = useMemo(() => {
      const payroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);
      const hours = mockPayrolls.reduce((sum, p) => sum + p.totalHours, 0);
      return { totalPayroll: payroll, totalHours: hours };
    }, []); // mockPayrolls는 정적 데이터이므로 의존성 배열 비움

    // 새로고침 핸들러
    const handleRefresh = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast({
                title: "데이터 업데이트 완료",
                description: "최신 근무표 정보를 불러왔습니다.",
            });
        }, 1000);
    };

    // Shift Editing Handlers
    const handleAddShiftClick = (day: string, time: string) => {
        const dailySchedule = monthlySchedule.schedule[day] || {};
        const unavailableIds = Object.keys(dailySchedule);
        openSelectEmployeeDialog(day, time, unavailableIds);
    };

    const handleEmployeesSave = (employees: import('@/lib/types').Employee[]) => {
        closeSelectEmployeeDialog();
        addEmployeesToSchedule(selectEmployeeState.date, employees);
    };

    const handleShiftClick = (
        employee: import('@/lib/types').Employee,
        day: string,
        timeRange: import('@/lib/types').TimeRange | null
    ) => {
        openEditDialog(employee, day, timeRange);
    };

    const handleSaveShift = (updatedShift: import('@/hooks/use-shift-management').ShiftInfo) => {
        if (updatedShift.timeRange) {
            updateScheduleForDate(updatedShift.day, updatedShift.employee.id, updatedShift.timeRange);
        } else {
            updateScheduleForDate(updatedShift.day, updatedShift.employee.id, null);
        }
        closeEditDialog();
        toast({
            title: "근무표 수정 완료",
            description: `${updatedShift.employee.name}님의 근무 시간이 수정되었습니다.`,
        });
    };

    // 자동 채우기 핸들러
    const handleAutoFill = () => {
        autoFillSchedule(weeks);
    };

    // 패턴 복사 핸들러
    const handleCopyPattern = (targetWeekIndices: number[]) => {
        if (!currentWeek) return;
        const targetWeeks = targetWeekIndices.map((idx) => weeks[idx]).filter(Boolean);
        copyWeekPattern(currentWeek, targetWeeks);
    };

    // 이메일 발송 핸들러
    const handleSendEmail = () => {
        setIsSendDialogOpen(false);
        toast({
            title: "이메일 발송 중...",
            description: "직원들에게 근무표를 전송하고 있습니다.",
        });
        sendScheduleEmail();
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <PageHeader
                title="근무표 대시보드"
                description="월간 근무표를 작성하고 관리하세요."
                action={
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
                }
            />
            
            {/* Summary Section */}
            <section aria-label="요약 정보">
                <SummaryCards totalPayroll={totalPayroll} totalHours={totalHours} />
            </section>
            
            {/* Month & Week Navigation */}
            <section className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <MonthNavigator 
                        currentDate={currentDate} 
                        onPrevMonth={handlePrevMonth} 
                        onNextMonth={handleNextMonth} 
                    />
                    
                    <div className="flex gap-2 w-full md:w-auto items-center flex-wrap justify-end">
                        {isEditing ? (
                            <>
                                <AutoFillButton onAutoFill={handleAutoFill} />
                                <Button 
                                    variant="outline" 
                                    onClick={() => setIsCopyDialogOpen(true)}
                                    className="gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    패턴 복사
                                </Button>
                                <Button 
                                    variant="default"
                                    onClick={() => setIsEditing(false)}
                                    className="gap-2 bg-green-600 hover:bg-green-700"
                                >
                                    <Check className="h-4 w-4" />
                                    수정 완료
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                    className="gap-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                    근무표 수정
                                </Button>
                                <Button 
                                    variant="default"
                                    onClick={() => setIsSendDialogOpen(true)}
                                    className="gap-2"
                                >
                                    <Mail className="h-4 w-4" />
                                    직원에게 발송
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="min-h-[500px]">
                {isEditing ? (
                    /* 편집 모드: 주간 상세 뷰 */
                    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <WeekTabs 
                            weeks={weeks} 
                            currentWeekIndex={currentWeekIndex} 
                            onWeekChange={setCurrentWeekIndex} 
                        />
                         <Tabs defaultValue="time" className="w-full space-y-4">
                            <div className="flex justify-end">
                                <TabsList className="grid w-[300px] grid-cols-2">
                                    <TabsTrigger value="time">시간대별 보기</TabsTrigger>
                                    <TabsTrigger value="employee">직원별 보기</TabsTrigger>
                                </TabsList>
                            </div>
                            
                            <TabsContent value="time" className="mt-0">
                                <TimeScheduleTable 
                                    scheduleData={monthlySchedule.schedule} 
                                    dates={currentWeek?.dates || []}
                                    onEditShift={handleShiftClick}
                                    onAddShift={handleAddShiftClick}
                                />
                            </TabsContent>
                            <TabsContent value="employee" className="mt-0">
                                <ScheduleGrid 
                                    scheduleData={monthlySchedule.schedule}
                                    dates={currentWeek?.dates || []}
                                    onEditShift={handleShiftClick} 
                                />
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    /* 조회 모드: 월간 캘린더 뷰 */
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <MonthlyCalendarView 
                            currentDate={currentDate}
                            scheduleData={monthlySchedule.schedule}
                        />
                    </div>
                )}
            </div>

            {/* Dialogs */}
            <SelectEmployeeDialog
                isOpen={selectEmployeeState.isOpen}
                onClose={closeSelectEmployeeDialog}
                onSave={handleEmployeesSave}
                employees={mockEmployees}
                unavailableEmployeeIds={selectEmployeeState.unavailableIds}
                date={selectEmployeeState.date}
                time={selectEmployeeState.time}
            />

            <EditShiftDialog
                isOpen={!!editingShift}
                onClose={closeEditDialog}
                shiftInfo={editingShift}
                onSave={handleSaveShift}
            />
            
            <CopyWeekPatternDialog
                isOpen={isCopyDialogOpen}
                onClose={() => setIsCopyDialogOpen(false)}
                weeks={weeks}
                currentWeekIndex={currentWeekIndex}
                onCopy={handleCopyPattern}
            />

            <SendScheduleDialog
                isOpen={isSendDialogOpen}
                onClose={() => setIsSendDialogOpen(false)}
                onSend={handleSendEmail}
                currentDate={currentDate}
                monthlySchedule={monthlySchedule}
            />
        </div>
    );
}
