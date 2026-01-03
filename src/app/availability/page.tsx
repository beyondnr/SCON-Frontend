"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CenteredLayout } from '@/components/layout/centered-layout';

export default function AvailabilityPage() {
    return (
        <CenteredLayout maxWidth="md">
            <Card className="w-full text-center shadow-lg">
                <CardHeader>
                    <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <CardTitle className="text-2xl font-headline">페이지 이용 불가</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        이 페이지는 더 이상 사용되지 않거나 준비 중입니다.<br />
                        관리자에게 문의해주세요.
                    </p>
                    <Link href="/">
                        <Button className="w-full">
                            홈으로 돌아가기
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </CenteredLayout>
    );
}
