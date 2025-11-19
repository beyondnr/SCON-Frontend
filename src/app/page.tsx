import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 flex justify-start">
        <Logo />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight text-foreground mb-4">
            사장님, 이제 스케줄 관리는<br />
            <span className="text-primary">LawfulShift</span>에 맡기세요
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            복잡한 수당 계산, 까다로운 근로기준법 준수, 번거로운 스케줄 조정까지.
            LawfulShift가 사장님의 매장 관리를 스마트하게 자동화합니다.
          </p>
          <div className="flex justify-center">
            <Button asChild size="lg" className="text-lg font-bold">
              <Link href="/onboarding">무료로 시작하기</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                    icon={<Zap className="w-8 h-8 text-primary" />}
                    title="자동화된 스케줄링"
                    description="직원 가용 시간을 기반으로 최적의 스케줄을 자동 생성하고, 법규 위반을 사전에 경고합니다."
                />
                <FeatureCard 
                    icon={<CheckCircle className="w-8 h-8 text-accent" />}
                    title="투명한 급여 정산"
                    description="주휴수당, 연장근로 등 복잡한 수당을 포함한 예상 급여를 정확히 계산하여 보여줍니다."
                />
                <FeatureCard 
                    icon={<Zap className="w-8 h-8 text-primary" />}
                    title="간편한 관리"
                    description="온보딩부터 직원 관리, 스케줄 승인까지 모든 과정을 몇 번의 클릭으로 해결할 수 있습니다."
                />
            </div>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} LawfulShift. All rights reserved.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <Card className="text-left bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <div className="mb-3">{icon}</div>
                <CardTitle className="font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
