"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockReportHistory, mockPayrolls } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { PayrollTable } from "./payroll-table";
import React, { useState } from "react";
import { ReportHistoryItem } from "@/lib/types";

export function ReportHistory() {
  // In a real app, you might fetch detailed payrolls for the specific history item.
  // For this mock, we'll just show the same mockPayrolls as "details" for any history item.
  
  const [selectedReport, setSelectedReport] = useState<ReportHistoryItem | null>(null);

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>기간</TableHead>
                <TableHead className="text-right">총 근무시간</TableHead>
                <TableHead className="text-right">총 지급액</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReportHistory.map((item) => (
                <TableRow 
                  key={item.id} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedReport(item)}
                >
                  <TableCell className="font-medium">{item.period}</TableCell>
                  <TableCell className="text-right">{item.totalHours}시간</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.totalAmount)}원</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      상세보기 <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 상세 내역 모달 */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex justify-between items-center pr-8">
              <DialogTitle className="font-headline text-xl">
                {selectedReport?.period} 급여 상세 내역
              </DialogTitle>
              <div className="text-lg font-semibold">
                <span className="text-muted-foreground text-base mr-2">총 지급액:</span>
                <span className="text-primary">{selectedReport ? formatCurrency(selectedReport.totalAmount) : 0}원</span>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            <div className="py-4">
               {/* Reusing PayrollTable for details */}
               <PayrollTable payrolls={mockPayrolls} />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
