"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MonthlyCalendarView } from "./monthly-calendar-view";
import { MonthlySchedule, Employee } from "@/lib/types";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";

interface SendScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: () => void;
  currentDate: Date;
  monthlySchedule: MonthlySchedule;
  employees: Employee[];
}

export function SendScheduleDialog({
  isOpen,
  onClose,
  onSend,
  currentDate,
  monthlySchedule,
  employees,
}: SendScheduleDialogProps) {
  // 근무가 있는 직원 필터링 및 근무일수 계산
  const scheduledEmployees = employees.filter(emp => {
    // 해당 월에 근무가 하나라도 있는지 확인
    return Object.values(monthlySchedule.schedule).some(daily => daily[emp.id]);
  }).map(emp => {
    const workDays = Object.values(monthlySchedule.schedule).filter(daily => daily[emp.id]).length;
    return { ...emp, workDays };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            📧 {format(currentDate, "yyyy년 M월", { locale: ko })} 근무표 발송
          </DialogTitle>
          <DialogDescription>
            직원들에게 이메일로 근무표를 발송합니다. 내용을 확인해주세요.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2">
          <div className="space-y-6">
            {/* 캘린더 미리보기 */}
            <div>
              <h3 className="text-sm font-semibold mb-2">근무표 미리보기</h3>
              <MonthlyCalendarView currentDate={currentDate} scheduleData={monthlySchedule.schedule} employees={employees} />
            </div>

            {/* 발송 대상 목록 */}
            <div>
              <h3 className="text-sm font-semibold mb-2">
                📬 발송 대상 ({scheduledEmployees.length}명)
              </h3>
              <div className="border rounded-md divide-y bg-muted/20">
                {scheduledEmployees.length > 0 ? (
                  scheduledEmployees.map(emp => (
                    <div key={emp.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{emp.name}</span>
                        <span className="text-muted-foreground">({emp.email})</span>
                      </div>
                      <span className="text-muted-foreground text-xs bg-muted px-2 py-1 rounded">
                        총 {emp.workDays}일 근무
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    발송할 대상이 없습니다. 근무표를 먼저 작성해주세요.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200">
              <span className="text-lg">⚠️</span>
              <span>발송 후 근무표를 수정하면 재발송이 필요합니다.</span>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onSend} disabled={scheduledEmployees.length === 0}>
            발송하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

