
// services/aiDataTools.ts
import { FunctionDeclaration, Part, Type } from '@google/genai';
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
    
    if (filteredAttendance.length === 0) {
        return { rate: 0 };
    }

    let rate = 0;
    if (type === 'unscheduled') {
        rate = getUnscheduledAbsenceRate(filteredAttendance);
    } else {
        rate = getOverallAbsenceRate(filteredAttendance);
    }
    return { rate };
  },
  getRecruitmentFunnelSummary: (context: AIDataContext, args: {}) => {
    const totals = getRecruitmentFunnelTotals(context.recruitmentFunnels);
    return totals;
  },
};

// This defines the schema of the tools for the Gemini API.
export const functionDeclarations: FunctionDeclaration[] = [
  {
    name: 'getHeadcount',
    description: 'Get the number of active employees, optionally filtered by department and/or gender.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, description: 'The department to filter by (e.g., "Development").' },
        gender: { type: Type.STRING, description: 'The gender to filter by.', enum: ['Male', 'Female', 'Other'] },
      },
    },
  },
  {
    name: 'getTurnoverRate',
    description: 'Get the annual turnover rate for the last 12 months, optionally filtered by department.',
    parameters: {
       type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, description: 'The department to filter by.' },
      },
    }
  },
  {
    name: 'getAverageMetric',
    description: 'Get the average value for a specific metric like tenure or engagement, optionally filtered by department.',
    parameters: {
       type: Type.OBJECT,
       properties: {
         metric: { type: Type.STRING, enum: ['tenure', 'engagement'], description: 'The metric to calculate the average for.'},
         department: { type: Type.STRING, description: 'The department to filter by.'}
       },
       required: ['metric']
    }
  },
  {
    name: 'getNewHirePerformance',
    description: 'Get the average performance rating for employees hired in the last N months.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        months: { type: Type.NUMBER, description: 'The number of recent months to look back for new hires.'}
      },
      required: ['months']
    }
  },
  {
    name: 'getDepartmentsByEngagement',
    description: 'Get a list of departments with the highest or lowest average engagement scores.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        order: { type: Type.STRING, enum: ['lowest', 'highest'], description: 'Whether to return the lowest or highest scoring departments.'},
        count: { type: Type.NUMBER, description: 'The number of departments to return.'}
      },
      required: ['order', 'count']
    }
  },
  {
    name: 'getOpenPositionCount',
    description: 'Get the number of open job positions, optionally filtered by department.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        department: { type: Type.STRING, description: 'The department to filter by.'},
      },
    },
  },
  {
    name: 'getTalentRiskCount',
    description: "Get the number of employees in a specific segment of the Talent Risk Matrix, based on performance and flight risk categories.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            performance: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The performance category.' },
            risk: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: 'The flight risk category.' }
        },
    },
  },
  {
    name: 'getRetentionRate',
    description: "Get the employee retention rate for the last 12 months. Can be filtered by type (overall, high performers, or first-year hires) and by department.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['overall', 'high_performer', 'first_year'], description: 'The type of retention rate to calculate.' },
            department: { type: Type.STRING, description: 'The department to filter by.' },
        },
        required: ['type']
    }
  },
  {
    name: 'getAbsenceRate',
    description: "Get the employee absence rate. Can be specified as 'overall' (sick & unscheduled) or just 'unscheduled', and can be filtered by department.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            type: { type: Type.STRING, enum: ['overall', 'unscheduled'], description: 'The type of absence rate to calculate.' },
            department: { type: Type.STRING, description: 'The department to filter by.' },
        },
        required: ['type']
    }
  },
  {
    name: 'getRecruitmentFunnelSummary',
    description: "Get a summary of the entire recruitment funnel, including the total number of candidates at each stage: shortlisted, interviewed, offers extended, offers accepted, and joined.",
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
  },
];

// The function that the main app will call
export const executeFunctionCall = async (context: AIDataContext, functionCall: { name: string; args: any; }): Promise<Part> => {
    const { name, args } = functionCall;
    let result: any;

    if (name in toolImplementations) {
        // Find the function in our implementations object
        const func = toolImplementations[name as keyof typeof toolImplementations];
        try {
            // Call the function with the provided context and arguments
            result = func(context, args);
        } catch (error) {
            console.error(`Error executing tool ${name}:`, error);
            result = { error: `An error occurred while executing the function: ${name}.` };
        }
    } else {
        result = { error: `Unknown function call: ${name}` };
    }

    // Return the result in the format the Gemini API expects for a function response
    return {
        functionResponse: {
            name,
            response: result,
        },
    };
};
