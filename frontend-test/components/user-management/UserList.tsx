import React from 'react';
import type { User } from '../../types';
import Button from '../ui/Button';
import { Edit, Trash2 } from 'lucide-react';

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

export default UserList;
