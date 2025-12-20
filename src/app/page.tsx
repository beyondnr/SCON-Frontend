import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Logo } from "@/components/layout/logo";
import { 
  ArrowRight, 
  CalendarDays, 
  CheckCircle2, 
  Clock, 
  Coins, 
  Calculator, 
  Users, 
  BellRing, 
  MousePointerClick
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* 1. Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">로그인</Link>
            </Button>
            <Button asChild>
              <Link href="/onboarding">무료로 시작하기</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section */}
        <section className="container relative pt-20 pb-32 md:pt-32 md:pb-48">
          <div className="flex flex-col items-center text-center space-y-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium rounded-full mb-4">
              🎉 엑셀 없는 매장 관리의 시작
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              클릭 몇 번으로 완성하는<br className="hidden md:block" />
              <span className="text-primary relative">
                우리 매장 최적의 스케줄
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              엑셀 씨름은 그만. 근무표 작성부터 예상 인건비 확인까지.<br />
              사장님은 그저 <strong>'배치'</strong>만 하세요. 나머지는 SCON이 계산합니다.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Button size="lg" className="h-14 px-8 text-lg gap-2 shadow-lg hover:shadow-xl transition-all" asChild>
                <Link href="/onboarding">
                  지금 바로 스케줄 만들어보기 <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg" asChild>
                <Link href="#features">
                  기능 더 알아보기
                </Link>
              </Button>
            </div>

            {/* Visual Mockup - Abstract Representation */}
            <div className="mt-16 relative w-full max-w-5xl aspect-video rounded-xl border bg-card shadow-2xl overflow-hidden p-2 group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-primary/5 opacity-50" />
              
              {/* Fake UI: Dashboard Header */}
              <div className="h-full w-full bg-background rounded-lg border flex flex-col overflow-hidden">
                <div className="h-14 border-b px-6 flex items-center justify-between bg-muted/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-8 w-64 bg-muted/50 rounded animate-pulse" />
                </div>
                
                <div className="flex-1 p-6 grid grid-cols-12 gap-6">
                  {/* Calendar Area */}
                  <div className="col-span-12 md:col-span-8 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg">12월 3주차 근무표</h3>
                      <Badge>작성중</Badge>
                    </div>
                    <div className="grid grid-cols-7 gap-2 flex-1">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="bg-muted/30 rounded border p-2 min-h-[100px] relative hover:bg-muted/50 transition-colors">
                          <span className="text-xs text-muted-foreground font-medium block mb-2">{i + 16}일</span>
                          {i % 2 === 0 && (
                            <div className="bg-primary/10 text-primary text-xs p-1 rounded mb-1 font-medium border border-primary/20">
                              오픈: 김철수
                            </div>
                          )}
                          {i === 3 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-primary border-dashed rounded opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-primary text-sm font-bold flex items-center gap-1">
                                <MousePointerClick className="w-4 h-4" /> 클릭하여 추가
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Cost Panel */}
                  <div className="col-span-12 md:col-span-4 space-y-4">
                    <Card className="bg-primary/5 border-primary/20 shadow-none">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">이번 주 예상 인건비</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">
                          1,245,000원
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 주휴수당 포함됨
                        </p>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-2">
                      <div className="h-10 w-full bg-muted/40 rounded" />
                      <div className="h-10 w-full bg-muted/40 rounded" />
                      <div className="h-10 w-full bg-muted/40 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Input-Output Section (Top-Down Flow) */}
        <section id="features" className="py-24 bg-muted/30">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                복잡한 소통 없이,<br /> 
                사장님이 주도하는 매장 관리
              </h2>
              <p className="text-lg text-muted-foreground">
                관리자가 계획을 세우면, 시스템이 알아서 공유하고 확인합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
              {/* Connector Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

              {/* Step 1 */}
              <div className="flex flex-col items-center text-center bg-background p-8 rounded-2xl border shadow-sm relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold border border-primary/20">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">작성 (Draft)</h3>
                <p className="text-muted-foreground mb-6">
                  필요한 시간에 필요한 인원을<br />
                  드래그하여 배치하세요.
                </p>
                <div className="w-full bg-muted/30 rounded-lg p-4 border border-dashed">
                  <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center bg-background p-8 rounded-2xl border shadow-sm relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold border border-primary/20">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">공유 (Publish)</h3>
                <p className="text-muted-foreground mb-6">
                  버튼 하나로 전 직원에게<br />
                  근무표 알림이 발송됩니다.
                </p>
                <div className="w-full bg-muted/30 rounded-lg p-4 border border-dashed">
                  <BellRing className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center bg-background p-8 rounded-2xl border shadow-sm relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-2xl font-bold border border-primary/20">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">확인 (Confirm)</h3>
                <p className="text-muted-foreground mb-6">
                  직원들의 확인 여부와<br />
                  피드백을 한눈에 파악하세요.
                </p>
                <div className="w-full bg-muted/30 rounded-lg p-4 border border-dashed">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Value Proposition (Prediction & Control) */}
        <section className="py-24 container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none">
                <Coins className="w-3 h-3 mr-1" /> 비용 관리
              </Badge>
              <h2 className="text-3xl md:text-5xl font-bold leading-tight">
                스케줄을 짤 때,<br />
                <span className="text-primary">돈이 보입니다.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                직원을 배치할 때마다 이번 주 예상 인건비가 바로 계산됩니다. 
                주휴수당, 야간수당까지 고려된 정확한 금액을 미리 확인하고 스케줄을 조정하세요.
              </p>
              
              <div className="grid gap-4">
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                  <div className="bg-background p-2 rounded-full border shadow-sm">
                    <Calculator className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">실시간 자동 계산</h4>
                    <p className="text-sm text-muted-foreground">복잡한 수당 계산식 없이 자동으로 법정 수당이 적용됩니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 border">
                  <div className="bg-background p-2 rounded-full border shadow-sm">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">예산 초과 방지</h4>
                    <p className="text-sm text-muted-foreground">계획된 예산 내에서 운영되고 있는지 실시간으로 체크하세요.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-transparent rounded-3xl blur-2xl opacity-50" />
              <Card className="relative border-2 shadow-2xl">
                <CardHeader>
                  <CardTitle>12월 인건비 예측 리포트</CardTitle>
                  <CardDescription>2023.12.01 ~ 2023.12.31</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">기본급</span>
                      <span>2,800,000원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">주휴수당</span>
                      <span>+ 420,000원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">야간/연장수당</span>
                      <span>+ 150,000원</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center">
                      <span className="font-bold">총 예상 지급액</span>
                      <span className="text-2xl font-bold text-primary">3,370,000원</span>
                    </div>
                  </div>
                  
                  <Button className="w-full" variant="outline">
                    상세 리포트 다운로드
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* 5. Efficiency Graph (Comparison) */}
        <section className="py-24 bg-slate-950 text-slate-50">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                스케줄 관리에 들이는 시간,<br />
                <span className="text-blue-400">90%</span>를 줄여드립니다.
              </h2>
              <p className="text-slate-400 text-lg">
                사장님의 시간은 비용입니다. 이제 더 중요한 일에 집중하세요.
              </p>
            </div>

            <div className="max-w-4xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800 hover:bg-slate-900/50">
                    <TableHead className="w-[30%] text-slate-400 pl-8">구분</TableHead>
                    <TableHead className="w-[35%] text-slate-400">기존 방식 (Manual)</TableHead>
                    <TableHead className="w-[35%] text-blue-400 font-bold">SCON 도입 후</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium pl-8 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> 근무 가능 시간 파악
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">개별 연락 및 취합 (1일)</TableCell>
                    <TableCell className="text-white font-bold bg-blue-500/10">가능 시간 자동 연동 (즉시)</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium pl-8 text-slate-300">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" /> 스케줄 작성
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">엑셀/수기 작성 (3시간)</TableCell>
                    <TableCell className="text-white font-bold bg-blue-500/10">드래그 앤 드롭 배치 (10분)</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium pl-8 text-slate-300">
                      <div className="flex items-center gap-2">
                        <BellRing className="w-4 h-4" /> 공지 및 소통
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">단톡방 공지/수정 (반복)</TableCell>
                    <TableCell className="text-white font-bold bg-blue-500/10">원클릭 게시 & 알림 (자동)</TableCell>
                  </TableRow>
                  <TableRow className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="font-medium pl-8 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4" /> 급여 계산
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-400">월말 수기 계산 (오류 발생)</TableCell>
                    <TableCell className="text-white font-bold bg-blue-500/10">실시간 자동 산출 (정확도 100%)</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* 6. Final CTA */}
        <section className="py-24 container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold">
              가장 스마트한 사장님의 선택, SCON.
            </h2>
            <p className="text-xl text-muted-foreground">
              회원가입 없이 1분 미리보기 체험도 가능합니다.<br />
              지금 바로 우리 매장 스케줄을 만들어보세요.
            </p>
            <div className="flex justify-center gap-4 pt-4">
               <Button size="lg" className="h-14 px-10 text-xl font-bold shadow-xl" asChild>
                <Link href="/onboarding">무료로 시작하기</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-8">
              * 별도의 앱 설치 없이 웹에서 바로 이용 가능합니다.
            </p>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Logo />
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              SCON은 소상공인 사장님의<br />성공적인 매장 운영을 응원합니다.
            </p>
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">이용약관</Link>
            <Link href="#" className="hover:text-foreground">개인정보처리방침</Link>
            <Link href="#" className="hover:text-foreground">문의하기</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SCON. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
