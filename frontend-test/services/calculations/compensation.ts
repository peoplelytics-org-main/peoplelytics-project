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
