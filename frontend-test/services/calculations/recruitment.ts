import type { JobPosition, RecruitmentFunnel } from '../../types';

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
