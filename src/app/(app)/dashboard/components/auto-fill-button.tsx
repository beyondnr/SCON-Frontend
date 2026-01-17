"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoFillButtonProps {
  onAutoFill: () => void;
  className?: string;
}

export function AutoFillButton({ onAutoFill, className }: AutoFillButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={cn("gap-2", className)}>
          <Wand2 className="h-4 w-4" />
          자동 채우기
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>자동 채우기를 진행하시겠습니까?</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>빈 근무 일정</strong>을 직원별 기본 근무 시간으로 채웁니다.<br />
            이미 입력된 근무는 변경되지 않습니다.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>취소</AlertDialogCancel>
          <AlertDialogAction onClick={onAutoFill}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

