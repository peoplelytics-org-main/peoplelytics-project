import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import type { Employee, AttendanceRecord, JobPosition, RecruitmentFunnel } from '../../types';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import DataUpload from '../DataUpload';
import AttendanceUpload from '../AttendanceUpload';
import RecruitmentDataUpload from '../RecruitmentDataUpload';
import { ChevronDown } from 'lucide-react';

const Accordion: React.FC<{ title: string; children: React.ReactNode; startOpen?: boolean }> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = React.useState(startOpen);
    return (
        <div className="border border-border rounded-lg bg-background">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 hover:bg-border/50 transition-colors">
                <h4 className="font-semibold text-text-primary text-left">{title}</h4>
                <ChevronDown className={`h-5 w-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-border">{children}</div>}
        </div>
    );
};


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
            <Card>
                <CardHeader>
                    <CardTitle>Employee Data Upload</CardTitle>
                    <CardDescription>Upload a CSV file with your employee records. This will replace all existing data for the current organization.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataUpload onComplete={handleEmployeeDataComplete} organizationId={organizationId} />
                </CardContent>
            </Card>
            <Accordion title="Upload Additional Data">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Attendance Data</CardTitle>
                            <CardDescription>Upload a CSV with attendance records. This will replace existing attendance data for this org.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AttendanceUpload onComplete={handleAttendanceDataComplete} organizationId={organizationId} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Recruitment Data</CardTitle>
                            <CardDescription>Upload a CSV with job position and recruitment funnel data. This will replace existing recruitment data for this org.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RecruitmentDataUpload onComplete={handleRecruitmentDataComplete} organizationId={organizationId} />
                        </CardContent>
                    </Card>
                </div>
            </Accordion>
        </div>
    );
};

export default ImportTab;
