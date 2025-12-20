"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockEmployees } from "@/lib/mock-data";
import { Employee, TimeRange, MonthlySchedule } from "@/lib/types";
import { Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { parseMinutes, isOutsideShiftTime, getShiftWarningMessage } from "@/lib/utils";

interface TimeScheduleTableProps {
  scheduleData: MonthlySchedule['schedule'];
  dates: Date[];
  onEditShift?: (employee: Employee, day: string, timeRange: TimeRange | null) => void;
  onAddShift?: (day: string, time: string) => void;
}

export function TimeScheduleTable({ scheduleData, dates, onEditShift, onAddShift }: TimeScheduleTableProps) {
  // 09:00 ~ 22:00 (1시간 단위)
  const hours = Array.from({ length: 14 }, (_, i) => i + 9);

  // 해당 슬롯(1시간) 내의 근무 시간(분) 계산 및 텍스트 반환
  const getWorkingDurationText = (slotHour: number, startStr: string, endStr: string) => {
    const slotStart = slotHour * 60;
    const slotEnd = (slotHour + 1) * 60;
    
    const workStart = parseMinutes(startStr);
    const workEnd = parseMinutes(endStr);

    // 겹치는 구간 계산
    const start = Math.max(slotStart, workStart);
    const end = Math.min(slotEnd, workEnd);

    if (end <= start) return null;

    const durationMinutes = end - start;
    
    if (durationMinutes === 60) return "1시간";
    return `${durationMinutes}분`;
  };

  const isWorking = (hour: number, startStr: string, endStr: string) => {
    const startHour = parseInt(startStr.split(":")[0], 10);
    const endHour = parseInt(endStr.split(":")[0], 10);
    return hour >= startHour && hour < endHour;
  };

  return (
    <TooltipProvider>
      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="font-headline text-xl">
              시간대별 근무표 현황
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Grid Layout: Time Column + Dates */}
            <div
              className="grid gap-[1px] bg-border/50"
              style={{
                gridTemplateColumns: `80px repeat(${dates.length}, minmax(120px, 1fr))`,
              }}
            >
              {/* Header Row */}
              <div className="bg-muted/50 p-4 font-semibold text-sm text-muted-foreground sticky top-0 z-20 border-b flex items-center justify-center">
                시간
              </div>
              {dates.map((date) => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const isSunday = date.getDay() === 0;
                const isSaturday = date.getDay() === 6;
                
                return (
                  <div
                    key={dateKey}
                    className={`bg-muted/30 p-4 font-semibold text-sm text-center border-b sticky top-0 z-20 ${
                      isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-foreground'
                    }`}
                  >
                    {format(date, 'M/d (eee)', { locale: ko })}
                  </div>
                );
              })}

              {/* Body Rows: Hours */}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  {/* Time Column */}
                  <div className="bg-background p-4 text-sm font-medium text-muted-foreground border-r flex items-center justify-center">
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>

                  {/* Dates Columns */}
                  {dates.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const dailySchedule = scheduleData[dateKey] || {};

                    // Find employees working at this hour on this day
                    const workingEmployees = mockEmployees.filter((emp) => {
                      const timeRange = dailySchedule[emp.id];
                      if (!timeRange) return false;
                      return isWorking(hour, timeRange.start, timeRange.end);
                    });

                    return (
                      <div
                        key={`${dateKey}-${hour}`}
                        className="bg-background p-2 border-b border-r last:border-r-0 flex flex-wrap gap-1 content-start min-h-[60px] hover:bg-accent/20 cursor-pointer transition-colors"
                        onClick={() => onAddShift?.(dateKey, `${hour.toString().padStart(2, "0")}:00`)}
                      >
                        {workingEmployees.map((emp) => {
                          const timeRange = dailySchedule[emp.id];
                          const durationText = timeRange
                            ? getWorkingDurationText(
                                hour,
                                timeRange.start,
                                timeRange.end
                              )
                            : "";
                          
                          // Check for shift warning
                          const hasWarning = isOutsideShiftTime(emp, timeRange);

                          return (
                            <Tooltip key={emp.id}>
                              <TooltipTrigger asChild>
                                <div 
                                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-full whitespace-nowrap border cursor-pointer transition-colors relative group"
                                  style={{
                                    backgroundColor: emp.color ? `${emp.color}20` : undefined,
                                    borderColor: hasWarning ? '#ef4444' : (emp.color ? `${emp.color}40` : undefined),
                                    color: emp.color || undefined,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEditShift?.(emp, dateKey, timeRange || null);
                                  }}
                                >
                                  {hasWarning && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                        <AlertTriangle className="h-3 w-3 text-destructive animate-pulse" />
                                    </div>
                                  )}
                                  <Avatar className="h-4 w-4 shrink-0">
                                    <AvatarFallback 
                                      className="text-[8px] flex items-center justify-center w-full h-full"
                                      style={{ backgroundColor: emp.color ? `${emp.color}40` : undefined }}
                                    >
                                      {emp.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {emp.name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-bold">{emp.name}</p>
                                <p>{durationText} 근무 ({timeRange?.start}~{timeRange?.end})</p>
                                {hasWarning && (
                                    <p className="text-destructive text-xs mt-1 font-medium">
                                        ⚠️ {getShiftWarningMessage(emp)}
                                    </p>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
