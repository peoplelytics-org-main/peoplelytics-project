import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { FileWarning, FilePieChart, BarChart3, Users, Calendar, Clock, LayoutGrid } from 'lucide-react';
import { ClipboardCheckIcon } from '../constants';
import Button from '../components/ui/Button';
import { StandardReportsView } from '../components/reports/StandardReportsView';
import OrgChartExplorer from '../components/reports/OrgChartExplorer';
import ReportScheduler from '../components/reports/ReportScheduler';
import TalentRiskMatrixView from '../components/reports/TalentRiskMatrixView';
import ExitInsightsPage from './ExitInsightsPage';

type ActiveTab = 'reports' | 'org-chart' | 'scheduler' | 'talent-matrix' | 'exit-insight';

const ReportsPage: React.FC = () => {
    const { employeeData } = useData();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<ActiveTab>('reports');
    
    const canUpload = currentUser?.role === 'Org Admin' || currentUser?.role === 'HR Analyst';

    if (employeeData.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-center">
              <div className="space-y-4">
                <FileWarning className="mx-auto h-16 w-16 text-text-secondary" />
                <h3 className="text-xl font-semibold text-text-primary">Employee Data Required</h3>
                <p className="text-text-secondary">
                  {canUpload 
                    ? "Please provide data to build reports and visualizations."
                    : "Employee data has not been uploaded yet. Reporting features are unavailable."
                  }
                </p>
                {canUpload && (
                  <div>
                    <Link to="/app/data-management">
                      <Button>Manage Data</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
        );
    }
    
    const tabs: { id: ActiveTab, name: string, icon: React.FC<any> }[] = [
        { id: 'reports', name: 'Standard Reports', icon: BarChart3 },
        { id: 'org-chart', name: 'Org Chart Explorer', icon: Users },
        { id: 'talent-matrix', name: 'Talent Risk Matrix', icon: LayoutGrid },
        { id: 'exit-insight', name: 'Exit Insight', icon: ClipboardCheckIcon },
        { id: 'scheduler', name: 'Report Scheduler', icon: Calendar }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <FilePieChart className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Visualization & Reporting Hub</h2>
                    <p className="text-text-secondary mt-1">Create, view, and schedule reports with interactive visualizations.</p>
                 </div>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                         <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                              group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                              ${activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}
                            `}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="pt-4">
                {activeTab === 'reports' && <StandardReportsView />}
                {activeTab === 'org-chart' && <OrgChartExplorer />}
                {activeTab === 'talent-matrix' && <TalentRiskMatrixView />}
                {activeTab === 'exit-insight' && <ExitInsightsPage />}
                {activeTab === 'scheduler' && <ReportScheduler />}
            </div>
        </div>
    );
}

export default ReportsPage;