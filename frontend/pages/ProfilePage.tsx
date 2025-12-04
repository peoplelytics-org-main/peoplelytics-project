import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import EmployeeDetailView from '../components/profiles/EmployeeDetailView';
import ManagerTeamView from '../components/profiles/ManagerTeamView';
import { ArrowLeft, User, Users } from 'lucide-react';
import Button from '../components/ui/Button';

const ProfilePage: React.FC = () => {
    const { employeeId } = useParams<{ employeeId: string }>();
    const { displayedData, employeeData } = useData();
    const { currentUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');

    const employee = useMemo(() => 
        displayedData.find(e => e.id === employeeId),
    [displayedData, employeeId]);
    
    const isManager = useMemo(() =>
        employeeData.some(e => e.managerId === employee?.id),
    [employeeData, employee]);
    
    const isOwnProfile = currentUser?.id === employee?.id;
    const canSeeTeamView = isManager && (isOwnProfile || currentUser?.role === 'Org Admin');

    if (!employee) {
        return (
            <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-red-400">Employee Not Found</h2>
                <p className="text-text-secondary mt-2">The profile you are looking for does not exist.</p>
                 <Link to="/app/profiles" className="mt-4 inline-block">
                    <Button>Back to Profiles</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Link to="/app/profiles" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Back to All Profiles
                </Link>
            </div>

            {canSeeTeamView && (
                 <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'profile' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <User className="mr-2 h-5 w-5" />
                            {isOwnProfile ? 'My Profile' : 'Profile'}
                        </button>
                        <button
                             onClick={() => setActiveTab('team')}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === 'team' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <Users className="mr-2 h-5 w-5" />
                            {isOwnProfile ? 'My Team' : 'Team View'}
                        </button>
                    </nav>
                </div>
            )}
            
            <div className="pt-2">
                {activeTab === 'profile' && <EmployeeDetailView employee={employee} allEmployees={displayedData} />}
                {activeTab === 'team' && canSeeTeamView && <ManagerTeamView manager={employee} allEmployees={displayedData} />}
            </div>
        </div>
    );
};

export default ProfilePage;