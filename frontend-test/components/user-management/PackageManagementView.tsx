import React from 'react';
import type { Organization, PackageName } from '../../types';
import { APP_PACKAGES } from '../../constants';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Switch from '../ui/Switch';

interface PackageManagementViewProps {
    organizations: Organization[];
    setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
    handleStatusToggle: (orgId: string, currentStatus: 'Active' | 'Inactive') => void;
    handleEmployeeCountChange: (orgId: string, count: string) => void;
}

const PackageManagementView: React.FC<PackageManagementViewProps> = ({
    organizations,
    setOrganizations,
    handleStatusToggle,
    handleEmployeeCountChange,
}) => {
    const handlePackageChange = (orgId: string, newPackage: PackageName) => {
        setOrganizations(prevOrgs => 
            prevOrgs.map(org => org.id === orgId ? { ...org, package: newPackage } : org)
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Package Management</CardTitle>
                <CardDescription>Assign subscription packages to each organization to control their feature access.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-text-secondary uppercase">
                            <tr>
                                <th className="py-2 px-4 text-left">Organization</th>
                                <th className="py-2 px-4 text-left">Status</th>
                                <th className="py-2 px-4 text-left">No. of Employees</th>
                                <th className="py-2 px-4 text-left">Package</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.id} className="border-b border-border last:border-b-0">
                                    <td className="py-3 px-4 font-semibold text-text-primary">{org.name}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                id={`status-toggle-${org.id}`}
                                                checked={org.status === 'Active'}
                                                onChange={() => handleStatusToggle(org.id, org.status)}
                                            />
                                            <span className={`text-xs font-semibold ${org.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{org.status}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <input
                                            type="number"
                                            aria-label={`Number of employees for ${org.name}`}
                                            value={org.employeeCount || ''}
                                            onChange={(e) => handleEmployeeCountChange(org.id, e.target.value)}
                                            className="w-24 bg-background border border-border rounded-md px-2 py-1.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        />
                                    </td>
                                    <td className="py-3 px-4">
                                        <select
                                            value={org.package}
                                            onChange={(e) => handlePackageChange(org.id, e.target.value as PackageName)}
                                            className="bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                        >
                                            {Object.keys(APP_PACKAGES).map(pkg => (
                                                <option key={pkg} value={pkg}>{pkg}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default PackageManagementView;
