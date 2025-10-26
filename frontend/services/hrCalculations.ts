
import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel, SuccessionGap, BurnoutRiskResult, SkillLevel, Skill, SkillGapData } from '../types';
import { getEmployeeStatus } from '../utils/statusHelper';

// --- Existing Base Calculators ---

export const calculateROI = (
  netBenefit: number,
  totalCost: number
): number => {
  if (totalCost === 0) return 0;
  return (netBenefit / totalCost) * 100;
};

export const calculateTurnoverSavings = (avgCostPerTermination: number, turnoverReductionPercent: number, annualTerminations: number): number => {
  if (annualTerminations === 0) return 0;
  const reduction = turnoverReductionPercent / 100;
  const terminationsReduced = annualTerminations * reduction;
  return terminationsReduced * avgCostPerTermination;
};

export const calculateProductivityGains = (revenuePerEmployee: number, productivityIncreasePercent: number, numberOfEmployees: number): number => {
  if (numberOfEmployees === 0) return 0;
  const increase = productivityIncreasePercent / 100;
  return (revenuePerEmployee * increase) * numberOfEmployees;
};

export const calculateRecruitmentSavings = (avgCostPerHire: number, hiresAvoided: number): number => {
  return avgCostPerHire * hiresAvoided;
};

// --- New Calculator Functions by Category ---

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

// Benefits
export const calculateBenefitsAsPercentageOfCompensation = (benefitsExpense: number, totalCompensationExpense: number): number => {
  if (totalCompensationExpense === 0) return 0;
  return (benefitsExpense / totalCompensationExpense) * 100;
};
export const calculateBenefitsCostPerEmployee = (benefitsExpense: number, fte: number): number => {
  if (fte === 0) return 0;
  return benefitsExpense / fte;
};
export const calculateBenefitsVsSalaryRatio = (benefitsExpense: number, salaryExpense: number): number => {
  if (salaryExpense === 0) return 0;
  return (benefitsExpense / salaryExpense); // Returns a ratio, e.g., 0.3
};
export const calculateBenefitsCostAsPercentageOfRevenue = (benefitsExpense: number, totalRevenue: number): number => {
  if (totalRevenue === 0) return 0;
  return (benefitsExpense / totalRevenue) * 100;
};

// Compensation & Salary
export const calculateAverageWorkweek = (totalHours: number, weeksInPeriod: number, averageHeadcount: number): number => {
  if (averageHeadcount === 0 || weeksInPeriod === 0) return 0;
  return (totalHours / weeksInPeriod) / averageHeadcount;
};
export const calculateAverageSalary = (totalSalary: number, averageHeadcount: number): number => {
  if (averageHeadcount === 0) return 0;
  return totalSalary / averageHeadcount;
};
export const calculateTotalCompensationPerFTE = (totalCompensation: number, fte: number): number => {
    if (fte === 0) return 0;
    return totalCompensation / fte;
};
export const calculateRaiseRate = (totalRaiseAmount: number, totalBaseSalary: number): number => {
  if (totalBaseSalary === 0) return 0;
  return (totalRaiseAmount / totalBaseSalary) * 100;
};

export const calculateBonusRate = (totalBonusAmount: number, totalBaseSalary: number): number => {
  if (totalBaseSalary === 0) return 0;
  return (totalBonusAmount / totalBaseSalary) * 100;
};


// Employee Relations
export const calculateGrievanceRate = (grievances: number, employeeCount: number): number => {
  if (employeeCount === 0) return 0;
  return (grievances / employeeCount) * 100; // Result is per 100 employees
};
export const calculateAvgGrievanceResolutionTime = (totalDaysToResolve: number, grievancesResolved: number): number => {
  if (grievancesResolved === 0) return 0;
  return totalDaysToResolve / grievancesResolved;
};

// HR Impact on Profitability
export const calculateRevenuePerEmployeeFromInputs = (totalRevenue: number, employeeCount: number): number => {
    if (employeeCount === 0) return 0;
    return totalRevenue / employeeCount;
};
export const calculateReturnOnHumanInvestment = (operatingProfit: number, totalCompensation: number): number => {
  if (totalCompensation === 0) return 0;
  return (operatingProfit / totalCompensation); // This is a ratio
};
export const calculateHRCostsPerEmployee = (totalHRCosts: number, employeeCount: number): number => {
  if (employeeCount === 0) return 0;
  return totalHRCosts / employeeCount;
};

// HR Operations Efficiency
export const calculateHRServiceLevel = (callsAnsweredInTime: number, totalCalls: number): number => {
  if (totalCalls === 0) return 0;
  return (callsAnsweredInTime / totalCalls) * 100;
};
export const calculateHRSelfServiceRate = (selfServiceTasks: number, totalTasks: number): number => {
    if (totalTasks === 0) return 0;
    return (selfServiceTasks / totalTasks) * 100;
};

// Management & Leadership
export const calculateSuccessorPoolCoverage = (successors: number, keyPositions: number): number => {
  if (keyPositions === 0) return 0;
  return (successors / keyPositions) * 100;
};

