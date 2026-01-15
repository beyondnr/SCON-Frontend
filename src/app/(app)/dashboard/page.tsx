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

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ScheduleGrid } from "./components/schedule-grid";
import { TimeScheduleTable } from "./components/time-schedule-table";
import { SummaryCards } from "./components/summary-cards";
import { EmptyState } from "./components/empty-state";
import { DailyScheduleList } from "./components/daily-schedule-list";
import { mockPayrolls } from "@/lib/mock-data";
import { DASHBOARD_CONSTANTS, getEmptyStateMessage } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Copy, Mail, Pencil, Check, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { EditShiftDialog } from "./components/edit-shift-dialog";
import { MonthNavigator } from "./components/month-navigator";
import { WeekTabs } from "./components/week-tabs";
import { CopyWeekPatternDialog } from "./components/copy-week-pattern-dialog";
import { SendScheduleDialog } from "./components/send-schedule-dialog";
import { AutoFillButton } from "./components/auto-fill-button";
import { SelectEmployeeDialog } from "./components/select-employee-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { useDateNavigation } from "@/hooks/use-date-navigation";
import { useMonthlySchedule } from "@/hooks/use-monthly-schedule";
import { useShiftManagement } from "@/hooks/use-shift-management";
import { format } from "date-fns";
import apiClient from "@/lib/api-client";
import { getCurrentStoreId } from "@/lib/local-storage-utils";
import { ApiStore, ApiEmployee, apiEmployeeToFrontend } from "@/lib/api-mappers";
import { logger } from "@/lib/logger";

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
    const router = useRouter();
    const isMobile = useIsMobile(); // 모바일 여부 확인
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
    const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
    
    // API 데이터 상태
    const [store, setStore] = useState<ApiStore | null>(null);
    const [employees, setEmployees] = useState<ApiEmployee[]>([]);
    const [isStoreLoading, setIsStoreLoading] = useState(false);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

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
        fetchMonthlySchedule,
        fetchScheduleDetail,
        getScheduleIdForWeek,
        saveSchedule,
        isLoading: isScheduleLoading,
        isSaving: isScheduleSaving,
    } = useMonthlySchedule();

    const {
        editingShift,
        selectEmployeeState,
        openEditDialog,
        closeEditDialog,
        openSelectEmployeeDialog,
        closeSelectEmployeeDialog,
    } = useShiftManagement();

    // 매장 정보 조회
    useEffect(() => {
        const fetchStore = async () => {
            const storeId = getCurrentStoreId();
            if (!storeId) {
                toast({
                    title: "오류",
                    description: "매장 정보를 찾을 수 없습니다.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setIsStoreLoading(true);
                const response = await apiClient.get<ApiStore>(`/v1/stores/${storeId}`);
                setStore(response.data || null);
                logger.debug("Store fetched successfully", { storeId });
            } catch (error) {
                // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
                logger.error("[Dashboard] Failed to fetch store:", error);
            } finally {
                setIsStoreLoading(false);
            }
        };

        fetchStore();
    }, [toast]);

    // 직원 목록 조회
    useEffect(() => {
        const fetchEmployees = async () => {
            const storeId = getCurrentStoreId();
            if (!storeId) {
                return;
            }

            try {
                setIsEmployeesLoading(true);
                const response = await apiClient.get<ApiEmployee[]>(
                    `/v1/stores/${storeId}/employees`
                );
                setEmployees(response.data || []);
                logger.debug("Employees fetched successfully", { 
                    count: response.data?.length || 0 
                });
            } catch (error) {
                // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
                logger.error("[Dashboard] Failed to fetch employees:", error);
                setEmployees([]); // 에러 시 빈 배열로 설정
            } finally {
                setIsEmployeesLoading(false);
            }
        };

        fetchEmployees();
    }, []);

    // 페이지 로드 시 및 날짜 변경 시 스케줄 조회
    useEffect(() => {
        const yearMonth = format(currentDate, 'yyyy-MM');
        fetchMonthlySchedule(yearMonth);
    }, [currentDate, fetchMonthlySchedule]);

    // 주차 선택 시 스케줄 상세 조회
    useEffect(() => {
        if (!currentWeek || !currentWeek.dates || currentWeek.dates.length === 0) {
            return;
        }

        const weekStartDate = currentWeek.dates[0]; // 주차 시작 날짜 (월요일)
        const scheduleId = getScheduleIdForWeek(weekStartDate);

        if (scheduleId) {
            fetchScheduleDetail(scheduleId);
        }
    }, [currentWeekIndex, currentWeek, getScheduleIdForWeek, fetchScheduleDetail]);

    // [Derived State] 총 예상 인건비 (Mock 유지) - 메모이제이션
    const { totalPayroll, totalHours } = useMemo(() => {
      const payroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);
      const hours = mockPayrolls.reduce((sum, p) => sum + p.totalHours, 0);
      return { totalPayroll: payroll, totalHours: hours };
    }, []); // mockPayrolls는 정적 데이터이므로 의존성 배열 비움

    // 새로고침 핸들러
    const handleRefresh = async () => {
        setIsLoading(true);
        try {
            const storeId = getCurrentStoreId();
            const yearMonth = format(currentDate, 'yyyy-MM');
            
            // 모든 데이터 새로고침 (병렬 호출 가능)
            await Promise.all([
                storeId ? apiClient.get<ApiStore>(`/v1/stores/${storeId}`).then((response) => {
                    setStore(response.data || null);
                }) : Promise.resolve(),
                storeId ? apiClient.get<ApiEmployee[]>(
                    `/v1/stores/${storeId}/employees`
                ).then((response) => {
                    setEmployees(response.data || []);
                }) : Promise.resolve(),
                fetchMonthlySchedule(yearMonth),
            ]);
            
            toast({
                title: "데이터 업데이트 완료",
                description: "최신 근무표 정보를 불러왔습니다.",
            });
        } catch (error) {
            // 에러는 각 API 호출에서 이미 처리됨
            logger.error("[Dashboard] Refresh error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Shift Editing Handlers
    const handleAddShiftClick = (day: string, time: string) => {
        const dailySchedule = monthlySchedule?.schedule?.[day] || {};
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
        // 직원 목록을 ApiEmployee에서 Employee 형식으로 변환
        const frontendEmployees = employees.map(apiEmployeeToFrontend);
        autoFillSchedule(weeks, frontendEmployees);
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

    // 저장 핸들러
    const handleSaveSchedule = async () => {
        if (!monthlySchedule) {
            toast({
                title: "오류",
                description: "스케줄 정보를 찾을 수 없습니다.",
                variant: "destructive",
            });
            return;
        }

        // 현재 주차의 스케줄 ID 확인
        if (!currentWeek || !currentWeek.dates || currentWeek.dates.length === 0) {
            toast({
                title: "오류",
                description: "주차 정보를 찾을 수 없습니다.",
                variant: "destructive",
            });
            return;
        }

        const weekStartDate = currentWeek.dates[0]; // 주차 시작 날짜 (월요일)
        const scheduleId = getScheduleIdForWeek(weekStartDate);

        if (!scheduleId) {
            toast({
                title: "오류",
                description: "스케줄 ID를 찾을 수 없습니다. 스케줄을 먼저 생성해주세요.",
                variant: "destructive",
            });
            return;
        }

        try {
            await saveSchedule(monthlySchedule, scheduleId, weekStartDate);
            
            toast({
                title: "저장 완료",
                description: "스케줄이 저장되었습니다.",
            });
        } catch (error) {
            // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
            console.error("[Dashboard] Failed to save schedule:", error);
        }
    };

    // 수정 여부 확인
    const isModified = monthlySchedule?.isModifiedAfterSent || false;

    // Empty state 여부 계산
    // [확장 고려] 현재는 상수 기반이지만, 향후 비즈니스 모드에 따라 동적으로 변경 가능
    const shouldShowEmptyState = !isEmployeesLoading && 
                                 DASHBOARD_CONSTANTS.shouldShowEmptyState(employees.length);
    
    // [확장 고려] 향후 비즈니스 모드에 따라 다른 메시지 사용 가능
    const emptyStateMessage = getEmptyStateMessage();

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
            
            {shouldShowEmptyState ? (
                /* EmptyState: 직원이 없을 때 */
                <EmptyState 
                    onAddEmployee={() => router.push('/settings')}
                    title={emptyStateMessage.title}
                    description={emptyStateMessage.description}
                    ctaText={emptyStateMessage.ctaText}
                />
            ) : (
                <>
                    {/* Summary Section */}
                    <section aria-label="요약 정보">
                        <SummaryCards 
                            totalPayroll={totalPayroll} 
                            totalHours={totalHours}
                            employees={employees}
                            monthlySchedule={monthlySchedule}
                            currentDate={currentDate}
                        />
                    </section>
                    
                    {/* Month & Week Navigation */}
                    <section className="space-y-4">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <MonthNavigator 
                                currentDate={currentDate} 
                                onPrevMonth={handlePrevMonth} 
                                onNextMonth={handleNextMonth} 
                            />
                            
                            {/* 모바일: 2열 그리드, 데스크탑: 가로 나열 */}
                            <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:flex-row md:items-center md:flex-wrap md:justify-end">
                                {isEditing ? (
                                    <>
                                        <AutoFillButton onAutoFill={handleAutoFill} className="h-12 md:h-10" />
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsCopyDialogOpen(true)}
                                            className="gap-2 h-12 md:h-10"
                                        >
                                            <Copy className="h-4 w-4" />
                                            <span className="truncate">패턴 복사</span>
                                        </Button>
                                        <Button 
                                            variant="default"
                                            onClick={() => setIsEditing(false)}
                                            className="gap-2 h-12 md:h-10 bg-green-600 hover:bg-green-700 col-span-2 md:col-span-1"
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
                                            className="gap-2 h-12 md:h-10"
                                        >
                                            <Pencil className="h-4 w-4" />
                                            <span className="truncate">근무표 수정</span>
                                        </Button>
                                        <Button 
                                            variant="default"
                                            onClick={() => setIsSendDialogOpen(true)}
                                            className="gap-2 h-12 md:h-10"
                                        >
                                            <Mail className="h-4 w-4" />
                                            <span className="truncate">직원에게 발송</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Main Content Area */}
                    <div className="min-h-[500px] md:min-h-[500px]">
                        {isScheduleLoading ? (
                            /* 로딩 상태 */
                            <div className="flex items-center justify-center h-96">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    <span className="text-muted-foreground">스케줄을 불러오는 중...</span>
                                </div>
                            </div>
                        ) : isEditing ? (
                            /* 편집 모드 */
                            isMobile ? (
                                /* 모바일 편집 모드: 일별 리스트 뷰 */
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <DailyScheduleList 
                                        currentDate={currentDate}
                                        scheduleData={monthlySchedule?.schedule || {}}
                                        employees={employees.map(apiEmployeeToFrontend)}
                                        isEditing={true}
                                        onEditShift={handleShiftClick}
                                        onAddShift={handleAddShiftClick}
                                    />
                                </div>
                            ) : (
                                /* 데스크탑 편집 모드: 주간 상세 뷰 */
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
                                                scheduleData={monthlySchedule?.schedule || {}} 
                                                dates={currentWeek?.dates || []}
                                                employees={employees.map(apiEmployeeToFrontend)}
                                                onEditShift={handleShiftClick}
                                                onAddShift={handleAddShiftClick}
                                            />
                                        </TabsContent>
                                        <TabsContent value="employee" className="mt-0">
                                            <ScheduleGrid 
                                                scheduleData={monthlySchedule?.schedule || {}}
                                                dates={currentWeek?.dates || []}
                                                employees={employees.map(apiEmployeeToFrontend)}
                                                onEditShift={handleShiftClick} 
                                            />
                                        </TabsContent>
                                    </Tabs>
                                </div>
                            )
                        ) : (
                            /* 조회 모드 */
                            isMobile ? (
                                /* 모바일 조회 모드: 일별 리스트 뷰 */
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <DailyScheduleList 
                                        currentDate={currentDate}
                                        scheduleData={monthlySchedule?.schedule || {}}
                                        employees={employees.map(apiEmployeeToFrontend)}
                                        isEditing={false}
                                    />
                                </div>
                            ) : (
                                /* 데스크탑 조회 모드: 월간 캘린더 뷰 */
                                <div className="animate-in fade-in zoom-in-95 duration-200">
                                    <MonthlyCalendarView 
                                        currentDate={currentDate}
                                        scheduleData={monthlySchedule?.schedule || {}}
                                        employees={employees.map(apiEmployeeToFrontend)}
                                    />
                                </div>
                            )
                        )}
                    </div>
                </>
            )}

            {/* Dialogs */}
            <SelectEmployeeDialog
                isOpen={selectEmployeeState.isOpen}
                onClose={closeSelectEmployeeDialog}
                onSave={handleEmployeesSave}
                employees={employees.map(apiEmployeeToFrontend)}
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
                employees={employees.map(apiEmployeeToFrontend)}
            />

            {/* 저장 버튼 (수정된 경우에만 표시) */}
            {isModified && (
                <div className="fixed bottom-4 right-4 z-50">
                    <Button
                        onClick={handleSaveSchedule}
                        disabled={isScheduleSaving || isScheduleLoading}
                        size="lg"
                        className="shadow-lg"
                    >
                        {isScheduleSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                저장 중...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                스케줄 저장
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
