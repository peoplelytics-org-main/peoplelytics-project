import type { Employee, AttendanceRecord, RecruitmentFunnel, Organization } from '../../types';
import type { PerformanceReview } from './performanceReviewsApi';
import type { ExitInterview } from './exitInterviewsApi';
import type { Skill } from './skillsApi';
import type { Report } from './reportsApi';
import type { AnalyticsMetric } from './analyticsApi';

/**
 * Map backend employee data to frontend Employee type
 * Backend has fewer fields, so we add defaults for missing ones
 */
export const mapBackendEmployeeToFrontend = (backendEmployee: any, orgId: string): Employee => {
  return {
    id: backendEmployee.employeeId || backendEmployee._id || '',
    name: backendEmployee.name || '',
    department: backendEmployee.department || '',
    jobTitle: backendEmployee.jobTitle || '',
    location: backendEmployee.location || '',
    hireDate: backendEmployee.hireDate ? new Date(backendEmployee.hireDate).toISOString().split('T')[0] : '',
    terminationDate: backendEmployee.terminationDate ? new Date(backendEmployee.terminationDate).toISOString().split('T')[0] : undefined,
    terminationReason: backendEmployee.terminationReason,
    salary: backendEmployee.salary || 0,
    gender: backendEmployee.gender || 'Other',
    performanceRating: backendEmployee.performanceRating || 3,
    potentialRating: backendEmployee.potentialRating || 2,
    engagementScore: backendEmployee.engagementScore || 70,
    skills: backendEmployee.skills || [],
    compensationSatisfaction: backendEmployee.compensationSatisfaction,
    benefitsSatisfaction: backendEmployee.benefitsSatisfaction,
    managementSatisfaction: backendEmployee.managementSatisfaction,
    trainingSatisfaction: backendEmployee.trainingSatisfaction,
    managerId: backendEmployee.managerId,
    trainingCompleted: backendEmployee.trainingCompleted || 0,
    trainingTotal: backendEmployee.trainingTotal || 0,
    successionStatus: backendEmployee.successionStatus || 'Not Assessed',
    bonus: backendEmployee.bonus,
    lastRaiseAmount: backendEmployee.lastRaiseAmount,
    hasGrievance: backendEmployee.hasGrievance || false,
    weeklyHours: backendEmployee.weeklyHours || 40,
    organizationId: orgId,
    snapshotDate: backendEmployee.snapshotDate || new Date().toISOString().split('T')[0],
  };
};

/**
 * Map frontend employee data to backend format
 */
export const mapFrontendEmployeeToBackend = (frontendEmployee: Partial<Employee>): any => {
  return {
    employeeId: frontendEmployee.id,
    name: frontendEmployee.name,
    department: frontendEmployee.department,
    jobTitle: frontendEmployee.jobTitle,
    location: frontendEmployee.location,
    hireDate: frontendEmployee.hireDate ? new Date(frontendEmployee.hireDate) : undefined,
    terminationDate: frontendEmployee.terminationDate ? new Date(frontendEmployee.terminationDate) : undefined,
    terminationReason: frontendEmployee.terminationReason,
    gender: frontendEmployee.gender,
    managerId: frontendEmployee.managerId,
    successionStatus: frontendEmployee.successionStatus,
    // Include all additional fields that backend now supports
    salary: frontendEmployee.salary,
    performanceRating: frontendEmployee.performanceRating,
    potentialRating: frontendEmployee.potentialRating,
    engagementScore: frontendEmployee.engagementScore,
    skills: frontendEmployee.skills,
    compensationSatisfaction: frontendEmployee.compensationSatisfaction,
    benefitsSatisfaction: frontendEmployee.benefitsSatisfaction,
    managementSatisfaction: frontendEmployee.managementSatisfaction,
    trainingSatisfaction: frontendEmployee.trainingSatisfaction,
    trainingCompleted: frontendEmployee.trainingCompleted,
    trainingTotal: frontendEmployee.trainingTotal,
    bonus: frontendEmployee.bonus,
    lastRaiseAmount: frontendEmployee.lastRaiseAmount,
    hasGrievance: frontendEmployee.hasGrievance,
    weeklyHours: frontendEmployee.weeklyHours,
    snapshotDate: frontendEmployee.snapshotDate ? new Date(frontendEmployee.snapshotDate) : undefined,
  };
};

