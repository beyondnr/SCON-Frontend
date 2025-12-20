"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

interface MonthNavigatorProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigator({ currentDate, onPrevMonth, onNextMonth }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-4 bg-background p-2 rounded-lg border shadow-sm">
      <Button variant="ghost" size="icon" onClick={onPrevMonth}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="text-lg font-bold min-w-[120px] text-center">
        {format(currentDate, "yyyy년 M월", { locale: ko })}
      </span>
      <Button variant="ghost" size="icon" onClick={onNextMonth}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

