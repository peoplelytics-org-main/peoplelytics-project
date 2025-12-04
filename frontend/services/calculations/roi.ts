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
