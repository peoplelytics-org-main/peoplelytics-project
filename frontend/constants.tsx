import React from 'react';
import { 
    LayoutDashboard, Database, Users, Calculator, BarChart3, Lightbulb, TrendingUp, Settings, Flame, ClipboardCheck, FilePieChart, UserCog, Briefcase, HeartHandshake, Star, Handshake, Banknote, Gift, Clock, UserPlus, BrainCircuit, Server 
} from 'lucide-react';
import type { NavItem, DashboardWidget, Theme, UserRole, PackageName, AppPackage } from './types';

export const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);
export const FlameIcon = Flame;
export const ClipboardCheckIcon = ClipboardCheck;
export const UserManagementIcon = UserCog;
export const ServerIcon = Server;

export const APP_PACKAGES: Record<PackageName, AppPackage> = {
    Basic: {
        name: 'Basic',
        headcountLimit: 150,
        pricePerEmployee: 1.5,
        roleLimits: { 'Org Admin': 1, 'HR Analyst': 3, 'Executive': 3 },
        features: {
            hasUserManagementAccess: true,
            hasEmployeeMetrics: true,
            hasHRMetrics: true,
        }
    },
    Intermediate: {
        name: 'Intermediate',
        headcountLimit: 300,
        pricePerEmployee: 1.3,
        roleLimits: { 'Org Admin': 1, 'HR Analyst': 1, 'Executive': 0 },
        features: { 
            hasROIAnalyzer: true, 
            hasAdvancedReports: true, 
            hasAIStory: true,
            hasUserManagementAccess: true,
            hasEmployeeMetrics: true,
            hasHRMetrics: true,
        }
    },
    Pro: {
        name: 'Pro',
        headcountLimit: 750,
        pricePerEmployee: 1.1,
        roleLimits: { 'Org Admin': 1, 'HR Analyst': 3, 'Executive': 10 },
        features: { 
            hasROIAnalyzer: true, 
            hasAdvancedReports: true, 
            hasAIStory: true, 
            hasPredictiveAnalytics: true, 
            hasAIAssistant: true, 
            hasCustomization: true, 
            hasKeyDriverAnalysis: true, 
            hasSuccessionPlanning: true,
            hasUserManagementAccess: true,
            hasEmployeeMetrics: true,
            hasHRMetrics: true, 
        }
    },
    Enterprise: {
        name: 'Enterprise',
        headcountLimit: Infinity,
        pricePerEmployee: 0.9,
        roleLimits: { 'Org Admin': 1 },
        features: { 
            hasROIAnalyzer: true, 
            hasAdvancedReports: true, 
            hasAIStory: true, 
            hasPredictiveAnalytics: true, 
            hasAIAssistant: true, 
            hasCustomization: true, 
            hasKeyDriverAnalysis: true, 
            hasSuccessionPlanning: true, 
            hasIntegrations: true,
            hasUserManagementAccess: true,
            hasEmployeeMetrics: true,
            hasHRMetrics: true, 
        }
    }
};

export const NAV_ITEMS: NavItem[] = [
  { name: 'Home', href: '/app/home', icon: HomeIcon, roles: ['Super Admin', 'Org Admin', 'HR Analyst', 'Executive'], description: 'Return to the main navigation page.' },
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard, roles: ['Org Admin', 'HR Analyst', 'Executive'], description: 'View key metrics and visualizations.' },
  { name: 'Employee Profiles', href: '/app/profiles', icon: Users, roles: ['Org Admin', 'HR Analyst', 'Executive'], description: 'Browse and search for employee profiles.' },
  { name: 'Data Management', href: '/app/data-management', icon: Database, roles: ['Org Admin', 'HR Analyst'], description: 'Upload, manage, and export your data.' },
  { name: 'Reports Hub', href: '/app/reports', icon: FilePieChart, roles: ['Org Admin', 'HR Analyst', 'Executive'], description: 'Access detailed reports and visualizations.' },
  { name: 'Employee Metrics', href: '/app/employee-metrics', icon: Calculator, roles: ['Org Admin', 'HR Analyst'], description: 'Calculate key employee-related metrics.', featureFlag: 'hasEmployeeMetrics' },
  { name: 'HR Metrics', href: '/app/hr-metrics', icon: BarChart3, roles: ['Org Admin', 'HR Analyst'], description: 'Calculate strategic HR and operational metrics.', featureFlag: 'hasHRMetrics' },
  { name: 'ROI Analyzer', href: '/app/roi-analyzer', icon: TrendingUp, roles: ['Org Admin', 'HR Analyst'], description: 'Build business cases for HR initiatives.', featureFlag: 'hasROIAnalyzer' },
  { name: 'Predictive Analytics', href: '/app/predictive-analytics', icon: Lightbulb, roles: ['Org Admin', 'HR Analyst'], description: 'Use AI to forecast HR outcomes.', featureFlag: 'hasPredictiveAnalytics' },
  { name: 'AI Assistant', href: '/app/ai-assistant', icon: Lightbulb, roles: ['Org Admin', 'HR Analyst', 'Executive'], description: 'Chat with an AI to get data insights.', featureFlag: 'hasAIAssistant' },
  { name: 'Customization', href: '/app/customization', icon: Settings, roles: ['Org Admin'], description: 'Customize dashboard and application settings.', featureFlag: 'hasCustomization' },
  { name: 'User Management', href: '/app/user-management', icon: UserManagementIcon, roles: ['Super Admin', 'Org Admin'], description: 'Manage organizations and users.', featureFlag: 'hasUserManagementAccess' },
  { name: 'Platform Reports', href: '/app/super-admin-reports', icon: ServerIcon, roles: ['Super Admin'], description: 'View platform-wide health and client reports.' },
];

