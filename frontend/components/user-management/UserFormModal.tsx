import React, { useState, useMemo } from 'react';
import type { Organization, User, UserRole, AppPackage } from '../../types';
import { APP_PACKAGES } from '../../constants';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { X, AlertCircle } from 'lucide-react';

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

export default UserFormModal;
