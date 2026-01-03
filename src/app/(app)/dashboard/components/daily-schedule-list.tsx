"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Employee, MonthlySchedule, TimeRange } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isBefore, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { getShiftWarningMessage, isOutsideShiftTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, History, Plus, Pencil, Trash2 } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DailyScheduleListProps {
  currentDate: Date;
  scheduleData: MonthlySchedule['schedule'];
  employees: Employee[];
  isEditing?: boolean;
  onEditShift?: (employee: Employee, day: string, timeRange: TimeRange | null) => void;
  onAddShift?: (day: string, time: string) => void;
}

// 근무 조 타입 판단 헬퍼 함수
const getShiftType = (employee: Employee, timeRange: TimeRange | null): 'morning' | 'afternoon' => {
  if (employee.shiftPreset === 'morning') return 'morning';
  if (employee.shiftPreset === 'afternoon') return 'afternoon';
  
  if (timeRange && timeRange.start < "12:00") {
    return 'morning';
  }
  return 'afternoon';
};

export function DailyScheduleList({ 
  currentDate, 
  scheduleData, 
  employees,
  isEditing = false,
  onEditShift,
  onAddShift
}: DailyScheduleListProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const today = new Date();
  const todayRef = useRef<HTMLDivElement>(null);
  
  // 지난 내역 접기 상태
  const [isPastExpanded, setIsPastExpanded] = useState(false);

  // 달력이 아닌 해당 월의 '모든 날짜'를 리스트로
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // 날짜 분류: 지난 날짜 vs 오늘 이후 날짜
  // (단, 이번 달이 아닌 과거나 미래의 달을 보고 있을 때는 전체 표시)
  const isCurrentMonthView = isSameDay(today, new Date()) || (today >= monthStart && today <= monthEnd);
  
  const pastDays = isCurrentMonthView 
    ? monthDays.filter(day => isBefore(day, today) && !isSameDay(day, today))
    : [];
    
  const futureDays = isCurrentMonthView
    ? monthDays.filter(day => !isBefore(day, today) || isSameDay(day, today))
    : monthDays;

  // 컴포넌트 마운트 시 오늘 날짜로 스크롤 (약간의 딜레이 후 실행하여 레이아웃 안정화 대기)
  useEffect(() => {
    if (isCurrentMonthView && todayRef.current) {
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [isCurrentMonthView, currentDate]);

  const renderDayCard = (day: Date, isToday: boolean = false) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayOfWeek = format(day, 'E', { locale: ko });
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const isSunday = day.getDay() === 0;
    const isSaturday = day.getDay() === 6;
    
    const dailySchedule = scheduleData[dateKey] || {};
    
    // 근무자 찾기 및 정렬
    const workingEmployees = employees
      .filter(emp => dailySchedule[emp.id])
      .sort((a, b) => {
        const scheduleA = dailySchedule[a.id];
        const scheduleB = dailySchedule[b.id];
        
        const typeA = getShiftType(a, scheduleA);
        const typeB = getShiftType(b, scheduleB);

        if (typeA !== typeB) {
          return typeA === 'morning' ? -1 : 1;
        }
        return (scheduleA?.start || "").localeCompare(scheduleB?.start || "");
      });

    return (
      <div 
        key={dateKey} 
        ref={isToday ? todayRef : null}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden scroll-mt-32 transition-all",
          isToday && "border-2 border-primary ring-2 ring-primary/20 shadow-md"
        )}
      >
        {/* 날짜 헤더 */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3 border-b",
          isToday ? "bg-primary/5" : "bg-muted/30"
        )}>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg font-bold",
              isSunday && "text-red-500",
              isSaturday && "text-blue-500",
              isToday && "text-primary"
            )}>
              {format(day, 'd')}일
            </span>
            <span className={cn(
              "text-sm font-medium text-muted-foreground",
              isSunday && "text-red-400",
              isSaturday && "text-blue-400",
              isToday && "text-primary/80"
            )}>
              ({dayOfWeek})
            </span>
            {isToday && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full animate-pulse">
                TODAY
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isEditing && (
                <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 px-2 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => onAddShift?.(dateKey, "09:00")}
                >
                    <Plus className="h-3 w-3" />
                    추가
                </Button>
            )}
            {!isEditing && (
                <div className="text-xs text-muted-foreground">
                    {workingEmployees.length > 0 ? `${workingEmployees.length}명 근무` : '휴무 / 근무 없음'}
                </div>
            )}
          </div>
        </div>

        {/* 근무자 리스트 */}
        <div className="p-3 space-y-2">
          {workingEmployees.length === 0 ? (
            <div className="text-center py-4">
                 <p className="text-sm text-muted-foreground">예정된 근무가 없습니다.</p>
                 {isEditing && (
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-primary hover:text-primary/80 hover:bg-primary/5"
                        onClick={() => onAddShift?.(dateKey, "09:00")}
                     >
                         <Plus className="h-4 w-4 mr-1" />
                         첫 근무자 추가하기
                     </Button>
                 )}
            </div>
          ) : (
            workingEmployees.map(emp => {
              const timeRange = dailySchedule[emp.id];
              const hasWarning = isOutsideShiftTime(emp, timeRange);
              const shiftType = getShiftType(emp, timeRange);

              return (
                <div 
                  key={emp.id} 
                  onClick={() => isEditing && onEditShift?.(emp, dateKey, timeRange)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md bg-background border transition-all relative overflow-hidden",
                    isEditing ? "cursor-pointer hover:border-primary hover:bg-primary/5 active:bg-primary/10" : "hover:bg-accent/50"
                  )}
                >
                  {/* 좌측: 직원 정보 */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-1.5 h-10 rounded-full" 
                      style={{ backgroundColor: emp.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base">{emp.name}</span>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          shiftType === 'morning' 
                            ? "bg-amber-100 text-amber-800 border border-amber-200" 
                            : "bg-slate-100 text-slate-800 border border-slate-200"
                        )}>
                          {shiftType === 'morning' ? '오전' : '오후'}
                        </span>
                      </div>
                      
                      {/* 편집 모드가 아닐 때 경고 메시지 표시 */}
                      {!isEditing && hasWarning && (
                         <div className="mt-1">
                             <span className="text-xs text-destructive font-medium bg-destructive/5 px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                               ⚠️ {getShiftWarningMessage(emp)}
                             </span>
                         </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 우측: 시간 정보 or 액션 버튼 */}
                  <div className="flex items-center gap-3">
                     <div className={cn(
                         "text-sm font-mono font-medium",
                         hasWarning ? "text-destructive" : "text-foreground"
                     )}>
                         {timeRange?.start} ~ {timeRange?.end}
                     </div>

                     {/* 수정 모드: 아이콘 버튼 표시 */}
                     {isEditing && (
                         <div className="flex items-center gap-1">
                            <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                         </div>
                     )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-4">
      {/* 지난 날짜 접기 영역 (이번 달 보기일 때만) */}
      {isCurrentMonthView && pastDays.length > 0 && (
        <Collapsible
          open={isPastExpanded}
          onOpenChange={setIsPastExpanded}
          className="space-y-2"
        >
          <div className="flex items-center justify-center">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground h-10 border-dashed">
                <History className="h-4 w-4" />
                {isPastExpanded ? "지난 근무 내역 접기" : `지난 ${pastDays.length}일간의 근무 내역 보기`}
                {isPastExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4 pt-2 animate-accordion-down">
            {pastDays.map(day => renderDayCard(day, false))}
            <div className="h-px bg-border my-4" /> {/* 구분선 */}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* 오늘 및 미래 날짜 (또는 전체 날짜) */}
      {futureDays.map(day => renderDayCard(day, isSameDay(day, today)))}
    </div>
  );
}
