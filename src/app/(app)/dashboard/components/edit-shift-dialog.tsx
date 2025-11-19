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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Employee, TimeRange } from "@/lib/types";

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

export function EditShiftDialog({ isOpen, onClose, shiftInfo, onSave }: EditShiftDialogProps) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    useEffect(() => {
        if (shiftInfo?.timeRange) {
            setStart(shiftInfo.timeRange.start);
            setEnd(shiftInfo.timeRange.end);
        } else {
            setStart("");
            setEnd("");
        }
    }, [shiftInfo]);

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-headline">{shiftInfo.employee.name} - {shiftInfo.day}요일 근무 시간 수정</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 items-center gap-4">
                <div>
                    <Label htmlFor="start-time">시작 시간</Label>
                    <Input id="start-time" type="time" value={start} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="end-time">종료 시간</Label>
                    <Input id="end-time" type="time" value={end} onChange={(e) => setEnd(e.target.value)} />
                </div>
            </div>
        </div>
        <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={handleClear}>근무 없음</Button>
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
