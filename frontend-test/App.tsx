import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { DashboardConfigProvider } from './contexts/DashboardConfigContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AnalysisProvider } from './contexts/AnalysisContext';
import { ReportSettingsProvider } from './contexts/ReportSettingsContext';
import { PermissionProvider } from './contexts/PermissionContext';

import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedGuard from './components/RoleBasedGuard';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import DataManagementPage from './pages/DataManagementPage';
import CalculatorsPage from './pages/CalculatorsPage';
import ROIAnalyzerPage from './pages/ROIAnalyzerPage';
import AIAssistantPage from './pages/AIAssistantPage';
import PredictiveAnalyticsPage from './pages/PredictiveAnalyticsPage';
import ReportsPage from './pages/ReportsPage';
import ProfilesListPage from './pages/ProfilesListPage';
import ProfilePage from './pages/ProfilePage';
import CustomizationPage from './pages/CustomizationPage';
import UserManagementPage from './pages/UserManagementPage';
import SuperAdminReportsPage from './pages/SuperAdminReportsPage';


import type { UserRole } from './types';


const ORG_ADMIN_ANALYST: UserRole[] = ['Org Admin', 'HR Analyst'];
const ALL_ORG_ROLES: UserRole[] = ['Org Admin', 'HR Analyst', 'Executive'];
const SUPER_ADMIN_ORG_ADMIN: UserRole[] = ['Super Admin', 'Org Admin'];
const SUPER_ADMIN_ONLY: UserRole[] = ['Super Admin'];

const AppRoutes: React.FC = () => {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <svg className="animate-spin h-8 w-8 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        );
    }

    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            
            <Route path="/app" element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/app/home" element={<HomePage />} />
                    <Route path="/app/dashboard" element={
                        <RoleBasedGuard allowedRoles={ALL_ORG_ROLES} checkHeadcountLimit><DashboardPage /></RoleBasedGuard>
                    } />
                    
                    <Route path="/app/data-management" element={
                      <RoleBasedGuard allowedRoles={ORG_ADMIN_ANALYST} checkHeadcountLimit requireWriteAccess>
                        <DataManagementPage />
                      </RoleBasedGuard>
                    }/>

                    <Route path="/app/profiles" element={<RoleBasedGuard allowedRoles={ALL_ORG_ROLES} checkHeadcountLimit><ProfilesListPage /></RoleBasedGuard>} />
                    <Route path="/app/profiles/:employeeId" element={<RoleBasedGuard allowedRoles={ALL_ORG_ROLES} checkHeadcountLimit><ProfilePage /></RoleBasedGuard>} />
                    
                    <Route path="/app/employee-metrics" element={
                      <RoleBasedGuard allowedRoles={ORG_ADMIN_ANALYST} checkHeadcountLimit featureFlag="hasEmployeeMetrics" featureName="Employee Metrics">
                          <CalculatorsPage pageType="employee" />
                      </RoleBasedGuard>
                    }/>
                    
                    <Route path="/app/hr-metrics" element={
                      <RoleBasedGuard allowedRoles={ORG_ADMIN_ANALYST} checkHeadcountLimit featureFlag="hasHRMetrics" featureName="HR Metrics">
                          <CalculatorsPage pageType="hr" />
                      </RoleBasedGuard>
                    }/>

                    <Route path="/app/roi-analyzer" element={
                      <RoleBasedGuard allowedRoles={ORG_ADMIN_ANALYST} featureFlag="hasROIAnalyzer" featureName="ROI Analyzer" checkHeadcountLimit>
                          <ROIAnalyzerPage />
                      </RoleBasedGuard>
                    }/>

                    <Route path="/app/reports" element={<RoleBasedGuard allowedRoles={ALL_ORG_ROLES} checkHeadcountLimit><ReportsPage /></RoleBasedGuard>} />
                    
                    <Route path="/app/predictive-analytics" element={
                      <RoleBasedGuard allowedRoles={ORG_ADMIN_ANALYST} featureFlag="hasPredictiveAnalytics" featureName="Predictive Analytics" checkHeadcountLimit>
                          <PredictiveAnalyticsPage />
                      </RoleBasedGuard>
                    }/>
                    
                    <Route path="/app/customization" element={
                      <RoleBasedGuard allowedRoles={['Org Admin']} featureFlag="hasCustomization" featureName="Customization">
                          <CustomizationPage />
                      </RoleBasedGuard>
                    }/>

                    <Route path="/app/user-management" element={
                        <RoleBasedGuard allowedRoles={SUPER_ADMIN_ORG_ADMIN} featureFlag="hasUserManagementAccess" featureName="User Management">
                            <UserManagementPage />
                        </RoleBasedGuard>
                    }/>

                    <Route path="/app/super-admin-reports" element={
                        <RoleBasedGuard allowedRoles={SUPER_ADMIN_ONLY}>
                            <SuperAdminReportsPage />
                        </RoleBasedGuard>
                    }/>

                    <Route path="/app/ai-assistant" element={
                        <RoleBasedGuard allowedRoles={ALL_ORG_ROLES} featureFlag="hasAIAssistant" featureName="AI Assistant" checkHeadcountLimit>
                            <AIAssistantPage />
                        </RoleBasedGuard>
                    } />

                    {/* Redirect from base /app to the home page */}
                    <Route index element={<Navigate to="/app/home" replace />} />
                </Route>
            </Route>
        </Routes>
    );
};


function App(): React.ReactNode {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <PermissionProvider>
            <DashboardConfigProvider>
              <NotificationProvider>
                <AnalysisProvider>
                  <ReportSettingsProvider>
                    <HashRouter>
                      <AppRoutes />
                    </HashRouter>
                  </ReportSettingsProvider>
                </AnalysisProvider>
              </NotificationProvider>
            </DashboardConfigProvider>
          </PermissionProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;