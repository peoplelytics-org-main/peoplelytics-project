import type { Employee } from '../../types';

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

export const getRegrettableLeaversForManager = (managerId: string, employees: Employee[]): Employee[] => {
    return employees.filter(e => 
        e.managerId === managerId &&
        e.terminationDate &&
        e.terminationReason === 'Voluntary' &&
        e.performanceRating >= 4
    );
};

export const calculateFlightRiskScore = (employee: Employee): number => {
    let risk = 0;
    console.log(employee.engagementScore);
    console.log(employee.name)
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
