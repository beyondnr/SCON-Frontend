"use client";

/**
 * [Script Purpose]
 * 근무표 대시보드 메인 페이지입니다.
 *
 * [Logic & Data Flow]
 * 1. 상태 관리:
 *    - currentDate: 현재 선택된 월
 *    - currentWeekIndex: 현재 선택된 주차
 *    - monthlySchedule: 월간 스케줄 데이터
 *    - isEditing: 편집 모드 여부
 * 2. 뷰 모드:
 *    - 조회 모드 (Default): MonthlyCalendarView (월 전체)
 *    - 편집 모드: TimeScheduleTable / ScheduleGrid (주 단위 상세 편집)
 */

import { useState, useMemo, useEffect } from "react";
import { ScheduleGrid } from "./components/schedule-grid";
import { TimeScheduleTable } from "./components/time-schedule-table";
import { SummaryCards } from "./components/summary-cards";
import { mockPayrolls } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Copy, Mail, Pencil, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EditShiftDialog } from "./components/edit-shift-dialog";
import { Employee, TimeRange, MonthlySchedule } from "@/lib/types";
import { getWeeksInMonth } from "@/lib/utils";
import { MonthNavigator } from "./components/month-navigator";
import { WeekTabs } from "./components/week-tabs";
import { addMonths, subMonths, format, addDays } from "date-fns";
import { CopyWeekPatternDialog } from "./components/copy-week-pattern-dialog";
import { SendScheduleDialog } from "./components/send-schedule-dialog";
import { AutoFillButton } from "./components/auto-fill-button";
import { mockEmployees } from "@/lib/mock-data";
import { getEmployeeShiftTime } from "@/lib/utils";
import { MonthlyCalendarView } from "./components/monthly-calendar-view";
import { SelectEmployeeDialog } from "./components/select-employee-dialog";

type ShiftInfo = {
    employee: Employee;
    day: string; // YYYY-MM-DD
    timeRange: TimeRange | null;
};

