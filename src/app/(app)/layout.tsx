import { AppHeader } from "@/components/layout/header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      {/* 모바일 하단 네비게이션 바 높이(h-16 + safe-area)만큼 여백 추가 */}
      <main className="flex-1 container mx-auto p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>
      {/* 모바일 전용 하단 네비게이션 (md:hidden 적용됨) */}
      <MobileBottomNav />
    </div>
  );
}
