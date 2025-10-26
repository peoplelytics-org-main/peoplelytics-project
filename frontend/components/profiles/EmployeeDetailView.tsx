import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Employee, Currency, SkillLevel } from '../../types';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Gauge from '../ui/Gauge';
import StatusBadge from '../ui/StatusBadge';
import { calculateTenure, calculateFlightRiskScore, calculateImpactScore } from '../../services/hrCalculations';
import { Award, Briefcase, Calendar, CheckCircle, Clock, TrendingUp, UserCheck, DollarSign, AlertTriangle, MessageSquare, BrainCircuit } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const InfoPill: React.FC<{ icon: React.FC<any>, label: string, value: string }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
        <div className="p-2 bg-primary-900/40 rounded-md">
            <Icon className="h-6 w-6 text-primary-400 flex-shrink-0" />
        </div>
        <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="font-semibold text-text-primary">{value}</p>
        </div>
    </div>
);

const SatisfactionBar: React.FC<{ label: string; value: number | undefined }> = ({ label, value = 0 }) => {
    const color = value < 60 ? 'bg-red-500' : value < 80 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div>
            <div className="flex justify-between items-end text-sm mb-1">
                <span className="text-text-secondary">{label}</span>
                <span className="font-semibold text-text-primary">{value.toFixed(0)}<span className="text-xs text-text-secondary">/100</span></span>
            </div>
            <div className="w-full bg-border rounded-full h-2">
                <div className={`${color} h-2 rounded-full`} style={{ width: `${value}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
    );
};

const DetailItem: React.FC<{ icon: React.FC<any>, label: string, value: string | React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-900/40 rounded-md">
           <Icon className="h-5 w-5 text-primary-400 flex-shrink-0" />
        </div>
        <div>
            <p className="text-sm text-text-secondary">{label}</p>
            <p className="font-semibold text-text-primary">{value}</p>
        </div>
    </div>
);

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

const mockTrainingModules = [
    "Introduction to Company Policies",
    "Cybersecurity Awareness",
    "Project Management Fundamentals",
    "Advanced Communication Skills",
    "Leadership Development Program",
    "Technical Skill Enhancement",
    "Diversity & Inclusion Workshop",
    "Customer Service Excellence"
];

interface EmployeeDetailViewProps {
    employee: Employee;
    allEmployees: Employee[];
}

const skillLevelConfig: Record<SkillLevel, {
    label: string;
    colorClasses: string;
}> = {
    Novice: { label: 'Novice', colorClasses: 'bg-gray-700 text-gray-200' },
    Beginner: { label: 'Beginner', colorClasses: 'bg-blue-800 text-blue-200' },
    Competent: { label: 'Competent', colorClasses: 'bg-green-800 text-green-200' },
    Proficient: { label: 'Proficient', colorClasses: 'bg-purple-800 text-purple-200' },
    Expert: { label: 'Expert', colorClasses: 'bg-amber-700 text-amber-200' },
};

const EmployeeDetailView: React.FC<EmployeeDetailViewProps> = ({ employee, allEmployees }) => {
    const { currency } = useTheme();
    const trainingProgress = employee.trainingTotal > 0 ? (employee.trainingCompleted / employee.trainingTotal) * 100 : 0;
    
    const manager = useMemo(() => 
        employee.managerId ? allEmployees.find(e => e.id === employee.managerId) : null,
    [employee.managerId, allEmployees]);

    const flightRiskScore = useMemo(() => calculateFlightRiskScore(employee), [employee]);
    const impactScore = useMemo(() => calculateImpactScore(employee), [employee]);

    const successionStatusConfig = {
        'Ready Now': { color: 'bg-green-500', icon: CheckCircle },
        'Ready in 1-2 Years': { color: 'bg-yellow-500', icon: Clock },
        'Future Potential': { color: 'bg-blue-500', icon: TrendingUp },
        'Not Assessed': { color: 'bg-gray-500', icon: UserCheck },
    };
    const SuccessIcon = successionStatusConfig[employee.successionStatus].icon;
    const successColor = successionStatusConfig[employee.successionStatus].color;

    const currencySymbols: Record<Currency, string> = {
        PKR: 'Rs',
        USD: '$',
        EUR: '€',
        GBP: '£',
    };
    
    const skillOrder: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];
    const sortedSkills = useMemo(() => {
        if (!employee.skills) return [];
        return [...employee.skills].sort((a, b) => skillOrder.indexOf(a.level) - skillOrder.indexOf(b.level));
    }, [employee.skills]);

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row items-center gap-6 p-6 bg-card rounded-lg border border-border bg-gradient-to-br from-card via-card to-primary-900/30">
                <div className={`w-24 h-24 rounded-full ${getAvatarColor(employee.gender)} flex items-center justify-center font-bold text-white text-5xl flex-shrink-0`}>
                    {employee.name.charAt(0)}
                </div>
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-text-primary">{employee.name}</h2>
                        <StatusBadge employee={employee} />
                    </div>
                    <p className="text-xl text-text-secondary">{employee.jobTitle}</p>
                    {manager && (
                         <p className="mt-2 text-sm text-text-secondary flex items-center gap-2">
                            <span>Reports to: <Link to={`/app/profiles/${manager.id}`} className="font-semibold text-primary-400 hover:underline">{manager.name}</Link></span>
                            <StatusBadge employee={manager} />
                        </p>
                    )}
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InfoPill icon={Briefcase} label="Department" value={employee.department} />
                <InfoPill icon={Calendar} label="Hire Date" value={new Date(employee.hireDate).toLocaleDateString()} />
                <InfoPill icon={Clock} label="Tenure" value={calculateTenure(employee.hireDate, employee.terminationDate)} />
                 <InfoPill icon={Award} label="Salary" value={employee.salary > 0 ? `${currencySymbols[currency]}${employee.salary.toLocaleString()}` : 'Anonymized'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Core Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap justify-around items-center gap-y-6 pt-4">
                        <Gauge
                            value={employee.performanceRating * 20}
                            label="Performance"
                            displayValue={employee.performanceRating.toFixed(1)}
                            displayMaxValue="/5"
                        />
                        <Gauge
                            value={employee.engagementScore}
                            label="Engagement"
                            displayValue={employee.engagementScore.toFixed(0)}
                            displayMaxValue="%"
                        />
                        <Gauge
                            value={((employee.potentialRating - 1) / 2) * 100}
                            label="Potential"
                            displayValue={employee.potentialRating.toString()}
                            displayMaxValue="/3"
                        />
                        <Gauge
                            value={flightRiskScore * 10}
                            label="Flight Risk"
                            displayValue={flightRiskScore.toFixed(1)}
                            displayMaxValue="/10"
                        />
                        <Gauge
                            value={impactScore * 10}
                            label="Impact"
                            displayValue={impactScore.toFixed(1)}
                            displayMaxValue="/10"
                        />
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Succession Planning</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full ${successColor}`}></div>
                                <span className="font-semibold text-text-primary">{employee.successionStatus}</span>
                            </div>
                            <p className="text-sm text-text-secondary mt-2">Employee's readiness for promotion to key roles.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 mb-4 text-xs text-text-secondary">
                                {Object.entries(skillLevelConfig).map(([level, config]) => (
                                    <div key={level} className="flex items-center gap-1.5">
                                        <div className={`w-3 h-3 rounded-sm ${config.colorClasses.split(' ')[0]}`}></div>
                                        <span>{config.label}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {sortedSkills.length > 0 ? (
                                    sortedSkills.map(skill => (
                                        <span key={skill.name} className={`px-3 py-1 text-sm font-medium rounded-full ${skillLevelConfig[skill.level].colorClasses}`}>
                                            {skill.name}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-text-secondary">No skills listed.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Training & Development</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                             <div className="flex justify-between text-sm font-medium text-text-secondary">
                                <span>Training Progress</span>
                                <span>{employee.trainingCompleted} / {employee.trainingTotal} modules</span>
                            </div>
                            <div className="w-full bg-border rounded-full h-4 mt-1">
                                <div className="bg-primary-600 h-4 rounded-full" style={{ width: `${trainingProgress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                            </div>
                        </div>
                        {employee.trainingCompleted > 0 && (
                            <div>
                                <h4 className="text-sm font-semibold text-text-primary mb-2">Completed Modules</h4>
                                <ul className="space-y-1 text-sm text-text-secondary list-disc list-inside">
                                    {mockTrainingModules.slice(0, employee.trainingCompleted).map(module => (
                                        <li key={module}>{module}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Satisfaction Scores</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <SatisfactionBar label="Compensation" value={employee.compensationSatisfaction} />
                        <SatisfactionBar label="Benefits" value={employee.benefitsSatisfaction} />
                        <SatisfactionBar label="Management" value={employee.managementSatisfaction} />
                        <SatisfactionBar label="Training" value={employee.trainingSatisfaction} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Compensation & Relations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <DetailItem 
                            icon={DollarSign} 
                            label="Annual Bonus" 
                            value={employee.bonus ? `${currencySymbols[currency]}${employee.bonus.toLocaleString()}` : 'N/A'}
                        />
                        <DetailItem 
                            icon={TrendingUp} 
                            label="Last Raise Amount" 
                            value={employee.lastRaiseAmount ? `${currencySymbols[currency]}${employee.lastRaiseAmount.toLocaleString()}` : 'N/A'}
                        />
                        <DetailItem 
                            icon={Clock} 
                            label="Average Weekly Hours" 
                            value={`${employee.weeklyHours || '40'} hours`}
                        />
                        <DetailItem 
                            icon={employee.hasGrievance ? AlertTriangle : MessageSquare} 
                            label="Grievance Status" 
                            value={
                                <span className={`flex items-center gap-2 font-semibold ${employee.hasGrievance ? 'text-red-400' : 'text-text-primary'}`}>
                                    {employee.hasGrievance ? 'Active Grievance' : 'No Grievances'}
                                </span>
                            }
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EmployeeDetailView;