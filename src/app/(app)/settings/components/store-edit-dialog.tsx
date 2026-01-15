import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store } from "@/lib/types";
import { ApiStore, ApiStoreRequest, storeToApiFormat, apiStoreToFrontend } from "@/lib/api-mappers";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api-client";
import { getCurrentStoreId } from "@/lib/local-storage-utils";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { Loader2 } from "lucide-react";

interface StoreEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onSave: (updatedStore: Store) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function StoreEditDialog({ isOpen, onClose, store, onSave }: StoreEditDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState(store?.name || "");
  const [businessType, setBusinessType] = useState(store?.businessType || "");
  const [openingTime, setOpeningTime] = useState(store?.openingTime || "");
  const [closingTime, setClosingTime] = useState(store?.closingTime || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && store) {
      setName(store.name);
      setBusinessType(store.businessType);
      setOpeningTime(store.openingTime);
      setClosingTime(store.closingTime);
    }
  }, [isOpen, store]);

  const handleSave = async () => {
    if (!store) {
      toast({
        title: "오류",
        description: "매장 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    // 유효성 검증
    if (!name || name.trim() === "") {
      toast({
        title: "입력 오류",
        description: "매장명을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      const storeId = getCurrentStoreId();
      if (!storeId) {
        throw new Error("매장 정보를 찾을 수 없습니다.");
      }

      // 프론트엔드 Store 타입 → API ApiStoreRequest 타입 변환
      // openingTime/closingTime → openTime/closeTime 자동 변환됨
      // 주의: 부분 수정 지원 (변경된 필드만 전송 가능)
      const apiRequest = storeToApiFormat({
        ...store,
        name,
        businessType,
        openingTime,
        closingTime,
      } as Store);

      const response = await apiClient.put<ApiStore>(
        `/v1/stores/${storeId}`,
        apiRequest
      );

      // API 응답 → 프론트엔드 Store 타입 변환
      if (response.data) {
        const updatedStore = apiStoreToFrontend(response.data);
        onSave(updatedStore);

        toast({
          title: "수정 완료",
          description: "매장 정보가 수정되었습니다.",
        });
      }

      onClose();
    } catch (error) {
      // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
      logger.error("[StoreEditDialog] Failed to update store:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">매장 정보 수정</DialogTitle>
          <DialogDescription>
            매장 정보를 수정합니다. 변경사항은 즉시 반영됩니다.
          </DialogDescription>
        </DialogHeader>
        <fieldset disabled={isSaving} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">매장명</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="매장명을 입력하세요"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="businessType">업종</Label>
            <Input 
              id="businessType" 
              value={businessType} 
              onChange={(e) => setBusinessType(e.target.value)} 
              placeholder="업종을 입력하세요"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>오픈 시간</Label>
              <Select value={openingTime} onValueChange={setOpeningTime} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                    {timeOptions.map((time) => (
                        <SelectItem key={`open-${time}`} value={time}>
                            {time}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>마감 시간</Label>
              <Select value={closingTime} onValueChange={setClosingTime} disabled={isSaving}>
                <SelectTrigger>
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                    {timeOptions.map((time) => (
                        <SelectItem key={`close-${time}`} value={time}>
                            {time}
                        </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </fieldset>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              "저장"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

