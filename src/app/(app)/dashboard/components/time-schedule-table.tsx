"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { mockEmployees, weekDays } from "@/lib/mock-data";
import { Schedule } from "@/lib/types";
import { Clock } from "lucide-react";

interface TimeScheduleTableProps {
  schedule: Schedule;
}

export function TimeScheduleTable({ schedule }: TimeScheduleTableProps) {
  // 09:00 ~ 22:00 (1시간 단위)
  const hours = Array.from({ length: 14 }, (_, i) => i + 9);

  // 시간 문자열(HH:mm)을 분 단위 정수로 변환
  const parseMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  };

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
            {/* Grid Layout: Time Column + 7 Days */}
            <div
              className="grid gap-[1px] bg-border/50"
              style={{
                gridTemplateColumns: `80px repeat(${weekDays.length}, minmax(120px, 1fr))`,
              }}
            >
              {/* Header Row */}
              <div className="bg-muted/50 p-4 font-semibold text-sm text-muted-foreground sticky top-0 z-20 border-b flex items-center justify-center">
                시간
              </div>
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-muted/30 p-4 font-semibold text-sm text-center text-foreground border-b sticky top-0 z-20"
                >
                  {day}
                </div>
              ))}

              {/* Body Rows: Hours */}
              {hours.map((hour) => (
                <div key={hour} className="contents">
                  {/* Time Column */}
                  <div className="bg-background p-4 text-sm font-medium text-muted-foreground border-r flex items-center justify-center">
                    {`${hour.toString().padStart(2, "0")}:00`}
                  </div>

                  {/* Days Columns */}
                  {weekDays.map((day) => {
                    // Find employees working at this hour on this day
                    const workingEmployees = mockEmployees.filter((emp) => {
                      const timeRange = schedule[day]?.[emp.id];
                      if (!timeRange) return false;
                      return isWorking(hour, timeRange.start, timeRange.end);
                    });

                    return (
                      <div
                        key={`${day}-${hour}`}
                        className="bg-background p-2 border-b border-r last:border-r-0 flex flex-wrap gap-1 content-start min-h-[60px]"
                      >
                        {workingEmployees.map((emp) => {
                          const timeRange = schedule[day]?.[emp.id];
                          const durationText = timeRange
                            ? getWorkingDurationText(
                                hour,
                                timeRange.start,
                                timeRange.end
                              )
                            : "";

                          return (
                            <Tooltip key={emp.id}>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-full whitespace-nowrap border border-primary/20 cursor-default hover:bg-primary/20 transition-colors">
                                  <Avatar className="h-4 w-4 shrink-0">
                                    <AvatarImage src={emp.avatarUrl} alt={emp.name} className="object-cover" />
                                    <AvatarFallback className="bg-primary/20 text-[8px] flex items-center justify-center w-full h-full">
                                      {emp.name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">
                                    {emp.name}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{durationText} 근무</p>
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
