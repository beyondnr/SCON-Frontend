import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Employee, EmployeeRole, ShiftPreset } from "@/lib/types";
import { SHIFT_PRESETS } from "@/lib/constants";
import { getRandomEmployeeColor } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EmployeeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null; // If null, it's add mode
  existingEmployees?: Employee[]; // To check for duplicate colors
  onSave: (employee: Employee) => void;
}

// 30분 단위 시간 옵션 생성
const timeOptions: string[] = [];
for (let i = 0; i < 24; i++) {
  const hour = i.toString().padStart(2, '0');
  timeOptions.push(`${hour}:00`);
  timeOptions.push(`${hour}:30`);
}

export function EmployeeEditDialog({ isOpen, onClose, employee, existingEmployees = [], onSave }: EmployeeEditDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<EmployeeRole>("직원");
  const [hourlyRate, setHourlyRate] = useState("");
  
  // 근무 시간 설정 상태
  const [shiftPreset, setShiftPreset] = useState<ShiftPreset>("morning");
  const [customStart, setCustomStart] = useState("09:00");
  const [customEnd, setCustomEnd] = useState("18:00");

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        setName(employee.name);
        setEmail(employee.email);
        setPhoneNumber(employee.phoneNumber);
        setRole(employee.role);
        setHourlyRate(employee.hourlyRate.toString());
        
        // 근무 시간 설정 로드
        setShiftPreset(employee.shiftPreset || "morning");
        if (employee.shiftPreset === 'custom') {
            setCustomStart(employee.customShiftStart || "09:00");
            setCustomEnd(employee.customShiftEnd || "18:00");
        } else {
            setCustomStart("09:00");
            setCustomEnd("18:00");
        }

        setEmailError("");
        setPhoneError("");
      } else {
        // Add mode reset
        setName("");
        setEmail("");
        setPhoneNumber("");
        setRole("직원");
        setHourlyRate("");
        
        // 기본값 설정
        setShiftPreset("morning");
        setCustomStart("09:00");
        setCustomEnd("18:00");

        setEmailError("");
        setPhoneError("");
      }
    }
  }, [isOpen, employee]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("유효한 이메일 형식이 아닙니다.");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      setPhoneError("010-0000-0000 형식이어야 합니다.");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail) {
      validateEmail(newEmail);
    } else {
      setEmailError("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format phone number
    let value = e.target.value.replace(/[^0-9]/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    let formattedValue = value;
    if (value.length > 3 && value.length <= 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    }

    setPhoneNumber(formattedValue);
    if (formattedValue.length >= 12) { // 010-1234-5678 (13 chars)
       validatePhone(formattedValue);
    } else {
       setPhoneError("");
    }
  };

  const handleSave = () => {
    if (!validateEmail(email)) {
      return;
    }
    if (!validatePhone(phoneNumber)) {
        return;
    }

    const usedColors = existingEmployees
      .map(e => e.color)
      .filter((c): c is string => !!c);

    const newEmployee: Employee = {
      id: employee?.id || `emp-${Date.now()}`, // Generate simple ID for new employee
      name,
      email,
      phoneNumber,
      role,
      hourlyRate: parseInt(hourlyRate) || 0,
      avatarUrl: employee?.avatarUrl, // Keep existing avatar or let it be undefined
      color: employee?.color || getRandomEmployeeColor(usedColors), // Use existing or generate new unique color
      
      // 근무 시간 설정 저장
      shiftPreset,
      customShiftStart: shiftPreset === 'custom' ? customStart : undefined,
      customShiftEnd: shiftPreset === 'custom' ? customEnd : undefined,
    };
    onSave(newEmployee);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">
            {employee ? "직원 정보 수정" : "직원 추가"}
          </DialogTitle>
          <DialogDescription>
            {employee 
              ? "직원 정보를 수정합니다." 
              : "새로운 직원을 추가합니다."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          {/* 기본 정보 섹션 */}
          <div className="grid gap-4">
            <h3 className="text-sm font-semibold text-muted-foreground">기본 정보</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="name">이름</Label>
                    <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="이름 입력"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="hourlyRate">시급 (원)</Label>
                    <Input 
                    id="hourlyRate" 
                    type="number" 
                    value={hourlyRate} 
                    onChange={(e) => setHourlyRate(e.target.value)}
                    placeholder="시급 입력" 
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="email">이메일</Label>
                <Input 
                id="email" 
                type="email"
                value={email} 
                onChange={handleEmailChange} 
                placeholder="이메일을 입력하세요"
                className={emailError ? "border-destructive" : ""}
                />
                {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="phoneNumber">휴대폰 번호</Label>
                    <Input 
                    id="phoneNumber" 
                    value={phoneNumber} 
                    onChange={handlePhoneChange} 
                    placeholder="010-0000-0000"
                    maxLength={13}
                    className={phoneError ? "border-destructive" : ""}
                    />
                    {phoneError && (
                    <p className="text-xs text-destructive">{phoneError}</p>
                    )}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="role">역할</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as EmployeeRole)}>
                    <SelectTrigger>
                        <SelectValue placeholder="역할 선택" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="직원">직원</SelectItem>
                        <SelectItem value="매니저">매니저</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          {/* 근무 시간 설정 섹션 */}
          <div className="grid gap-4 pt-2 border-t">
            <h3 className="text-sm font-semibold text-muted-foreground mt-2">기본 근무 시간 설정</h3>
            <RadioGroup value={shiftPreset} onValueChange={(v) => setShiftPreset(v as ShiftPreset)} className="grid gap-3">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="morning" id="r-morning" />
                    <Label htmlFor="r-morning" className="font-normal cursor-pointer flex-1">
                        {SHIFT_PRESETS.morning.label} ({SHIFT_PRESETS.morning.start} ~ {SHIFT_PRESETS.morning.end})
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="afternoon" id="r-afternoon" />
                    <Label htmlFor="r-afternoon" className="font-normal cursor-pointer flex-1">
                        {SHIFT_PRESETS.afternoon.label} ({SHIFT_PRESETS.afternoon.start} ~ {SHIFT_PRESETS.afternoon.end})
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="r-custom" />
                    <Label htmlFor="r-custom" className="font-normal cursor-pointer flex-1">
                        직접 입력
                    </Label>
                </div>
            </RadioGroup>

            {/* 커스텀 시간 선택 - shiftPreset이 'custom'일 때만 표시 */}
            {shiftPreset === 'custom' && (
                <div className="grid grid-cols-2 gap-4 pl-6 animate-in slide-in-from-top-2 fade-in duration-200">
                    <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground">시작 시간</Label>
                        <Select value={customStart} onValueChange={setCustomStart}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {timeOptions.map(t => <SelectItem key={`s-${t}`} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label className="text-xs text-muted-foreground">종료 시간</Label>
                        <Select value={customEnd} onValueChange={setCustomEnd}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                                {timeOptions.map(t => <SelectItem key={`e-${t}`} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
          </div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave} disabled={!!emailError || !!phoneError || !email || !phoneNumber || !name || !hourlyRate}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