const ALL_ROLES: UserRole[] = ['Org Admin', 'HR Analyst', 'Executive'];
const ORG_ADMIN_ANALYST: UserRole[] = ['Org Admin', 'HR Analyst'];
const ORG_ADMIN_EXEC: UserRole[] = ['Org Admin', 'Executive'];

export const AVAILABLE_WIDGETS: DashboardWidget[] = [
    { id: 'kpi_cards', name: 'KPI Cards', description: 'Shows the main key performance indicators.', roles: ORG_ADMIN_EXEC },
    { id: 'ai_story', name: 'AI Story', description: 'AI-generated narrative of the current data view.', roles: ORG_ADMIN_EXEC, featureFlag: 'hasAIStory' },
    { id: 'key_driver_analysis', name: 'Key Driver Analysis', description: 'AI-powered breakdown of factors contributing to turnover.', roles: ORG_ADMIN_ANALYST, featureFlag: 'hasKeyDriverAnalysis' },
    { id: 'gender_diversity', name: 'Gender Diversity', description: 'Pie chart showing the gender distribution in the workforce.', roles: ALL_ROLES },
    { id: 'turnover_trend', name: 'Turnover Trend', description: 'Line chart showing the number of leavers over time.', roles: ALL_ROLES },
    { id: 'department_headcount', name: 'Department Headcount', description: 'Bar chart of employee counts per department.', roles: ORG_ADMIN_ANALYST },
    { id: 'performance_distribution', name: 'Performance Distribution', description: 'Distribution of employee performance scores.', roles: ORG_ADMIN_ANALYST },
    { id: 'headcount_heatmap', name: 'Headcount Heatmap', description: 'Heatmap of headcount by department and location.', roles: ORG_ADMIN_ANALYST },
    { id: 'turnover_by_reason', name: 'Turnover by Reason', description: 'Pie chart showing voluntary vs. involuntary turnover.', roles: ORG_ADMIN_ANALYST },
    { id: 'turnover_by_dept', name: 'Turnover by Department', description: 'Bar chart showing departments with the most leavers.', roles: ORG_ADMIN_ANALYST },
    { id: 'attendance_trend', name: 'Absence Trend', description: 'Line chart of sick and unscheduled absences over time.', roles: ORG_ADMIN_ANALYST },
    { id: 'recruitment_funnel', name: 'Recruitment Funnel', description: 'Bar chart of candidates across all recruitment stages.', roles: ORG_ADMIN_ANALYST },
    { id: 'succession_gaps', name: 'Succession Pipeline Risks', description: 'Identifies critical roles with potential leadership gaps.', roles: ORG_ADMIN_EXEC, featureFlag: 'hasSuccessionPlanning' },
    { id: 'burnout_hotspots', name: 'Burnout Risk Hotspots', description: 'Bar chart of departments with the highest risk of burnout.', roles: ALL_ROLES },
    { id: 'retention_by_dept', name: 'Retention by Department', description: 'Bar chart comparing employee retention rates across departments.', roles: ORG_ADMIN_ANALYST },
    { id: 'turnover_by_tenure', name: 'Turnover by Tenure', description: 'Bar chart of leavers by their tenure at the company.', roles: ORG_ADMIN_ANALYST },
    { id: 'pay_for_performance', name: 'Pay for Performance', description: 'Scatter plot of performance rating vs. salary.', roles: ORG_ADMIN_ANALYST },
    { id: 'performance_trend', name: 'Performance Over Time', description: 'Historical trend of average performance ratings.', roles: ORG_ADMIN_ANALYST },
    { id: 'performance_calibration', name: 'Performance Calibration', description: 'Rating distribution by department.', roles: ORG_ADMIN_ANALYST, featureFlag: 'hasAdvancedReports' },
    { id: 'nine_box_grid', name: '9-Box Grid (Full View)', description: 'Detailed talent segmentation.', roles: ORG_ADMIN_ANALYST, featureFlag: 'hasAdvancedReports' },
    { id: 'manager_performance', name: 'Team Performance by Manager', description: 'Performance rating distribution for each manager\'s team.', roles: ORG_ADMIN_ANALYST },
    { id: 'open_pos_by_dept', name: 'Open Positions by Department', description: 'Breakdown of open roles by type and department.', roles: ORG_ADMIN_ANALYST },
    { id: 'open_pos_by_title', name: 'Open Positions by Title', description: 'Breakdown of open roles by type and title.', roles: ORG_ADMIN_ANALYST },
    { id: 'turnover_by_job_title', name: 'Turnover by Job Title', description: 'Bar chart of job titles with the most leavers.', roles: ORG_ADMIN_ANALYST },
    { id: 'turnover_by_location', name: 'Turnover by Location', description: 'Bar chart of locations with the most leavers.', roles: ORG_ADMIN_ANALYST },
    { id: 'talent_risk_matrix', name: 'Talent Risk Matrix', description: 'Contains multiple views for talent risk analysis, including Performance vs. Risk and Risk & Impact.', roles: ALL_ROLES, featureFlag: 'hasAdvancedReports' },
    { id: 'skill_set_kpis', name: 'Skill Set KPIs', description: 'Key performance indicators for the organization\'s skill landscape.', roles: ALL_ROLES },
    { id: 'at_risk_skills', name: 'At-Risk Skills', description: 'Skills possessed by a small number of employees, creating a potential business risk.', roles: ORG_ADMIN_ANALYST },
    { id: 'top_skills_proficiency', name: 'Top Skills by Proficiency', description: 'Skills with the highest average proficiency level across the company.', roles: ORG_ADMIN_ANALYST },
    { id: 'top_skills_high_performers', name: 'Top Skills of High Performers', description: 'The most common skills found among top-performing employees.', roles: ORG_ADMIN_ANALYST },
];

