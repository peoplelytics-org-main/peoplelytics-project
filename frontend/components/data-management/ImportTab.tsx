import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel } from '../../types';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import DataUpload from '../DataUpload';
import AttendanceUpload from '../AttendanceUpload';
import RecruitmentDataUpload from '../RecruitmentDataUpload';
import { UploadCloud, Clock, Briefcase, FileSpreadsheet, ChevronRight, Sparkles } from 'lucide-react';


const ImportTab: React.FC = () => {
    const { 
        replaceEmployeeDataForOrg, 
        setAttendanceData, 
        setJobPositions, 
        setRecruitmentFunnels,
        activeOrganizationId 
    } = useData();
    const { currentUser: authUser } = useAuth();
    const { addNotification } = useNotifications();

    const organizationId = authUser?.role === 'Super Admin' ? activeOrganizationId : authUser?.organizationId;

    const handleEmployeeDataComplete = (newData: Employee[]) => {
        if (!organizationId) {
            addNotification({ title: 'Error', message: 'No organization selected to upload data for.', type: 'error' });
            return;
        }
        replaceEmployeeDataForOrg(organizationId, newData);
    };
    
    const handleAttendanceDataComplete = (newData: AttendanceRecord[]) => {
        if (!organizationId) {
            addNotification({ title: 'Error', message: 'No organization selected to upload data for.', type: 'error' });
            return;
        }
        setAttendanceData(prev => [...prev.filter(d => d.organizationId !== organizationId), ...newData]);
    };

    const handleRecruitmentDataComplete = (newData: { positions: JobPosition[], funnels: RecruitmentFunnel[] }) => {
        if (!organizationId) return;
        setJobPositions(prev => [...prev.filter(d => d.organizationId !== organizationId), ...newData.positions]);
        setRecruitmentFunnels(prev => [...prev.filter(d => d.organizationId !== organizationId), ...newData.funnels]);
    };

    if (!organizationId) {
        return <p>No organization selected.</p>
    }

    return (
        <div className="space-y-6">
            {/* Primary Employee Data Upload */}
            <Card className="border-2 border-primary-500/20 bg-gradient-to-br from-primary-900/10 to-background">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary-500/20 rounded-lg">
                            <UploadCloud className="h-6 w-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-xl">Employee Data Upload</CardTitle>
                            <CardDescription className="mt-1">
                                Upload a CSV file with your employee records. This will replace all existing data for the current organization.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <DataUpload onComplete={handleEmployeeDataComplete} organizationId={organizationId} />
                </CardContent>
            </Card>

            {/* Additional Data Uploads Section - More Prominent */}
            <div className="relative">
                {/* Decorative Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary-400" />
                        <h3 className="text-2xl font-bold text-text-primary">Additional Data Uploads</h3>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-primary-500/30 via-primary-500/10 to-transparent"></div>
                </div>

                {/* Grid Layout for Better Visibility */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Data Card */}
                    <Card className="group hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        Attendance Data
                                        <span className="text-xs font-normal text-text-secondary bg-blue-500/10 px-2 py-0.5 rounded-full">
                                            CSV Upload
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Upload attendance records to track employee presence, absences, and work hours. Supports multiple date formats.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AttendanceUpload onComplete={handleAttendanceDataComplete} organizationId={organizationId} />
                        </CardContent>
                    </Card>

                    {/* Recruitment Data Card */}
                    <Card className="group hover:border-primary-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                        <CardHeader>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                                    <Briefcase className="h-5 w-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        Recruitment Data
                                        <span className="text-xs font-normal text-text-secondary bg-purple-500/10 px-2 py-0.5 rounded-full">
                                            CSV Upload
                                        </span>
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        Upload job positions and recruitment funnel data including applications, interviews, and hiring metrics.
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <RecruitmentDataUpload onComplete={handleRecruitmentDataComplete} organizationId={organizationId} />
                        </CardContent>
                    </Card>
                </div>

                {/* Helpful Info Banner */}
                <div className="mt-6 p-4 bg-primary-900/20 border border-primary-500/20 rounded-lg">
                    <div className="flex items-start gap-3">
                        <FileSpreadsheet className="h-5 w-5 text-primary-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-text-primary mb-1">
                                Need help with CSV formatting?
                            </p>
                            <p className="text-xs text-text-secondary">
                                Each upload section includes validation and error handling. Make sure your CSV files have the required columns as specified in each upload section.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportTab;
