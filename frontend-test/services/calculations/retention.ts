import type { Employee } from '../../types';

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

export const calculateAverageEngagement = (employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  const totalScore = employees.reduce((acc, emp) => acc + (emp.engagementScore || 0), 0);
  return totalScore / employees.length;
};

export const calculateRevenuePerEmployee = (totalRevenue: number, employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  return totalRevenue / employees.length;
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

export const getRetentionByManager = (employees: Employee[], timePeriod: '12m' | '6m' | '24m'): { name: string; value: number; managerId: string; teamSize: number; leavers: number }[] => {
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
        const months = parseInt(timePeriod.replace('m', ''));
        const now = new Date();
        const startDate = new Date(new Date().setMonth(now.getMonth() - months));
        const leaversInPeriod = managerData.team.filter(e => e.terminationDate && new Date(e.terminationDate) >= startDate && new Date(e.terminationDate) <= now).length;

        return {
            managerId: managerData.id,
            name: managerData.name,
            value: calculateOverallRetentionRate(managerData.team, timePeriod),
            teamSize: managerData.team.filter(e => !e.terminationDate).length,
            leavers: leaversInPeriod,
        };
    });

    return rates.sort((a, b) => a.value - b.value);
};
