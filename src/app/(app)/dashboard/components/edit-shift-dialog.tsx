"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Employee, TimeRange } from "@/lib/types";
import { Clock, Calculator } from "lucide-react";

type ShiftInfo = {
    employee: Employee;
    day: string;
    timeRange: TimeRange | null;
};

type EditShiftDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  shiftInfo: ShiftInfo | null;
  onSave: (updatedShift: ShiftInfo) => void;
};

// 30분 단위 시간 옵션 생성 (06:00 ~ 24:00 영업시간 고려)
const timeOptions: string[] = [];
for (let i = 6; i <= 24; i++) {
  const hour = i.toString().padStart(2, '0');
  timeOptions.push(`${hour}:00`);
  if (i !== 24) timeOptions.push(`${hour}:30`);
}

export function EditShiftDialog({ isOpen, onClose, shiftInfo, onSave }: EditShiftDialogProps) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [duration, setDuration] = useState("");

    useEffect(() => {
        if (shiftInfo?.timeRange) {
            setStart(shiftInfo.timeRange.start);
            setEnd(shiftInfo.timeRange.end);
        } else {
            setStart("");
            setEnd("");
        }
    }, [shiftInfo]);

    // 근무 시간 자동 계산
    useEffect(() => {
        if (start && end) {
            const [startH, startM] = start.split(':').map(Number);
            const [endH, endM] = end.split(':').map(Number);
            let diff = (endH * 60 + endM) - (startH * 60 + startM);
            
            if (diff < 0) diff += 24 * 60; // 자정 넘거가는 경우

            const h = Math.floor(diff / 60);
            const m = diff % 60;
            setDuration(`${h}시간 ${m > 0 ? `${m}분` : ''}`);
        } else {
            setDuration("");
        }
    }, [start, end]);

    const handleSave = () => {
        if (shiftInfo) {
            onSave({
                ...shiftInfo,
                timeRange: start && end ? { start, end } : null,
            });
        }
    };

    const handleClear = () => {
        if (shiftInfo) {
            onSave({
                ...shiftInfo,
                timeRange: null,
            });
        }
    }

    if (!shiftInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]"> {/* 모달 크기 약간 키움 */}
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center gap-2">
             <Clock className="h-6 w-6" />
             {shiftInfo.employee.name} - {shiftInfo.day} 근무 시간 수정
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 py-6">
            {/* 1. 시간 선택 영역 (Select로 변경하여 터치 영역 확보) */}
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground">출근 시간</Label>
                    <Select value={start} onValueChange={setStart}>
                        <SelectTrigger className="h-14 text-lg border-2 focus:ring-primary">
                            <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                            {timeOptions.map(t => <SelectItem key={`s-${t}`} value={t} className="text-base py-3">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground">퇴근 시간</Label>
                    <Select value={end} onValueChange={setEnd}>
                        <SelectTrigger className="h-14 text-lg border-2 focus:ring-primary">
                            <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                             {timeOptions.map(t => <SelectItem key={`e-${t}`} value={t} className="text-base py-3">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 2. 총 근무 시간 계산 표시 (피드백 제공) */}
            <div className="bg-secondary/30 p-4 rounded-lg flex items-center justify-between border border-secondary">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Calculator className="h-5 w-5" />
                    <span className="font-medium">총 근무 시간</span>
                </div>
                <span className="text-xl font-bold text-primary">
                    {duration || "-"}
                </span>
            </div>
        </div>

        <DialogFooter className="sm:justify-between gap-4">
            {/* 버튼 크기(h-12) 및 간격 확보 */}
            <Button variant="destructive" onClick={handleClear}>근무 제거</Button>
            <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">취소</Button>
                </DialogClose>
                <Button type="button" onClick={handleSave}>저장</Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
