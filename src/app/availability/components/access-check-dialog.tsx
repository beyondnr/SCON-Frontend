import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockEmployees } from "@/lib/mock-data";
import { Employee } from "@/lib/types";
import { maskName } from "@/lib/utils";
import { useState, useEffect } from "react";

interface AccessCheckDialogProps {
  isOpen: boolean;
  onVerify: (employee: Employee) => void;
  targetEmpId?: string; // If provided from token, lock selection
}

export function AccessCheckDialog({ isOpen, onVerify, targetEmpId }: AccessCheckDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [last4Digits, setLast4Digits] = useState("");
  const [error, setError] = useState("");

  // If targetEmpId is provided, set it automatically
  useEffect(() => {
    if (targetEmpId) {
      setSelectedEmployeeId(targetEmpId);
    }
  }, [targetEmpId]);

  const handleVerify = () => {
    if (!selectedEmployeeId) {
      setError("직원을 선택해주세요.");
      return;
    }

    // Security check: if token specified an ID, user MUST be that person
    if (targetEmpId && selectedEmployeeId !== targetEmpId) {
       setError("잘못된 접근입니다.");
       return;
    }

    const employee = mockEmployees.find(emp => emp.id === selectedEmployeeId);
    
    if (!employee) {
      setError("잘못된 직원 정보입니다.");
      return;
    }

    // Verify last 4 digits of phone number
    if (employee.phoneNumber && employee.phoneNumber.endsWith(last4Digits)) {
      onVerify(employee);
    } else {
      setError("휴대폰 번호 뒤 4자리가 일치하지 않습니다.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px]" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-center font-headline text-xl">직원 확인</DialogTitle>
          <DialogDescription className="text-center">
            본인의 이름을 선택하고 휴대폰 번호 뒤 4자리를 입력해주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="employee">이름 선택</Label>
            <Select 
                value={selectedEmployeeId} 
                onValueChange={(val) => {
                    setSelectedEmployeeId(val);
                    setError("");
                }}
                disabled={!!targetEmpId} // Disable if pre-set by token
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="이름을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {mockEmployees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6" style={{ borderColor: emp.color }}>
                        <AvatarFallback style={{ backgroundColor: emp.color ? `${emp.color}30` : undefined, color: emp.color }}>
                            {emp.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      {maskName(emp.name)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="last4Digits">휴대폰 번호 뒤 4자리</Label>
            <Input
              id="last4Digits"
              type="password"
              placeholder="1234"
              className="text-center text-2xl tracking-widest h-12"
              maxLength={4}
              value={last4Digits}
              onChange={(e) => {
                setLast4Digits(e.target.value.replace(/[^0-9]/g, ""));
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleVerify();
              }}
              disabled={!selectedEmployeeId}
            />
            {error && <p className="text-center text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleVerify} 
            className="w-full h-12 text-lg" 
            disabled={!selectedEmployeeId || last4Digits.length !== 4}
          >
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