// Performance & Productivity
export const calculatePerformancePayDifferential = (highPerformerComp: number, otherComp: number): number => {
  if (otherComp === 0) return 0;
  return (highPerformerComp / otherComp) * 100 - 100; // Show as a percentage difference
};
export const calculatePerformanceAppraisalRate = (appraisalsDone: number, eligibleEmployees: number): number => {
  if (eligibleEmployees === 0) return 0;
  return (appraisalsDone / eligibleEmployees) * 100;
};
export const calculateHighPerformerGrowthRate = (highPerformersStart: number, highPerformersEnd: number): number => {
    if (highPerformersStart === 0) {
        return highPerformersEnd > 0 ? Infinity : 0;
    }
    return ((highPerformersEnd - highPerformersStart) / highPerformersStart) * 100;
};
export const calculateTaskCompletionRate = (tasksCompleted: number, totalTasks: number): number => {
  if (totalTasks === 0) return 0;
  return (tasksCompleted / totalTasks) * 100;
};
export const calculateHighPerformerRatio = (highPerformers: number, totalEmployees: number): number => {
  if (totalEmployees === 0) return 0;
  return (highPerformers / totalEmployees) * 100;
};

// Recruitment
export const calculateCostPerHire = (
  totalRecruitingCosts: number,
  numberOfHires: number
): number => {
  if (numberOfHires === 0) return 0;
  return totalRecruitingCosts / numberOfHires;
};
export const calculateOfferAcceptanceRate = (offersAccepted: number, offersMade: number): number => {
  if (offersMade === 0) return 0;
  return (offersAccepted / offersMade) * 100;
};
export const calculateNewHireTurnoverContribution = (newHiresWhoLeft: number, totalTerminations: number): number => {
  if (totalTerminations === 0) return 0;
  return (newHiresWhoLeft / totalTerminations) * 100;
}
export const calculateSourceEffectiveness = (highQualityHires: number, totalHires: number): number => {
  if (totalHires === 0) return 0;
  return (highQualityHires / totalHires) * 100;
};
export const calculateAvgTimeToFill = (totalDays: number, positionsFilled: number): number => {
  if (positionsFilled === 0) return 0;
  return totalDays / positionsFilled;
};


// Retention
export const calculateTurnoverRate = (
  numberOfLeavers: number,
  averageNumberOfEmployees: number
): number => {
  if (averageNumberOfEmployees === 0) return 0;
  return (numberOfLeavers / averageNumberOfEmployees) * 100;
};
export const calculateRetentionRate = (startHeadcount: number, hires: number, terminations: number): number => {
  const effectiveHeadcount = startHeadcount + hires;
  if (effectiveHeadcount === 0) return 0;
  return ((effectiveHeadcount - terminations) / effectiveHeadcount) * 100;
};
export const calculateKeyEmployeeRetentionRate = (keyEmployeesStart: number, keyEmployeesLeft: number): number => {
    if (keyEmployeesStart === 0) return 0;
    return ((keyEmployeesStart - keyEmployeesLeft) / keyEmployeesStart) * 100;
};
export const calculateAverageTerminationCost = (totalTerminationCosts: number, numberOfTerminations: number): number => {
    if (numberOfTerminations === 0) return 0;
    return totalTerminationCosts / numberOfTerminations;
};

// Training
export const calculateTrainingCostsPerEmployee = (totalTrainingCosts: number, employeesTrained: number): number => {
  if (employeesTrained === 0) return 0;
  return totalTrainingCosts / employeesTrained;
};

// --- Calculations based on Employee Data (used in Dashboard & Reports) ---

