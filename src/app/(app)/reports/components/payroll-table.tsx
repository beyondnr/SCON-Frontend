"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Payroll } from "@/lib/types";
import { mockEmployees, mockSchedule, weekDays } from "@/lib/mock-data";
import { formatCurrency, formatTime } from "@/lib/utils";
import { ChevronDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";

export function PayrollTable({ payrolls }: { payrolls: Payroll[] }) {
  const getEmployee = (id: string) => mockEmployees.find(e => e.id === id);
  const [increasedState, setIncreasedState] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const newIncreasedState: {[key: string]: boolean} = {};
    payrolls.forEach(p => {
        newIncreasedState[p.employeeId] = Math.random() > 0.5;
    });
    setIncreasedState(newIncreasedState);
  }, [payrolls]);

  return (
    <Card className="print:shadow-none print:border-none">
        <CardContent className="p-0">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[120px]"></TableHead>
                    <TableHead>직원</TableHead>
                    <TableHead className="text-right">총 근무시간</TableHead>
                    <TableHead className="text-right">기본급</TableHead>
                    <TableHead className="text-right">주휴수당</TableHead>
                    <TableHead className="text-right">연장/야간/휴일</TableHead>
                    <TableHead className="text-right font-bold">총 지급액</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {payrolls.map((payroll) => {
                    const employee = getEmployee(payroll.employeeId);
                    if (!employee) return null;
                    const specialPay = payroll.overtimePay + payroll.nightPay + payroll.holidayPay;
                    const isIncreased = increasedState[payroll.employeeId];

                    return (
                        <Collapsible key={payroll.employeeId} asChild>
                            <React.Fragment>
                                <TableRow className="font-medium">
                                    <TableCell>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full justify-start">
                                                상세
                                                <ChevronDown className="h-4 w-4 ml-2" />
                                            </Button>
                                        </CollapsibleTrigger>
                                    </TableCell>
                                    <TableCell>{employee.name}</TableCell>
                                    <TableCell className="text-right">{payroll.totalHours}시간</TableCell>
                                    <TableCell className="text-right">{formatCurrency(payroll.basePay)}원</TableCell>
                                    <TableCell className="text-right">{formatCurrency(payroll.weeklyHolidayAllowance)}원</TableCell>
                                    <TableCell className="text-right">{formatCurrency(specialPay)}원</TableCell>
                                    <TableCell className="text-right font-bold">
                                        <div className="flex justify-end items-center gap-2">
                                            {formatCurrency(payroll.totalPay)}원
                                            {isIncreased && <TrendingUp className="h-4 w-4 text-green-500" />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <CollapsibleContent asChild>
                                    <TableRow>
                                        <TableCell colSpan={7} className="p-0">
                                            <div className="p-4 bg-muted/50">
                                                <h4 className="font-semibold mb-2">{employee.name}님 일별 근무 기록</h4>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                                                    {weekDays.map(day => {
                                                        const shift = mockSchedule[day]?.[employee.id];
                                                        return (
                                                        <div key={day} className="border rounded-md p-2 text-xs bg-background">
                                                            <p className="font-semibold">{day}</p>
                                                            <p className="text-muted-foreground">
                                                                {shift ? `${formatTime(shift.start)} - ${formatTime(shift.end)}` : '휴무'}
                                                            </p>
                                                        </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                </CollapsibleContent>
                            </React.Fragment>
                        </Collapsible>
                    );
                    })}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}
