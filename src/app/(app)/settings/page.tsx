"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { mockEmployees, mockStore } from "@/lib/mock-data";
import { Employee, Store } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Building, Clock, Edit2, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import { EmployeeEditDialog } from "./components/employee-edit-dialog";
import { StoreEditDialog } from "./components/store-edit-dialog";

export default function SettingsPage() {
    const [store, setStore] = useState<Store>(mockStore);
    const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
    
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

    const handleStoreSave = (updatedStore: Store) => {
        setStore(updatedStore);
    };

    const handleEmployeeSave = (employee: Employee) => {
        if (editingEmployee) {
            // Edit existing
            setEmployees(employees.map(e => e.id === employee.id ? employee : e));
        } else {
            // Add new
            setEmployees([...employees, employee]);
        }
    };

    const handleDeleteEmployee = (id: string) => {
        if (confirm("정말로 이 직원을 삭제하시겠습니까?")) {
            setEmployees(employees.filter(e => e.id !== id));
        }
    };

    const openAddEmployeeDialog = () => {
        setEditingEmployee(null);
        setIsEmployeeDialogOpen(true);
    };

    const openEditEmployeeDialog = (employee: Employee) => {
        setEditingEmployee(employee);
        setIsEmployeeDialogOpen(true);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">직원 관리</h1>
                <p className="text-muted-foreground">직원 목록을 관리하고 매장 정보를 수정합니다.</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Users className="h-5 w-5" />
                            직원 목록
                        </CardTitle>
                        <CardDescription>현재 등록된 직원 목록입니다.</CardDescription>
                    </div>
                    <Button size="sm" onClick={openAddEmployeeDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        직원 추가
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">프로필</TableHead>
                                <TableHead>이름</TableHead>
                                <TableHead>이메일</TableHead>
                                <TableHead>휴대폰 번호</TableHead>
                                <TableHead>역할</TableHead>
                                <TableHead className="text-right">시급</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell>
                                        <Avatar className="border-2 border-transparent" style={{ borderColor: employee.color }}>
                                            <AvatarFallback style={{ backgroundColor: employee.color ? `${employee.color}30` : undefined, color: employee.color }}>
                                                {employee.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TableCell>
                                    <TableCell className="font-medium">{employee.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{employee.email}</TableCell>
                                    <TableCell className="text-muted-foreground">{employee.phoneNumber}</TableCell>
                                    <TableCell>{employee.role}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(employee.hourlyRate)}원</TableCell>
                                    <TableCell>
                                        <div className="flex justify-end gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="icon"
                                                onClick={() => openEditEmployeeDialog(employee)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            <Building className="h-5 w-5" />
                            매장 정보
                        </CardTitle>
                        <CardDescription>사장님의 매장 기본 정보입니다.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setIsStoreDialogOpen(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        수정
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">매장명</span>
                        <span className="font-semibold">{store.name}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">업종</span>
                        <span className="font-semibold">{store.businessType}</span>
                    </div>
                     <div className="flex items-center">
                        <span className="w-24 text-muted-foreground">영업시간</span>
                        <span className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {store.openingTime} ~ {store.closingTime}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <StoreEditDialog 
                isOpen={isStoreDialogOpen} 
                onClose={() => setIsStoreDialogOpen(false)} 
                store={store}
                onSave={handleStoreSave}
            />

            <EmployeeEditDialog
                isOpen={isEmployeeDialogOpen}
                onClose={() => setIsEmployeeDialogOpen(false)}
                employee={editingEmployee}
                existingEmployees={employees}
                onSave={handleEmployeeSave}
            />
        </div>
    );
}
