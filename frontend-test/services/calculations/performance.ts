import type { Employee, SuccessionGap, BurnoutRiskResult } from '../../types';
import { getEmployeeFlightRisk } from './turnover';

export type PerformanceCategory = 'High' | 'Medium' | 'Low';
export type PotentialCategory = 'High' | 'Medium' | 'Low';
export interface NineBoxGridData {
  High: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Medium: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Low: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
}

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
