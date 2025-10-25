
import React from 'react';
import * as hrCalculations from '../../services/hrCalculations';
import { 
    Clock, Gift, Banknote, Handshake, TrendingUp, Users, Star, UserPlus, HeartHandshake, BrainCircuit, UserCog, Briefcase, Target 
} from 'lucide-react';

export interface CalculatorInput {
  id: string;
  label: string;
  placeholder: string;
  type: 'number' | 'text';
  defaultValue?: string;
}

export type ResultType = 'percent' | 'currency' | 'decimal' | 'ratio' | 'days' | 'generic' | 'score' | 'hours' | 'return' | 'per100' | 'daysPerEmployee';

export interface CalculatorConfig {
  title: string;
  description: string;
  explanation: string;
  formula: string;
  inputs: CalculatorInput[];
  calculateFn: (inputs: Record<string, number>) => number;
  resultType: ResultType;
  aiPromptFn: (inputs: Record<string, number>, result: number) => string;
}

interface CalculatorCategory {
    name: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    calculators: CalculatorConfig[];
}

export const EMPLOYEE_METRIC_CATEGORIES: CalculatorCategory[] = [
    {
        name: 'Attendance',
        icon: Clock,
        calculators: [
            {
                title: 'Absence Rate',
                description: 'Calculate the percentage of unscheduled absence days against total workdays.',
                explanation: "This metric measures the rate of unscheduled absences as a percentage of total workdays in a given period. It's a key indicator of workforce health, engagement, and potential productivity loss.",
                formula: '(Total Absence Days / Total Workdays in Period) * 100',
                inputs: [
                    { id: 'absenceDays', label: 'Total Absence Days', placeholder: 'e.g., 50', type: 'number' },
                    { id: 'workdays', label: 'Total Workdays in Period', placeholder: 'e.g., 2200', type: 'number' },
                ],
                calculateFn: ({ absenceDays, workdays }) => hrCalculations.calculateAbsenceRate(absenceDays, workdays),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our absence rate is ${result.toFixed(2)}%. This was calculated with ${inputs.absenceDays} absence days over ${inputs.workdays} total workdays. Analyze this rate and suggest 3 ways to improve employee attendance.`,
            },
            {
                title: 'PTO Utilization Rate',
                description: 'Percentage of paid time off used by employees against their accrued time.',
                explanation: "This metric shows the percentage of available Paid Time Off (PTO) that employees have used. A very high rate might indicate burnout risk, while a very low rate could suggest employees are not taking needed breaks.",
                formula: '(Total PTO Hours Used / Total PTO Hours Accrued) * 100',
                inputs: [
                    { id: 'ptoHoursUsed', label: 'Total PTO Hours Used', placeholder: 'e.g., 1500', type: 'number' },
                    { id: 'ptoHoursAccrued', label: 'Total PTO Hours Accrued', placeholder: 'e.g., 2000', type: 'number' },
                ],
                calculateFn: ({ ptoHoursUsed, ptoHoursAccrued }) => hrCalculations.calculatePTOUtilization(ptoHoursUsed, ptoHoursAccrued),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our PTO utilization rate is ${result.toFixed(2)}%. Analyze this. Is it healthy? What does a high or low rate signify?`,
            },
            {
                title: 'Unscheduled Absences per Employee',
                description: 'Average number of unscheduled absence days per employee.',
                explanation: 'This metric calculates the average number of days an employee was absent without prior scheduling. It helps identify trends in absenteeism that might be linked to morale or management issues.',
                formula: 'Total Unscheduled Absence Days / Number of Employees',
                inputs: [
                    { id: 'unscheduledAbsenceDays', label: 'Unscheduled Absence Days', placeholder: 'e.g., 25', type: 'number' },
                    { id: 'numEmployees', label: 'Number of Employees', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ unscheduledAbsenceDays, numEmployees }) => hrCalculations.calculateUnscheduledAbsencesPerEmployee(unscheduledAbsenceDays, numEmployees),
                resultType: 'daysPerEmployee',
                aiPromptFn: (inputs, result) => `Our unscheduled absences per employee is ${result.toFixed(2)} days. Analyze the potential causes and impacts of this level of unscheduled absence. Suggest two strategies to manage it.`,
            },
            {
                title: 'Avg. Cost of Unscheduled Absence',
                description: 'Estimate the direct financial cost of unscheduled absences per FTE.',
                explanation: 'This metric quantifies the direct financial impact of unscheduled absences, based on the average daily compensation of the workforce. It highlights the tangible cost of absenteeism.',
                formula: '(Unscheduled Absence Days * Avg. Daily Compensation) / Number of FTEs',
                inputs: [
                    { id: 'unscheduledAbsenceDays', label: 'Total Unscheduled Absence Days', placeholder: 'e.g., 25', type: 'number' },
                    { id: 'dailyComp', label: 'Avg. Direct Daily Compensation ($)', placeholder: 'e.g., 300', type: 'number' },
                    { id: 'fte', label: 'Number of Full-Time Equivalents', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ unscheduledAbsenceDays, dailyComp, fte }) => hrCalculations.calculateAvgCostOfUnscheduledAbsence(unscheduledAbsenceDays, dailyComp, fte),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `The average cost of an unscheduled absence per FTE is $${result.toFixed(2)}. This was calculated using ${inputs.unscheduledAbsenceDays} total days and an average daily compensation of $${inputs.dailyComp} across ${inputs.fte} FTEs. Explain the hidden costs associated with this and suggest a strategy to mitigate these financial impacts.`,
            },
        ],
    },
    {
        name: 'Benefits',
        icon: Gift,
        calculators: [
            {
                title: 'Benefits Cost per Employee',
                description: 'Calculate the average cost of benefits for each full-time employee.',
                explanation: "This metric provides the average cost of the benefits package for each full-time employee. It's essential for budgeting, assessing the total rewards package, and comparing against industry benchmarks.",
                formula: 'Total Benefits Expense / Number of Full-Time Equivalents',
                inputs: [
                    { id: 'benefitsExpense', label: 'Total Benefits Expense ($)', placeholder: 'e.g., 500000', type: 'number', defaultValue: '13500000' },
                    { id: 'fte', label: 'Number of Full-Time Equivalents', placeholder: 'e.g., 100', type: 'number', defaultValue: '426' },
                ],
                calculateFn: ({ benefitsExpense, fte }) => hrCalculations.calculateBenefitsCostPerEmployee(benefitsExpense, fte),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our benefits cost per employee is $${result.toFixed(2)}. Is this competitive? Suggest 3 ways to optimize benefits cost without reducing value.`,
            },
            {
                title: 'Benefits as % of Compensation',
                description: 'The portion of total compensation that is spent on benefits.',
                explanation: "This metric shows what percentage of an employee's total compensation is made up of benefits costs. It helps in understanding the composition of the total rewards package and its appeal to candidates.",
                formula: '(Total Benefits Expense / Total Compensation Expense) * 100',
                inputs: [
                    { id: 'benefitsExpense', label: 'Total Benefits Expense ($)', placeholder: 'e.g., 500000', type: 'number', defaultValue: '13500000' },
                    { id: 'totalCompensationExpense', label: 'Total Compensation Expense ($)', placeholder: 'e.g., 2000000', type: 'number', defaultValue: '71500000' },
                ],
                calculateFn: ({ benefitsExpense, totalCompensationExpense }) => hrCalculations.calculateBenefitsAsPercentageOfCompensation(benefitsExpense, totalCompensationExpense),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Benefits make up ${result.toFixed(2)}% of our total compensation. What is a typical benchmark for this, and what does this signal to current and potential employees?`,
            },
            {
                title: 'Benefits vs. Salary Ratio',
                description: 'Compare the cost of benefits directly against the cost of salaries.',
                explanation: 'This ratio compares the cost of benefits directly to the cost of salaries. It provides a clear view of how much the company invests in benefits for every dollar spent on base pay.',
                formula: 'Total Benefits Expense / Total Salary Expense',
                inputs: [
                    { id: 'benefitsExpense', label: 'Total Benefits Expense ($)', placeholder: 'e.g., 500000', type: 'number', defaultValue: '13500000' },
                    { id: 'salaryExpense', label: 'Total Salary Expense ($)', placeholder: 'e.g., 1800000', type: 'number', defaultValue: '55000000' },
                ],
                calculateFn: ({ benefitsExpense, salaryExpense }) => hrCalculations.calculateBenefitsVsSalaryRatio(benefitsExpense, salaryExpense),
                resultType: 'ratio',
                aiPromptFn: (inputs, result) => `Our benefits-to-salary ratio is ${result.toFixed(2)}:1. This means for every dollar in salary, we spend $${result.toFixed(2)} on benefits. Analyze this ratio's impact on employee value proposition and cost structure.`,
            },
            {
                title: 'Benefits Cost as % of Revenue',
                description: "Understand the cost of benefits in relation to the company's total revenue.",
                explanation: "This metric connects the cost of employee benefits to the company's overall financial performance by showing it as a percentage of total revenue. It helps assess the sustainability of the benefits program.",
                formula: '(Total Benefits Expense / Total Company Revenue) * 100',
                inputs: [
                    { id: 'benefitsExpense', label: 'Total Benefits Expense ($)', placeholder: 'e.g., 500000', type: 'number', defaultValue: '13500000' },
                    { id: 'totalRevenue', label: 'Total Company Revenue ($)', placeholder: 'e.g., 10000000', type: 'number', defaultValue: '150000000' },
                ],
                calculateFn: ({ benefitsExpense, totalRevenue }) => hrCalculations.calculateBenefitsCostAsPercentageOfRevenue(benefitsExpense, totalRevenue),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our benefits costs represent ${result.toFixed(2)}% of total company revenue. Analyze this from a financial health and strategic investment perspective. Is this sustainable?`,
            },
            {
                title: 'Benefits Satisfaction Index',
                description: 'Input your survey-based Benefits Satisfaction Index score for AI analysis.',
                explanation: "This is a qualitative metric, typically derived from employee surveys, that measures how satisfied employees are with their benefits package. It's a leading indicator of whether the benefits spend is perceived as valuable by the workforce.",
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'satisfactionIndex', label: 'Benefits Satisfaction Score (0-100)', placeholder: 'e.g., 78', type: 'number', defaultValue: '78' },
                ],
                calculateFn: ({ satisfactionIndex }) => satisfactionIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Benefits Satisfaction Index is ${result.toFixed(1)} out of 100. Analyze what this score likely means regarding our benefits package's effectiveness and appeal. Provide 3 concrete, actionable strategies to improve benefits satisfaction, considering different employee segments.`,
            },
        ],
    },
    {
        name: 'Compensation',
        icon: Banknote,
        calculators: [
            {
                title: 'Average Salary',
                description: 'Calculate the average salary across a group of employees.',
                explanation: "This metric calculates the mean salary for a group of employees. While simple, it's a foundational metric for compensation analysis, budgeting, and understanding pay levels within the organization.",
                formula: 'Total Salary Expense / Average Employee Headcount',
                inputs: [
                    { id: 'totalSalary', label: 'Total Salary Expense ($)', placeholder: 'e.g., 5000000', type: 'number', defaultValue: '55000000' },
                    { id: 'averageHeadcount', label: 'Average Employee Headcount', placeholder: 'e.g., 100', type: 'number', defaultValue: '426' },
                ],
                calculateFn: ({ totalSalary, averageHeadcount }) => hrCalculations.calculateAverageSalary(totalSalary, averageHeadcount),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our average salary is $${result.toFixed(2)}. Provide a brief analysis on how we should interpret this number and what factors could influence it.`,
            },
             {
                title: 'Total Compensation per FTE',
                description: 'The average total compensation (salary + benefits + bonuses) for each FTE.',
                explanation: "This metric provides the average total cost of a full-time employee, including salary, benefits, bonuses, and other compensation. It's a comprehensive view of the true cost of labor.",
                formula: 'Total Compensation Expense / Number of Full-Time Equivalents',
                inputs: [
                    { id: 'totalCompensation', label: 'Total Compensation Expense ($)', placeholder: 'e.g., 6500000', type: 'number', defaultValue: '71500000' },
                    { id: 'fte', label: 'Number of Full-Time Equivalents', placeholder: 'e.g., 100', type: 'number', defaultValue: '426' },
                ],
                calculateFn: ({ totalCompensation, fte }) => hrCalculations.calculateTotalCompensationPerFTE(totalCompensation, fte),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our total compensation per FTE is $${result.toFixed(2)}. What are the strategic implications of this metric for talent acquisition and retention?`,
            },
            {
                title: 'Average Workweek',
                description: 'Calculate the average hours worked per employee in a week.',
                explanation: 'This metric calculates the average number of hours an employee works per week. It can be an indicator of workload, productivity, and potential burnout risk if consistently high.',
                formula: '(Total Hours Worked / Weeks in Period) / Average Headcount',
                inputs: [
                    { id: 'totalHours', label: 'Total Hours Worked in Period', placeholder: 'e.g., 16000', type: 'number', defaultValue: '950000' },
                    { id: 'weeksInPeriod', label: 'Number of Weeks in Period', placeholder: 'e.g., 4', type: 'number', defaultValue: '52' },
                    { id: 'averageHeadcount', label: 'Average Employee Headcount', placeholder: 'e.g., 100', type: 'number', defaultValue: '426' },
                ],
                calculateFn: ({ totalHours, weeksInPeriod, averageHeadcount }) => hrCalculations.calculateAverageWorkweek(totalHours, weeksInPeriod, averageHeadcount),
                resultType: 'hours',
                aiPromptFn: (inputs, result) => `Our average workweek is ${result.toFixed(1)} hours. Analyze this. Is it a healthy number? What are the risks of a high or low average workweek? Suggest a strategy for maintaining a healthy work-life balance based on this metric.`,
            },
            {
                title: 'Compensation Raise Rate',
                description: 'Calculate the average pay raise as a percentage of total base salary.',
                explanation: 'This metric shows the average annual pay increase as a percentage of the total base salary budget. It is used to assess if salary adjustments are competitive and keeping pace with the market.',
                formula: '(Total Annual Raise Amount / Total Annual Base Salary) * 100',
                inputs: [
                    { id: 'totalRaiseAmount', label: 'Total Annual Raise Amount ($)', placeholder: 'e.g., 250000', type: 'number', defaultValue: '2200000' },
                    { id: 'totalBaseSalary', label: 'Total Annual Base Salary ($)', placeholder: 'e.g., 5000000', type: 'number', defaultValue: '55000000' },
                ],
                calculateFn: ({ totalRaiseAmount, totalBaseSalary }) => hrCalculations.calculateRaiseRate(totalRaiseAmount, totalBaseSalary),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our compensation raise rate is ${result.toFixed(2)}%. Analyze this rate in the context of market trends, inflation, and employee retention. Is this rate competitive?`,
            },
            {
                title: 'Bonus Payout Rate',
                description: 'Calculate the total bonus payout as a percentage of total base salary.',
                explanation: 'This metric calculates the total amount paid in bonuses as a percentage of total base salaries. It helps evaluate the significance of variable pay within the overall compensation strategy.',
                formula: '(Total Bonus Payout / Total Annual Base Salary) * 100',
                inputs: [
                    { id: 'totalBonusAmount', label: 'Total Bonus Payout ($)', placeholder: 'e.g., 500000', type: 'number', defaultValue: '4400000' },
                    { id: 'totalBaseSalary', label: 'Total Annual Base Salary ($)', placeholder: 'e.g., 5000000', type: 'number', defaultValue: '55000000' },
                ],
                calculateFn: ({ totalBonusAmount, totalBaseSalary }) => hrCalculations.calculateBonusRate(totalBonusAmount, totalBaseSalary),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our bonus payout rate is ${result.toFixed(2)}% of base salary. How effective is this likely to be as a performance incentive? Suggest one way to structure bonus programs to maximize motivation.`,
            },
            {
                title: 'Compensation Satisfaction Index',
                description: 'Input your survey-based Compensation Satisfaction score for AI analysis.',
                explanation: 'A qualitative metric from employee surveys that measures sentiment towards compensation. It is a key driver of engagement and retention and can highlight issues with pay equity or competitiveness.',
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'satisfactionIndex', label: 'Compensation Satisfaction Score (0-100)', placeholder: 'e.g., 65', type: 'number', defaultValue: '65' },
                ],
                calculateFn: ({ satisfactionIndex }) => satisfactionIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Compensation Satisfaction Index is ${result.toFixed(1)} out of 100. This is a critical metric for retention. Analyze what this score signifies and provide 3 distinct strategies to improve employee perception of compensation, beyond just increasing salaries.`,
            }
        ],
    },
    {
        name: 'Employee Relations',
        icon: Handshake,
        calculators: [
            {
                title: 'Grievance Rate',
                description: 'Calculate the rate of formal grievances filed per 100 employees.',
                explanation: 'This metric tracks the number of formal employee complaints filed per 100 employees. It serves as an indicator of the health of the workplace environment and employee-manager relationships.',
                formula: '(Number of Grievances / Total Employees) * 100',
                inputs: [
                    { id: 'grievances', label: 'Number of Grievances Filed', placeholder: 'e.g., 5', type: 'number' },
                    { id: 'employeeCount', label: 'Total Number of Employees', placeholder: 'e.g., 250', type: 'number' },
                ],
                calculateFn: ({ grievances, employeeCount }) => hrCalculations.calculateGrievanceRate(grievances, employeeCount),
                resultType: 'per100',
                aiPromptFn: (inputs, result) => `Our grievance rate is ${result.toFixed(2)} per 100 employees. Analyze what this rate indicates about our workplace climate. Provide 3 proactive strategies to foster positive employee relations and reduce formal complaints.`,
            },
            {
                title: 'Avg. Grievance Resolution Time',
                description: 'Calculate the average time in days it takes to resolve an employee grievance.',
                explanation: 'This metric measures the average number of days it takes to formally resolve an employee grievance from the time it is filed. A shorter time indicates an efficient and responsive employee relations process.',
                formula: 'Total Days to Resolve Grievances / Number of Grievances Resolved',
                inputs: [
                    { id: 'totalDaysToResolve', label: 'Total Days to Resolve Grievances', placeholder: 'e.g., 150', type: 'number' },
                    { id: 'grievancesResolved', label: 'Number of Grievances Resolved', placeholder: 'e.g., 5', type: 'number' },
                ],
                calculateFn: ({ totalDaysToResolve, grievancesResolved }) => hrCalculations.calculateAvgGrievanceResolutionTime(totalDaysToResolve, grievancesResolved),
                resultType: 'days',
                aiPromptFn: (inputs, result) => `Our average grievance resolution time is ${result.toFixed(1)} days. Analyze the impact of this resolution speed on employee trust and morale. Suggest two process improvements to expedite grievance handling fairly.`,
            },
            {
                title: 'Employee Engagement Index',
                description: 'Input your survey-based Employee Engagement score for AI analysis.',
                explanation: "A comprehensive score from employee surveys that measures an employee's emotional commitment to the organization and its goals. It's a key predictor of performance, productivity, and retention.",
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'engagementIndex', label: 'Employee Engagement Score (0-100)', placeholder: 'e.g., 82', type: 'number' },
                ],
                calculateFn: ({ engagementIndex }) => engagementIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Employee Engagement Index is ${result.toFixed(1)} out of 100. This is a primary indicator of workforce health. Analyze what this score means for productivity, innovation, and retention. Provide 3 high-impact strategies to boost employee engagement.`,
            },
        ]
    },
    {
        name: 'Recruitment',
        icon: UserPlus,
        calculators: [
            {
                title: 'Cost Per Hire',
                description: 'Calculate the average cost of hiring a new employee.',
                explanation: "This metric measures the total cost associated with sourcing, recruiting, and hiring a new employee. It's a critical metric for managing the efficiency and effectiveness of the recruitment function.",
                formula: 'Total Recruiting Costs / Number of New Hires',
                inputs: [
                    { id: 'totalRecruitingCosts', label: 'Total Recruiting Costs ($)', placeholder: 'e.g., 50000', type: 'number' },
                    { id: 'numberOfHires', label: 'Number of New Hires', placeholder: 'e.g., 10', type: 'number' },
                ],
                calculateFn: ({ totalRecruitingCosts, numberOfHires }) => hrCalculations.calculateCostPerHire(totalRecruitingCosts, numberOfHires),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our cost per hire is $${result.toFixed(2)}. Analyze if this cost is high or low and provide 3 actionable strategies to optimize it.`,
            },
            {
                title: 'Offer Acceptance Rate',
                description: 'The percentage of candidates who accept a formal job offer.',
                explanation: 'This metric is the percentage of candidates who accept a formal job offer extended to them. A high rate indicates a strong employer brand, competitive offers, and an effective recruitment process.',
                formula: '(Number of Offers Accepted / Total Number of Offers Made) * 100',
                inputs: [
                    { id: 'offersAccepted', label: 'Number of Offers Accepted', placeholder: 'e.g., 9', type: 'number' },
                    { id: 'offersMade', label: 'Total Number of Offers Made', placeholder: 'e.g., 10', type: 'number' },
                ],
                calculateFn: ({ offersAccepted, offersMade }) => hrCalculations.calculateOfferAcceptanceRate(offersAccepted, offersMade),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our offer acceptance rate is ${result.toFixed(2)}%. What does this say about our employer brand and compensation packages? Suggest 3 ways to improve this rate.`,
            },
            {
                title: 'New Hire Turnover Contribution',
                description: 'Percentage of total turnover composed of employees who left in their first year.',
                explanation: "This metric calculates the percentage of total employee turnover that is attributed to employees leaving within their first year. A high rate can indicate issues with onboarding, role clarity, or hiring decisions.",
                formula: '(New Hires Who Left in First Year / Total Terminations in Period) * 100',
                inputs: [
                    { id: 'newHiresWhoLeft', label: 'New Hires Who Left in First Year', placeholder: 'e.g., 3', type: 'number' },
                    { id: 'totalTerminations', label: 'Total Terminations in Period', placeholder: 'e.g., 15', type: 'number' },
                ],
                calculateFn: ({ newHiresWhoLeft, totalTerminations }) => hrCalculations.calculateNewHireTurnoverContribution(newHiresWhoLeft, totalTerminations),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `New hires contribute to ${result.toFixed(2)}% of our total turnover. Analyze what this indicates about our onboarding process and role alignment. Suggest 2 strategies to improve first-year retention.`,
            },
        ],
    },
    {
        name: 'Retention',
        icon: HeartHandshake,
        calculators: [
            {
                title: 'Employee Turnover Rate',
                description: 'Calculate the percentage of employees who leave an organization over a period.',
                explanation: 'This metric calculates the percentage of employees who leave the organization over a specific period. It is one of the most critical indicators of workforce stability and employee satisfaction.',
                formula: '(Number of Leavers / Average Number of Employees) * 100',
                inputs: [
                    { id: 'numberOfLeavers', label: 'Number of Leavers', placeholder: 'e.g., 15', type: 'number' },
                    { id: 'averageNumberOfEmployees', label: 'Average Number of Employees', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ numberOfLeavers, averageNumberOfEmployees }) => hrCalculations.calculateTurnoverRate(numberOfLeavers, averageNumberOfEmployees),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our employee turnover rate is ${result.toFixed(2)}%. Analyze the potential business impact of this rate and provide 3 actionable strategies to address it.`,
            },
            {
                title: 'Retention Rate',
                description: 'The percentage of employees who remained with the organization over a period.',
                explanation: "This metric measures the percentage of employees who remained with the organization over a specific period. It's a key indicator of stability and employee satisfaction, representing the organization's ability to retain its talent.",
                formula: '((Employees at Start - Leavers) / Employees at Start) * 100',
                inputs: [
                    { id: 'startHeadcount', label: 'Starting Headcount', placeholder: 'e.g., 100', type: 'number' },
                    { id: 'hires', label: 'External Hires in Period', placeholder: 'e.g., 20', type: 'number' },
                    { id: 'terminations', label: 'Terminations in Period', placeholder: 'e.g., 15', type: 'number' },
                ],
                calculateFn: ({ startHeadcount, hires, terminations }) => hrCalculations.calculateRetentionRate(startHeadcount, hires, terminations),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our retention rate is ${result.toFixed(2)}%. What does this tell us about employee satisfaction and stability? What are two key drivers of high retention?`,
            },
            {
                title: 'Key Employee Retention Rate',
                description: 'The percentage of key employees who remained with the organization over a period.',
                explanation: "This metric focuses specifically on the retention rate of employees identified as 'key' or 'high-potential'. Losing these employees has a disproportionate impact, making this a critical metric for business continuity.",
                formula: '((Key Employees at Start - Key Employees Who Left) / Key Employees at Start) * 100',
                inputs: [
                    { id: 'keyEmployeesStart', label: 'Key Employees at Start', placeholder: 'e.g., 20', type: 'number' },
                    { id: 'keyEmployeesLeft', label: 'Key Employees Who Left', placeholder: 'e.g., 1', type: 'number' },
                ],
                calculateFn: ({ keyEmployeesStart, keyEmployeesLeft }) => hrCalculations.calculateKeyEmployeeRetentionRate(keyEmployeesStart, keyEmployeesLeft),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our key employee retention rate is ${result.toFixed(2)}%. This is a critical indicator of organizational health and leadership stability. Analyze the strategic risks associated with this rate and suggest two high-impact strategies specifically for retaining top talent.`,
            },
            {
                title: 'Average Termination Costs',
                description: 'The average direct cost associated with an employee termination.',
                explanation: "This metric calculates the average direct costs associated with an employee's departure, including severance pay, offboarding administration, and potential legal fees. It does not include indirect costs like lost productivity.",
                formula: 'Total Termination Costs / Number of Terminations',
                inputs: [
                    { id: 'totalTerminationCosts', label: 'Total Termination Costs ($)', placeholder: 'e.g., 30000', type: 'number' },
                    { id: 'numberOfTerminations', label: 'Number of Terminations', placeholder: 'e.g., 2', type: 'number' },
                ],
                calculateFn: ({ totalTerminationCosts, numberOfTerminations }) => hrCalculations.calculateAverageTerminationCost(totalTerminationCosts, numberOfTerminations),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `The average termination cost is $${result.toFixed(2)}. This includes things like severance, offboarding, and legal fees. Analyze the components of this cost and suggest two ways to manage or reduce these costs without creating legal risk.`,
            },
        ],
    },
    {
        name: 'Training',
        icon: BrainCircuit,
        calculators: [
            {
                title: 'Training Cost per Employee',
                description: 'The average cost of training per employee trained.',
                explanation: "This metric measures the average investment in training and development for each employee who participated. It's used for budgeting and evaluating the cost-effectiveness of L&D programs.",
                formula: 'Total Training Costs / Number of Employees Trained',
                inputs: [
                    { id: 'totalTrainingCosts', label: 'Total Training Costs ($)', placeholder: 'e.g., 50000', type: 'number' },
                    { id: 'employeesTrained', label: 'Number of Employees Trained', placeholder: 'e.g., 80', type: 'number' },
                ],
                calculateFn: ({ totalTrainingCosts, employeesTrained }) => hrCalculations.calculateTrainingCostsPerEmployee(totalTrainingCosts, employeesTrained),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our training cost per employee is $${result.toFixed(2)}. How can we evaluate if this is a good investment? Provide two methods for measuring training effectiveness.`,
            },
            {
                title: 'Training Satisfaction Index',
                description: 'Input your survey-based Training Satisfaction score for AI analysis.',
                explanation: "A qualitative metric from post-training surveys that measures how satisfied employees are with the training they received. It's a leading indicator of training quality, relevance, and effectiveness.",
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'satisfactionIndex', label: 'Training Satisfaction Score (0-100)', placeholder: 'e.g., 85', type: 'number' },
                ],
                calculateFn: ({ satisfactionIndex }) => satisfactionIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Training Satisfaction Index is ${result.toFixed(1)} out of 100. Analyze what this score signifies about the quality and effectiveness of our training programs. Provide 3 actionable strategies to improve training satisfaction and impact.`,
            },
        ],
    },
    {
        name: 'Performance & Productivity',
        icon: Star,
        calculators: [
            {
                title: 'Task Completion Rate',
                description: 'Measure team or individual efficiency by calculating the percentage of assigned tasks completed.',
                explanation: "This metric measures the percentage of assigned tasks that have been successfully completed within a given period. It's a direct indicator of productivity and execution efficiency.",
                formula: '(Tasks Completed / Total Tasks Assigned) * 100',
                inputs: [
                    { id: 'tasksCompleted', label: 'Tasks Completed', placeholder: 'e.g., 85', type: 'number' },
                    { id: 'totalTasks', label: 'Total Tasks Assigned', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ tasksCompleted, totalTasks }) => hrCalculations.calculateTaskCompletionRate(tasksCompleted, totalTasks),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our team's task completion rate is ${result.toFixed(2)}%. Analyze this rate. What factors could be influencing it, and suggest two strategies to improve task execution and team productivity.`,
            },
            {
                title: 'High Performer Ratio',
                description: 'Determine the concentration of top talent within your organization or a specific team.',
                explanation: "This metric calculates the percentage of employees who are considered high-performers (e.g., based on performance reviews). It's a key indicator of talent density and the organization's capacity for innovation and future leadership.",
                formula: '(Number of High Performers / Total Number of Employees) * 100',
                inputs: [
                    { id: 'highPerformers', label: 'Number of High Performers', placeholder: 'e.g., 20', type: 'number' },
                    { id: 'totalEmployees', label: 'Total Number of Employees', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ highPerformers, totalEmployees }) => hrCalculations.calculateHighPerformerRatio(highPerformers, totalEmployees),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our high performer ratio is ${result.toFixed(2)}%. Is this a healthy ratio? What are the strategic implications of this talent density for our business goals? Suggest one strategy to develop mid-performers into high-performers.`,
            },
            {
                title: 'Workload Balance (Avg. Workweek)',
                description: 'Monitor the average weekly hours worked per employee to identify potential burnout risks.',
                explanation: 'This metric calculates the average number of hours an employee works per week. It can be an indicator of workload, productivity, and potential burnout risk if consistently high.',
                formula: '(Total Hours Worked / Weeks in Period) / Average Headcount',
                inputs: [
                    { id: 'totalHours', label: 'Total Hours Worked in Period', placeholder: 'e.g., 16000', type: 'number', defaultValue: '950000' },
                    { id: 'weeksInPeriod', label: 'Number of Weeks in Period', placeholder: 'e.g., 4', type: 'number', defaultValue: '52' },
                    { id: 'averageHeadcount', label: 'Average Employee Headcount', placeholder: 'e.g., 100', type: 'number', defaultValue: '426' },
                ],
                calculateFn: ({ totalHours, weeksInPeriod, averageHeadcount }) => hrCalculations.calculateAverageWorkweek(totalHours, weeksInPeriod, averageHeadcount),
                resultType: 'hours',
                aiPromptFn: (inputs, result) => `Our average workweek is ${result.toFixed(1)} hours. Analyze this. Is it a healthy number? What are the risks of a high or low average workweek? Suggest a strategy for maintaining a healthy work-life balance based on this metric.`,
            },
        ]
    },
];

export const HR_METRIC_CATEGORIES: CalculatorCategory[] = [
    {
        name: 'HR Impact on Profitability',
        icon: TrendingUp,
        calculators: [
            {
                title: 'Revenue per Employee',
                description: 'Calculate the total company revenue generated per employee.',
                explanation: 'This is a core business productivity metric that calculates the amount of company revenue generated for each employee. It connects workforce size directly to financial performance.',
                formula: 'Total Company Revenue / Total Employee Count',
                inputs: [
                    { id: 'totalRevenue', label: 'Total Company Revenue ($)', placeholder: 'e.g., 10000000', type: 'number' },
                    { id: 'employeeCount', label: 'Total Employee Count', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ totalRevenue, employeeCount }) => hrCalculations.calculateRevenuePerEmployeeFromInputs(totalRevenue, employeeCount),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our revenue per employee is $${result.toLocaleString()}. This is a key productivity metric. Analyze this figure and suggest two strategies to improve it.`,
            },
            {
                title: 'Return on Human Investment',
                description: 'Measures the financial return for every dollar spent on employee compensation.',
                explanation: 'This advanced metric, often called ROHI, measures the financial return generated for every dollar invested in employee compensation. It demonstrates the profitability of the workforce.',
                formula: 'Company Operating Profit / Total Compensation Expense',
                inputs: [
                    { id: 'operatingProfit', label: 'Company Operating Profit ($)', placeholder: 'e.g., 2000000', type: 'number' },
                    { id: 'totalCompensation', label: 'Total Compensation Expense ($)', placeholder: 'e.g., 5000000', type: 'number' },
                ],
                calculateFn: ({ operatingProfit, totalCompensation }) => hrCalculations.calculateReturnOnHumanInvestment(operatingProfit, totalCompensation),
                resultType: 'return',
                aiPromptFn: (inputs, result) => `Our Return on Human Investment (ROHI) is ${result.toFixed(2)}, meaning we generate $${result.toFixed(2)} in profit for every $1 of compensation. Analyze this result and its importance for strategic workforce planning.`,
            },
            {
                title: 'HR Cost per Employee',
                description: 'The total cost of the HR function per employee in the organization.',
                explanation: "This metric calculates the total cost to run the HR function divided by the number of employees in the company. It's a measure of HR's operational efficiency.",
                formula: 'Total HR Department Costs / Total Company Employee Count',
                inputs: [
                    { id: 'totalHRCosts', label: 'Total HR Department Costs ($)', placeholder: 'e.g., 300000', type: 'number' },
                    { id: 'employeeCount', label: 'Total Company Employee Count', placeholder: 'e.g., 250', type: 'number' },
                ],
                calculateFn: ({ totalHRCosts, employeeCount }) => hrCalculations.calculateHRCostsPerEmployee(totalHRCosts, employeeCount),
                resultType: 'currency',
                aiPromptFn: (inputs, result) => `Our HR cost per employee is $${result.toFixed(2)}. What are the primary drivers of this cost, and suggest two ways HR can improve its efficiency to lower this metric.`,
            },
        ]
    },
    {
        name: 'HR Operations Efficiency',
        icon: Briefcase,
        calculators: [
             {
                title: 'HR Service Level',
                description: 'The percentage of HR service calls answered within a target time.',
                explanation: 'This metric measures the efficiency of the HR service delivery team, typically by tracking the percentage of employee inquiries or calls that are resolved within a predefined target timeframe.',
                formula: '(Calls Answered Within Target / Total Service Calls) * 100',
                inputs: [
                    { id: 'callsAnsweredInTime', label: 'Calls Answered Within Target', placeholder: 'e.g., 950', type: 'number' },
                    { id: 'totalCalls', label: 'Total Service Calls', placeholder: 'e.g., 1000', type: 'number' },
                ],
                calculateFn: ({ callsAnsweredInTime, totalCalls }) => hrCalculations.calculateHRServiceLevel(callsAnsweredInTime, totalCalls),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our HR department's service level is ${result.toFixed(2)}%. Analyze what this metric indicates about HR operational efficiency and employee satisfaction with HR services. Suggest one technology or process change that could improve this metric.`,
            },
            {
                title: 'HR Self-Service Rate',
                description: 'The percentage of HR tasks and inquiries handled through self-service tools.',
                explanation: "This metric calculates the percentage of HR-related tasks that employees complete themselves using self-service tools (like an HRIS). A higher rate indicates greater efficiency and empowerment.",
                formula: '(Tasks Completed via Self-Service / Total HR Service Tasks) * 100',
                inputs: [
                    { id: 'selfServiceTasks', label: 'Tasks Completed via Self-Service', placeholder: 'e.g., 800', type: 'number' },
                    { id: 'totalTasks', label: 'Total HR Service Tasks', placeholder: 'e.g., 1000', type: 'number' },
                ],
                calculateFn: ({ selfServiceTasks, totalTasks }) => hrCalculations.calculateHRSelfServiceRate(selfServiceTasks, totalTasks),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our HR self-service rate is ${result.toFixed(2)}%. This means ${inputs.selfServiceTasks} out of ${inputs.totalTasks} tasks were handled without direct HR intervention. Analyze what this rate indicates about our technology adoption and HR workload. Suggest two ways to increase this rate.`,
            },
        ],
    },
    {
        name: 'Performance & Productivity',
        icon: Star,
        calculators: [
            {
                title: 'Performance Appraisal Rate',
                description: 'The percentage of eligible employees who received a performance appraisal.',
                explanation: 'This metric tracks the percentage of employees who have completed a formal performance review out of all employees who were eligible. A high rate is crucial for a healthy performance management culture.',
                formula: '(Appraisals Completed / Total Eligible Employees) * 100',
                inputs: [
                    { id: 'appraisalsDone', label: 'Appraisals Completed', placeholder: 'e.g., 95', type: 'number' },
                    { id: 'eligibleEmployees', label: 'Total Eligible Employees', placeholder: 'e.g., 100', type: 'number' },
                ],
                calculateFn: ({ appraisalsDone, eligibleEmployees }) => hrCalculations.calculatePerformanceAppraisalRate(appraisalsDone, eligibleEmployees),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our performance appraisal completion rate is ${result.toFixed(2)}%. Why is a high completion rate important for performance management? Suggest one way to streamline the appraisal process.`,
            },
            {
                title: 'Performance Pay Differential',
                description: 'The percentage difference in pay between high performers and other employees.',
                explanation: 'This metric measures the percentage difference in average pay between employees identified as high-performers and other employees. It quantifies the extent to which the company rewards top performance financially.',
                formula: '((Avg. High-Performer Pay / Avg. Other Pay) - 1) * 100',
                inputs: [
                    { id: 'highPerformerComp', label: 'Avg. High-Performer Pay ($)', placeholder: 'e.g., 120000', type: 'number' },
                    { id: 'otherComp', label: 'Avg. Other Employee Pay ($)', placeholder: 'e.g., 90000', type: 'number' },
                ],
                calculateFn: ({ highPerformerComp, otherComp }) => hrCalculations.calculatePerformancePayDifferential(highPerformerComp, otherComp),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `The pay differential for our high performers is ${result.toFixed(2)}%. Explain the significance of this metric in motivating performance and signaling a pay-for-performance culture.`,
            },
            {
                title: 'High Performer Growth Rate',
                description: 'Measure the percentage change in your high-performer population over a period.',
                explanation: 'This metric tracks the change in the number of high-performing employees over a period. A positive growth rate indicates successful talent development and performance management strategies.',
                formula: '((High Performers at End - High Performers at Start) / High Performers at Start) * 100',
                inputs: [
                    { id: 'highPerformersStart', label: 'High Performers at Start of Period', placeholder: 'e.g., 20', type: 'number' },
                    { id: 'highPerformersEnd', label: 'High Performers at End of Period', placeholder: 'e.g., 25', type: 'number' },
                ],
                calculateFn: ({ highPerformersStart, highPerformersEnd }) => hrCalculations.calculateHighPerformerGrowthRate(highPerformersStart, highPerformersEnd),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our high performer growth rate is ${isFinite(result) ? result.toFixed(2) + '%' : 'very high (started from zero)'}. We started with ${inputs.highPerformersStart} high performers and ended with ${inputs.highPerformersEnd}. Analyze what this means for our talent pipeline and suggest two strategies to accelerate or sustain this growth.`,
            },
        ],
    },
    {
        name: 'Management & Leadership',
        icon: UserCog,
        calculators: [
            {
                title: 'Successor Pool Coverage',
                description: 'The percentage of key leadership positions with at least one ready successor.',
                explanation: "This metric measures the readiness of the leadership pipeline by calculating the percentage of critical leadership roles for which there is at least one 'ready now' internal successor identified.",
                formula: '(Number of Ready Successors / Number of Key Positions) * 100',
                inputs: [
                    { id: 'successors', label: 'Number of Ready Successors', placeholder: 'e.g., 15', type: 'number' },
                    { id: 'keyPositions', label: 'Number of Key Positions', placeholder: 'e.g., 20', type: 'number' },
                ],
                calculateFn: ({ successors, keyPositions }) => hrCalculations.calculateSuccessorPoolCoverage(successors, keyPositions),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `Our successor pool coverage is ${result.toFixed(2)}%. Analyze what this means for our organization's risk management and leadership continuity. Suggest two strategies to build a stronger leadership pipeline.`,
            },
            {
                title: 'Management Satisfaction Index',
                description: 'Input your survey-based score on employee satisfaction with management.',
                explanation: 'A qualitative metric from surveys measuring employee satisfaction with their direct manager. It is a powerful leading indicator of team morale, engagement, and retention risk.',
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'satisfactionIndex', label: 'Management Satisfaction Score (0-100)', placeholder: 'e.g., 75', type: 'number' },
                ],
                calculateFn: ({ satisfactionIndex }) => satisfactionIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Management Satisfaction Index is ${result.toFixed(1)} out of 100. This score reflects how employees perceive their direct managers. Analyze the profound impact of this score on team morale, productivity, and turnover. Provide 3 specific, actionable behaviors or trainings for managers that could improve this score.`,
            },
        ],
    },
    {
        name: 'Talent Acquisition',
        icon: Target,
        calculators: [
            {
                title: 'Time-to-Fill',
                description: 'Calculate the average number of days to fill an open position.',
                explanation: "This metric measures the average number of days from when a job requisition is opened to when an offer is accepted. It's a key indicator of recruitment efficiency.",
                formula: 'Total Days Positions Were Open / Number of Positions Filled',
                inputs: [
                    { id: 'totalDays', label: 'Total Days All Positions Were Open', placeholder: 'e.g., 900', type: 'number' },
                    { id: 'positionsFilled', label: 'Number of Positions Filled', placeholder: 'e.g., 15', type: 'number' },
                ],
                calculateFn: ({ totalDays, positionsFilled }) => hrCalculations.calculateAvgTimeToFill(totalDays, positionsFilled),
                resultType: 'days',
                aiPromptFn: (inputs, result) => `Our average time-to-fill is ${result.toFixed(1)} days. Analyze this. Is this efficient? What are the primary factors that increase time-to-fill, and suggest two strategies to reduce it.`,
            },
            {
                title: 'Source Quality Hire Rate',
                description: 'The percentage of new hires from a source who are considered high-quality.',
                explanation: "This metric helps determine the effectiveness of different recruitment channels by measuring the percentage of hires from a specific source who are deemed high-quality (e.g., based on first-year performance reviews).",
                formula: '(High-Quality Hires from Source / Total Hires from Source) * 100',
                inputs: [
                    { id: 'highQualityHires', label: 'High-Quality Hires from Source', placeholder: 'e.g., 8', type: 'number' },
                    { id: 'totalHires', label: 'Total Hires from Source', placeholder: 'e.g., 10', type: 'number' },
                ],
                calculateFn: ({ highQualityHires, totalHires }) => hrCalculations.calculateSourceEffectiveness(highQualityHires, totalHires),
                resultType: 'percent',
                aiPromptFn: (inputs, result) => `For a specific recruiting source, our quality hire rate is ${result.toFixed(2)}%. This means ${inputs.highQualityHires} out of ${inputs.totalHires} hires were high-quality. Analyze what this indicates about the source's effectiveness and how we should adjust our recruitment strategy based on this.`,
            },
            {
                title: 'Candidate Experience Score',
                description: 'Input your survey-based score for candidate satisfaction with the hiring process.',
                explanation: "A qualitative metric from candidate surveys measuring satisfaction with the recruitment process. A positive experience strengthens the employer brand, even for candidates who are not hired.",
                formula: 'Survey Score (Not a direct calculation)',
                inputs: [
                    { id: 'satisfactionIndex', label: 'Candidate Experience Score (0-100)', placeholder: 'e.g., 88', type: 'number' },
                ],
                calculateFn: ({ satisfactionIndex }) => satisfactionIndex,
                resultType: 'score',
                aiPromptFn: (inputs, result) => `Our Candidate Experience Score is ${result.toFixed(1)} out of 100. Analyze the long-term impact of this score on our employer brand and talent pipeline. Provide 3 specific actions to improve the candidate experience.`,
            },
        ]
    },
];
