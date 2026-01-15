"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MonthlySchedule, Employee } from "@/lib/types";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { getShiftWarningMessage, isOutsideShiftTime } from "@/lib/utils";

interface MonthlyCalendarViewProps {
  currentDate: Date;
  scheduleData: MonthlySchedule['schedule'];
  employees: Employee[];
}

export function MonthlyCalendarView({ currentDate, scheduleData, employees }: MonthlyCalendarViewProps) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // 일요일 시작
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDaysHeader = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="border rounded-md bg-background overflow-hidden text-sm">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-muted/50 border-b">
        {weekDaysHeader.map((day, i) => (
          <div key={day} className={`p-2 text-center font-medium ${
            i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : ''
          }`}>
            {day}
          </div>
        ))}
      </div>

      {/* 달력 그리드 */}
      <div className="grid grid-cols-7 auto-rows-[minmax(80px,auto)]">
        {calendarDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dailySchedule = scheduleData[dateKey] || {};
          
          // 근무자 찾기
          const workingEmployees = employees.filter(emp => dailySchedule[emp.id]);

          return (
            <div 
              key={dateKey} 
              className={`border-b border-r p-1 flex flex-col gap-1 ${
                !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : ''
              }`}
            >
              <div className={`text-right px-1 ${
                day.getDay() === 0 ? 'text-red-500' : day.getDay() === 6 ? 'text-blue-500' : ''
              }`}>
                {format(day, 'd')}
              </div>

              <div className="flex flex-col gap-0.5">
                <TooltipProvider>
                  {workingEmployees.map(emp => {
                    const timeRange = dailySchedule[emp.id];
                    const hasWarning = isOutsideShiftTime(emp, timeRange);

                    return (
                      <Tooltip key={`${dateKey}-${emp.id}`}>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-accent cursor-default group text-xs">
                            <span 
                              className="w-1.5 h-1.5 rounded-full shrink-0" 
                              style={{ backgroundColor: emp.color }}
                            />
                            <span className={`truncate ${hasWarning ? 'text-destructive font-medium' : ''}`}>
                              {emp.name}
                            </span>
                            {hasWarning && <span className="text-[10px] text-destructive ml-auto">⚠️</span>}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="text-xs">
                          <p className="font-bold">{emp.name}</p>
                          <p>{timeRange?.start} ~ {timeRange?.end}</p>
                          {hasWarning && (
                            <p className="text-destructive mt-1">
                              {getShiftWarningMessage(emp)}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

