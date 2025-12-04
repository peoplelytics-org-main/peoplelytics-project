// services/aiDataTools.ts
import { FunctionDeclaration, Part, Type } from '@google/genai';
// FIX: Corrected import path for calculation functions.
import { 
    getAnnualTurnoverRateFromData, 
    getAverageTenure, 
    calculateAverageEngagement,
    getEmployeeFlightRisk,
    calculateOverallRetentionRate,
    calculateHighPerformerRetentionRate,
    calculateFirstYearRetentionRate,
    getOverallAbsenceRate,
    getUnscheduledAbsenceRate,
    getRecruitmentFunnelTotals,
} from './hrCalculations';
import type { Employee, AIDataContext } from '../types';

// This is the implementation of the functions that the AI can call.
// They take the live data and arguments from the AI, and return JSON.
export const toolImplementations = {
  getHeadcount: (context: AIDataContext, args: { department?: string; gender?: 'Male' | 'Female' | 'Other' }) => {
    const { department, gender } = args;
    let filteredEmployees = context.employees.filter(e => !e.terminationDate);

    if (department) {
      filteredEmployees = filteredEmployees.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }
    if (gender) {
      filteredEmployees = filteredEmployees.filter(e => e.gender === gender);
    }
    
    return { count: filteredEmployees.length };
  },

  getTurnoverRate: (context: AIDataContext, args: { department?: string }) => {
    const { department } = args;
    const filtered = department
      ? context.employees.filter(e => e.department.toLowerCase() === department.toLowerCase())
      : context.employees;
    const rate = getAnnualTurnoverRateFromData(filtered, '12m');
    return { turnoverRate: rate };
  },

  getAverageMetric: (context: AIDataContext, args: { metric: 'tenure' | 'engagement'; department?: string }) => {
    const { metric, department } = args;
    const activeEmployees = context.employees.filter(e => !e.terminationDate);
    const filtered = department
      ? activeEmployees.filter(e => e.department.toLowerCase() === department.toLowerCase())
      : activeEmployees;
    
    if (filtered.length === 0) return { average: 0 };
    
    let average = 0;
    if (metric === 'tenure') {
        average = getAverageTenure(filtered);
    } else if (metric === 'engagement') {
        average = calculateAverageEngagement(filtered);
    }
    return { average };
  },

  getNewHirePerformance: (context: AIDataContext, args: { months: number }) => {
    const { months } = args;
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);

    const newHires = context.employees.filter(e => new Date(e.hireDate) >= cutoffDate && !e.terminationDate);
    if (newHires.length === 0) {
      return { averagePerformance: 0, newHireCount: 0 };
    }
    const totalPerformance = newHires.reduce((acc, e) => acc + e.performanceRating, 0);
    return {
      averagePerformance: totalPerformance / newHires.length,
      newHireCount: newHires.length,
    };
  },

  getDepartmentsByEngagement: (context: AIDataContext, args: { order: 'lowest' | 'highest', count: number }) => {
    const { order, count } = args;
    const activeEmployees = context.employees.filter(e => !e.terminationDate);
    const engagementByDept: { [key: string]: { total: number; count: number } } = {};

    activeEmployees.forEach(e => {
        if (!engagementByDept[e.department]) {
            engagementByDept[e.department] = { total: 0, count: 0 };
        }
        engagementByDept[e.department].total += e.engagementScore;
        engagementByDept[e.department].count++;
    });

    const deptAverages = Object.entries(engagementByDept).map(([name, data]) => ({
      department: name,
      averageEngagement: data.total / data.count
    }));

    deptAverages.sort((a, b) => 
        order === 'lowest' 
        ? a.averageEngagement - b.averageEngagement 
        : b.averageEngagement - a.averageEngagement
    );
    
    return { departments: deptAverages.slice(0, count) };
  },
  getOpenPositionCount: (context: AIDataContext, args: { department?: string }) => {
    const { department } = args;
    let openPositions = context.jobPositions.filter(p => p.status === 'Open');
    if (department) {
      openPositions = openPositions.filter(p => p.department.toLowerCase() === department.toLowerCase());
    }
    return { count: openPositions.length };
  },
  getTalentRiskCount: (context: AIDataContext, args: { performance?: 'High' | 'Medium' | 'Low'; risk?: 'High' | 'Medium' | 'Low' }) => {
    const { performance, risk } = args;
    const activeEmployees = context.employees.filter(e => !e.terminationDate);

    let filtered = activeEmployees;

    if (performance || risk) {
        filtered = activeEmployees.filter(employee => {
            let perfCat: 'High' | 'Medium' | 'Low';
            if (employee.performanceRating >= 4) perfCat = 'High';
            else if (employee.performanceRating === 3) perfCat = 'Medium';
            else perfCat = 'Low';

            const { risk: riskCat } = getEmployeeFlightRisk(employee);

            const performanceMatch = performance ? perfCat === performance : true;
            const riskMatch = risk ? riskCat === risk : true;

            return performanceMatch && riskMatch;
        });
    }
    
    return { count: filtered.length };
  },
  getRetentionRate: (context: AIDataContext, args: { type: 'overall' | 'high_performer' | 'first_year'; department?: string }) => {
    const { type, department } = args;
    const filtered = department
        ? context.employees.filter(e => e.department.toLowerCase() === department.toLowerCase())
        : context.employees;
    
    let rate = 0;
    switch(type) {
        case 'high_performer':
            rate = calculateHighPerformerRetentionRate(filtered, '12m');
            break;
        case 'first_year':
            rate = calculateFirstYearRetentionRate(filtered);
            break;
        case 'overall':
        default:
            rate = calculateOverallRetentionRate(filtered, '12m');
            break;
    }
    return { retentionRate: rate };
  },
  getAbsenceRate: (context: AIDataContext, args: { type: 'overall' | 'unscheduled'; department?: string }) => {
    const { type, department } = args;

    const relevantEmployees = department
        ? context.employees.filter(e => e.department.toLowerCase() === department.toLowerCase())
        : context.employees;
    const relevantEmployeeIds = new Set(relevantEmployees.map(e => e.id));
    const filteredAttendance = context.attendance.filter(att => relevantEmployeeIds.has(att.employeeId));

    let rate = 0;
    if (type === 'overall') {
        rate = getOverallAbsenceRate(filteredAttendance);
    } else {
        rate = getUnscheduledAbsenceRate(filteredAttendance);
    }
    return { absenceRate: rate };
  },
  getRecruitmentFunnelSummary: (context: AIDataContext) => {
    return getRecruitmentFunnelTotals(context.recruitmentFunnels);
  }
};

