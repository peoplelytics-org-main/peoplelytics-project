import React, { useMemo } from 'react';
import type { User } from '../../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import UserList from './UserList';
import { PlusCircle, Search } from 'lucide-react';

interface OrgAdminViewProps {
    currentUser: User;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    users: User[];
    openUserModal: (user: User | null, orgId?: string) => void;
    deleteUser: (userId: string) => void;
}

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

export default OrgAdminView;
