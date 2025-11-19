import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { PayrollTable } from "./components/payroll-table";
import { mockPayrolls } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ReportActions } from "./components/report-actions";


export default function ReportsPage() {
  const totalPayroll = mockPayrolls.reduce((sum, p) => sum + p.totalPay, 0);

  return (
    <div className="space-y-8 print:space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 print:hidden">
            <div>
                <h1 className="text-3xl font-bold font-headline">급여 리포트</h1>
                <p className="text-muted-foreground">3월 2주차 예상 급여 내역입니다.</p>
            </div>
            <ReportActions />
        </div>

        <div className="block print:hidden">
            <div className="border rounded-lg p-4 bg-card w-full md:w-auto md:max-w-xs">
                <p className="text-sm text-muted-foreground">총 예상 인건비</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayroll)}원</p>
            </div>
        </div>

        {/* Hidden on screen, visible only for printing */}
        <div className="hidden print:block mb-4">
            <h1 className="text-2xl font-bold font-headline">급여 리포트 - 3월 2주차</h1>
            <p className="text-lg">총 예상 인건비: {formatCurrency(totalPayroll)}원</p>
        </div>

      <PayrollTable payrolls={mockPayrolls} />
    </div>
  );
}
