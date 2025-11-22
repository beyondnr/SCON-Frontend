// File: studio/src/app/(app)/dashboard/components/schedule-grid.tsx
"use client";

/**
 * [Script Purpose]
 * 직원별 주간 근무 스케줄을 그리드(테이블) 형태로 시각화하고 관리하는 컴포넌트입니다.
 * 
 * [Logic & Data Flow]
 * 1. 스케줄 렌더링: 직원(행) x 요일(열) 매트릭스 구조로 스케줄을 표시합니다.
 * 2. 법규 위반 체크 (Simulation):
 *    - useEffect를 통해 컴포넌트 마운트 시 랜덤하게 특정 근무를 '법규 위반'으로 표시합니다.
 *    - 위반 시 붉은색 하이라이트와 아이콘 애니메이션을 적용합니다.
 * 3. 상호작용 (Interaction):
 *    - 셀 클릭 -> handleShiftClick -> 편집 모달(EditShiftDialog) 오픈
 *    - 모달 저장 -> handleSaveShift -> 로컬 스케줄 상태(schedule) 업데이트
 */

import { useState, Fragment, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEmployees, weekDays } from "@/lib/mock-data";
import { Schedule, TimeRange, Employee } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import { EditShiftDialog } from "./edit-shift-dialog";
import { Calendar, Clock } from "lucide-react";

/**
 * [Type Definition] ShiftInfo
 * 스케줄 수정 시 선택된 셀의 컨텍스트 정보를 담습니다.
 */
type ShiftInfo = {
    employee: Employee;
    day: string;
    timeRange: TimeRange | null;
};

type ViolationState = {
    [key: string]: boolean;
};

export function ScheduleGrid({ schedule: initialSchedule }: { schedule: Schedule }) {
    // [State] 로컬 스케줄 데이터 및 UI 상태
    const [schedule, setSchedule] = useState(initialSchedule);
    const [editingShift, setEditingShift] = useState<ShiftInfo | null>(null);
    const [violations, setViolations] = useState<ViolationState>({});

    // [Effect] 컴포넌트 마운트 시 법규 위반 여부 시뮬레이션
    useEffect(() => {
        const newViolations: ViolationState = {};
        mockEmployees.forEach(employee => {
            weekDays.forEach(day => {
                // 데모 목적: 특정 직원의 스케줄을 랜덤하게 위반으로 표시
                if (employee.id === 'emp-1' && Math.random() < 0.1) {
                    newViolations[`${employee.id}-${day}`] = true;
                }
            });
        });
        setViolations(newViolations);
    }, []);


    /**
     * [Function] 셀 클릭 핸들러
     * 클릭된 셀의 정보(직원, 요일, 현재 시간)를 상태에 저장하여 편집 다이얼로그를 엽니다.
     */
    const handleShiftClick = (employee: Employee, day: string, timeRange: TimeRange | null) => {
        setEditingShift({ employee, day, timeRange });
    };

    /**
     * [Function] 스케줄 저장 핸들러
     * 다이얼로그에서 '저장' 버튼 클릭 시 호출됩니다.
     * 불변성을 유지하며 schedule 상태를 업데이트합니다.
     */
    const handleSaveShift = (updatedShift: ShiftInfo) => {
        setSchedule(prevSchedule => {
            const newSchedule = { ...prevSchedule };
            if (!newSchedule[updatedShift.day]) {
                newSchedule[updatedShift.day] = {};
            }
            newSchedule[updatedShift.day][updatedShift.employee.id] = updatedShift.timeRange;
            return newSchedule;
        });
        setEditingShift(null);
    };

    return (
        <>
            <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline text-xl">주간 스케줄 현황</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* CSS Grid를 활용한 테이블 레이아웃 */}
                        <div className="grid gap-[1px] bg-border/50" style={{ gridTemplateColumns: `160px repeat(${weekDays.length}, minmax(110px, 1fr))` }}>
                            
                            {/* [Header Row] 요일 헤더 */}
                            <div className="bg-muted/50 p-4 font-semibold text-sm text-muted-foreground sticky left-0 z-20 border-b flex items-center justify-center">직원 / 요일</div>
                            {weekDays.map(day => (
                                <div key={day} className="bg-muted/30 p-4 font-semibold text-sm text-center text-foreground border-b">{day}</div>
                            ))}

                            {/* [Body Rows] 직원별 스케줄 행 */}
                            {mockEmployees.map(employee => (
                                <Fragment key={employee.id}>
                                    {/* 직원 정보 컬럼 (Sticky) */}
                                    <div className="bg-background p-4 text-sm font-medium sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                                            {employee.avatarUrl ? (
                                                <img src={employee.avatarUrl} alt={employee.name} className="h-full w-full object-cover" />
                                            ) : (
                                                employee.name[0]
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-foreground">{employee.name}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{employee.role}</span>
                                        </div>
                                    </div>
                                    
                                    {/* 요일별 근무 시간 셀 */}
                                    {weekDays.map(day => {
                                        const timeRange = schedule[day]?.[employee.id];
                                        const isViolation = violations[`${employee.id}-${day}`];
                                        return (
                                            <div
                                                key={`${employee.id}-${day}`}
                                                className={cn(
                                                    "relative p-3 min-h-[80px] flex flex-col items-center justify-center text-xs cursor-pointer transition-all duration-200 group border-b last:border-b-0",
                                                    "hover:bg-accent/50 hover:shadow-inner",
                                                    isViolation ? "bg-destructive/5 hover:bg-destructive/10" : "bg-background"
                                                )}
                                                onClick={() => handleShiftClick(employee, day, timeRange || null)}
                                            >
                                                {/* 위반 시 표시되는 인디케이터 */}
                                                {isViolation && (
                                                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" title="법규 위반 경고" />
                                                )}
                                                
                                                {timeRange ? (
                                                    <div className={cn(
                                                        "rounded-md px-3 py-1.5 font-medium shadow-sm border flex items-center gap-1.5 w-full justify-center",
                                                        isViolation 
                                                            ? "bg-white border-destructive/30 text-destructive" 
                                                            : "bg-primary/5 border-primary/20 text-primary group-hover:bg-primary/10 group-hover:border-primary/30"
                                                    )}>
                                                        <Clock className="h-3 w-3 opacity-70" />
                                                        <span>{formatTime(timeRange.start)} - {formatTime(timeRange.end)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 text-lg font-light transition-colors">+</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 스케줄 편집 모달 */}
            <EditShiftDialog
                isOpen={!!editingShift}
                onClose={() => setEditingShift(null)}
                shiftInfo={editingShift}
                onSave={handleSaveShift}
            />
        </>
    );
}
