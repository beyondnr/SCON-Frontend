"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, Printer } from "lucide-react";

export function ReportActions() {
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
