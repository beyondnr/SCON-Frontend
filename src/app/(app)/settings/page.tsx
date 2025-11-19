import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockEmployees, mockStore } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Building, Clock, Users } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">매장 설정</h1>
                <p className="text-muted-foreground">온보딩에서 입력한 매장 및 직원 정보를 확인합니다.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Building className="h-5 w-5" />
                        매장 정보
                    </CardTitle>
                    <CardDescription>사장님의 매장 기본 정보입니다.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">매장명</span>
                        <span className="font-semibold">{mockStore.name}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">업종</span>
                        <span className="font-semibold">{mockStore.businessType}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">영업시간</span>
                        <span className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {mockStore.openingTime} ~ {mockStore.closingTime}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        <Users className="h-5 w-5" />
                        직원 목록
                    </CardTitle>
                    <CardDescription>현재 등록된 직원 목록입니다.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">프로필</TableHead>
                                <TableHead>이름</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead className="text-right">시급</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockEmployees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <Image 
                                            src={`https://picsum.photos/seed/${employee.id}/100/100`}
                                            alt={employee.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                            data-ai-hint="person avatar"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(employee.hourlyRate)}원</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
