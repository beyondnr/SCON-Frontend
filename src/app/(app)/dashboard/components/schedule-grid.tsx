"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Employee, TimeRange, MonthlySchedule } from "@/lib/types";
import { cn, formatTime, isOutsideShiftTime, getShiftWarningMessage } from "@/lib/utils";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ScheduleGridProps {
    scheduleData: MonthlySchedule['schedule'];
    dates: Date[];
    employees: Employee[];
    onEditShift?: (employee: Employee, day: string, timeRange: TimeRange | null) => void;
}

export function ScheduleGrid({ scheduleData, dates, employees, onEditShift }: ScheduleGridProps) {
    return (
        <TooltipProvider>
            <Card className="shadow-md">
                <CardHeader className="border-b bg-muted/30 pb-4">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        <CardTitle className="font-headline text-xl">주간 근무표 현황</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* CSS Grid를 활용한 테이블 레이아웃 */}
                        <div className="grid gap-[1px] bg-border/50" style={{ gridTemplateColumns: `160px repeat(${dates.length}, minmax(110px, 1fr))` }}>
                            
                            {/* [Header Row] 날짜 헤더 */}
                            <div className="bg-muted/50 p-4 font-semibold text-sm text-muted-foreground sticky left-0 z-20 border-b flex items-center justify-center">직원 / 날짜</div>
                            {dates.map(date => {
                                const dateKey = format(date, 'yyyy-MM-dd');
                                const isSunday = date.getDay() === 0;
                                const isSaturday = date.getDay() === 6;
                                
                                return (
                                    <div key={dateKey} className={`bg-muted/30 p-4 font-semibold text-sm text-center border-b ${
                                        isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-foreground'
                                    }`}>
                                        {format(date, 'M/d (eee)', { locale: ko })}
                                    </div>
                                );
                            })}

                            {/* [Body Rows] 직원별 근무표 행 */}
                            {employees.map(employee => (
                                <div key={employee.id} className="contents">
                                    {/* 직원 정보 컬럼 (Sticky) */}
                                    <div className="bg-background p-4 text-sm font-medium sticky left-0 z-10 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border-2 border-transparent" style={{ borderColor: employee.color }}>
                                            <AvatarFallback 
                                                className="font-bold text-xs"
                                                style={{ backgroundColor: employee.color ? `${employee.color}30` : undefined, color: employee.color }}
                                            >
                                                {employee.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-foreground">{employee.name}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{employee.role}</span>
                                        </div>
                                    </div>
                                    
                                    {/* 날짜별 근무 시간 셀 */}
                                    {dates.map(date => {
                                        const dateKey = format(date, 'yyyy-MM-dd');
                                        const timeRange = scheduleData[dateKey]?.[employee.id];
                                        const isViolation = isOutsideShiftTime(employee, timeRange || null);

                                        return (
                                            <div
                                                key={`${employee.id}-${dateKey}`}
                                                className={cn(
                                                    "relative p-3 min-h-[80px] flex flex-col items-center justify-center text-xs cursor-pointer transition-all duration-200 group border-b last:border-b-0",
                                                    "hover:bg-accent/50 hover:shadow-inner",
                                                    isViolation ? "bg-destructive/5 hover:bg-destructive/10" : "bg-background"
                                                )}
                                                onClick={() => onEditShift?.(employee, dateKey, timeRange || null)}
                                            >
                                                {/* 위반 시 표시되는 인디케이터 (Tooltip 적용) */}
                                                {isViolation && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive animate-pulse" />
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-destructive font-medium">⚠️ {getShiftWarningMessage(employee)}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                
                                                {timeRange ? (
                                                    <div 
                                                        className={cn(
                                                            "rounded-md px-3 py-1.5 font-medium shadow-sm border flex items-center gap-1.5 w-full justify-center",
                                                            isViolation 
                                                                ? "bg-white border-destructive/30 text-destructive" 
                                                                : "bg-primary/5 border-primary/20 text-primary group-hover:bg-primary/10 group-hover:border-primary/30"
                                                        )}
                                                        style={!isViolation && employee.color ? {
                                                            backgroundColor: `${employee.color}20`,
                                                            borderColor: `${employee.color}40`,
                                                            color: employee.color
                                                        } : undefined}
                                                    >
                                                        <Clock className="h-3 w-3 opacity-70" />
                                                        <span>{formatTime(timeRange.start)} - {formatTime(timeRange.end)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground/30 group-hover:text-muted-foreground/70 text-lg font-light transition-colors">+</span>
                                                )}
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
