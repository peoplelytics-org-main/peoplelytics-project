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

// Training
export const calculateTrainingCostsPerEmployee = (totalTrainingCosts: number, employeesTrained: number): number => {
  if (employeesTrained === 0) return 0;
  return totalTrainingCosts / employeesTrained;
};
