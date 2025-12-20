"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Employee } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface SelectEmployeeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employees: Employee[]) => void;
  employees: Employee[];
  unavailableEmployeeIds: string[];
  date: string;
  time: string;
}

export function SelectEmployeeDialog({
  isOpen,
  onClose,
  onSave,
  employees,
  unavailableEmployeeIds,
  date,
  time,
}: SelectEmployeeDialogProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 근무 가능한 직원 필터링
  const availableEmployees = employees.filter(
    (emp) => !unavailableEmployeeIds.includes(emp.id)
  );

  const handleToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const handleSave = () => {
    const selectedEmployees = availableEmployees.filter(emp => selectedIds.includes(emp.id));
    onSave(selectedEmployees);
    setSelectedIds([]); // Reset
    onClose();
  };

  const handleClose = () => {
    setSelectedIds([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-lg">
            직원 추가 ({date} {time})
          </DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <p className="text-sm text-muted-foreground mb-4">
            추가할 직원을 선택해주세요.
          </p>
          <ScrollArea className="max-h-[300px] pr-4 -mr-4">
            <div className="space-y-2">
              {availableEmployees.length > 0 ? (
                availableEmployees.map((emp) => (
                  <div
                    key={emp.id}
                    className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent cursor-pointer border"
                    onClick={() => handleToggle(emp.id)}
                  >
                    <Checkbox 
                        id={`emp-${emp.id}`} 
                        checked={selectedIds.includes(emp.id)}
                        onCheckedChange={() => handleToggle(emp.id)}
                    />
                    <div className="flex items-center gap-3 flex-1">
                        <Avatar className="h-8 w-8">
                        <AvatarFallback
                            style={{
                            backgroundColor: emp.color ? `${emp.color}30` : undefined,
                            color: emp.color,
                            }}
                        >
                            {emp.name[0]}
                        </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                        <Label htmlFor={`emp-${emp.id}`} className="font-medium cursor-pointer">{emp.name}</Label>
                        <span className="text-xs text-muted-foreground">
                            {emp.role}
                        </span>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  추가할 수 있는 직원이 없습니다.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={handleClose}>취소</Button>
            <Button onClick={handleSave} disabled={selectedIds.length === 0}>
                {selectedIds.length}명 추가
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

