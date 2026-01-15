import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Employee, EmployeeRole, ShiftPreset } from "@/lib/types";
import { ApiEmployee, ApiEmployeeRequest, employeeToApiFormat, apiEmployeeToFrontend } from "@/lib/api-mappers";
import { SHIFT_PRESETS } from "@/lib/constants";
import { getRandomEmployeeColor } from "@/lib/utils";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { getCurrentStoreId } from "@/lib/local-storage-utils";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

interface EmployeeEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  employee?: Employee | null; // If null, it's add mode
  existingEmployees?: Employee[]; // To check for duplicate colors
  onSave: () => void; // 직원 목록 새로고침 콜백
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

  const { toast } = useToast();
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [consentVerified, setConsentVerified] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
        setConsentVerified(true); // 수정 모드에서는 동의 체크 불필요
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
        setConsentVerified(false); // 추가 모드에서는 동의 체크 필요
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
    // 유효성 검증
    if (!name || name.trim() === "") {
      toast({
        title: "입력 오류",
        description: "이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      return;
    }
    if (!validatePhone(phoneNumber)) {
        return;
    }

    // 추가 모드이고 이메일이 있을 때만 확인 팝업 표시
    if (!employee && email) {
      setShowConfirmDialog(true);
      return;
    }

    // 수정 모드이거나 이메일이 없으면 바로 저장
    saveEmployee();
  };

  const saveEmployee = async () => {
    const storeId = getCurrentStoreId();
    if (!storeId) {
      toast({
        title: "오류",
        description: "매장 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // 프론트엔드 Employee 형식으로 구성
      // 주의: color는 프론트엔드에서만 사용하므로 API 요청에는 포함되지 않음
      const usedColors = existingEmployees
        .map(e => e.color)
        .filter((c): c is string => !!c);

      const employeeData: Employee = {
        id: employee?.id || `temp-${Date.now()}`, // 임시 ID (등록 시 API 응답에서 받음)
        name,
        email,
        phoneNumber,
        role,
        hourlyRate: parseInt(hourlyRate) || 0,
        avatarUrl: employee?.avatarUrl,
        color: employee?.color || getRandomEmployeeColor(usedColors), // 프론트엔드에서만 사용
        shiftPreset,
        customShiftStart: shiftPreset === 'custom' ? customStart : undefined,
        customShiftEnd: shiftPreset === 'custom' ? customEnd : undefined,
        personalHoliday: undefined, // 현재 폼에 없음 (Phase 4 범위 밖)
      };

      // 프론트엔드 Employee 타입 → API ApiEmployeeRequest 타입 변환
      // phoneNumber → phone, hourlyRate → hourlyWage, role → employmentType 자동 변환됨
      const apiRequest = employeeToApiFormat(employeeData);

      if (employee) {
        // 수정 API 호출
        // 주의: 프론트엔드 Employee.id는 string이지만, API는 number를 요구함
        const employeeId = parseInt(employee.id);
        if (isNaN(employeeId)) {
          throw new Error("유효하지 않은 직원 ID입니다.");
        }

        const response = await apiClient.put<ApiEmployee>(
          `/v1/employees/${employeeId}`,
          apiRequest
        );

        // 이메일 발송 로그는 실제로 백엔드에서 처리될 것으로 예상
        if (response.data && email) {
          logger.debug("Employee updated successfully", { employeeId, email });
        }

        toast({
          title: "수정 완료",
          description: "직원 정보가 수정되었습니다.",
        });
      } else {
        // 등록 API 호출
        const response = await apiClient.post<ApiEmployee>(
          `/v1/stores/${storeId}/employees`,
          apiRequest
        );

        // 이메일 발송 로그는 실제로 백엔드에서 처리될 것으로 예상
        if (response.data && email) {
          logger.debug("Employee created successfully", { 
            employeeId: response.data.id, 
            email 
          });
        }

        toast({
          title: "등록 완료",
          description: "직원이 등록되었습니다.",
        });
      }

      // 직원 목록 새로고침
      onSave();
      setShowConfirmDialog(false);
      onClose();
    } catch (error) {
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
      logger.error("[EmployeeEditDialog] Failed to save employee:", error);
    } finally {
      setIsSaving(false);
    }
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
        <fieldset disabled={isSaving} className="grid gap-6 py-4">
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

          {/* 개인정보 수집 동의 체크박스 (추가 모드일 때만 표시) */}
          {!employee && (
            <div className="grid gap-4 pt-2 border-t">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentVerified}
                  onCheckedChange={(checked) => setConsentVerified(checked === true)}
                />
                <label
                  htmlFor="consent"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  직원에게 개인정보 수집 및 이용 동의를 받았습니다{" "}
                  <span className="text-destructive">(필수)</span>
                </label>
              </div>
            </div>
          )}
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={
              isSaving ||
              !!emailError || 
              !!phoneError || 
              !email || 
              !phoneNumber || 
              !name || 
              !hourlyRate ||
              (!employee && !consentVerified) // 추가 모드일 때 동의 체크 필수
            }
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {employee ? "저장 중..." : "추가 중..."}
              </>
            ) : (
              employee ? "저장" : "추가"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* 이메일 발송 확인 팝업 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>안내 메일 발송 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {email}로 개인정보 수집 출처 안내 메일이 발송됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={saveEmployee} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  처리 중...
                </>
              ) : (
                "확인"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