export const THEMES: Theme[] = [
    { name: 'Blue', colors: { '--color-primary-50': '#eff6ff', '--color-primary-100': '#dbeafe', '--color-primary-200': '#bfdbfe', '--color-primary-300': '#93c5fd', '--color-primary-400': '#60a5fa', '--color-primary-500': '#3b82f6', '--color-primary-600': '#2563eb', '--color-primary-700': '#1d4ed8', '--color-primary-800': '#1e40af', '--color-primary-900': '#1e3a8a', '--color-primary-950': '#172554' } },
    { name: 'Green', colors: { '--color-primary-50': '#f0fdf4', '--color-primary-100': '#dcfce7', '--color-primary-200': '#bbf7d0', '--color-primary-300': '#86efac', '--color-primary-400': '#4ade80', '--color-primary-500': '#22c55e', '--color-primary-600': '#16a34a', '--color-primary-700': '#15803d', '--color-primary-800': '#166534', '--color-primary-900': '#14532d', '--color-primary-950': '#052e16' } },
    { name: 'Purple', colors: { '--color-primary-50': '#f5f3ff', '--color-primary-100': '#ede9fe', '--color-primary-200': '#ddd6fe', '--color-primary-300': '#c4b5fd', '--color-primary-400': '#a78bfa', '--color-primary-500': '#8b5cf6', '--color-primary-600': '#7c3aed', '--color-primary-700': '#6d28d9', '--color-primary-800': '#5b21b6', '--color-primary-900': '#4c1d95', '--color-primary-950': '#2e1065' } },
    { name: 'Red', colors: { '--color-primary-50': '#fff1f2', '--color-primary-100': '#ffe4e6', '--color-primary-200': '#fecdd3', '--color-primary-300': '#fda4af', '--color-primary-400': '#fb7185', '--color-primary-500': '#f43f5e', '--color-primary-600': '#e11d48', '--color-primary-700': '#be123c', '--color-primary-800': '#9f1239', '--color-primary-900': '#881337', '--color-primary-950': '#4c0519' } },
];