import React, { useMemo } from 'react';
import type { Organization, User } from '../../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Switch from '../ui/Switch';
import UserList from './UserList';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronUp, Search } from 'lucide-react';

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

const getStatusBadgeClasses = (status: 'Active' | 'Inactive' | string) => {
    switch (status) {
        case 'Active': return 'bg-green-900/50 text-green-300 border border-green-500/30';
        case 'Inactive': return 'bg-red-900/50 text-red-300 border border-red-500/30';
        default: return 'bg-gray-700 text-gray-300 border-gray-500/30';
    }
};

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

export default SuperAdminView;
