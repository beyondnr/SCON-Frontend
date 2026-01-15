"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Edit2, Check, X, LogOut } from "lucide-react";
import apiClient from "@/lib/api-client";
import { ApiOwnerProfile, UpdateOwnerProfileRequest } from "@/lib/api-mappers";
import { handleLogout } from "@/lib/auth-utils";

export default function MyPage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ApiOwnerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // 프로필 조회
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<ApiOwnerProfile>("/v1/owners/me");
      setProfile(response.data);
      setFormData({
        name: response.data.name || "",
        phone: response.data.phone || "",
      });
    } catch (error) {
      console.error("[MyPage] Failed to fetch profile:", error);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  // 수정 모드 전환
  const handleEdit = () => {
    setIsEditing(true);
  };

  // 수정 취소
  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
      });
    }
  };

  // 프로필 수정 저장
  const handleSave = async () => {
    if (!profile) return;

    // 유효성 검증
    // name 필드 검증: API 명세서에 따르면 "Request에 포함된 경우, 빈 문자열이 아니어야 함"
    // 현재 formData.name에 값이 있으면 (변경된 경우) 빈 문자열 검증 수행
    const nameChanged = formData.name !== (profile.name || "");
    if (nameChanged && formData.name.trim() === "") {
      toast({
        title: "입력 오류",
        description: "이름은 빈 값일 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // name 필드 최대 길이 검증 (100자)
    if (formData.name && formData.name.length > 100) {
      toast({
        title: "입력 오류",
        description: "이름은 최대 100자까지 입력 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    // 전화번호 형식 검증
    if (formData.phone && !/^010-\d{4}-\d{4}$/.test(formData.phone)) {
      toast({
        title: "입력 오류",
        description: "휴대폰 번호는 010-XXXX-XXXX 형식으로 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      const updateData: UpdateOwnerProfileRequest = {};
      
      // name 필드: 변경된 경우에만 포함, 빈 문자열이 아닌 경우만 포함
      if (nameChanged) {
        const trimmedName = formData.name.trim();
        // 빈 문자열이 아닌 경우에만 포함 (이미 위에서 검증했지만 안전하게 처리)
        if (trimmedName !== "") {
          updateData.name = trimmedName;
        } else {
          // 빈 문자열인 경우 undefined로 설정하여 API 요청에서 제외
          // (하지만 위에서 이미 검증했으므로 이 부분은 실행되지 않음)
          updateData.name = undefined;
        }
      }
      
      if (formData.phone !== (profile.phone || "")) {
        // 전화번호가 빈 문자열인 경우 null로 변환 (백엔드에서 null로 처리)
        updateData.phone = formData.phone || undefined;
      }

      // 변경사항이 없으면 API 호출하지 않음
      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      const response = await apiClient.patch<ApiOwnerProfile>(
        "/v1/owners/me",
        updateData
      );
      
      setProfile(response.data);
      setIsEditing(false);
      
      toast({
        title: "수정 완료",
        description: "프로필 정보가 수정되었습니다.",
      });
    } catch (error) {
      console.error("[MyPage] Failed to update profile:", error);
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
    } finally {
      setIsSaving(false);
    }
  };

  // 휴대폰 번호 자동 포맷팅
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7)
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  // 로그아웃 처리
  const onLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await handleLogout();
    } catch (error) {
      console.error("[MyPage] Logout error:", error);
      // 에러가 발생해도 로그아웃은 진행
      await handleLogout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">프로필 정보를 불러올 수 없습니다.</p>
        <Button onClick={fetchProfile} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-headline font-bold">마이페이지</h1>
        <p className="text-muted-foreground mt-1">
          회원 정보를 확인하고 수정할 수 있습니다.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>회원 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <fieldset disabled={isSaving}>
            {/* 이메일 (읽기 전용) */}
            <div className="space-y-2">
              <Label>이메일 주소</Label>
              <Input
                value={profile.email}
                disabled
                className="bg-muted text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                이메일은 변경할 수 없습니다.
              </p>
            </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            {isEditing ? (
              <>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="이름을 입력하세요"
                  maxLength={100}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  최대 100자까지 입력 가능합니다. 수정 시 빈 값은 저장되지 않습니다.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-md bg-background">
                <span className={formData.name ? "" : "text-muted-foreground"}>
                  {formData.name || "입력되지 않음"}
                </span>
              </div>
            )}
          </div>

          {/* 휴대폰 번호 */}
          <div className="space-y-2">
            <Label htmlFor="phone">
              휴대폰 번호 <span className="text-muted-foreground">(선택)</span>
            </Label>
            {isEditing ? (
              <>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="010-1234-5678"
                  maxLength={13}
                  disabled={isSaving}
                />
                <p className="text-xs text-muted-foreground">
                  010-XXXX-XXXX 형식으로 입력해주세요.
                </p>
              </>
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-md bg-background">
                <span className={formData.phone ? "" : "text-muted-foreground"}>
                  {formData.phone || "입력되지 않음"}
                </span>
              </div>
            )}
          </div>
          </fieldset>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      저장하기
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  disabled={isSaving}
                >
                  <X className="mr-2 h-4 w-4" />
                  취소
                </Button>
              </>
            ) : (
              <Button onClick={handleEdit} className="w-full">
                <Edit2 className="mr-2 h-4 w-4" />
                수정하기
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 계정 관리 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="w-full"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                로그아웃 중...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            로그아웃하면 모든 세션이 종료됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

