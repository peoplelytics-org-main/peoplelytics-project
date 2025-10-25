import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import type { UserRole, AppPackage } from '../types';
import UpgradePlanView from './ui/UpgradePlanView';

interface RoleBasedGuardProps {
    allowedRoles: UserRole[];
    children: React.ReactNode;
    featureFlag?: keyof AppPackage['features'];
    featureName?: string;
    checkHeadcountLimit?: boolean;
}

const RoleBasedGuard: React.FC<RoleBasedGuardProps> = ({ allowedRoles, children, featureFlag, featureName, checkHeadcountLimit = false }) => {
    const { currentUser } = useAuth();
    const { allOrganizations, currentPackageFeatures, currentOrgHeadcount, currentOrgHeadcountLimit } = useData();
    
    // Super Admins should have access to everything, bypassing all other checks.
    if (currentUser?.role === 'Super Admin') {
        return <>{children}</>;
    }

    if (!currentUser || !allowedRoles.includes(currentUser.role)) {
        return (
            <div className="flex items-center justify-center h-full text-center">
                <div>
                    <h3 className="text-2xl font-bold text-red-400">Access Denied</h3>
                    <p className="text-text-secondary">You do not have permission to view this page.</p>
                </div>
            </div>
        );
    }

    if (currentUser.organizationId) {
        const org = allOrganizations.find(o => o.id === currentUser.organizationId);
        if (org && org.status === 'Inactive') {
            return (
                <div className="flex items-center justify-center h-full text-center">
                    <div>
                        <h3 className="text-2xl font-bold text-red-400">Account Deactivated</h3>
                        <p className="text-text-secondary">Your organization's subscription has expired. Please contact an administrator to reactivate your account.</p>
                    </div>
                </div>
            );
        }
    }

    // FIX: Removed redundant check for 'Super Admin' as it's handled by the early return above.
    if (checkHeadcountLimit && currentOrgHeadcount > currentOrgHeadcountLimit) {
        return <UpgradePlanView featureName={`a higher headcount limit (current: ${currentOrgHeadcount}/${currentOrgHeadcountLimit})`} />;
    }

    // FIX: Removed redundant check for 'Super Admin' as it's handled by the early return above.
    const isFeatureBlocked = featureFlag &&
                             !currentPackageFeatures?.[featureFlag];

    if (isFeatureBlocked) {
        return <UpgradePlanView featureName={featureName || 'This'} />;
    }

    return <>{children}</>;
};

export default RoleBasedGuard;