export const getAverageTenure = (employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  const now = new Date();
  const activeEmployees = employees.filter(e => !e.terminationDate);
  if (activeEmployees.length === 0) return 0;

  const totalTenureDays = activeEmployees.reduce((acc, emp) => {
    const hireDate = new Date(emp.hireDate);
    const endDate = emp.terminationDate ? new Date(emp.terminationDate) : now;
    const diffTime = Math.abs(endDate.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return acc + diffDays;
  }, 0);

  return totalTenureDays / activeEmployees.length / 365.25; // in years
};

export const calculateTenure = (hireDate: string, terminationDate?: string): string => {
  const start = new Date(hireDate);
  const end = terminationDate ? new Date(terminationDate) : new Date();
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  
  if (months < 0 || (months === 0 && end.getDate() < start.getDate())) {
    years--;
    months = (months + 12) % 12;
  }
  
  if (years === 0 && months === 0) {
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (days < 30) return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  const yearStr = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
  const monthStr = months > 0 ? `${months} mo${months > 1 ? 's' : ''}` : '';
  
  const result = [yearStr, monthStr].filter(Boolean).join(', ');
  return result || "Less than a month";
};

export const getHeadcountByDepartment = (employees: Employee[]): { name: string, value: number }[] => {
    const counts: { [key: string]: number } = {};
    employees.forEach(emp => {
        counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
};

export const getGenderDiversity = (employees: Employee[]): { name: string, value: number }[] => {
    const counts: { 'Male': number, 'Female': number, 'Other': number } = { 'Male': 0, 'Female': 0, 'Other': 0 };
    employees.forEach(emp => {
        if (counts.hasOwnProperty(emp.gender)) {
            counts[emp.gender]++;
        }
    });
    return [
        { name: 'Male', value: counts.Male },
        { name: 'Female', value: counts.Female },
        { name: 'Other', value: counts.Other },
    ].filter(g => g.value > 0);
}

export const getAnnualTurnoverRateFromData = (employees: Employee[], timePeriod: 'all' | '24m' | '12m' | '6m' | '3m'): number => {
    if (employees.length === 0) return 0;

    const now = new Date();
    let monthsInPeriod: number;
    let startDate: Date;

    switch (timePeriod) {
        case '3m': monthsInPeriod = 3; break;
        case '6m': monthsInPeriod = 6; break;
        case '12m': monthsInPeriod = 12; break;
        case '24m': monthsInPeriod = 24; break;
        case 'all':
        default:
            const firstHireDate = employees.reduce((earliest, emp) => {
                const d = new Date(emp.hireDate);
                return d < earliest ? d : earliest;
            }, new Date());
            monthsInPeriod = Math.max(1, (now.getFullYear() - firstHireDate.getFullYear()) * 12 + now.getMonth() - firstHireDate.getMonth());
            break;
    }
    
    startDate = new Date(new Date().setMonth(now.getMonth() - monthsInPeriod));

    const leaversInPeriod = employees.filter(e => e.terminationDate && new Date(e.terminationDate) >= startDate).length;
    
    const employeesAtStart = employees.filter(e => new Date(e.hireDate) < startDate && (!e.terminationDate || new Date(e.terminationDate) >= startDate)).length;
    const employeesAtEnd = employees.filter(e => !e.terminationDate || new Date(e.terminationDate) > now).length;

    const averageHeadcount = (employeesAtStart + employeesAtEnd) / 2;

    if (averageHeadcount === 0) return 0;
    
    const periodTurnoverRate = leaversInPeriod / averageHeadcount;
    
    // Annualize the rate
    const annualizedRate = periodTurnoverRate * (12 / monthsInPeriod);
    
    return annualizedRate * 100;
};

export const calculateAverageEngagement = (employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  const totalScore = employees.reduce((acc, emp) => acc + (emp.engagementScore || 0), 0);
  return totalScore / employees.length;
};

export const calculateRevenuePerEmployee = (totalRevenue: number, employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  return totalRevenue / employees.length;
};

export const getTurnoverTrend = (employees: Employee[], timePeriod: 'all' | '24m' | '12m' | '6m' | '3m'): { name: string; value: number }[] => {
  const leavers = employees.filter(e => e.terminationDate);
  if (leavers.length === 0) return [];
  
  const now = new Date();
  let months = 12;
  if (timePeriod === '24m') months = 24;
  if(timePeriod === '6m') months = 6;
  if(timePeriod === '3m') months = 3;
  if(timePeriod === 'all') {
      const firstLeaverDate = leavers.reduce((earliest, e) => {
          const termDate = new Date(e.terminationDate!);
          return termDate < earliest ? termDate : earliest;
      }, new Date());
      months = Math.floor((now.getTime() - firstLeaverDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)) + 1;
      if (months > 48) months = 48; // Cap at 4 years for sanity
  }


  const monthLabels = Array.from({ length: months }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return d.toLocaleString('default', { month: 'short', year: '2-digit' });
  }).reverse();

  const monthlyTurnover: { [key: string]: number } = monthLabels.reduce((acc, label) => ({ ...acc, [label]: 0 }), {});

  leavers.forEach(e => {
    const termDate = new Date(e.terminationDate!);
    const diffMonths = (now.getFullYear() - termDate.getFullYear()) * 12 + (now.getMonth() - termDate.getMonth());
    
    if (diffMonths < months && diffMonths >= 0) {
      const label = termDate.toLocaleString('default', { month: 'short', year: '2-digit' });
      if(monthlyTurnover.hasOwnProperty(label)) {
          monthlyTurnover[label]++;
      }
    }
  });

  return Object.entries(monthlyTurnover).map(([name, value]) => ({ name, value }));
};


export const getPerformanceDistribution = (employees: Employee[]): { name: string; value: number }[] => {
    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const ratingLabels: { [key: number]: string } = {
        1: 'Needs Improvement',
        2: 'Below Expectations',
        3: 'Meets Expectations',
        4: 'Exceeds Expectations',
        5: 'Outstanding',
    };
    employees.forEach(emp => {
        if(ratingCounts.hasOwnProperty(emp.performanceRating)){
            ratingCounts[emp.performanceRating]++;
        }
    });
    return Object.entries(ratingCounts).map(([rating, count]) => ({
        name: ratingLabels[parseInt(rating)],
        value: count,
    }));
};

export const getHeadcountHeatmap = (employees: Employee[]): { 
    departments: string[], 
    locations: string[], 
    data: { [department: string]: { [location: string]: { total: number; Male: number; Female: number; Other: number; } } },
    maxHeadcount: number
} => {
    const departments = [...new Set(employees.map(e => e.department))].sort();
    const locations = [...new Set(employees.map(e => e.location))].sort();
    
    const data: { [department: string]: { [location: string]: { total: number; Male: number; Female: number; Other: number; } } } = {};
    let maxHeadcount = 0;

    departments.forEach(dept => {
        data[dept] = {};
        locations.forEach(loc => {
            data[dept][loc] = { total: 0, Male: 0, Female: 0, Other: 0 };
        });
    });

    employees.forEach(emp => {
        const cell = data[emp.department]?.[emp.location];
        if (cell) {
            cell.total++;
            if (emp.gender === 'Male' || emp.gender === 'Female' || emp.gender === 'Other') {
                cell[emp.gender]++;
            }
            if(cell.total > maxHeadcount) {
                maxHeadcount = cell.total;
            }
        }
    });
    
    return { departments, locations, data, maxHeadcount };
};

// --- New Attendance Calculations ---
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


// --- Turnover/Attrition Functions ---
export const getTurnoverByReason = (leavers: Employee[]): { name: string; value: number }[] => {
    const reasonCounts = { Voluntary: 0, Involuntary: 0 };
    leavers.forEach(emp => {
        if (emp.terminationReason) {
            reasonCounts[emp.terminationReason]++;
        }
    });
    return [
        { name: 'Voluntary', value: reasonCounts.Voluntary },
        { name: 'Involuntary', value: reasonCounts.Involuntary },
    ];
};

export const getTurnoverByDepartment = (leavers: Employee[]): { name: string; value: number }[] => {
    const counts: { [key: string]: number } = {};
    leavers.forEach(emp => {
        counts[emp.department] = (counts[emp.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const getTurnoverByLocation = (leavers: Employee[]): { name: string; value: number }[] => {
    const counts: { [key: string]: number } = {};
    leavers.forEach(emp => {
        counts[emp.location] = (counts[emp.location] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const getTurnoverByJobTitle = (leavers: Employee[]): { name: string; value: number }[] => {
    const counts: { [key: string]: number } = {};
    leavers.forEach(emp => {
        counts[emp.jobTitle] = (counts[emp.jobTitle] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

export const getTurnoverByTenureBuckets = (leavers: Employee[]): { name: string; value: number }[] => {
    const buckets = { '< 1 Year': 0, '1-2 Years': 0, '2-5 Years': 0, '5+ Years': 0 };
    leavers.forEach(emp => {
        if (!emp.terminationDate) return;
        const tenureYears = (new Date(emp.terminationDate).getTime() - new Date(emp.hireDate).getTime()) / (1000 * 3600 * 24 * 365.25);
        if (tenureYears < 1) buckets['< 1 Year']++;
        else if (tenureYears <= 2) buckets['1-2 Years']++;
        else if (tenureYears <= 5) buckets['2-5 Years']++;
        else buckets['5+ Years']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
};

export const getAverageTenureOfLeavers = (leavers: Employee[]): number => {
  if (leavers.length === 0) return 0;
  const totalTenureDays = leavers.reduce((acc, emp) => {
    if (!emp.terminationDate) return acc;
    const hireDate = new Date(emp.hireDate);
    const termDate = new Date(emp.terminationDate);
    const diffTime = Math.abs(termDate.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return acc + diffDays;
  }, 0);
  return totalTenureDays / leavers.length / 365.25;
};

// --- Attendance Functions ---
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

// --- Diversity ---
export const getHeadcountByDepartmentAndGender = (employees: Employee[]): { [dept: string]: { Male: number; Female: number; Other: number } } => {
    const data: { [dept: string]: { Male: number; Female: number; Other: number } } = {};
    employees.forEach(emp => {
        if (!data[emp.department]) {
            data[emp.department] = { Male: 0, Female: 0, Other: 0 };
        }
        if (emp.gender === 'Male' || emp.gender === 'Female' || emp.gender === 'Other') {
            data[emp.department][emp.gender]++;
        }
    });
    return data;
};

// --- Recruitment ---
export const getRecruitmentFunnelTotals = (funnelData: RecruitmentFunnel[]): { shortlisted: number; interviewed: number; offersExtended: number; offersAccepted: number; joined: number } => {
    return funnelData.reduce((acc, curr) => ({
        shortlisted: acc.shortlisted + curr.shortlisted,
        interviewed: acc.interviewed + curr.interviewed,
        offersExtended: acc.offersExtended + curr.offersExtended,
        offersAccepted: acc.offersAccepted + curr.offersAccepted,
        joined: acc.joined + curr.joined,
    }), { shortlisted: 0, interviewed: 0, offersExtended: 0, offersAccepted: 0, joined: 0 });
};

export const calculateAveragePositionAge = (positions: JobPosition[]): number => {
    if (positions.length === 0) return 0;
    const now = new Date().getTime();
    const totalAgeDays = positions.reduce((acc, pos) => {
        const openDate = new Date(pos.openDate).getTime();
        return acc + (now - openDate) / (1000 * 3600 * 24);
    }, 0);
    return totalAgeDays / positions.length;
};

export const calculateOfferAcceptanceRateFromFunnel = (funnelData: RecruitmentFunnel[]): number => {
    const totals = getRecruitmentFunnelTotals(funnelData);
    if (totals.offersExtended === 0) return 0;
    return (totals.offersAccepted / totals.offersExtended) * 100;
};

export const getOpenPositionsByDepartment = (positions: JobPosition[]): { department: string; replacement: number; newBudgeted: number; newNonBudgeted: number }[] => {
    const data: { [dept: string]: { replacement: number; newBudgeted: number; newNonBudgeted: number } } = {};
    positions.forEach(pos => {
        if (!data[pos.department]) {
            data[pos.department] = { replacement: 0, newBudgeted: 0, newNonBudgeted: 0 };
        }
        if (pos.positionType === 'Replacement') {
            data[pos.department].replacement++;
        } else if (pos.positionType === 'New') {
            if (pos.budgetStatus === 'Budgeted') {
                data[pos.department].newBudgeted++;
            } else {
                data[pos.department].newNonBudgeted++;
            }
        }
    });
    return Object.entries(data).map(([department, values]) => ({ department, ...values }));
};

export const getOpenPositionsByTitle = (positions: JobPosition[]): { title: string; replacement: number; newBudgeted: number; newNonBudgeted: number }[] => {
    const data: { [title: string]: { replacement: number; newBudgeted: number; newNonBudgeted: number } } = {};
    positions.forEach(pos => {
        if (!data[pos.title]) {
            data[pos.title] = { replacement: 0, newBudgeted: 0, newNonBudgeted: 0 };
        }
        if (pos.positionType === 'Replacement') {
            data[pos.title].replacement++;
        } else if (pos.positionType === 'New') {
            if (pos.budgetStatus === 'Budgeted') {
                data[pos.title].newBudgeted++;
            } else {
                data[pos.title].newNonBudgeted++;
            }
        }
    });
    return Object.entries(data).map(([title, values]) => ({ title, ...values })).sort((a,b) => (b.replacement+b.newBudgeted+b.newNonBudgeted) - (a.replacement+a.newBudgeted+a.newNonBudgeted));
};

// --- Retention ---
export const calculateOverallRetentionRate = (employees: Employee[], timePeriod: '12m' | '6m' | '24m'): number => {
  const months = parseInt(timePeriod.replace('m', ''));
  const now = new Date();
  const startDate = new Date(new Date().setMonth(now.getMonth() - months));

  const leaversInPeriod = employees.filter(e => e.terminationDate && new Date(e.terminationDate) >= startDate && new Date(e.terminationDate) <= now).length;
  const employeesAtStart = employees.filter(e => new Date(e.hireDate) < startDate && (!e.terminationDate || new Date(e.terminationDate) >= startDate)).length;

  if (employeesAtStart === 0) return 100;
  return ((employeesAtStart - leaversInPeriod) / employeesAtStart) * 100;
};

export const calculateHighPerformerRetentionRate = (employees: Employee[], timePeriod: '12m' | '6m' | '24m'): number => {
  const highPerformers = employees.filter(e => e.performanceRating >= 4);
  return calculateOverallRetentionRate(highPerformers, timePeriod);
};

export const calculateFirstYearRetentionRate = (employees: Employee[]): number => {
  const now = new Date();
  const oneYearAgo = new Date(new Date().setFullYear(now.getFullYear() - 1));
  const newHires = employees.filter(e => new Date(e.hireDate) >= oneYearAgo);
  const leaversAmongNewHires = newHires.filter(e => e.terminationDate).length;
  if (newHires.length === 0) return 100;
  return ((newHires.length - leaversAmongNewHires) / newHires.length) * 100;
};

export const getRetentionByDepartment = (employees: Employee[], timePeriod: '12m' | '6m' | '24m'): { name: string; value: number }[] => {
  const departments = [...new Set(employees.map(e => e.department))];
  const rates = departments.map(dept => {
    const deptEmployees = employees.filter(e => e.department === dept);
    return {
      name: dept,
      value: calculateOverallRetentionRate(deptEmployees, timePeriod),
    };
  });
  return rates.sort((a, b) => b.value - a.value);
};

export const getRetentionByManager = (employees: Employee[], timePeriod: '12m' | '6m' | '24m'): { name: string; value: number; managerId: string; teamSize: number }[] => {
    const managers = new Map<string, { name: string, team: Employee[], id: string }>();

    const activeEmployees = employees.filter(e => !e.terminationDate);
    const managerIds = new Set(activeEmployees.map(e => e.managerId).filter(id => id));

    managerIds.forEach(managerId => {
        const manager = employees.find(m => m.id === managerId);
        if (manager) {
            managers.set(manager.id, { name: manager.name, team: [], id: manager.id });
        }
    });

    employees.forEach(emp => {
        if (emp.managerId && managers.has(emp.managerId)) {
            managers.get(emp.managerId)!.team.push(emp);
        }
    });
    
    const rates = Array.from(managers.values()).map(managerData => {
        return {
            managerId: managerData.id,
            name: managerData.name,
            value: calculateOverallRetentionRate(managerData.team, timePeriod),
            teamSize: managerData.team.filter(e => !e.terminationDate).length,
        };
    });

    return rates.sort((a, b) => a.value - b.value);
};

export type SkillMatrixData = Record<string, Record<SkillLevel | 'total', Employee[]>>;
export type PerformanceCategory = 'High' | 'Medium' | 'Low';
export type PotentialCategory = 'High' | 'Medium' | 'Low';
export interface NineBoxGridData {
  High: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Medium: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Low: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
}

export const calculateFlightRiskScore = (employee: Employee): number => {
    let risk = 0;
    if (employee.engagementScore < 60) risk += 3;
    else if (employee.engagementScore < 75) risk += 1.5;
    if (employee.managementSatisfaction && employee.managementSatisfaction < 60) risk += 2.5;
    if (employee.performanceRating <= 2) risk += 1.5;
    const tenureYears = (new Date().getTime() - new Date(employee.hireDate).getTime()) / (1000 * 3600 * 24 * 365.25);
    if (tenureYears < 1.5) risk += 1.5;
    if (tenureYears > 5 && tenureYears < 10) risk += 1;
    return Math.min(10, risk);
};

export const calculateImpactScore = (employee: Employee): number => {
    let impact = 0;
    impact += (employee.performanceRating / 5) * 4;
    impact += (employee.potentialRating / 3) * 3;
    if (employee.jobTitle.includes('Chief') || employee.jobTitle.includes('VP')) impact += 3;
    else if (employee.jobTitle.includes('Director') || employee.jobTitle.includes('Principal')) impact += 2;
    else if (employee.jobTitle.includes('Manager') || employee.jobTitle.includes('Lead')) impact += 1;
    return Math.min(10, impact);
};

export const getEmployeeFlightRisk = (employee: Employee): { risk: 'Low' | 'Medium' | 'High'; score: number } => {
    const score = calculateFlightRiskScore(employee);
    let risk: 'Low' | 'Medium' | 'High';
    if (score >= 6.5) risk = 'High';
    else if (score >= 3.5) risk = 'Medium';
    else risk = 'Low';
    return { risk, score: score * 10 };
};

export const analyzeSuccessionGaps = (employees: Employee[]): SuccessionGap[] => {
    const criticalRoles = ['Chief Executive Officer', 'VP of Engineering', 'VP of Sales'];
    const gaps: SuccessionGap[] = [];
    criticalRoles.forEach(role => {
        const incumbent = employees.find(e => e.jobTitle === role && !e.terminationDate);
        if (incumbent) {
            const readyNowSuccessors = employees.filter(e => e.managerId === incumbent.id && e.successionStatus === 'Ready Now');
            const potentialSuccessors = employees.filter(e => e.managerId === incumbent.id && e.successionStatus !== 'Not Assessed');
            const atRiskSuccessors = potentialSuccessors
                .map(e => ({ employee: e, riskData: getEmployeeFlightRisk(e) }))
                .filter(s => s.riskData.risk === 'High' || s.riskData.risk === 'Medium')
                .map(s => ({ employee: s.employee, risk: s.riskData.risk, score: s.riskData.score }));

            if (readyNowSuccessors.length === 0) {
                gaps.push({
                    criticalRole: role,
                    incumbent: incumbent,
                    readyNowCount: 0,
                    atRiskSuccessors: atRiskSuccessors,
                });
            }
        }
    });
    return gaps;
};

export const getBurnoutHotspots = (employees: Employee[]): BurnoutRiskResult[] => {
    const departments = [...new Set(employees.map(e => e.department))];
    return departments.map(dept => {
        const deptEmployees = employees.filter(e => e.department === dept && !e.terminationDate);
        if (deptEmployees.length === 0) return null;
        
        let totalRiskScore = 0;
        let highRiskCount = 0;
        const factors = { highWorkload: 0, lowEngagement: 0, highPerformancePressure: 0 };
        
        deptEmployees.forEach(e => {
            let score = 0;
            if ((e.weeklyHours || 40) > 48) { score += 35; factors.highWorkload++; }
            if (e.engagementScore < 65) { score += 45; factors.lowEngagement++; }
            if (e.performanceRating >= 4) { score += 20; factors.highPerformancePressure++; }
            if (score > 65) highRiskCount++;
            totalRiskScore += score;
        });

        const totalFactors = factors.highWorkload + factors.lowEngagement + factors.highPerformancePressure || 1;
        return {
            department: dept,
            averageRiskScore: totalRiskScore / deptEmployees.length,
            highRiskEmployeeCount: highRiskCount,
            contributingFactors: {
                highWorkload: (factors.highWorkload / totalFactors) * 100,
                lowEngagement: (factors.lowEngagement / totalFactors) * 100,
                highPerformancePressure: (factors.highPerformancePressure / totalFactors) * 100
            }
        };
    }).filter((r): r is BurnoutRiskResult => r !== null)
      .sort((a, b) => b.averageRiskScore - a.averageRiskScore);
};

export const getPayForPerformanceData = (employees: Employee[]): { x: number; y: number; label: string }[] => {
    return employees.filter(e => !e.terminationDate).map(e => ({ x: e.performanceRating, y: e.salary, label: e.name }));
};

export const getPerformanceTrend = (employees: Employee[]): { period: string; avgPerformance: number }[] => {
    const trend: { [key: string]: { total: number; count: number } } = {};
    employees.filter(e => e.snapshotDate).forEach(e => {
        const period = e.snapshotDate!.substring(0, 7); // YYYY-MM
        if (!trend[period]) trend[period] = { total: 0, count: 0 };
        trend[period].total += e.performanceRating;
        trend[period].count++;
    });
    return Object.entries(trend)
        .map(([period, data]) => ({ period, avgPerformance: data.total / data.count }))
        .sort((a, b) => a.period.localeCompare(b.period));
};

export const getHistoricalPerformanceTrend = getPerformanceTrend;

export const getPerformanceCalibrationData = (employees: Employee[]): { department: string; distribution: Record<string, number> }[] => {
    const departments = [...new Set(employees.map(e => e.department))].sort();
    return departments.map(dept => {
        const deptEmployees = employees.filter(e => e.department === dept && !e.terminationDate);
        const total = deptEmployees.length;
        const counts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        deptEmployees.forEach(e => counts[e.performanceRating]++);
        return {
            department: dept,
            distribution: {
                '1': total > 0 ? (counts['1'] / total) * 100 : 0,
                '2': total > 0 ? (counts['2'] / total) * 100 : 0,
                '3': total > 0 ? (counts['3'] / total) * 100 : 0,
                '4': total > 0 ? (counts['4'] / total) * 100 : 0,
                '5': total > 0 ? (counts['5'] / total) * 100 : 0,
            }
        };
    });
};

export const getNineBoxGridData = (employees: Employee[]): NineBoxGridData => {
    const grid: NineBoxGridData = {
        High: { Low: [], Medium: [], High: [] },
        Medium: { Low: [], Medium: [], High: [] },
        Low: { Low: [], Medium: [], High: [] },
    };
    employees.filter(e => !e.terminationDate).forEach(e => {
        const perf: PerformanceCategory = e.performanceRating >= 4 ? 'High' : e.performanceRating === 3 ? 'Medium' : 'Low';
        const pot: PotentialCategory = e.potentialRating === 3 ? 'High' : e.potentialRating === 2 ? 'Medium' : 'Low';
        grid[perf][pot].push(e);
    });
    return grid;
};

export const getPerformanceByManager = (employees: Employee[]) => {
    const managers: { [id: string]: { managerName: string; team: Employee[] } } = {};
    employees.forEach(e => {
        if (e.managerId) {
            const manager = employees.find(m => m.id === e.managerId);
            if (manager && !manager.terminationDate) {
                if (!managers[e.managerId]) managers[e.managerId] = { managerName: manager.name, team: [] };
                managers[e.managerId].team.push(e);
            }
        }
    });
    return Object.entries(managers).map(([managerId, data]) => {
        const ratings: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        data.team.filter(e => !e.terminationDate).forEach(e => ratings[e.performanceRating]++);
        return { managerId, managerName: data.managerName, teamSize: data.team.length, ratings };
    }).sort((a,b) => b.teamSize - a.teamSize);
};

export const getHighPerformerAttritionData = (employees: Employee[]) => {
    const leavers = employees.filter(e => e.terminationDate && e.performanceRating >= 4);
    if (leavers.length === 0) return null;
    const topDept = getTurnoverByDepartment(leavers)[0]?.name || 'N/A';
    const avgTenure = getAverageTenureOfLeavers(leavers);
    return {
        summary: { count: leavers.length, avgTenure, topDept },
        leavers: leavers.sort((a, b) => new Date(b.terminationDate!).getTime() - new Date(a.terminationDate!).getTime()).slice(0, 10)
    };
};

// FIX: Added function to resolve missing export error.
export const getRegrettableLeaversForManager = (managerId: string, employees: Employee[]): Employee[] => {
    return employees.filter(e => 
        e.managerId === managerId &&
        e.terminationDate &&
        e.terminationReason === 'Voluntary' &&
        e.performanceRating >= 4
    );
};

export const getSkillMatrix = (employees: Employee[]): SkillMatrixData => {
    const matrix: SkillMatrixData = {};
    employees.filter(e => !e.terminationDate).forEach(emp => {
        emp.skills.forEach(skill => {
            if (!matrix[skill.name]) {
                matrix[skill.name] = { Novice: [], Beginner: [], Competent: [], Proficient: [], Expert: [], total: [] };
            }
            matrix[skill.name][skill.level].push(emp);
            matrix[skill.name].total.push(emp);
        });
    });
    return matrix;
};

export const getSkillSetKPIs = (employees: Employee[], matrix: SkillMatrixData) => {
    const allSkills = Object.keys(matrix);
    if (allSkills.length === 0) {
        return { uniqueSkillCount: 0, mostCommonSkill: 'N/A', topExpertSkill: 'N/A', mostSkilledDepartment: 'N/A' };
    }
    const mostCommon = allSkills.sort((a, b) => matrix[b].total.length - matrix[a].total.length)[0] || 'N/A';
    const topExpert = allSkills.sort((a, b) => matrix[b].Expert.length - matrix[a].Expert.length)[0] || 'N/A';
    
    const deptSkills: Record<string, number> = {};
    employees.filter(e => !e.terminationDate).forEach(e => {
        deptSkills[e.department] = (deptSkills[e.department] || 0) + e.skills.length;
    });
    const mostSkilledDept = Object.entries(deptSkills).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return { uniqueSkillCount: allSkills.length, mostCommonSkill: mostCommon, topExpertSkill: topExpert, mostSkilledDepartment: mostSkilledDept };
};

export const getAtRiskSkills = (employees: Employee[], threshold: number) => {
    const matrix = getSkillMatrix(employees);
    return Object.entries(matrix)
        .filter(([, data]) => data.total.length <= threshold)
        .map(([skillName, data]) => ({
            skillName,
            employees: data.total,
            highRiskEmployeeCount: data.total.filter(e => getEmployeeFlightRisk(e).risk === 'High').length,
        }))
        .sort((a, b) => a.employees.length - b.employees.length);
};

export const getSkillProficiencyMetrics = (employees: Employee[]) => {
    const skillLevels: Record<SkillLevel, number> = { Novice: 1, Beginner: 2, Competent: 3, Proficient: 4, Expert: 5 };
    const matrix = getSkillMatrix(employees);
    return Object.entries(matrix).map(([skillName, data]) => {
        if(data.total.length === 0) return { skillName, avgProficiency: 0 };
        const totalScore = data.total.reduce((acc, emp) => {
            const skill = emp.skills.find(s => s.name === skillName);
            return acc + (skill ? skillLevels[skill.level] : 0);
        }, 0);
        return { skillName, avgProficiency: totalScore / data.total.length };
    }).sort((a, b) => b.avgProficiency - a.avgProficiency);
};

export const getHighPerformerSkills = (employees: Employee[]) => {
    const highPerformers = employees.filter(e => e.performanceRating >= 4 && !e.terminationDate);
    const skillCounts: Record<string, number> = {};
    highPerformers.forEach(e => e.skills.forEach(s => skillCounts[s.name] = (skillCounts[s.name] || 0) + 1));
    return Object.entries(skillCounts).map(([skillName, count]) => ({ skillName, count }))
        .sort((a, b) => b.count - a.count);
};

export const getSkillComparisonByDepartment = (employees: Employee[]): {
    labels: string[]; // Skills
    datasets: {
        label: string; // Department
        data: number[]; // Avg proficiency for each skill
    }[];
} => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return { labels: [], datasets: [] };

    const skillLevels: Record<SkillLevel, number> = { Novice: 1, Beginner: 2, Competent: 3, Proficient: 4, Expert: 5 };

    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
        emp.skills.forEach(skill => {
            totalSkillCounts[skill.name] = (totalSkillCounts[skill.name] || 0) + 1;
        });
    });
    const topSkills = Object.entries(totalSkillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);

    const deptCounts = activeEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topDepartments = Object.entries(deptCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(e => e[0]);

    const proficiencyData: Record<string, Record<string, { totalScore: number, count: number }>> = {}; // { dept: { skill: { total, count } } }
    topDepartments.forEach(dept => {
        proficiencyData[dept] = {};
        topSkills.forEach(skill => {
            proficiencyData[dept][skill] = { totalScore: 0, count: 0 };
        });
    });

    activeEmployees.forEach(emp => {
        if (topDepartments.includes(emp.department)) {
            emp.skills.forEach(skill => {
                if (topSkills.includes(skill.name)) {
                    proficiencyData[emp.department][skill.name].totalScore += skillLevels[skill.level];
                    proficiencyData[emp.department][skill.name].count++;
                }
            });
        }
    });

    const datasets = topDepartments.map(dept => ({
        label: dept,
        data: topSkills.map(skill => {
            const { totalScore, count } = proficiencyData[dept][skill];
            return count > 0 ? totalScore / count : 0;
        })
    }));

    return { labels: topSkills, datasets };
};

export const getSkillImpactOnPerformance = (employees: Employee[], skill: string): { level: SkillLevel; avgPerformance: number; count: number }[] => {
    if (!skill) return [];
    const activeEmployees = employees.filter(e => !e.terminationDate);
    const skillLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];
    
    const dataByLevel: Record<SkillLevel, { totalPerf: number, count: number }> = {
        Novice: { totalPerf: 0, count: 0 },
        Beginner: { totalPerf: 0, count: 0 },
        Competent: { totalPerf: 0, count: 0 },
        Proficient: { totalPerf: 0, count: 0 },
        Expert: { totalPerf: 0, count: 0 },
    };

    activeEmployees.forEach(emp => {
        const empSkill = emp.skills.find(s => s.name === skill);
        if (empSkill) {
            dataByLevel[empSkill.level].totalPerf += emp.performanceRating;
            dataByLevel[empSkill.level].count++;
        }
    });

    return skillLevels.map(level => ({
        level,
        avgPerformance: dataByLevel[level].count > 0 ? dataByLevel[level].totalPerf / dataByLevel[level].count : 0,
        count: dataByLevel[level].count
    })).filter(d => d.count > 0);
};

export const getHighPerformerSkillsWithScarcity = (employees: Employee[]): { skillName: string, highPerformerCount: number, totalCount: number }[] => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return [];
    
    const highPerformers = activeEmployees.filter(e => e.performanceRating >= 4);

    const highPerformerSkillCounts: Record<string, number> = {};
    highPerformers.forEach(e => {
        e.skills.forEach(s => {
            highPerformerSkillCounts[s.name] = (highPerformerSkillCounts[s.name] || 0) + 1;
        });
    });
    
    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(e => {
        e.skills.forEach(s => {
            totalSkillCounts[s.name] = (totalSkillCounts[s.name] || 0) + 1;
        });
    });

    return Object.entries(highPerformerSkillCounts)
        .map(([skillName, highPerformerCount]) => ({
            skillName,
            highPerformerCount,
            totalCount: totalSkillCounts[skillName] || 0,
        }))
        .sort((a, b) => b.highPerformerCount - a.highPerformerCount);
};

export const getSkillDensityByDepartment = (employees: Employee[]): {
    skills: string[];
    departments: string[];
    datasets: { department: string; data: number[] }[];
    skillTotalCounts: Record<string, number>;
} => {
    const activeEmployees = employees.filter(e => !e.terminationDate);
    if (activeEmployees.length === 0) return { skills: [], departments: [], datasets: [], skillTotalCounts: {} };

    const totalSkillCounts: Record<string, number> = {};
    activeEmployees.forEach(emp => {
        emp.skills.forEach(skill => {
            totalSkillCounts[skill.name] = (totalSkillCounts[skill.name] || 0) + 1;
        });
    });
    const topSkills = Object.entries(totalSkillCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) // Top 10 skills
        .map(entry => entry[0]);

    const deptCounts = activeEmployees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const topDepartments = Object.entries(deptCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5 departments
        .map(entry => entry[0]);

    const skillDensity: Record<string, Record<string, number>> = {}; // { dept: { skill: count } }
    topDepartments.forEach(dept => {
        skillDensity[dept] = {};
        topSkills.forEach(skill => {
            skillDensity[dept][skill] = 0;
        });
    });

    activeEmployees.forEach(emp => {
        if (topDepartments.includes(emp.department)) {
            emp.skills.forEach(skill => {
                if (topSkills.includes(skill.name)) {
                    skillDensity[emp.department][skill.name]++;
                }
            });
        }
    });

    const datasets = topDepartments.map(dept => {
        const deptHeadcount = deptCounts[dept];
        return {
            department: dept,
            data: topSkills.map(skill => {
                const count = skillDensity[dept][skill] || 0;
                return deptHeadcount > 0 ? (count / deptHeadcount) * 100 : 0;
            })
        };
    });

    return {
        skills: topSkills,
        departments: topDepartments,
        datasets,
        skillTotalCounts: totalSkillCounts
    };
};

export const analyzeSkillGaps = (employees: Employee[], requiredSkillsText: string): SkillGapData[] => {
    const requiredMap = new Map<string, number>();
    requiredSkillsText.split('\n').forEach(line => {
        const parts = line.split(':');
        if (parts.length === 2) {
            const skillName = parts[0].trim();
            const count = parseInt(parts[1].trim(), 10);
            if (skillName && !isNaN(count)) {
                requiredMap.set(skillName, count);
            }
        }
    });

    const currentMap = new Map<string, number>();
    employees.filter(e => !e.terminationDate).forEach(emp => {
        emp.skills.forEach(skill => {
            if (skill.level === 'Proficient' || skill.level === 'Expert') {
                currentMap.set(skill.name, (currentMap.get(skill.name) || 0) + 1);
            }
        });
    });

    const allSkills = new Set([...requiredMap.keys(), ...currentMap.keys()]);

    return Array.from(allSkills).map(skillName => {
        const required = requiredMap.get(skillName) || 0;
        const current = currentMap.get(skillName) || 0;
        const gap = required - current;
        return { skillName, required, current, gap };
    }).sort((a, b) => a.gap - b.gap); // Sort by smallest gap first
};