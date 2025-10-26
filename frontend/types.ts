import React from 'react';

export type Currency = 'PKR' | 'USD' | 'EUR' | 'GBP';
export type PackageName = 'Basic' | 'Intermediate' | 'Pro' | 'Enterprise';

export interface AppPackage {
  name: PackageName;
  headcountLimit: number;
  roleLimits?: {
    'Org Admin'?: number;
    'HR Analyst'?: number;
    'Executive'?: number;
  };
  features: {
    hasPredictiveAnalytics?: boolean;
    hasAIAssistant?: boolean;
    hasROIAnalyzer?: boolean;
    hasCustomization?: boolean;
    hasAdvancedReports?: boolean;
    hasIntegrations?: boolean;
    hasAIStory?: boolean;
    hasKeyDriverAnalysis?: boolean;
    hasSuccessionPlanning?: boolean;
    hasUserManagementAccess?: boolean;
  };
}

export interface Organization {
  id: string;
  name: string;
  subscriptionStartDate: string; // YYYY-MM-DD
  subscriptionEndDate: string; // YYYY-MM-DD
  status: 'Active' | 'Inactive';
  package: PackageName;
  employeeCount?: number;
}

export type SkillLevel = 'Novice' | 'Beginner' | 'Competent' | 'Proficient' | 'Expert';
export interface Skill {
  name: string;
  level: SkillLevel;
}

export interface Employee {
  id: string;
  name: string;
  department: string;
  jobTitle: string;
  location: string;
  hireDate: string; // YYYY-MM-DD
  terminationDate?: string; // YYYY-MM-DD
  terminationReason?: 'Voluntary' | 'Involuntary';
  salary: number;
  gender: 'Male' | 'Female' | 'Other';
  performanceRating: number; // 1-5
  potentialRating: number; // 1-3 (1=Developing, 2=Growth, 3=High)
  engagementScore: number; // 1-100
  skills: Skill[];
  compensationSatisfaction?: number; // 1-100
  benefitsSatisfaction?: number; // 1-100
  managementSatisfaction?: number; // 1-100
  trainingSatisfaction?: number; // 1-100
  managerId?: string;
  trainingCompleted: number;
  trainingTotal: number;
  successionStatus: 'Ready Now' | 'Ready in 1-2 Years' | 'Future Potential' | 'Not Assessed';
  bonus?: number;
  lastRaiseAmount?: number;
  hasGrievance?: boolean;
  weeklyHours?: number;
  organizationId: string;
  snapshotDate?: string; // YYYY-MM-DD
}

export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Unscheduled Absence' | 'PTO' | 'Sick Leave';
  organizationId: string;
}

export interface JobPosition {
  id: string;
  title: string;
  department: string;
  status: 'Open' | 'Closed' | 'On Hold';
  openDate: string; // YYYY-MM-DD
  closeDate?: string; // YYYY-MM-DD
  hiredEmployeeId?: string;
  onHoldDate?: string;
  heldBy?: string;
  positionType?: 'Replacement' | 'New';
  budgetStatus?: 'Budgeted' | 'Non-Budgeted';
  organizationId: string;
}

export interface RecruitmentFunnel {
  positionId: string;
  shortlisted: number;
  interviewed: number;
  offersExtended: number;
  offersAccepted: number;
  joined: number;
  organizationId: string;
}

export type UserRole = 'Super Admin' | 'Org Admin' | 'HR Analyst' | 'Executive';

export interface NavItem {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  roles: UserRole[];
  description?: string;
  featureFlag?: keyof AppPackage['features'];
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
}

export interface TurnoverPrediction {
  riskLevel: 'Low' | 'Medium' | 'High';
  confidenceScore: number;
  contributingFactors: string[];
}

export interface PerformanceForecast {
  predictedPerformance: string;
  confidenceScore: number;
  rationale: string;
}

export interface ScheduledReport {
    id: string;
    reportName: string;
    recipients: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    nextRun: string;
    subTypes?: string[];
}

export interface DashboardWidget {
    id: string;
    name: string;
    description: string;
    roles: UserRole[];
    featureFlag?: keyof AppPackage['features'];
}

export interface Theme {
    name: string;
    colors: Record<string, string>;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    timestamp: Date;
}

export interface SuccessionGap {
  criticalRole: string;
  incumbent: Employee;
  readyNowCount: number;
  atRiskSuccessors: { employee: Employee; risk: 'High' | 'Medium' | 'Low'; score: number }[];
}

export interface AIDataContext {
    employees: Employee[];
    attendance: AttendanceRecord[];
    jobPositions: JobPosition[];
    recruitmentFunnels: RecruitmentFunnel[];
}

export interface ExitInterviewTopicAnalysis {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  quote: string;
  summary: string;
}

export interface ExitInterviewAnalysis {
  primaryReasonForLeaving: string;
  secondaryReasonForLeaving?: string;

  management: ExitInterviewTopicAnalysis;
  compensation: ExitInterviewTopicAnalysis;
  culture: ExitInterviewTopicAnalysis;
  error?: string;
}

export interface KeyDriver {
  feature: string;
  impact: number;
  description: string;
}

export interface KeyDriverAnalysisResult {
  topDrivers: KeyDriver[];
}

export interface ForecastPoint {
    period: string;
    value: number;
    lowerBound: number;
    upperBound: number;
}

export interface KPIForecast {
    forecast: ForecastPoint[];
    analysis: string;
}

export interface BurnoutRiskResult {
    department: string;
    averageRiskScore: number;
    highRiskEmployeeCount: number;
    contributingFactors: {
        highWorkload: number; // percentage contribution
        lowEngagement: number; // percentage contribution
        highPerformancePressure: number; // percentage contribution
    };
}

export interface SkillGapData {
  skillName: string;
  required: number;
  current: number;
  gap: number;
}