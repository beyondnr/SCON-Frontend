export type Store = {
  name: string;
  businessType: string;
  openingTime: string;
  closingTime: string;
};

export type EmployeeRole = '직원' | '매니저';

export type Employee = {
  id: string;
  name: string;
  hourlyRate: number;
  role: EmployeeRole;
  avatarUrl?: string;
};

export type TimeRange = {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
};

export type DailyAvailability = {
  day: string; // '월', '화', ...
  times: TimeRange[];
};

export type Availability = DailyAvailability[];

export type Shift = {
  employeeId: string;
  start: string; // "YYYY-MM-DDTHH:mm"
  end: "YYYY-MM-DDTHH:mm";
};

export type Schedule = {
  [day: string]: {
    [employeeId: string]: TimeRange | null;
  };
};

export type Payroll = {
  employeeId: string;
  totalHours: number;
  basePay: number;
  weeklyHolidayAllowance: number;
  overtimePay: number;
  nightPay: number;
  holidayPay: number;
  totalPay: number;
};
