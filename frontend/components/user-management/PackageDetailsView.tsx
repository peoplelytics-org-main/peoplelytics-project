import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { User, UserRole, AppPackage } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { APP_PACKAGES } from '../../constants';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { CheckCircle } from 'lucide-react';

const ProgressBar: React.FC<{ value: number; max: number; label: string }> = ({ value, max, label }) => {
    const isInfinite = !isFinite(max);
    const displayMax = isInfinite ? 'Unlimited' : max;
    const percentage = isInfinite ? 100 : max > 0 ? Math.min((value / max) * 100, 100) : 0;
    const barColor = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-primary-600';

    return (
        <div>
            <div className="flex justify-between items-end text-sm mb-1">
                <span className="font-medium text-text-primary">{label}</span>
                <span className="font-semibold text-text-secondary">{value} / {displayMax}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2.5">
                <div className={`${barColor} h-2.5 rounded-full`} style={{ width: `${percentage}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
    );
};

// FIX: Add missing 'hasEmployeeMetrics' and 'hasHRMetrics' to the map to satisfy the type.
const featureNameMap: { [key in keyof Required<AppPackage['features']>]: string } = {
    hasPredictiveAnalytics: 'Predictive Analytics',
    hasAIAssistant: 'AI Assistant',
    hasROIAnalyzer: 'ROI Analyzer',
    hasCustomization: 'Dashboard & Theme Customization',
    hasAdvancedReports: 'Advanced Reporting Suite',
    hasIntegrations: 'HRIS Integrations',
    hasAIStory: 'AI Story Generation',
    hasKeyDriverAnalysis: 'Key Driver Analysis',
    hasSuccessionPlanning: 'Succession Planning Tools',
    hasUserManagementAccess: 'User Management Module',
    hasEmployeeMetrics: 'Employee Metrics',
    hasHRMetrics: 'HR Metrics',
};

const PackageDetailsView: React.FC = () => {
    const { currentUser } = useAuth();
    const { 
        allOrganizations, 
        allUsers, 
        currentOrgHeadcount, 
        currentOrgHeadcountLimit,
        currentPackageRoleLimits,
        currentPackageFeatures 
    } = useData();

    const organization = allOrganizations.find(o => o.id === currentUser?.organizationId);
    const appPackage = organization ? APP_PACKAGES[organization.package] : null;

    const roleCounts = useMemo(() => {
        if (!currentUser?.organizationId) return {};
        return allUsers
            .filter(u => u.organizationId === currentUser.organizationId)
            .reduce((acc, user) => {
                acc[user.role] = (acc[user.role] || 0) + 1;
                return acc;
            }, {} as Record<UserRole, number>);
    }, [allUsers, currentUser]);

    if (!organization || !appPackage) {
        return <Card><CardContent>Could not load package details for your organization.</CardContent></Card>;
    }

    const includedFeatures = Object.entries(featureNameMap)
        .filter(([key]) => currentPackageFeatures?.[key as keyof AppPackage['features']]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Usage Limits</CardTitle>
                        <CardDescription>Your current usage against the limits of your plan.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <ProgressBar
                            label="Employee Headcount"
                            value={currentOrgHeadcount}
                            max={currentOrgHeadcountLimit}
                        />
                        {currentPackageRoleLimits && Object.entries(currentPackageRoleLimits).map(([role, limit]) => (
                            <ProgressBar
                                key={role}
                                label={`${role}s`}
                                value={roleCounts[role as UserRole] || 0}
                                max={limit ?? Infinity}
                            />
                        ))}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Included Features</CardTitle>
                        <CardDescription>Features available to your organization under the {appPackage.name} plan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {includedFeatures.map(([key, name]) => (
                                <li key={key} className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                                    <span className="text-text-primary">{name}</span>
                                </li>
                            ))}
                            {includedFeatures.length === 0 && (
                                <p className="text-text-secondary">Your plan includes core features. Upgrade for more capabilities.</p>
                            )}
                        </ul>
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card>
                    <CardHeader>
                        <CardTitle>{appPackage.name} Plan</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-text-secondary">Status</p>
                            <p className={`font-semibold ${organization.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{organization.status}</p>
                        </div>
                        <div>
                            <p className="text-sm text-text-secondary">Subscription End Date</p>
                            <p className="font-semibold text-text-primary">{organization.subscriptionEndDate}</p>
                        </div>
                        <Link to="/pricing">
                           <Button variant="secondary" className="w-full">View All Plans</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PackageDetailsView;