"use client";

import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { PayrollTable } from "./components/payroll-table";
import { ReportHistory } from "./components/report-history";
import { mockPayrolls } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ReportActions } from "./components/report-actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ReportsPage() {
  const totalPayroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold font-headline">급여 리포트</h1>
          <p className="text-muted-foreground">매장 급여 내역을 확인하고 관리하세요.</p>
        </div>
        <ReportActions />
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
