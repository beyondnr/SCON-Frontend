"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type WeekInfo = {
  id: number;
  label: string;
  start: Date;
  end: Date;
};

interface WeekTabsProps {
  weeks: WeekInfo[];
  currentWeekIndex: number;
  onWeekChange: (index: number) => void;
}

export function WeekTabs({ weeks, currentWeekIndex, onWeekChange }: WeekTabsProps) {
  return (
    <div className="flex space-x-1 overflow-x-auto pb-2">
      {weeks.map((week, index) => {
        const isSelected = index === currentWeekIndex;
        return (
          <Button
            key={week.id}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "flex flex-col h-auto py-2 px-4 min-w-[100px]",
              isSelected ? "border-primary" : "border-transparent bg-muted/30 hover:bg-muted/50"
            )}
            onClick={() => onWeekChange(index)}
          >
            <span className={cn("text-sm font-bold", isSelected ? "text-primary-foreground" : "text-foreground")}>
              {week.label}
            </span>
            <span className={cn("text-xs font-normal opacity-80", isSelected ? "text-primary-foreground" : "text-muted-foreground")}>
              {format(week.start, "M/d")} - {format(week.end, "M/d")}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

