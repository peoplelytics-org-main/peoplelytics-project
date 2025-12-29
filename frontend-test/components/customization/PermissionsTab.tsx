import React from 'react';
import { usePermissions } from '../../contexts/PermissionContext';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Switch from '../ui/Switch';
import { NAV_ITEMS } from '../../constants';
import type { UserRole, ControllableFeature } from '../../types';

const controllableFeatures = NAV_ITEMS
    .filter(item => item.featureFlag)
    .map(item => ({
        flag: item.featureFlag as ControllableFeature,
        name: item.name,
        description: item.description || `Toggle access to the ${item.name} module.`
    }))
    // Remove duplicates
    .filter((v,i,a)=>a.findIndex(t=>(t.flag === v.flag))===i);

const rolesToManage: UserRole[] = ['Org Admin', 'HR Analyst', 'Executive'];

const PermissionsTab: React.FC = () => {
    const { permissions, updatePermission } = usePermissions();

    return (
        <div className="space-y-6">
            {rolesToManage.map(role => (
                <Card key={role}>
                    <CardHeader>
                        <CardTitle>{role} Permissions</CardTitle>
                        <CardDescription>Control what users with the {role} role can see and do.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {role !== 'Org Admin' && (
                            <div className="p-3 bg-background rounded-md border border-border">
                                <Switch
                                    id={`${role}-readonly`}
                                    label="Read-Only Mode"
                                    checked={permissions[role]?.isReadOnly || false}
                                    onChange={(e) => updatePermission(role, 'isReadOnly', e.target.checked)}
                                />
                                <p className="text-xs text-text-secondary mt-1 pl-8">
                                    When enabled, users can view dashboards and reports but cannot upload or modify any data.
                                </p>
                            </div>
                        )}
                        {controllableFeatures
                            .filter(feature => {
                                if (role === 'Executive') {
                                    return feature.flag !== 'hasUserManagementAccess' && feature.flag !== 'hasCustomization';
                                }
                                return true;
                            })
                            .map(feature => (
                            <div key={feature.flag} className="p-3 bg-background rounded-md border border-border">
                                <Switch
                                    id={`${role}-${feature.flag}`}
                                    label={feature.name}
                                    checked={permissions[role]?.[feature.flag] ?? true}
                                    onChange={(e) => updatePermission(role, feature.flag, e.target.checked)}
                                    // Org Admin must have customization access
                                    disabled={role === 'Org Admin' && feature.flag === 'hasCustomization'}
                                />
                                <p className="text-xs text-text-secondary mt-1 pl-8">{feature.description}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PermissionsTab;