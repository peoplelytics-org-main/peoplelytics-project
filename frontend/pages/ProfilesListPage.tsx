import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import Card, { CardContent } from '../components/ui/Card';
import MetricCard from '../components/MetricCard';
import { IdCard, Search, Users, UserCheck, UserMinus, UserX } from 'lucide-react';
import { ClipboardCheckIcon } from '../constants';
import type { Employee } from '../types';
import StatusBadge from '../components/ui/StatusBadge';
import { getEmployeeStatus } from '../utils/statusHelper';

const getAvatarColor = (gender: Employee['gender']) => {
  switch (gender) {
    case 'Female':
      return 'bg-rose-600';
    case 'Other':
      return 'bg-gray-600';
    case 'Male':
    default:
      return 'bg-primary-800';
  }
};

const ProfilesListPage: React.FC = () => {
    const { displayedData } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const managerMap = useMemo(() => new Map(displayedData.map(e => [e.id, e.name])), [displayedData]);

    const metrics = useMemo(() => {
        const counts = {
            total: displayedData.length,
            active: 0,
            onProbation: 0,
            resigned: 0, // Serving notice
            resignedAndLeft: 0, // Already left
        };

        displayedData.forEach(employee => {
            const { status } = getEmployeeStatus(employee);
            switch (status) {
                case 'Active':
                    counts.active++;
                    break;
                case 'On Probation':
                    counts.onProbation++;
                    break;
                case 'Resigned':
                    counts.resigned++;
                    break;
                case 'Resigned & Left':
                case 'Terminated':
                    counts.resignedAndLeft++;
                    break;
            }
        });

        return counts;
    }, [displayedData]);

    const filteredEmployees = useMemo(() => {
        if (!searchTerm) {
            return displayedData;
        }
        return displayedData.filter(employee =>
            employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            employee.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [displayedData, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <IdCard className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Employee Profiles</h2>
                    <p className="text-text-secondary mt-1">Search and view detailed profiles for all employees.</p>
                 </div>
            </div>
            
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <MetricCard title="Total Profiles" value={metrics.total.toString()} icon={<Users className="h-5 w-5"/>} />
                <MetricCard title="Active" value={metrics.active.toString()} icon={<UserCheck className="h-5 w-5"/>} />
                <MetricCard title="On Probation" value={metrics.onProbation.toString()} icon={<ClipboardCheckIcon className="h-5 w-5"/>} />
                <MetricCard title="Resigned (Notice)" value={metrics.resigned.toString()} icon={<UserMinus className="h-5 w-5"/>} />
                <MetricCard title="Resigned & Left" value={metrics.resignedAndLeft.toString()} icon={<UserX className="h-5 w-5"/>} />
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                    type="text"
                    placeholder="Search by name, department, or job title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-card border border-border rounded-md pl-10 pr-4 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
            </div>
            
            {filteredEmployees.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map(employee => {
                        const managerName = employee.managerId ? managerMap.get(employee.managerId) : null;
                        return (
                            <Link to={`/app/profiles/${employee.id}`} key={employee.id} className="block group">
                                <Card className="h-full transition-all duration-300 transform group-hover:border-primary-600 group-hover:shadow-lg group-hover:shadow-primary-900/30 group-hover:-translate-y-1">
                                    <CardContent className="pt-6 flex flex-col items-center text-center">
                                        <div className={`w-16 h-16 rounded-full ${getAvatarColor(employee.gender)} flex items-center justify-center font-bold text-white text-2xl mb-4`}>
                                            {employee.name.charAt(0)}
                                        </div>
                                        <p className="font-semibold text-text-primary">{employee.name}</p>
                                        <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
                                        <div className="mt-2">
                                            <StatusBadge employee={employee} />
                                        </div>
                                        {managerName && (
                                            <p className="text-xs text-text-secondary mt-1">Reports to: <span className="font-medium text-text-primary">{managerName}</span></p>
                                        )}
                                        <p className="text-xs text-text-secondary mt-1">{employee.department}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-text-secondary">No employees found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default ProfilesListPage;