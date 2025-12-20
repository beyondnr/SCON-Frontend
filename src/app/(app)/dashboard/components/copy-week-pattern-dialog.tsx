"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { format } from "date-fns";

type WeekInfo = {
  id: number;
  label: string;
  start: Date;
  end: Date;
};

interface CopyWeekPatternDialogProps {
  isOpen: boolean;
  onClose: () => void;
  weeks: WeekInfo[];
  currentWeekIndex: number;
  onCopy: (targetWeekIndices: number[]) => void;
}

export function CopyWeekPatternDialog({
  isOpen,
  onClose,
  weeks,
  currentWeekIndex,
  onCopy,
}: CopyWeekPatternDialogProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

  const handleToggle = (index: number) => {
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleCopy = () => {
    onCopy(selectedIndices);
    onClose();
    setSelectedIndices([]); // Reset after copy
  };

  const currentWeek = weeks[currentWeekIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {currentWeek?.label} 패턴 복사
          </DialogTitle>
          <DialogDescription>
            {format(currentWeek?.start || new Date(), "M/d")} ~ {format(currentWeek?.end || new Date(), "M/d")}의 근무표를 다른 주차에 복사합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            복사할 주차를 선택하세요:
          </div>
          {weeks.map((week, index) => {
            if (index === currentWeekIndex) return null; // 현재 주차 제외

            return (
              <div key={week.id} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent/50 transition-colors">
                <Checkbox
                  id={`week-${index}`}
                  checked={selectedIndices.includes(index)}
                  onCheckedChange={() => handleToggle(index)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor={`week-${index}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {week.label} ({format(week.start, "M/d")} ~ {format(week.end, "M/d")})
                  </Label>
                </div>
              </div>
            );
          })}
          
          <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-md text-sm border border-yellow-200 mt-2">
            <span className="text-lg">⚠️</span>
            <span>선택한 주차의 기존 데이터는 덮어쓰기 됩니다.</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleCopy} disabled={selectedIndices.length === 0}>
            복사하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