export default function DashboardPage() {
    const { toast } = useToast();
    
    // [State] 날짜 및 뷰 상태
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태

    // [State] 모달 상태
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);

    // [State] 데이터 상태
    const [monthlySchedule, setMonthlySchedule] = useState<MonthlySchedule>({
        id: 'temp-id',
        yearMonth: format(new Date(), 'yyyy-MM'),
        schedule: {},
        isModifiedAfterSent: false
    });

    const [editingShift, setEditingShift] = useState<ShiftInfo | null>(null);
    
    const [selectEmployeeState, setSelectEmployeeState] = useState<{
        isOpen: boolean;
        date: string;
        time: string;
        unavailableIds: string[];
    }>({ isOpen: false, date: "", time: "", unavailableIds: [] });

    // [Derived State] 현재 월의 주차 정보 계산
    const weeks = useMemo(() => {
        return getWeeksInMonth(currentDate.getFullYear(), currentDate.getMonth());
    }, [currentDate]);

    // 주차 변경 시 유효성 검사
    useEffect(() => {
        if (currentWeekIndex >= weeks.length) {
            setCurrentWeekIndex(0);
        }
    }, [weeks, currentWeekIndex]);

    const currentWeek = weeks[currentWeekIndex] || weeks[0];

    // [Derived State] 총 예상 인건비 (Mock 유지)
    const totalPayroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);
    const totalHours = mockPayrolls.reduce((sum, p) => sum + p.totalHours, 0);

    // 월 변경 핸들러
    const handlePrevMonth = () => {
        setCurrentDate(prev => subMonths(prev, 1));
        setCurrentWeekIndex(0);
    };
    const handleNextMonth = () => {
        setCurrentDate(prev => addMonths(prev, 1));
        setCurrentWeekIndex(0);
    };

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

        setSelectEmployeeState({
            isOpen: true,
            date: day,
            time,
            unavailableIds,
        });
    };

    const handleEmployeesSave = (employees: Employee[]) => {
        setSelectEmployeeState(prev => ({ ...prev, isOpen: false }));

        setMonthlySchedule(prev => {
            const newSchedule = { ...prev.schedule };
            const dateKey = selectEmployeeState.date;

            if (!newSchedule[dateKey]) {
                newSchedule[dateKey] = {};
            }

            employees.forEach(emp => {
                // 직원의 기본 근무 시간으로 설정
                const shiftTime = getEmployeeShiftTime(emp);
                newSchedule[dateKey][emp.id] = shiftTime;
            });

            return { ...prev, schedule: newSchedule, isModifiedAfterSent: true };
        });

        toast({
            title: "직원 추가 완료",
            description: `${employees.length}명의 직원이 추가되었습니다.`,
        });
    };

    const handleShiftClick = (employee: Employee, day: string, timeRange: TimeRange | null) => {
        setEditingShift({ employee, day, timeRange });
    };

    const handleSaveShift = (updatedShift: ShiftInfo) => {
        setMonthlySchedule(prev => {
            const newSchedule = { ...prev.schedule };
            if (!newSchedule[updatedShift.day]) {
                newSchedule[updatedShift.day] = {};
            }
            
            if (updatedShift.timeRange) {
                newSchedule[updatedShift.day][updatedShift.employee.id] = updatedShift.timeRange;
            } else {
                delete newSchedule[updatedShift.day][updatedShift.employee.id];
            }
            
            return { ...prev, schedule: newSchedule, isModifiedAfterSent: true };
        });
        
        setEditingShift(null);
        toast({
            title: "근무표 수정 완료",
            description: `${updatedShift.employee.name}님의 근무 시간이 수정되었습니다.`,
        });
    };

    // 자동 채우기 로직
    const handleAutoFill = () => {
        setMonthlySchedule(prev => {
            const newSchedule = { ...prev.schedule };
            
            // 이번 달의 모든 날짜 순회
            const allDates = weeks.flatMap(week => week.dates);

            allDates.forEach(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                
                // 날짜별 객체가 없으면 생성
                if (!newSchedule[dateKey]) {
                    newSchedule[dateKey] = {};
                }

                mockEmployees.forEach(emp => {
                    // 이미 스케줄이 있으면 건너뜀 (사용자 입력 존중)
                    if (newSchedule[dateKey][emp.id]) return;

                    // 스케줄이 없으면 기본 시간으로 채움
                    const shiftTime = getEmployeeShiftTime(emp);
                    newSchedule[dateKey][emp.id] = shiftTime;
                });
            });

            return { ...prev, schedule: newSchedule, isModifiedAfterSent: true };
        });

        toast({
            title: "자동 채우기 완료",
            description: "빈 근무 일정을 기본 근무 시간으로 채웠습니다.",
        });
    };

    // 패턴 복사 로직
    const handleCopyPattern = (targetWeekIndices: number[]) => {
        if (!currentWeek) return;

        setMonthlySchedule(prev => {
            const newSchedule = { ...prev.schedule };
            
            // 소스 데이터 추출 (현재 주차)
            const sourceData = currentWeek.dates.map(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                return newSchedule[dateKey] || {};
            });

            // 타겟 주차에 덮어쓰기
            targetWeekIndices.forEach(targetIndex => {
                const targetWeek = weeks[targetIndex];
                if (!targetWeek) return;

                targetWeek.dates.forEach((targetDate, dayIndex) => {
                    if (dayIndex < sourceData.length) {
                        const targetDateKey = format(targetDate, 'yyyy-MM-dd');
                        // 해당 요일의 소스 데이터 복사
                        newSchedule[targetDateKey] = { ...sourceData[dayIndex] };
                    }
                });
            });

            return { ...prev, schedule: newSchedule, isModifiedAfterSent: true };
        });

        toast({
            title: "패턴 복사 완료",
            description: `${targetWeekIndices.length}개 주차에 근무표가 복사되었습니다.`,
        });
    };

    // 이메일 발송 로직
    const handleSendEmail = () => {
        setIsSendDialogOpen(false);
        toast({
            title: "이메일 발송 중...",
            description: "직원들에게 근무표를 전송하고 있습니다.",
        });

        // Simulate API call
        setTimeout(() => {
            setMonthlySchedule(prev => ({
                ...prev,
                lastSentAt: new Date().toISOString(),
                isModifiedAfterSent: false
            }));
            toast({
                title: "발송 완료",
                description: "모든 직원에게 근무표가 성공적으로 발송되었습니다.",
            });
        }, 1500);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight font-headline text-foreground">근무표 대시보드</h1>
                    <p className="text-lg text-muted-foreground">월간 근무표를 작성하고 관리하세요.</p>
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
                </div>
            </div>
            
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
                onClose={() => setSelectEmployeeState(prev => ({ ...prev, isOpen: false }))}
                onSave={handleEmployeesSave}
                employees={mockEmployees}
                unavailableEmployeeIds={selectEmployeeState.unavailableIds}
                date={selectEmployeeState.date}
                time={selectEmployeeState.time}
            />

            <EditShiftDialog
                isOpen={!!editingShift}
                onClose={() => setEditingShift(null)}
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
