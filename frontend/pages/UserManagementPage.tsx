import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Organization, User, UserRole, PackageName, AppPackage } from '../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { PlusCircle, Edit, Trash2, UserCog, X, Building, ChevronDown, ChevronUp, Search, Package, CheckCircle, Users, AlertCircle } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import Switch from '../components/ui/Switch';
import { APP_PACKAGES } from '../constants';
import { Link } from 'react-router-dom';


// Props interfaces for the extracted components
interface SuperAdminViewProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    organizations: Organization[];
    users: User[];
    openOrgModal: (org: Organization | null) => void;
    deleteOrg: (orgId: string) => void;
    openUserModal: (user: User | null, orgId?: string) => void;
    deleteUser: (userId: string) => void;
    expandedOrg: string | null;
    setExpandedOrg: (id: string | null) => void;
    reactivateOrg: (orgId: string, newEndDate: string) => void;
    reactivationState: { orgId: string | null; newEndDate: string };
    handleReactivationToggle: (org: Organization) => void;
    cancelReactivation: () => void;
    setReactivationState: React.Dispatch<React.SetStateAction<{ orgId: string | null; newEndDate: string }>>;
}

interface OrgAdminViewProps {
    currentUser: User;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    users: User[];
    openUserModal: (user: User | null, orgId?: string) => void;
    deleteUser: (userId: string) => void;
}

const getStatusBadgeClasses = (status: 'Active' | 'Inactive' | string) => {
    switch (status) {
        case 'Active': return 'bg-green-900/50 text-green-300 border border-green-500/30';
        case 'Inactive': return 'bg-red-900/50 text-red-300 border border-red-500/30';
        default: return 'bg-gray-700 text-gray-300 border-gray-500/30';
    }
};

// Extracted SuperAdminView component
const SuperAdminView: React.FC<SuperAdminViewProps> = ({
    searchTerm,
    setSearchTerm,
    organizations,
    users,
    openOrgModal,
    deleteOrg,
    openUserModal,
    deleteUser,
    expandedOrg,
    setExpandedOrg,
    reactivateOrg,
    reactivationState,
    handleReactivationToggle,
    cancelReactivation,
    setReactivationState
}) => {
    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) {
            return organizations.map(org => ({
                ...org,
                displayUsers: users.filter(u => u.organizationId === org.id)
            }));
        }
        const lowercasedSearch = searchTerm.toLowerCase();

        return organizations
            .map(org => {
                const isOrgMatch = org.name.toLowerCase().includes(lowercasedSearch);
                const orgUsers = users.filter(u => u.organizationId === org.id);
                const matchingUsers = orgUsers.filter(u =>
                    u.username.toLowerCase().includes(lowercasedSearch)
                );

                if (isOrgMatch) {
                    return { ...org, displayUsers: orgUsers };
                }

                if (matchingUsers.length > 0) {
                    return { ...org, displayUsers: matchingUsers };
                }

                return null;
            })
            .filter((org): org is Organization & { displayUsers: User[] } => org !== null);

    }, [searchTerm, organizations, users]);

    

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <h3 className="text-xl font-bold">Organizations</h3>
                <Button onClick={() => openOrgModal(null)} className="gap-2 self-start sm:self-center"><PlusCircle className="h-4 w-4"/> Add Organization</Button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
                <input
                    type="text"
                    id="user-management-search-super"
                    placeholder="Search organizations or users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-background border border-border rounded-md px-3 py-2 pl-10 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    aria-label="Search organizations or users"
                />
            </div>

            <div className="space-y-4">
                {filteredData.length > 0 ? filteredData.map(org => {
                    const isExpanded = expandedOrg === org.id || (searchTerm.trim() && filteredData.length === 1);
                    return (
                        <Card key={org.id}>
                            <div className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <button onClick={() => setExpandedOrg(isExpanded && !(searchTerm.trim() && filteredData.length === 1) ? null : org.id)} className="flex items-center gap-4 text-left">
                                    {isExpanded ? <ChevronUp className="h-5 w-5"/> : <ChevronDown className="h-5 w-5"/>}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg text-text-primary">{org.name}</h4>
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClasses(org.status)}`}>{org.status}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary">Subscription: {org.subscriptionStartDate} to {org.subscriptionEndDate}</p>
                                    </div>
                                </button>
                                <div className="flex gap-2 self-end sm:self-center">
                                    <Button size="sm" variant="secondary" onClick={() => openOrgModal(org)} className="gap-2"><Edit className="h-4 w-4"/> Edit</Button>
                                    <Button size="sm" variant="ghost" onClick={() => deleteOrg(org.id)} className="gap-2 text-red-400"><Trash2 className="h-4 w-4"/> Delete</Button>
                                    <Button size="sm" onClick={() => openUserModal(null, org.id)} className="gap-2"><PlusCircle className="h-4 w-4"/> Add User</Button>
                                </div>
                            </div>
                            {isExpanded && (
                                <div className="border-t border-border p-4">
                                     {org.status === 'Inactive' && (
                                        <div className="p-3 bg-background rounded-md border border-border mb-4 space-y-2">
                                            <Switch
                                                id={`reactivate-toggle-${org.id}`}
                                                label="Reactivate Account"
                                                checked={reactivationState.orgId === org.id}
                                                onChange={() => reactivationState.orgId === org.id ? cancelReactivation() : handleReactivationToggle(org)}
                                            />
                                            {reactivationState.orgId === org.id && (
                                                <div className="pl-8 space-y-2" style={{animation: 'fade-in 0.3s ease-out forwards'}}>
                                                    <style>{`@keyframes fade-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                                                    <Input
                                                        label="Set New Subscription End Date"
                                                        type="date"
                                                        value={reactivationState.newEndDate}
                                                        onChange={(e) => setReactivationState(s => ({ ...s!, newEndDate: e.target.value }))}
                                                        min={new Date().toISOString().split('T')[0]}
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            onClick={() => reactivateOrg(org.id, reactivationState.newEndDate)}
                                                            disabled={!reactivationState.newEndDate}
                                                        >
                                                            Confirm Activation
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={cancelReactivation}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                            {reactivationState.orgId !== org.id && (
                                                 <p className="text-xs text-text-secondary mt-1">Toggle this on to set a new subscription end date and reactivate the account.</p>
                                            )}
                                        </div>
                                    )}
                                    <UserList users={org.displayUsers} openUserModal={openUserModal} deleteUser={deleteUser} />
                                </div>
                            )}
                        </Card>
                    );
                }) : (
                    <p className="text-center text-text-secondary py-8">No results found for "{searchTerm}".</p>
                )}
            </div>
        </div>
    );
};