/**
 * Map backend attendance data to frontend AttendanceRecord type
 */
export const mapBackendAttendanceToFrontend = (backendAttendance: any, orgId: string): AttendanceRecord => {
  // Extract date from date_time_in
  const dateTimeIn = backendAttendance.date_time_in ? new Date(backendAttendance.date_time_in) : new Date();
  const date = dateTimeIn.toISOString().split('T')[0];

  return {
    id: backendAttendance.attendanceId || backendAttendance._id || '', // ✅ Added id field for updates/deletes
    employeeId: backendAttendance.employeeId || '',
    date: date,
    status: backendAttendance.status || 'Present',
    organizationId: orgId,
  };
};

/**
 * Map frontend attendance data to backend format
 */
export const mapFrontendAttendanceToBackend = (frontendAttendance: Partial<AttendanceRecord>): any => {
  const dateTimeIn = frontendAttendance.date ? new Date(frontendAttendance.date) : new Date();
  
  return {
    attendanceId: frontendAttendance.id || `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // ✅ Use id if provided
    employeeId: frontendAttendance.employeeId,
    date_time_in: dateTimeIn,
    date_time_out: undefined, // Can be set later
    status: frontendAttendance.status || 'Present',
  };
};

/**
 * Map backend job position data to frontend JobPosition type
 */
export const mapBackendJobPositionToFrontend = (backendPosition: any, orgId: string): any => {
  return {
    id: backendPosition.positionId || backendPosition._id || '',
    title: backendPosition.title || '',
    department: backendPosition.department || '',
    status: backendPosition.status || 'Open',
    openDate: backendPosition.openDate ? new Date(backendPosition.openDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    closeDate: backendPosition.closeDate ? new Date(backendPosition.closeDate).toISOString().split('T')[0] : undefined,
    hiredEmployeeId: backendPosition.hiredEmployeeId,
    onHoldDate: backendPosition.onHoldDate ? new Date(backendPosition.onHoldDate).toISOString().split('T')[0] : undefined,
    heldBy: backendPosition.heldBy,
    positionType: backendPosition.positionType || 'New',
    budgetStatus: backendPosition.budgetStatus || 'Budgeted',
    organizationId: orgId,
  };
};

/**
 * Map frontend job position data to backend format
 */
export const mapFrontendJobPositionToBackend = (frontendPosition: Partial<any>): any => {
  return {
    positionId: frontendPosition.id,
    title: frontendPosition.title,
    department: frontendPosition.department,
    status: frontendPosition.status,
    openDate: frontendPosition.openDate ? new Date(frontendPosition.openDate) : new Date(),
    closeDate: frontendPosition.closeDate ? new Date(frontendPosition.closeDate) : undefined,
    hiredEmployeeId: frontendPosition.hiredEmployeeId,
    onHoldDate: frontendPosition.onHoldDate ? new Date(frontendPosition.onHoldDate) : undefined,
    heldBy: frontendPosition.heldBy,
    positionType: frontendPosition.positionType,
    budgetStatus: frontendPosition.budgetStatus,
  };
};

/**
 * Map backend recruitment funnel data to frontend RecruitmentFunnel type
 */
export const mapBackendRecruitmentFunnelToFrontend = (backendFunnel: any, orgId: string): RecruitmentFunnel => {
  return {
    positionId: backendFunnel.positionId || '',
    shortlisted: backendFunnel.shortlisted || 0,
    interviewed: backendFunnel.interviewed || 0,
    offersExtended: backendFunnel.offersExtended || 0,
    offersAccepted: backendFunnel.offersAccepted || 0,
    joined: backendFunnel.joined || 0,
    organizationId: orgId,
  };
};

/**
 * Map frontend recruitment funnel data to backend format
 */
export const mapFrontendRecruitmentFunnelToBackend = (frontendFunnel: Partial<RecruitmentFunnel>): any => {
  return {
    rec_funnel_id: `funnel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    positionId: frontendFunnel.positionId,
    shortlisted: frontendFunnel.shortlisted || 0,
    interviewed: frontendFunnel.interviewed || 0,
    offersExtended: frontendFunnel.offersExtended || 0,
    offersAccepted: frontendFunnel.offersAccepted || 0,
    joined: frontendFunnel.joined || 0,
  };
};