// FIX: Added function declarations for AI tools.
const getHeadcountDeclaration: FunctionDeclaration = {
    name: 'getHeadcount',
    description: 'Get the number of active employees, optionally filtered by department or gender.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, description: 'The department to filter by (e.g., "Engineering", "Sales").' },
        gender: { type: Type.STRING, enum: ['Male', 'Female', 'Other'], description: 'The gender to filter by.' }
      }
    }
};

const getTurnoverRateDeclaration: FunctionDeclaration = {
    name: 'getTurnoverRate',
    description: 'Calculates the annualized turnover rate for the last 12 months, optionally filtered by department.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, description: 'The department to filter by.' }
      }
    }
};

const getAverageMetricDeclaration: FunctionDeclaration = {
    name: 'getAverageMetric',
    description: 'Calculates the average for a given metric (tenure or engagement), optionally filtered by department.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        metric: { type: Type.STRING, enum: ['tenure', 'engagement'], description: "The metric to calculate the average for." },
        department: { type: Type.STRING, description: 'The department to filter by.' }
      },
      required: ['metric']
    }
};

const getNewHirePerformanceDeclaration: FunctionDeclaration = {
    name: 'getNewHirePerformance',
    description: 'Calculates the average performance rating for employees hired within a specified number of months from today.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        months: { type: Type.NUMBER, description: 'The number of months to look back for new hires.' }
      },
      required: ['months']
    }
};

const getDepartmentsByEngagementDeclaration: FunctionDeclaration = {
    name: 'getDepartmentsByEngagement',
    description: 'Gets a list of departments sorted by their average employee engagement score.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        order: { type: Type.STRING, enum: ['lowest', 'highest'], description: "The sort order." },
        count: { type: Type.NUMBER, description: 'The number of departments to return.' }
      },
      required: ['order', 'count']
    }
};

const getOpenPositionCountDeclaration: FunctionDeclaration = {
    name: 'getOpenPositionCount',
    description: 'Gets the number of currently open job positions, optionally filtered by department.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            department: { type: Type.STRING, description: 'The department to filter by.' }
        }
    }
};

const getTalentRiskCountDeclaration: FunctionDeclaration = {
    name: 'getTalentRiskCount',
    description: 'Gets the number of active employees who fall into a specific talent risk segment, based on performance and flight risk.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        performance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The performance category.' },
        risk: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The flight risk category.' }
      }
    }
};

const getRetentionRateDeclaration: FunctionDeclaration = {
    name: 'getRetentionRate',
    description: 'Calculates the retention rate for a specified employee segment over the last 12 months.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['overall', 'high_performer', 'first_year'], description: "The segment of employees to analyze." },
        department: { type: Type.STRING, description: 'An optional department to filter by.' }
      },
      required: ['type']
    }
};

const getAbsenceRateDeclaration: FunctionDeclaration = {
    name: 'getAbsenceRate',
    description: 'Calculates the absence rate (either overall or just unscheduled) for a given period.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: ['overall', 'unscheduled'], description: "The type of absence rate to calculate." },
        department: { type: Type.STRING, description: 'An optional department to filter by.' }
      },
      required: ['type']
    }
};

const getRecruitmentFunnelSummaryDeclaration: FunctionDeclaration = {
    name: 'getRecruitmentFunnelSummary',
    description: 'Provides a summary of the entire recruitment funnel, totaling all candidates across all stages for all open positions.',
    parameters: {
      type: Type.OBJECT,
      properties: {}
    }
};

// FIX: Export functionDeclarations for use in the AI Assistant.
export const functionDeclarations: FunctionDeclaration[] = [
    getHeadcountDeclaration,
    getTurnoverRateDeclaration,
    getAverageMetricDeclaration,
    getNewHirePerformanceDeclaration,
    getDepartmentsByEngagementDeclaration,
    getOpenPositionCountDeclaration,
    getTalentRiskCountDeclaration,
    getRetentionRateDeclaration,
    getAbsenceRateDeclaration,
    getRecruitmentFunnelSummaryDeclaration,
];

// FIX: Export executeFunctionCall to handle AI tool requests.
export const executeFunctionCall = async (
  context: AIDataContext,
  functionCall: { name: string; args: any }
): Promise<Part> => {
  const { name, args } = functionCall;

  let functionResponse: any;
  const toolImplementation = toolImplementations[name as keyof typeof toolImplementations];

  if (toolImplementation) {
    // @ts-ignore
    functionResponse = toolImplementation(context, args);
  } else {
    functionResponse = { error: `Function ${name} not found.` };
  }
  
  return {
    functionResponse: {
      name,
      response: functionResponse,
    },
  };
};
