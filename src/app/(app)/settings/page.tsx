"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ApiEmployee, ApiStore, apiEmployeeToFrontend, apiStoreToFrontend } from "@/lib/api-mappers";
import { Employee, Store } from "@/lib/types";
import { formatCurrency, getRandomEmployeeColor } from "@/lib/utils";
import { Building, Clock, Edit2, Plus, Trash2, Users, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { EmployeeEditDialog } from "./components/employee-edit-dialog";
import { StoreEditDialog } from "./components/store-edit-dialog";
import apiClient from "@/lib/api-client";
import { getCurrentStoreId } from "@/lib/local-storage-utils";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export default function SettingsPage() {
    const { toast } = useToast();
    
    // 매장 정보 상태
    const [store, setStore] = useState<Store | null>(null);
    const [isStoreLoading, setIsStoreLoading] = useState(false);
    
    // 직원 목록 상태
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
    
    // 다이얼로그 상태
    const [isStoreDialogOpen, setIsStoreDialogOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
    
    // 삭제 확인 다이얼로그 상태
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<ApiEmployee | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // 매장 정보 조회
    useEffect(() => {
        const fetchStore = async () => {
            const storeId = getCurrentStoreId();
            if (!storeId) {
                toast({
                    title: "오류",
                    description: "매장 정보를 찾을 수 없습니다.",
                    variant: "destructive",
                });
                return;
            }

            try {
                setIsStoreLoading(true);
                const response = await apiClient.get<ApiStore>(`/v1/stores/${storeId}`);
                if (response.data) {
                    const frontendStore = apiStoreToFrontend(response.data);
                    setStore(frontendStore);
                    logger.debug("Store fetched successfully", { storeId });
                }
            } catch (error) {
                // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
                logger.error("[Settings] Failed to fetch store:", error);
            } finally {
                setIsStoreLoading(false);
            }
        };

        fetchStore();
    }, [toast]);

    // 직원 목록 조회
    const fetchEmployees = useCallback(async () => {
        const storeId = getCurrentStoreId();
        if (!storeId) {
            return;
        }

        try {
            setIsEmployeesLoading(true);
            const response = await apiClient.get<ApiEmployee[]>(
                `/v1/stores/${storeId}/employees`
            );
            if (response.data) {
                // API 응답을 프론트엔드 Employee 타입으로 변환
                const frontendEmployees = response.data.map(apiEmployeeToFrontend);
                // color 필드가 없는 경우 생성 (프론트엔드에서만 사용)
                // 이미 할당된 색상을 추적하여 중복 방지
                const usedColors = frontendEmployees
                    .map(e => e.color)
                    .filter((c): c is string => !!c);
                
                const employeesWithColors = frontendEmployees.map((emp) => {
                    if (!emp.color) {
                        return { ...emp, color: getRandomEmployeeColor(usedColors) };
                    }
                    return emp;
                });
                
                setEmployees(employeesWithColors);
                logger.debug("Employees fetched successfully", { 
                    count: response.data.length 
                });
            } else {
                setEmployees([]);
            }
        } catch (error) {
            // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
            logger.error("[Settings] Failed to fetch employees:", error);
            setEmployees([]); // 에러 시 빈 배열로 설정
        } finally {
            setIsEmployeesLoading(false);
        }
    }, []);

    // 페이지 로드 시 직원 목록 조회
    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // 매장 정보 수정 핸들러
    const handleStoreSave = (updatedStore: Store) => {
        setStore(updatedStore);
        // 매장 정보 수정 후 재조회는 필요 없음 (StoreEditDialog에서 처리)
    };

    // 직원 목록 새로고침 핸들러 (직원 등록/수정/삭제 후 호출)
    const handleEmployeesRefresh = () => {
        fetchEmployees();
    };

    // 직원 저장 핸들러 (직원 등록/수정 후 호출)
    const handleEmployeeSave = () => {
        // 직원 목록 새로고침 (EmployeeEditDialog에서 API 호출 후 이 콜백 호출)
        handleEmployeesRefresh();
    };

    // 직원 삭제 클릭 핸들러
    const handleDeleteClick = (employee: Employee) => {
        // 프론트엔드 Employee 타입에서 ID 추출
        // Employee.id는 string이지만, API는 number를 요구함
        const employeeId = parseInt(employee.id);
        if (isNaN(employeeId)) {
            toast({
                title: "오류",
                description: "유효하지 않은 직원 ID입니다.",
                variant: "destructive",
            });
            return;
        }
        
        // 삭제 확인 다이얼로그를 위해 직원 정보 저장 (이름 표시용)
        // ID만 필요한 경우이므로 최소한의 정보만 저장
        const apiEmployee: ApiEmployee = {
            id: employeeId,
            name: employee.name,
            employmentType: employee.role === '매니저' ? 'MANAGER' : 'EMPLOYEE',
        };
        
        setEmployeeToDelete(apiEmployee);
        setDeleteDialogOpen(true);
    };

    // 직원 삭제 확인 핸들러
    const handleDeleteConfirm = async () => {
        if (!employeeToDelete) return;

        try {
            setIsDeleting(true);
            // ApiEmployee.id는 이미 number 타입이므로 변환 불필요
            await apiClient.delete(`/v1/employees/${employeeToDelete.id}`);

            toast({
                title: "삭제 완료",
                description: "직원이 삭제되었습니다.",
            });

            // 직원 목록 새로고침
            handleEmployeesRefresh();
            setDeleteDialogOpen(false);
            setEmployeeToDelete(null);
        } catch (error) {
            // 에러는 apiClient 인터셉터에서 자동으로 Toast 표시됨
            logger.error("[Settings] Failed to delete employee:", error);
        } finally {
            setIsDeleting(false);
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
                            {isEmployeesLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            <span className="text-muted-foreground">직원 목록을 불러오는 중...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        등록된 직원이 없습니다.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
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
                                                    onClick={() => handleDeleteClick(employee)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
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
                    {isStoreLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                <span className="text-muted-foreground">매장 정보를 불러오는 중...</span>
                            </div>
                        </div>
                    ) : store ? (
                        <>
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
                        </>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            매장 정보를 불러올 수 없습니다.
                        </div>
                    )}
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

            {/* 삭제 확인 다이얼로그 */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>직원 삭제</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 {employeeToDelete?.name} 직원을 삭제하시겠습니까?
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    삭제 중...
                                </>
                            ) : (
                                "삭제"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
