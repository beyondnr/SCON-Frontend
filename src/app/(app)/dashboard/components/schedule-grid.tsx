"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockEmployees, weekDays } from "@/lib/mock-data";
import { Schedule, TimeRange, Employee } from "@/lib/types";
import { cn, formatTime } from "@/lib/utils";
import { EditShiftDialog } from "./edit-shift-dialog";

type ShiftInfo = {
    employee: Employee;
    day: string;
    timeRange: TimeRange | null;
};

export function ScheduleGrid({ schedule: initialSchedule }: { schedule: Schedule }) {
    const [schedule, setSchedule] = useState(initialSchedule);
    const [editingShift, setEditingShift] = useState<ShiftInfo | null>(null);

    const handleShiftClick = (employee: Employee, day: string, timeRange: TimeRange | null) => {
        setEditingShift({ employee, day, timeRange });
    };

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
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">주간 스케줄</CardTitle>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    <div className="grid gap-px bg-border" style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, minmax(100px, 1fr))` }}>
                        {/* Header Row */}
                        <div className="bg-card p-3 font-semibold text-sm sticky left-0 z-10">직원</div>
                        {weekDays.map(day => (
                            <div key={day} className="bg-card p-3 font-semibold text-sm text-center">{day}</div>
                        ))}

                        {/* Employee Rows */}
                        {mockEmployees.map(employee => (
                            <>
                                <div key={employee.id} className="bg-card p-3 text-sm font-medium sticky left-0 z-10">{employee.name}</div>
                                {weekDays.map(day => {
                                    const timeRange = schedule[day]?.[employee.id];
                                    const isViolation = employee.id === 'emp-1' && Math.random() < 0.1; // Simulate violation
                                    return (
                                        <div
                                            key={`${employee.id}-${day}`}
                                            className={cn("bg-card p-2 text-xs text-center cursor-pointer hover:bg-muted/80 transition-colors", isViolation && "bg-destructive/10 ring-1 ring-destructive")}
                                            onClick={() => handleShiftClick(employee, day, timeRange || null)}
                                        >
                                            {timeRange ? (
                                                <span>{formatTime(timeRange.start)} - {formatTime(timeRange.end)}</span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <EditShiftDialog
                isOpen={!!editingShift}
                onClose={() => setEditingShift(null)}
                shiftInfo={editingShift}
                onSave={handleSaveShift}
            />
        </>
    );
}
