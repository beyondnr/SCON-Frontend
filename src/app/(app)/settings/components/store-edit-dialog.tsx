import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store } from "@/lib/types";
import { useEffect, useState } from "react";

interface StoreEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store;
  onSave: (updatedStore: Store) => void;
}

const timeOptions = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function StoreEditDialog({ isOpen, onClose, store, onSave }: StoreEditDialogProps) {
  const [name, setName] = useState(store.name);
  const [businessType, setBusinessType] = useState(store.businessType);
  const [openingTime, setOpeningTime] = useState(store.openingTime);
  const [closingTime, setClosingTime] = useState(store.closingTime);

  useEffect(() => {
    if (isOpen) {
      setName(store.name);
      setBusinessType(store.businessType);
      setOpeningTime(store.openingTime);
      setClosingTime(store.closingTime);
    }
  }, [isOpen, store]);

  const handleSave = () => {
    onSave({
      ...store,
      name,
      businessType,
      openingTime,
      closingTime,
    });
    onClose();
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
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">매장명</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="businessType">업종</Label>
            <Input id="businessType" value={businessType} onChange={(e) => setBusinessType(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>오픈 시간</Label>
              <Select value={openingTime} onValueChange={setOpeningTime}>
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
              <Select value={closingTime} onValueChange={setClosingTime}>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