/**
 * Map backend performance review data to frontend PerformanceReview type
 */
export const mapBackendPerformanceReviewToFrontend = (backendReview: any, orgId: string): PerformanceReview => {
  return {
    id: backendReview._id || '',
    employeeId: backendReview.employeeId || '',
    name: backendReview.name || '',
    performanceRating: backendReview.performanceRating || 3,
    potentialRating: backendReview.potentialRating || 2,
    flightRiskScore: backendReview.flightRiskScore || 0,
    impactScore: backendReview.impactScore || 0,
    trainingCompleted: backendReview.trainingCompleted || 0,
    trainingTotal: backendReview.trainingTotal || 8,
    weeklyHours: backendReview.weeklyHours || 40,
    hasGrievance: backendReview.hasGrievance || false,
    organizationId: orgId,
    createdAt: backendReview.createdAt ? new Date(backendReview.createdAt).toISOString() : undefined,
    updatedAt: backendReview.updatedAt ? new Date(backendReview.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend performance review data to backend format
 */
export const mapFrontendPerformanceReviewToBackend = (frontendReview: Partial<PerformanceReview>): any => {
  return {
    employeeId: frontendReview.employeeId,
    name: frontendReview.name,
    performanceRating: frontendReview.performanceRating,
    potentialRating: frontendReview.potentialRating,
    flightRiskScore: frontendReview.flightRiskScore,
    impactScore: frontendReview.impactScore,
    trainingCompleted: frontendReview.trainingCompleted,
    trainingTotal: frontendReview.trainingTotal,
    weeklyHours: frontendReview.weeklyHours,
    hasGrievance: frontendReview.hasGrievance,
  };
};

/**
 * Map backend exit interview data to frontend ExitInterview type
 */
export const mapBackendExitInterviewToFrontend = (backendInterview: any, orgId: string): ExitInterview => {
  // ✅ Use orgId from backend if available, otherwise use provided orgId
  const organizationId = backendInterview.orgId || orgId;
  
  return {
    id: backendInterview._id || backendInterview.exit_interview_id || '',
    employeeId: backendInterview.employeeId || '',
    primaryReasonForLeaving: backendInterview.primaryReasonForLeaving || '',
    secondaryReasonForLeaving: backendInterview.secondaryReasonForLeaving,
    management: backendInterview.management || {
      sentiment: 'Neutral' as const,
      quote: '',
      summary: '',
    },
    compensation: backendInterview.compensation || {
      sentiment: 'Neutral' as const,
      quote: '',
      summary: '',
    },
    culture: backendInterview.culture || {
      sentiment: 'Neutral' as const,
      quote: '',
      summary: '',
    },
    analyzedAt: backendInterview.analyzedAt ? new Date(backendInterview.analyzedAt).toISOString() : new Date().toISOString(),
    organizationId: organizationId, // ✅ Properly map orgId → organizationId
    createdAt: backendInterview.createdAt ? new Date(backendInterview.createdAt).toISOString() : undefined,
    updatedAt: backendInterview.updatedAt ? new Date(backendInterview.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend exit interview data to backend format
 */
export const mapFrontendExitInterviewToBackend = (frontendInterview: Partial<ExitInterview>): any => {
  return {
    employeeId: frontendInterview.employeeId,
    primaryReasonForLeaving: frontendInterview.primaryReasonForLeaving,
    secondaryReasonForLeaving: frontendInterview.secondaryReasonForLeaving,
    management: frontendInterview.management,
    compensation: frontendInterview.compensation,
    culture: frontendInterview.culture,
    analyzedAt: frontendInterview.analyzedAt ? new Date(frontendInterview.analyzedAt) : new Date(),
    orgId: frontendInterview.organizationId, // ✅ Map organizationId → orgId for backend
  };
};

/**
 * Map backend organization data to frontend Organization type
 */
export const mapBackendOrganizationToFrontend = (backendOrg: any): Organization => {
  return {
    id: backendOrg.orgId || backendOrg._id || '',
    name: backendOrg.name || '',
    subscriptionStartDate: backendOrg.subscriptionStartDate ? new Date(backendOrg.subscriptionStartDate).toISOString().split('T')[0] : '',
    subscriptionEndDate: backendOrg.subscriptionEndDate ? new Date(backendOrg.subscriptionEndDate).toISOString().split('T')[0] : '',
    status: backendOrg.status || 'Active',
    package: backendOrg.package || 'Basic',
    employeeCount: backendOrg.employeeCount || 0,
  };
};

/**
 * Map frontend organization data to backend format
 */
export const mapFrontendOrganizationToBackend = (frontendOrg: Partial<Organization>): any => {
  return {
    name: frontendOrg.name,
    subscriptionStartDate: frontendOrg.subscriptionStartDate ? new Date(frontendOrg.subscriptionStartDate) : undefined,
    subscriptionEndDate: frontendOrg.subscriptionEndDate ? new Date(frontendOrg.subscriptionEndDate) : undefined,
    status: frontendOrg.status,
    package: frontendOrg.package,
    employeeCount: frontendOrg.employeeCount,
  };
};

/**
 * Map backend skill data to frontend Skill type
 */
export const mapBackendSkillToFrontend = (backendSkill: any, orgId: string): any => {
  return {
    skillLevelId: backendSkill.skillLevelId || backendSkill._id || '',
    employeeId: backendSkill.employeeId || '',
    employeeName: backendSkill.employeeName || '',
    skillName: backendSkill.skillName || '',
    skillLevel: backendSkill.skillLevel || 'Novice',
  };
};

/**
 * Map frontend skill data to backend format
 */
export const mapFrontendSkillToBackend = (frontendSkill: Partial<any>): any => {
  return {
    skillLevelId: frontendSkill.skillLevelId || `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: frontendSkill.employeeId,
    employeeName: frontendSkill.employeeName,
    skillName: frontendSkill.skillName,
    skillLevel: frontendSkill.skillLevel,
  };
};

/**
 * Map backend report data to frontend Report type
 */
export const mapBackendReportToFrontend = (backendReport: any): any => {
  return {
    reportId: backendReport.reportId || backendReport._id || '',
    name: backendReport.name || '',
    type: backendReport.type || '',
    generatedBy: backendReport.generatedBy || '',
    parameters: backendReport.parameters || {
      dateRange: {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    data: backendReport.data || {},
    status: backendReport.status || 'generating',
    filePath: backendReport.filePath,
    createdAt: backendReport.createdAt ? new Date(backendReport.createdAt).toISOString() : new Date().toISOString(),
    expiresAt: backendReport.expiresAt ? new Date(backendReport.expiresAt).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
};

/**
 * Map frontend report data to backend format
 */
export const mapFrontendReportToBackend = (frontendReport: Partial<any>): any => {
  return {
    reportId: frontendReport.reportId || `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: frontendReport.name,
    type: frontendReport.type,
    generatedBy: frontendReport.generatedBy,
    parameters: frontendReport.parameters ? {
      dateRange: {
        start: frontendReport.parameters.dateRange?.start ? new Date(frontendReport.parameters.dateRange.start) : new Date(),
        end: frontendReport.parameters.dateRange?.end ? new Date(frontendReport.parameters.dateRange.end) : new Date(),
      },
      departments: frontendReport.parameters.departments,
    } : undefined,
    data: frontendReport.data,
    status: frontendReport.status || 'generating',
    filePath: frontendReport.filePath,
    expiresAt: frontendReport.expiresAt ? new Date(frontendReport.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };
};

/**
 * Map backend analytics data to frontend AnalyticsMetric type
 */
export const mapBackendAnalyticsToFrontend = (backendAnalytics: any): any => {
  return {
    metricType: backendAnalytics.metricType || '',
    period: backendAnalytics.period || '',
    value: backendAnalytics.value || 0,
    breakdown: backendAnalytics.breakdown || {},
    calculatedAt: backendAnalytics.calculatedAt ? new Date(backendAnalytics.calculatedAt).toISOString() : new Date().toISOString(),
    dataSource: backendAnalytics.dataSource || '',
  };
};

/**
 * Map frontend analytics data to backend format
 */
export const mapFrontendAnalyticsToBackend = (frontendAnalytics: Partial<any>): any => {
  return {
    metricType: frontendAnalytics.metricType,
    period: frontendAnalytics.period,
    value: frontendAnalytics.value,
    breakdown: frontendAnalytics.breakdown,
    calculatedAt: frontendAnalytics.calculatedAt ? new Date(frontendAnalytics.calculatedAt) : new Date(),
    dataSource: frontendAnalytics.dataSource || 'manual',
  };
};

/**
 * Map backend department data to frontend Department type
 */
export const mapBackendDepartmentToFrontend = (backendDepartment: any): any => {
  return {
    departmentId: backendDepartment.departmentId || backendDepartment._id || '',
    name: backendDepartment.name || '',
    description: backendDepartment.description || '',
    headOfDepartment: backendDepartment.headOfDepartment || '',
    budget: backendDepartment.budget || 0,
    location: backendDepartment.location || '',
    isActive: backendDepartment.isActive !== undefined ? backendDepartment.isActive : true,
    createdAt: backendDepartment.createdAt ? new Date(backendDepartment.createdAt).toISOString() : undefined,
    updatedAt: backendDepartment.updatedAt ? new Date(backendDepartment.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend department data to backend format
 */
export const mapFrontendDepartmentToBackend = (frontendDepartment: Partial<any>): any => {
  return {
    departmentId: frontendDepartment.departmentId || `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: frontendDepartment.name,
    description: frontendDepartment.description,
    headOfDepartment: frontendDepartment.headOfDepartment,
    budget: frontendDepartment.budget,
    location: frontendDepartment.location,
    isActive: frontendDepartment.isActive !== undefined ? frontendDepartment.isActive : true,
  };
};

/**
 * Map backend salary data to frontend Salary type
 */
export const mapBackendSalaryToFrontend = (backendSalary: any): any => {
  return {
    salaryId: backendSalary.salaryId || backendSalary._id || '',
    employeeId: backendSalary.employeeId || '',
    name: backendSalary.name || '',
    salary: backendSalary.salary || 0,
    bonus: backendSalary.bonus || 0,
    lastRaiseAmount: backendSalary.lastRaiseAmount,
    lastRaiseDate: backendSalary.lastRaiseDate ? new Date(backendSalary.lastRaiseDate).toISOString().split('T')[0] : undefined,
    createdAt: backendSalary.createdAt ? new Date(backendSalary.createdAt).toISOString() : undefined,
    updatedAt: backendSalary.updatedAt ? new Date(backendSalary.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend salary data to backend format
 */
export const mapFrontendSalaryToBackend = (frontendSalary: Partial<any>): any => {
  return {
    salaryId: frontendSalary.salaryId || `salary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: frontendSalary.employeeId,
    name: frontendSalary.name,
    salary: frontendSalary.salary,
    bonus: frontendSalary.bonus,
    lastRaiseAmount: frontendSalary.lastRaiseAmount,
    lastRaiseDate: frontendSalary.lastRaiseDate ? new Date(frontendSalary.lastRaiseDate) : undefined,
  };
};

/**
 * Map backend account data to frontend Account type
 */
export const mapBackendAccountToFrontend = (backendAccount: any): any => {
  return {
    accountId: backendAccount.accountId || backendAccount._id || '',
    accountName: backendAccount.accountName || '',
    accountType: backendAccount.accountType || 'Asset',
    balance: backendAccount.balance || 0,
    currency: backendAccount.currency || 'USD',
    description: backendAccount.description,
    isActive: backendAccount.isActive !== undefined ? backendAccount.isActive : true,
    createdAt: backendAccount.createdAt ? new Date(backendAccount.createdAt).toISOString() : undefined,
    updatedAt: backendAccount.updatedAt ? new Date(backendAccount.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend account data to backend format
 */
export const mapFrontendAccountToBackend = (frontendAccount: Partial<any>): any => {
  return {
    accountId: frontendAccount.accountId || `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    accountName: frontendAccount.accountName,
    accountType: frontendAccount.accountType,
    balance: frontendAccount.balance || 0,
    currency: frontendAccount.currency || 'USD',
    description: frontendAccount.description,
    isActive: frontendAccount.isActive !== undefined ? frontendAccount.isActive : true,
  };
};

/**
 * Map backend expense data to frontend Expense type
 */
export const mapBackendExpenseToFrontend = (backendExpense: any): any => {
  return {
    expenseId: backendExpense.expenseId || backendExpense._id || '',
    employeeId: backendExpense.employeeId,
    employeeName: backendExpense.employeeName,
    department: backendExpense.department,
    category: backendExpense.category || '',
    amount: backendExpense.amount || 0,
    currency: backendExpense.currency || 'USD',
    description: backendExpense.description || '',
    expenseDate: backendExpense.expenseDate ? new Date(backendExpense.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    receiptUrl: backendExpense.receiptUrl,
    status: backendExpense.status || 'Pending',
    approvedBy: backendExpense.approvedBy,
    approvedAt: backendExpense.approvedAt ? new Date(backendExpense.approvedAt).toISOString() : undefined,
    createdAt: backendExpense.createdAt ? new Date(backendExpense.createdAt).toISOString() : undefined,
    updatedAt: backendExpense.updatedAt ? new Date(backendExpense.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend expense data to backend format
 */
export const mapFrontendExpenseToBackend = (frontendExpense: Partial<any>): any => {
  return {
    expenseId: frontendExpense.expenseId || `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: frontendExpense.employeeId,
    employeeName: frontendExpense.employeeName,
    department: frontendExpense.department,
    category: frontendExpense.category,
    amount: frontendExpense.amount,
    currency: frontendExpense.currency || 'USD',
    description: frontendExpense.description,
    expenseDate: frontendExpense.expenseDate ? new Date(frontendExpense.expenseDate) : new Date(),
    receiptUrl: frontendExpense.receiptUrl,
    status: frontendExpense.status || 'Pending',
    approvedBy: frontendExpense.approvedBy,
    approvedAt: frontendExpense.approvedAt ? new Date(frontendExpense.approvedAt) : undefined,
  };
};

/**
 * Map backend leave data to frontend Leave type
 */
export const mapBackendLeaveToFrontend = (backendLeave: any): any => {
  return {
    leaveId: backendLeave.leaveId || backendLeave._id || '',
    employeeId: backendLeave.employeeId || '',
    employeeName: backendLeave.employeeName || '',
    leaveType: backendLeave.leaveType || 'Annual',
    startDate: backendLeave.startDate ? new Date(backendLeave.startDate).toISOString().split('T')[0] : '',
    endDate: backendLeave.endDate ? new Date(backendLeave.endDate).toISOString().split('T')[0] : '',
    days: backendLeave.days || 0,
    status: backendLeave.status || 'Pending',
    reason: backendLeave.reason,
    approvedBy: backendLeave.approvedBy,
    approvedAt: backendLeave.approvedAt ? new Date(backendLeave.approvedAt).toISOString() : undefined,
    rejectedReason: backendLeave.rejectedReason,
    createdAt: backendLeave.createdAt ? new Date(backendLeave.createdAt).toISOString() : undefined,
    updatedAt: backendLeave.updatedAt ? new Date(backendLeave.updatedAt).toISOString() : undefined,
  };
};

/**
 * Map frontend leave data to backend format
 */
export const mapFrontendLeaveToBackend = (frontendLeave: Partial<any>): any => {
  return {
    leaveId: frontendLeave.leaveId || `leave_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    employeeId: frontendLeave.employeeId,
    employeeName: frontendLeave.employeeName,
    leaveType: frontendLeave.leaveType,
    startDate: frontendLeave.startDate ? new Date(frontendLeave.startDate) : new Date(),
    endDate: frontendLeave.endDate ? new Date(frontendLeave.endDate) : new Date(),
    days: frontendLeave.days,
    status: frontendLeave.status || 'Pending',
    reason: frontendLeave.reason,
    approvedBy: frontendLeave.approvedBy,
    approvedAt: frontendLeave.approvedAt ? new Date(frontendLeave.approvedAt) : undefined,
    rejectedReason: frontendLeave.rejectedReason,
  };
};

