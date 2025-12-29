import type { AttendanceRecord, Employee } from '../../types';

// Attendance
export const calculateAbsenceRate = (absenceDays: number, workdays: number): number => {
  if (workdays === 0) return 0;
  return (absenceDays / workdays) * 100;
};
export const calculateUnscheduledAbsencesPerEmployee = (unscheduledAbsenceDays: number, numEmployees: number): number => {
  if (numEmployees === 0) return 0;
  return unscheduledAbsenceDays / numEmployees;
};
export const calculatePTOUtilization = (ptoHoursUsed: number, ptoHoursAccrued: number): number => {
  if (ptoHoursAccrued === 0) return 0;
  return (ptoHoursUsed / ptoHoursAccrued) * 100;
};
export const calculateAvgCostOfUnscheduledAbsence = (unscheduledAbsenceDays: number, dailyComp: number, fte: number): number => {
  if (fte === 0) return 0;
  return unscheduledAbsenceDays * dailyComp / fte;
};

export const getAttendanceSummary = (attendanceData: AttendanceRecord[]): { present: number; sick: number; pto: number; unscheduled: number; total: number } => {
    const summary = { present: 0, sick: 0, pto: 0, unscheduled: 0, total: attendanceData.length };
    for (const record of attendanceData) {
        if (record.status === 'Present') summary.present++;
        else if (record.status === 'Sick Leave') summary.sick++;
        else if (record.status === 'PTO') summary.pto++;
        else if (record.status === 'Unscheduled Absence') summary.unscheduled++;
    }
    return summary;
};

export const getUnscheduledAbsenceRate = (attendanceData: AttendanceRecord[]): number => {
    if (attendanceData.length === 0) return 0;
    const unscheduledDays = attendanceData.filter(r => r.status === 'Unscheduled Absence').length;
    const totalWorkDays = attendanceData.filter(r => r.status === 'Present' || r.status === 'Unscheduled Absence').length;
    if (totalWorkDays === 0) return 0;
    return (unscheduledDays / totalWorkDays) * 100;
};

export const getOverallAbsenceRate = (attendanceData: AttendanceRecord[]): number => {
  if (attendanceData.length === 0) return 0;
  const absenceDays = attendanceData.filter(r => r.status === 'Unscheduled Absence' || r.status === 'Sick Leave').length;
  const totalDays = attendanceData.length;
  return (absenceDays / totalDays) * 100;
};

export const getSickLeaveRateFromAttendance = (attendanceData: AttendanceRecord[]): number => {
  if (attendanceData.length === 0) return 0;
  const sickDays = attendanceData.filter(r => r.status === 'Sick Leave').length;
  const totalWorkDays = attendanceData.filter(r => r.status !== 'PTO').length;
  if (totalWorkDays === 0) return 0;
  return (sickDays / totalWorkDays) * 100;
};

export const calculatePTOUtilizationFromData = (attendanceData: AttendanceRecord[], employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  // This is a simplified model assuming a standard PTO accrual rate for demo purposes
  const totalPtoUsed = attendanceData.filter(r => r.status === 'PTO').length;
  const avgPtoAccrualPerEmployeePerYear = 15;
  const totalPtoAccrued = employees.length * avgPtoAccrualPerEmployeePerYear;
  if (totalPtoAccrued === 0) return 0;
  // This is not annualized correctly but is a proxy for the demo
  return (totalPtoUsed / (totalPtoAccrued / 4)) * 100; // Assuming quarterly for now
};

export const getAbsenceTrend = (attendanceData: AttendanceRecord[], timePeriod: '6m' | '12m' | '24m' = '6m'): { name: string; value: number }[] => {
  const absences = attendanceData.filter(r => r.status === 'Sick Leave' || r.status === 'Unscheduled Absence');
  if (absences.length === 0) return [];
  const now = new Date();
  let months = 6;
  if (timePeriod === '12m') months = 12;
  if (timePeriod === '24m') months = 24;
  
  const monthLabels = Array.from({ length: months }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }).reverse();

  const monthlyAbsences: { [key: string]: number } = monthLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});

  absences.forEach(r => {
    const absDate = new Date(r.date);
    const diffMonths = (now.getFullYear() - absDate.getFullYear()) * 12 + (now.getMonth() - absDate.getMonth());
    if (diffMonths < months && diffMonths >= 0) {
      const label = absDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthlyAbsences.hasOwnProperty(label)) {
        monthlyAbsences[label]++;
      }
    }
  });

  return Object.entries(monthlyAbsences).map(([name, value]) => ({ name, value }));
};

export const getAbsencesByDepartment = (attendanceData: AttendanceRecord[], employees: Employee[]): { name: string; value: number }[] => {
  const empDeptMap = new Map(employees.map(e => [e.id, e.department]));
  const counts: { [key: string]: number } = {};
  
  attendanceData.forEach(r => {
    if (r.status === 'Sick Leave' || r.status === 'Unscheduled Absence') {
      const dept = empDeptMap.get(r.employeeId);
      if (dept) {
        counts[dept] = (counts[dept] || 0) + 1;
      }
    }
  });
  
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const getTopAbsentees = (attendanceData: AttendanceRecord[], employees: Employee[], count: number): { employee: Employee; absenceCount: number }[] => {
  const absenceCounts: { [key: string]: number } = {};
  attendanceData.forEach(r => {
    if (r.status === 'Sick Leave' || r.status === 'Unscheduled Absence') {
      absenceCounts[r.employeeId] = (absenceCounts[r.employeeId] || 0) + 1;
    }
  });
  
  const employeeMap = new Map(employees.map(e => [e.id, e]));
  
  return Object.entries(absenceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([employeeId, absenceCount]) => ({
      employee: employeeMap.get(employeeId)!,
      absenceCount
    }))
    .filter(item => item.employee); // Ensure employee exists
};