// Extracted OrgAdminView component
const OrgAdminView: React.FC<OrgAdminViewProps> = ({
    currentUser,
    searchTerm,
    setSearchTerm,
    users,
    openUserModal,
    deleteUser,
}) => {
    const orgUsers = useMemo(() => users.filter(u => u.organizationId === currentUser?.organizationId && u.id !== currentUser.id), [users, currentUser]);
    
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return orgUsers;
        }
        const lowercasedSearch = searchTerm.toLowerCase();
        return orgUsers.filter(u => u.username.toLowerCase().includes(lowercasedSearch));
    }, [searchTerm, orgUsers]);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                    <CardTitle>Users in {currentUser?.organizationName}</CardTitle>
                    <CardDescription>Manage users for your organization.</CardDescription>
                </div>
                <Button onClick={() => openUserModal(null, currentUser?.organizationId)} className="gap-2 self-start sm:self-center"><PlusCircle className="h-4 w-4"/> Add User</Button>
            </CardHeader>
            <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary pointer-events-none" />
                    <input
                        type="text"
                        id="user-management-search-org"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 pl-10 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        aria-label="Search users"
                    />
                </div>
                <UserList users={filteredUsers} openUserModal={openUserModal} deleteUser={deleteUser} />
            </CardContent>
        </Card>
    );
};

interface PackageManagementViewProps {
    organizations: Organization[];
    //setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
    handlePackageChange: (orgId: string, newPackage: PackageName) => void;
    handleStatusToggle: (orgId: string, currentStatus: 'Active' | 'Inactive') => void;
    handleEmployeeCountChange: (orgId: string, count: string) => void;
}

