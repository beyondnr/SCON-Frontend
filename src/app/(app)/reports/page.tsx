"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { ReportHistory } from "./components/report-history";
import { mockPayrolls } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ReportActions } from "./components/report-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";

// 코드 스플리팅: 대용량 테이블 컴포넌트 지연 로딩
const PayrollTable = dynamic(
  () => import("./components/payroll-table").then((mod) => ({ default: mod.PayrollTable })),
  {
    loading: () => <div className="flex items-center justify-center h-64">로딩 중...</div>,
    ssr: false,
  }
);

export default function ReportsPage() {
  // 메모이제이션: 총 인건비 계산
  const totalPayroll = useMemo(
    () => mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0),
    []
  );

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="print:hidden">
        <PageHeader
          title="급여 리포트"
          description="매장 급여 내역을 확인하고 관리하세요."
          action={<ReportActions />}
        />
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="current">이번 주 리포트 (3월 2주)</TabsTrigger>
          <TabsTrigger value="history">지난 리포트 이력</TabsTrigger>
        </TabsList>

        {/* Current Report Tab */}
        <TabsContent value="current" className="space-y-6">
          <div className="block print:hidden">
            <div className="border rounded-lg p-4 bg-card w-full md:w-auto md:max-w-xs shadow-sm">
              <p className="text-sm text-muted-foreground">총 예상 인건비</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalPayroll)}원</p>
            </div>
          </div>

          {/* Hidden on screen, visible only for printing */}
          <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold font-headline">급여 리포트 - 3월 2주차</h1>
            <p className="text-lg">총 예상 인건비: {formatCurrency(totalPayroll)}원</p>
          </div>

          <PayrollTable payrolls={mockPayrolls} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <ReportHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
