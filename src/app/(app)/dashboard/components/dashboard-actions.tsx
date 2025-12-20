"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockEmployees } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Send, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react";
import { generateMockToken } from "@/lib/utils";

export function DashboardActions() {
  const { toast } = useToast();
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  
  // Rejection Logic States
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{ id: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  // Mock Data for interactions
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 1, empId: 'emp-3', name: '박하준', submittedAt: '2024.03.10 14:00', status: 'pending' },
    { id: 2, empId: 'emp-4', name: '최지우', submittedAt: '2024.03.10 15:30', status: 'pending' },
  ]);

  const [unsubmittedEmployees, setUnsubmittedEmployees] = useState([
    { id: 'emp-2', name: '이서연', status: 'not_requested' },
    { id: 'emp-5', name: '정우성', status: 'not_requested' },
    { id: 'emp-6', name: '한지민', status: 'not_requested' },
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

  // Open Reject Modal
  const handleRejectClick = (id: number, name: string) => {
    setRejectTarget({ id, name });
    setRejectReason(""); // Reset reason
    setIsRejectOpen(true);
  };

  // Confirm Rejection
  const handleConfirmReject = () => {
    if (!rejectTarget) return;

    setPendingApprovals(prev => prev.filter(item => item.id !== rejectTarget.id));
    toast({
      title: "근무표 반려 완료",
      description: `${rejectTarget.name}님의 근무표를 반려하였습니다. (사유: ${rejectReason || "입력 없음"})`,
      variant: "destructive",
    });
    
    setIsRejectOpen(false);
    setRejectTarget(null);
  };

  const handleRequest = (empId: string, name: string) => {
    const token = generateMockToken(empId);
    const link = `${window.location.origin}/availability?token=${token}`;
    
    // console.log(`[Link Generated for ${name}]`, link); // For debugging
    window.prompt(`[테스트용] ${name}님을 위한 링크가 생성되었습니다. 복사해서 사용하세요:`, link);

    setUnsubmittedEmployees(prev => prev.map(emp => 
      emp.id === empId ? { ...emp, status: 'requested' } : emp
    ));
    toast({
      title: "요청 전송 완료",
      description: `${name}님에게 근무표 작성을 요청하였습니다.`,
    });
  };

  const handleRequestAll = () => {
    const targetCount = unsubmittedEmployees.filter(e => e.status === 'not_requested').length;
    
    if (targetCount === 0) {
      toast({
        title: "알림",
        description: "요청을 보낼 대상이 없습니다.",
        variant: "secondary", // using secondary as info-like
      });
      return;
    }

    if (confirm("아직 요청하지 않은 직원 전체에 알림을 보내시겠습니까?")) {
      // Only update employees who are NOT yet requested
      setUnsubmittedEmployees(prev => prev.map(emp => 
        emp.status === 'not_requested' ? { ...emp, status: 'requested' } : emp
      ));
      
      // Generate links and logs for newly requested employees (Mock Logic)
      const newlyRequested = unsubmittedEmployees.filter(e => e.status === 'not_requested');
      newlyRequested.forEach(emp => {
         const token = generateMockToken(emp.id);
         const link = `${window.location.origin}/availability?token=${token}`;
         // In a real app, this would trigger an API call to send emails/SMS
         // For demo, we just log or maybe prompt the first one (but prompting all is annoying)
         console.log(`[Batch Request] Link for ${emp.name}: ${link}`);
      });

      toast({
        title: "전체 요청 전송 완료",
        description: `총 ${targetCount}명의 직원에게 요청을 보냈습니다.`,
      });
    }
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
                            onClick={() => handleRejectClick(item.id, item.name)}
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

      {/* 반려 사유 입력 모달 (Nested Dialog Alternative using simple state control on top) */}
      {/* Note: To avoid nested Dialog issues in some library versions, ensure proper z-index or management. 
          Shadcn UI (Radix) supports nested dialogs but sometimes requires care. 
          Here we open a second dialog on top of the first one. */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[400px] z-[150]">
          <DialogHeader>
            <DialogTitle className="text-lg font-headline text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              근무표 반려 사유 입력
            </DialogTitle>
            <DialogDescription>
              {rejectTarget?.name}님의 근무표를 반려하는 이유를 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">반려 사유</Label>
              <Textarea 
                id="reason" 
                placeholder="예: 주말 근무 시간이 너무 적습니다. 조정 부탁드려요." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>취소</Button>
            <Button variant="destructive" onClick={handleConfirmReject}>반려 확정</Button>
          </DialogFooter>
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
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                        요청 완료
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleRequest(emp.id, emp.name)}
                        className="h-7 px-2 text-muted-foreground hover:text-primary"
                        title="링크 재전송"
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        재전송
                      </Button>
                    </div>
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
          <DialogFooter className="pt-2">
             <Button 
               className="w-full font-bold" 
               onClick={handleRequestAll}
               disabled={unsubmittedEmployees.every(e => e.status === 'requested')}
             >
               <Send className="w-4 h-4 mr-2" />
               미제출 인원 전체 요청하기
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