const PackageManagementView: React.FC<PackageManagementViewProps> = ({
    organizations,
    setOrganizations,
    handleStatusToggle,
    handleEmployeeCountChange,
}) => {
    // const handlePackageChange = (orgId: string, newPackage: PackageName) => {
    //     setOrganizations(prevOrgs => 
    //         prevOrgs.map(org => org.id === orgId ? { ...org, package: newPackage } : org)
    //     );
    // };

    const handlePackageChange = async (orgId: string, newPackage: PackageName) => {
        try {
          const response = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ package: newPackage })
          });
    
          if (response.ok) {
            setOrganizations(prevOrgs => 
              prevOrgs.map(org => org.id === orgId ? { ...org, package: newPackage } : org)
            );
            // Alert is optional, might be too noisy for a dropdown
            console.log(`✅ Package updated for ${orgId}`);
          } else {
            const data = await response.json();
            throw new Error(data.message || 'Failed to update package');
          }
        } catch (error: any) {
          console.error('Error updating package:', error);
          alert('❌ ' + (error.message || 'Something went wrong'));
        }
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


const UserManagementPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { 
        allOrganizations: organizations, 
        setAllOrganizations: setOrganizations, 
        allUsers: users, 
        setAllUsers: setUsers 
    } = useData();
    
    const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [reactivationState, setReactivationState] = useState<{ orgId: string | null; newEndDate: string }>({ orgId: null, newEndDate: '' });
    const [superAdminTab, setSuperAdminTab] = useState<'users' | 'packages'>('users');
    const [orgAdminTab, setOrgAdminTab] = useState<'manageUsers' | 'packageDetails'>('manageUsers');
    
    const hasFullUserManagement = useMemo(() => {
        if (currentUser?.role !== 'Org Admin' || !currentUser.organizationId) return false;
        const org = organizations.find(o => o.id === currentUser.organizationId);
        if (!org) return false;
        return org.package === 'Pro' || org.package === 'Enterprise';
    }, [currentUser, organizations]);

    const openOrgModal = (org: Organization | null = null) => {
        setEditingOrg(org);
        setIsOrgModalOpen(true);
    };

    const openUserModal = (user: User | null = null, orgId?: string) => {
        setEditingUser(user);
        if (!user && orgId) {
             setEditingUser({ id: '', username: '', role: 'HR Analyst', organizationId: orgId });
        }
        setIsUserModalOpen(true);
    };

    // const handleOrgSubmit = (orgData: { name: string, duration?: number, subscriptionEndDate?: string }) => {
    //     if (editingOrg) {
    //         setOrganizations(orgs => orgs.map(o => o.id === editingOrg.id ? { 
    //             ...o, 
    //             name: orgData.name,
    //             subscriptionEndDate: orgData.subscriptionEndDate || o.subscriptionEndDate 
    //         } : o));
    //     } else {
    //         const startDate = new Date();
    //         const endDate = new Date();
    //         endDate.setMonth(startDate.getMonth() + (orgData.duration || 6));
    //         const formatDate = (date: Date) => date.toISOString().split('T')[0];

    //         const newOrg: Organization = {
    //             id: `org_${Date.now()}`,
    //             name: orgData.name,
    //             subscriptionStartDate: formatDate(startDate),
    //             subscriptionEndDate: formatDate(endDate),
    //             status: 'Active',
    //             package: 'Basic',
    //             employeeCount: 0,
    //         };
    //         setOrganizations(orgs => [...orgs, newOrg]);
    //     }
    //     setIsOrgModalOpen(false);
    // };

    useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/organizations',{
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                
                if (data.success) {
                    // Map backend data to your frontend Organization type
                    const mappedOrgs = data.data.map((org: any) => ({
                        id: org.orgId, // or org.orgId
                        name: org.name,
                        subscriptionStartDate: org.subscriptionStartDate.split('T')[0],
                        subscriptionEndDate: org.subscriptionEndDate.split('T')[0],
                        status: org.status,
                        package: org.package,
                        employeeCount: org.employeeCount || 0,
                    }));
                    setOrganizations(mappedOrgs);
                }
            } catch (error) {
                console.error('Failed to fetch organizations:', error);
            }
        };

        if (currentUser?.role === 'Super Admin') {
            fetchOrganizations();
        }
    }, [currentUser, setOrganizations]);

    const handleOrgSubmit = async (orgData: { name: string, duration?: number, subscriptionEndDate?: string }) => {
        if (editingOrg) {
          // --- START REFACTOR ---
          // This block now saves the edit to the backend
          try {
            const payload = {
              name: orgData.name,
              subscriptionEndDate: orgData.subscriptionEndDate,
            };
    
            const response = await fetch(`http://localhost:5000/api/organizations/${editingOrg.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
    
            const data = await response.json();
    
            if (!response.ok) {
              throw new Error(data.message || "Failed to update organization");
            }
            
            // Update local state *after* successful backend call
            // It's best to use the updated data returned from the server
            setOrganizations(orgs =>
              orgs.map(o =>
                o.id === editingOrg.id
                  // Assuming data.data is the updated organization object
                  ? { 
                      ...o, 
                      name: data.data.name, 
                      subscriptionEndDate: data.data.subscriptionEndDate.split('T')[0] 
                    }
                  : o
              )
            );
            alert("✅ Organization updated successfully!");
    
          } catch (error: any) {
            console.error('Error updating organization:', error);
            alert("❌ " + (error.message || "Something went wrong"));
          }
          // --- END REFACTOR ---
    
        } else {
          // This is your existing "add new organization" logic, which is correct.
          try {
            const response = await fetch("http://localhost:5000/api/organizations/add-organization", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(orgData),
            });
    
            const data = await response.json();
    
            if (!response.ok) throw new Error(data.message || "Failed to create organization");
    
            // REFACTOR: Use the data returned from the backend to set the new org
            // This ensures you have the correct orgId created by the server
            const backendOrg = data.data;
            const newOrg: Organization = {
                id: backendOrg.orgId, // Use the real orgId
                name: backendOrg.name,
                subscriptionStartDate: backendOrg.subscriptionStartDate.split('T')[0],
                subscriptionEndDate: backendOrg.subscriptionEndDate.split('T')[0],
                status: backendOrg.status,
                package: backendOrg.package,
                employeeCount: backendOrg.employeeCount || 0,
            };
    
            setOrganizations(orgs => [...orgs, newOrg]);
            alert("✅ Organization created successfully!");
          } catch (error: any) {
            console.error(error);
            alert("❌ " + (error.message || "Something went wrong"));
          }
        }
    
        setIsOrgModalOpen(false);
      };
    

    const handleUserSubmit = (userData: User) => {
        if (editingUser && editingUser.id) {
            setUsers(usrs => usrs.map(u => {
                if (u.id === userData.id) {
                    const finalUserData = { ...userData };
                    if (!finalUserData.password) {
                        finalUserData.password = u.password;
                    }
                    return finalUserData;
                }
                return u;
            }));
        } else {
            const org = organizations.find(o => o.id === userData.organizationId);
            setUsers(usrs => [...usrs, { ...userData, id: `user_${Date.now()}`, organizationName: org?.name }]);
        }
        setIsUserModalOpen(false);
    };

    const deleteOrg = async (orgId: string) => {
        if(window.confirm('Are you sure you want to delete this organization and all its users? This cannot be undone.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/hard`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ confirm: 'DELETE' })
                });
                console.log(orgId);
    
                const data = await response.json();
    
                if (data.success) {
                    setOrganizations(orgs => orgs.filter(o => o.id !== orgId));
                    setUsers(usrs => usrs.filter(u => u.organizationId !== orgId));
                    alert('✅ Organization deleted successfully!');
                } else {
                    alert('❌ ' + (data.message || 'Failed to delete organization'));
                }
            } catch (error: any) {
                console.error(error);
                alert('❌ Error deleting organization');
            }
        }
    };
    
    const deleteUser = (userId: string) => {
         if(window.confirm('Are you sure you want to delete this user?')) {
            setUsers(usrs => usrs.filter(u => u.id !== userId));
         }
    };

    const handleReactivationToggle = (org: Organization) => {
        const today = new Date();
        const sixMonthsFromNow = new Date(new Date().setMonth(today.getMonth() + 6));
        const formattedDate = sixMonthsFromNow.toISOString().split('T')[0];
        setReactivationState({ orgId: org.id, newEndDate: formattedDate });
    };
    
    const cancelReactivation = () => {
        setReactivationState({ orgId: null, newEndDate: '' });
    };
    
    const reactivateOrg = async (orgId: string, newEndDate: string) => {
        if (!newEndDate) return;
        
        try {
            const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
    
            // Also update the subscription end date
            const updateResponse = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    subscriptionEndDate: newEndDate,
                    subscriptionStartDate: new Date().toISOString().split('T')[0]
                })
            });
    
            if (response.ok && updateResponse.ok) {
                const startDate = new Date();
                const formatDate = (date: Date) => date.toISOString().split('T')[0];
                
                setOrganizations(orgs => orgs.map(o => {
                    if (o.id === orgId) {
                        return {
                            ...o,
                            status: 'Active',
                            subscriptionStartDate: formatDate(startDate),
                            subscriptionEndDate: newEndDate,
                        };
                    }
                    return o;
                }));
                cancelReactivation();
                alert('✅ Organization reactivated successfully!');
            }
        } catch (error) {
            console.error('Error reactivating organization:', error);
            alert('❌ Failed to reactivate organization');
        }
    };

    

    const handleStatusToggle = async (orgId: string, currentStatus: 'Active' | 'Inactive') => {
        if (currentStatus === 'Active') {
            if (window.confirm(`Are you sure you want to DEACTIVATE this organization? They will lose all access.`)) {
                try {
                    const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/deactivate`, {
                        method: 'PATCH',
                    });
    
                    if (response.ok) {
                        setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, status: 'Inactive' } : o));
                        alert('✅ Organization deactivated successfully!');
                    }
                } catch (error) {
                    console.error('Error deactivating organization:', error);
                    alert('❌ Failed to deactivate organization');
                }
            }
        } else {
            if (window.confirm(`Reactivating this organization will set a new 6-month subscription starting today. Continue?`)) {
                try {
                    const today = new Date();
                    const sixMonthsFromNow = new Date();
                    sixMonthsFromNow.setMonth(today.getMonth() + 6);
                    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
                    const response = await fetch(`http://localhost:5000/api/organizations/${orgId}/activate`, {
                        method: 'PATCH',
                    });
    
                    const updateResponse = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subscriptionStartDate: formatDate(today),
                            subscriptionEndDate: formatDate(sixMonthsFromNow)
                        })
                    });
    
                    if (response.ok && updateResponse.ok) {
                        setOrganizations(prev => prev.map(o => 
                            o.id === orgId 
                            ? { 
                                ...o, 
                                status: 'Active',
                                subscriptionStartDate: formatDate(today),
                                subscriptionEndDate: formatDate(sixMonthsFromNow)
                              } 
                            : o
                        ));
                        alert('✅ Organization reactivated successfully!');
                    }
                } catch (error) {
                    console.error('Error reactivating organization:', error);
                    alert('❌ Failed to reactivate organization');
                }
            }
        }
    };

    const handleEmployeeCountChange = async (orgId: string, count: string) => {
        const numCount = parseInt(count, 10);
        
        try {
            const response = await fetch(`http://localhost:5000/api/organizations/${orgId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeCount: isNaN(numCount) ? 0 : numCount })
            });
    
            if (response.ok) {
                setOrganizations(prevOrgs => 
                    prevOrgs.map(org => org.id === orgId ? { ...org, employeeCount: isNaN(numCount) ? undefined : numCount } : org)
                );
            }
        } catch (error) {
            console.error('Error updating employee count:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <UserCog className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">User Management</h2>
                    <p className="text-text-secondary mt-1">
                        {currentUser?.role === 'Super Admin' ? 'Manage all organizations and their users.' : 'Manage users and view package details for your organization.'}
                    </p>
                 </div>
            </div>
            
            {currentUser?.role === 'Super Admin' && (
                <div className="border-b border-border">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        <button onClick={() => setSuperAdminTab('users')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${superAdminTab === 'users' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}><UserCog className="mr-2 h-5 w-5"/> Organizations & Users</button>
                        <button onClick={() => setSuperAdminTab('packages')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${superAdminTab === 'packages' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}><Package className="mr-2 h-5 w-5"/> Package Management</button>
                    </nav>
                </div>
            )}
            
            <div className="pt-4">
                {currentUser?.role === 'Super Admin' && (
                    <>
                        {superAdminTab === 'users' && (
                            <SuperAdminView
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                organizations={organizations}
                                users={users}
                                openOrgModal={openOrgModal}
                                deleteOrg={deleteOrg}
                                openUserModal={openUserModal}
                                deleteUser={deleteUser}
                                expandedOrg={expandedOrg}
                                setExpandedOrg={setExpandedOrg}
                                reactivateOrg={reactivateOrg}
                                reactivationState={reactivationState}
                                handleReactivationToggle={handleReactivationToggle}
                                cancelReactivation={cancelReactivation}
                                setReactivationState={setReactivationState}
                            />
                        )}
                        {superAdminTab === 'packages' && (
                            <PackageManagementView 
                                organizations={organizations} 
                                setOrganizations={setOrganizations} 
                                handleStatusToggle={handleStatusToggle}
                                handleEmployeeCountChange={handleEmployeeCountChange}
                            />
                        )}
                    </>
                )}

                {currentUser?.role === 'Org Admin' && (
                    hasFullUserManagement ? (
                        <>
                            <div className="border-b border-border">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <button onClick={() => setOrgAdminTab('manageUsers')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${orgAdminTab === 'manageUsers' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}><Users className="mr-2 h-5 w-5"/> Manage Users</button>
                                    <button onClick={() => setOrgAdminTab('packageDetails')} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${orgAdminTab === 'packageDetails' ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}><Package className="mr-2 h-5 w-5"/> Package Details</button>
                                </nav>
                            </div>
                            <div className="pt-4">
                                {orgAdminTab === 'manageUsers' && (
                                    <OrgAdminView
                                        currentUser={currentUser}
                                        searchTerm={searchTerm}
                                        setSearchTerm={setSearchTerm}
                                        users={users}
                                        openUserModal={openUserModal}
                                        deleteUser={deleteUser}
                                    />
                                )}
                                {orgAdminTab === 'packageDetails' && (
                                    <PackageDetailsView />
                                )}
                            </div>
                        </>
                    ) : (
                        <PackageDetailsView />
                    )
                )}
            </div>

            {isOrgModalOpen && <OrgFormModal org={editingOrg} onSubmit={handleOrgSubmit} onClose={() => setIsOrgModalOpen(false)} />}
            {isUserModalOpen && <UserFormModal user={editingUser} allOrgs={organizations} allUsers={users} onSubmit={handleUserSubmit} onClose={() => setIsUserModalOpen(false)} currentUserRole={currentUser!.role} />}
        </div>
    );
};

const UserList: React.FC<{users: User[], openUserModal: (u: User) => void, deleteUser: (id: string) => void}> = ({users, openUserModal, deleteUser}) => (
     <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead className="text-xs text-text-secondary uppercase"><tr>
                <th className="py-2 px-4 text-left">Username</th><th className="py-2 px-4 text-left">Role</th><th className="py-2 px-4 text-right">Actions</th>
            </tr></thead>
            <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b border-border last:border-b-0">
                        <td className="py-2 px-4 font-semibold text-text-primary">{user.username}</td>
                        <td className="py-2 px-4 text-text-secondary">{user.role}</td>
                        <td className="py-2 px-4 text-right flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => openUserModal(user)}><Edit className="h-3 w-3"/></Button>
                            <Button size="sm" variant="ghost" onClick={() => deleteUser(user.id)}><Trash2 className="h-3 w-3 text-red-400"/></Button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {users.length === 0 && <p className="text-center text-text-secondary py-4">No users found.</p>}
    </div>
);

const OrgFormModal: React.FC<{
    org: Organization | null, 
    onSubmit: (data: { name: string, duration?: number, subscriptionEndDate?: string }) => void, 
    onClose: () => void
}> = ({ org, onSubmit, onClose }) => {
    const [name, setName] = useState(org?.name || '');
    const [duration, setDuration] = useState(6);
    const [endDate, setEndDate] = useState(org?.subscriptionEndDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (org) {
            onSubmit({ name, subscriptionEndDate: endDate });
        } else {
            onSubmit({ name, duration });
        }
    };
    
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{org ? 'Edit' : 'Add'} Organization</CardTitle>
                        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-border"><X className="h-4 w-4"/></button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input label="Organization Name" value={name} onChange={e => setName(e.target.value)} required />
                        {org ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Subscription Start Date</label>
                                    <p className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-secondary cursor-not-allowed">{org.subscriptionStartDate}</p>
                                </div>
                                <Input 
                                    label="Subscription End Date" 
                                    type="date" 
                                    value={endDate} 
                                    onChange={e => setEndDate(e.target.value)} 
                                    min={todayStr}
                                    required 
                                />
                            </>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Subscription Period</label>
                                <select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary">
                                    <option value={6}>6 Months</option>
                                    <option value={12}>12 Months</option>
                                </select>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 flex justify-end gap-2 border-t border-border">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const sanitizeOrgNameForDomain = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const UserFormModal: React.FC<{user: User | null, allOrgs: Organization[], allUsers: User[], onSubmit: (user: User) => void, onClose: () => void, currentUserRole: UserRole}> = ({ user, allOrgs, allUsers, onSubmit, onClose, currentUserRole }) => {
    const [formData, setFormData] = useState<Partial<User>>(user || { role: 'HR Analyst', password: '' });
    const [localUsername, setLocalUsername] = useState(user?.username.split('@')[0] || '');
    const [error, setError] = useState('');
    
    const roleOptions: UserRole[] = currentUserRole === 'Super Admin' 
        ? ['Org Admin', 'HR Analyst', 'Executive']
        : ['HR Analyst', 'Executive'];

    const { domainPart, targetOrg } = useMemo(() => {
        const orgId = formData.organizationId;
        const org = allOrgs.find(o => o.id === orgId);
        if (!org) return { domainPart: 'select an org', targetOrg: null };
        return { domainPart: `${sanitizeOrgNameForDomain(org.name)}.com`, targetOrg: org };
    }, [formData.organizationId, allOrgs]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!user?.id && !formData.password) {
            setError('Password is required for new users.');
            return;
        }
        
        if (!targetOrg) {
            setError("An organization must be selected.");
            return;
        }

        const fullUsername = `${localUsername}@${domainPart}`;

        const limits = APP_PACKAGES[targetOrg.package].roleLimits;

        if (limits) {
            const orgUsers = allUsers.filter(u => u.organizationId === targetOrg.id);
            const roleCounts = orgUsers.reduce((acc, u) => {
                acc[u.role] = (acc[u.role] || 0) + 1;
                return acc;
            }, {} as Record<UserRole, number>);

            const newRole = formData.role!;
            const limitForNewRole = limits[newRole as keyof typeof limits];

            if (limitForNewRole !== undefined) {
                if (user && user.id) { // Editing an existing user
                    const oldRole = user.role;
                    if (oldRole !== newRole) { // Role is changing
                        const currentCount = roleCounts[newRole] || 0;
                        if (currentCount + 1 > limitForNewRole) {
                            setError(`User limit for role '${newRole}' (${limitForNewRole}) has been reached for this organization.`);
                            return;
                        }
                    }
                } else { // Adding a new user
                    const currentCount = roleCounts[newRole] || 0;
                    if (currentCount + 1 > limitForNewRole) {
                        setError(`User limit for role '${newRole}' (${limitForNewRole}) has been reached for this organization.`);
                        return;
                    }
                }
            }
        }
        
        onSubmit({ ...formData, username: fullUsername } as User);
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                 <form onSubmit={handleSubmit}>
                    <CardHeader>
                        <CardTitle>{user?.id ? 'Edit' : 'Add'} User</CardTitle>
                         <button onClick={onClose} type="button" className="absolute top-4 right-4 p-1 rounded-full hover:bg-border"><X className="h-4 w-4"/></button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {error && <p className="text-sm text-red-400 flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</p>}
                        
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                            <div className="flex">
                                <input
                                    value={localUsername}
                                    onChange={e => setLocalUsername(e.target.value)}
                                    className="w-full bg-background border border-border rounded-l-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    required
                                />
                                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-border bg-card text-text-secondary text-sm">
                                    @{domainPart}
                                </span>
                            </div>
                        </div>

                        <Input 
                            label={user?.id ? "New Password (leave blank to keep unchanged)" : "Password"}
                            type="password"
                            value={formData.password || ''}
                            onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                            required={!user?.id}
                        />
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                            <select value={formData.role} onChange={e => setFormData(f => ({...f, role: e.target.value as UserRole}))} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary">
                                {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        {currentUserRole === 'Super Admin' && (
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Organization</label>
                                <select value={formData.organizationId || ''} onChange={e => setFormData(f => ({...f, organizationId: e.target.value}))} required className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary">
                                    <option value="" disabled>Select an organization</option>
                                    {allOrgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                                </select>
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 flex justify-end gap-2 border-t border-border">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UserManagementPage;

// function useEffect(arg0: () => void, arg1: any[]) {
//     throw new Error('Function not implemented.');
// }
