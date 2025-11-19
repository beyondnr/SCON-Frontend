import type { Store, Employee, Schedule, Payroll } from './types';

export const mockStore: Store = {
  name: '행복 베이커리',
  businessType: '베이커리',
  openingTime: '08:00',
  closingTime: '22:00',
};

export const mockEmployees: Employee[] = [
  { id: 'emp-1', name: '김민준', hourlyRate: 10000, role: '매니저', avatarUrl: '/avatars/1.png' },
  { id: 'emp-2', name: '이서연', hourlyRate: 9860, role: '직원', avatarUrl: '/avatars/2.png' },
  { id: 'emp-3', name: '박하준', hourlyRate: 9860, role: '직원', avatarUrl: '/avatars/3.png' },
  { id: 'emp-4', name: '최지우', hourlyRate: 9860, role: '직원', avatarUrl: '/avatars/4.png' },
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
