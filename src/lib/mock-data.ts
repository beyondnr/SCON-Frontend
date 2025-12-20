import type { Store, Employee, Schedule, Payroll, ReportHistoryItem } from './types';

export const mockStore: Store = {
  name: '행복 베이커리',
  businessType: '베이커리',
  openingTime: '08:00',
  closingTime: '22:00',
};

export const mockEmployees: Employee[] = [
  { 
    id: 'emp-1', 
    name: '김민준', 
    email: 'minjun@scon.com', 
    phoneNumber: '010-1234-5678', 
    hourlyRate: 10000, 
    role: '매니저', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minjun', 
    color: '#E07A5F',
    shiftPreset: 'morning'
  },
  { 
    id: 'emp-2', 
    name: '이서연', 
    email: 'seoyeon@scon.com', 
    phoneNumber: '010-2345-6789', 
    hourlyRate: 9860, 
    role: '직원', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seoyeon', 
    color: '#D4A373',
    shiftPreset: 'afternoon'
  },
  { 
    id: 'emp-3', 
    name: '박하준', 
    email: 'hajun@scon.com', 
    phoneNumber: '010-3456-7890', 
    hourlyRate: 9860, 
    role: '직원', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hajun', 
    color: '#81B29A',
    shiftPreset: 'morning'
  },
  { 
    id: 'emp-4', 
    name: '최지우', 
    email: 'jiwoo@scon.com', 
    phoneNumber: '010-4567-8901', 
    hourlyRate: 9860, 
    role: '직원', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jiwoo', 
    color: '#7D8CC4',
    shiftPreset: 'custom',
    customShiftStart: '18:00',
    customShiftEnd: '22:00'
  },
];

export const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

export const mockSchedule: Schedule = {
  '월': {
    'emp-1': { start: '08:00', end: '16:00' },
    'emp-2': null,
    'emp-3': { start: '14:00', end: '22:00' },
    'emp-4': null,
  },
  '화': {
    'emp-1': { start: '08:00', end: '16:00' },
    'emp-2': { start: '09:00', end: '15:00' },
    'emp-3': null,
    'emp-4': { start: '16:00', end: '22:00' },
  },
  '수': {
    'emp-1': null,
    'emp-2': { start: '09:00', end: '17:00' },
    'emp-3': { start: '14:00', end: '22:00' },
    'emp-4': null,
  },
  '목': {
    'emp-1': { start: '08:00', end: '16:00' },
    'emp-2': { start: '09:00', end: '15:00' },
    'emp-3': null,
    'emp-4': { start: '16:00', end: '22:00' },
  },
  '금': {
    'emp-1': { start: '08:00', end: '16:00' },
    'emp-2': null,
    'emp-3': { start: '14:00', end: '22:00' },
    'emp-4': { start: '18:00', end: '22:00' },
  },
  '토': {
    'emp-1': { start: '09:00', end: '18:00' },
    'emp-2': { start: '09:00', end: '14:00' },
    'emp-3': null,
    'emp-4': { start: '14:00', end: '22:00' },
  },
  '일': {
    'emp-1': null,
    'emp-2': null,
    'emp-3': { start: '10:00', end: '19:00' },
    'emp-4': null,
  },
};

export const mockPayrolls: Payroll[] = [
  {
    employeeId: 'emp-1',
    totalHours: 41,
    basePay: 410000,
    weeklyHolidayAllowance: 80000,
    overtimePay: 15000,
    nightPay: 0,
    holidayPay: 0,
    totalPay: 505000,
  },
  {
    employeeId: 'emp-2',
    totalHours: 20,
    basePay: 197200,
    weeklyHolidayAllowance: 39440,
    overtimePay: 0,
    nightPay: 0,
    holidayPay: 0,
    totalPay: 236640,
  },
  {
    employeeId: 'emp-3',
    totalHours: 33,
    basePay: 325380,
    weeklyHolidayAllowance: 65076,
    overtimePay: 0,
    nightPay: 0,
    holidayPay: 0,
    totalPay: 390456,
  },
  {
    employeeId: 'emp-4',
    totalHours: 18,
    basePay: 177480,
    weeklyHolidayAllowance: 35496,
    overtimePay: 0,
    nightPay: 4930,
    holidayPay: 0,
    totalPay: 217906,
  },
];

export const mockReportHistory: ReportHistoryItem[] = [
  {
    id: 'rep-2403-1',
    period: '2024.02.26 ~ 2024.03.03 (3월 1주)',
    totalHours: 108,
    totalAmount: 1280000,
  },
  {
    id: 'rep-2402-4',
    period: '2024.02.19 ~ 2024.02.25 (2월 4주)',
    totalHours: 115,
    totalAmount: 1420000,
  },
  {
    id: 'rep-2402-3',
    period: '2024.02.12 ~ 2024.02.18 (2월 3주)',
    totalHours: 110,
    totalAmount: 1310000,
  },
];
