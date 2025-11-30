"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockEmployees } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Send, ChevronDown, ChevronUp, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardActions() {
  const { toast } = useToast();
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  
  // Mock Data for interactions
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, empId: 'emp-3', name: '박하준', submittedAt: '2024.03.10 14:00', status: 'pending' },
    { id: 2, empId: 'emp-4', name: '최지우', submittedAt: '2024.03.10 15:30', status: 'pending' },
  ]);

  const [unsubmittedEmployees, setUnsubmittedEmployees] = useState([
    { id: 'emp-2', name: '이서연', status: 'not_requested' },
  ]);

  // Expanded state for accordion in approvals
  const [expandedApprovalId, setExpandedApprovalId] = useState<number | null>(null);

  const handleApprove = (id: number, name: string) => {
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    toast({
      title: "근무표 승인 완료",
      description: `${name}님의 근무표를 승인하였습니다.`,
      variant: "default", // using default as success-like blue in standard shadcn/toast usually
    });
  };

  const handleReject = (id: number, name: string) => {
    setPendingApprovals(prev => prev.filter(item => item.id !== id));
    toast({
      title: "근무표 반려 완료",
      description: `${name}님의 근무표를 반려하였습니다.`,
      variant: "destructive",
    });
  };

  const handleRequest = (empId: string, name: string) => {
    setUnsubmittedEmployees(prev => prev.map(emp => 
      emp.id === empId ? { ...emp, status: 'requested' } : emp
    ));
    toast({
      title: "요청 전송 완료",
      description: `${name}님에게 근무표 작성을 요청하였습니다.`,
    });
  };

  const pendingCount = pendingApprovals.length;
  const requestCount = unsubmittedEmployees.filter(e => e.status === 'not_requested').length;

  return (
    <div className="flex gap-3">
      {/* A. 근무표 승인 버튼 */}
      <Button 
        onClick={() => setIsApproveOpen(true)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[48px] px-6 relative"
      >
        근무표 승인
        {pendingCount > 0 && (
          <Badge variant="destructive" className="ml-2 rounded-full w-6 h-6 p-0 flex items-center justify-center absolute -top-2 -right-2 border-2 border-background">
            {pendingCount}
          </Badge>
        )}
      </Button>

      {/* B. 근무표 요청 버튼 */}
      <Button 
        variant="outline"
        onClick={() => setIsRequestOpen(true)}
        className="min-h-[48px] px-6 border-primary/20 text-primary hover:bg-primary/5 relative"
      >
        근무표 요청
        {requestCount > 0 && (
          <Badge variant="secondary" className="ml-2 rounded-full w-6 h-6 p-0 flex items-center justify-center bg-muted-foreground text-white absolute -top-2 -right-2 border-2 border-background">
            {requestCount}
          </Badge>
        )}
      </Button>

      {/* 승인 모달 */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline">주간 근무표 승인 목록</DialogTitle>
            <DialogDescription>
              직원들이 제출한 근무표를 검토하고 승인해주세요.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-3 py-2">
              {pendingApprovals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  대기 중인 승인 건이 없습니다.
                </div>
              ) : (
                pendingApprovals.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden bg-card">
                    <div 
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => setExpandedApprovalId(expandedApprovalId === item.id ? null : item.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-lg">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.submittedAt}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">대기</Badge>
                        {expandedApprovalId === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {expandedApprovalId === item.id && (
                      <div className="p-4 border-t bg-muted/20 animate-accordion-down">
                        <div className="mb-4 space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">제출된 근무 시간표 (요약)</p>
                          {/* Mock Schedule Summary */}
                          <div className="bg-background p-3 rounded border text-sm space-y-1">
                            <div className="flex justify-between"><span className="text-muted-foreground">월</span> <span>09:00 - 18:00</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">수</span> <span>09:00 - 18:00</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">금</span> <span>09:00 - 18:00</span></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12"
                            onClick={() => handleApprove(item.id, item.name)}
                          >
                            <CheckCircle2 className="mr-2 h-5 w-5" />
                            승인
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 h-12"
                            onClick={() => handleReject(item.id, item.name)}
                          >
                            <XCircle className="mr-2 h-5 w-5" />
                            반려
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* 요청 모달 */}
      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline">근무표 미제출 직원 목록</DialogTitle>
            <DialogDescription>
              아직 근무표를 제출하지 않은 직원에게 알림을 보냅니다.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh] pr-4">
            <div className="space-y-2 py-2">
              {unsubmittedEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <span className="font-medium text-lg">{emp.name}</span>
                  {emp.status === 'requested' ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                      요청 완료
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={() => handleRequest(emp.id, emp.name)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      요청하기
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

