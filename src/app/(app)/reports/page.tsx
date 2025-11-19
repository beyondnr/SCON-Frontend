import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { PayrollTable } from "./components/payroll-table";
import { mockPayrolls } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function ReportActions() {
    "use client";
    const { toast } = useToast();

    const handleDownload = (format: 'Excel' | 'PDF') => {
        toast({
            title: `${format} 다운로드 시작`,
            description: `Mock ${format} 다운로드가 시작되었습니다.`,
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleDownload('Excel')}>
                <Download className="mr-2 h-4 w-4" />
                Excel 다운로드
            </Button>
            <Button variant="outline" onClick={() => handleDownload('PDF')}>
                <Download className="mr-2 h-4 w-4" />
                PDF 다운로드
            </Button>
            <Button variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                인쇄
            </Button>
        </div>
    );
}

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
