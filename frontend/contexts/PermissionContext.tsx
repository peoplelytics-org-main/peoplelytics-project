import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { Permissions, UserRole, ControllableFeature } from '../types';

interface PermissionContextType {
    permissions: Permissions;
    updatePermission: (role: UserRole, key: ControllableFeature | 'isReadOnly', value: boolean) => void;
    isFeatureAllowed: (role: UserRole, feature: ControllableFeature) => boolean;
    isRoleReadOnly: (role: UserRole) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

const STORAGE_KEY = 'role-permissions';

const DEFAULT_PERMISSIONS: Permissions = {
    'Org Admin': {
        isReadOnly: false,
        hasPredictiveAnalytics: true,
        hasAIAssistant: true,
        hasROIAnalyzer: true,
        hasCustomization: true,
        hasAdvancedReports: true,
        hasIntegrations: true,
        hasAIStory: true,
        hasKeyDriverAnalysis: true,
        hasSuccessionPlanning: true,
        hasUserManagementAccess: true,
        hasEmployeeMetrics: true,
        hasHRMetrics: true,
    },
    'HR Analyst': {
        isReadOnly: false,
        hasPredictiveAnalytics: true,
        hasAIAssistant: true,
        hasROIAnalyzer: true,
        hasCustomization: false,
        hasAdvancedReports: true,
        hasIntegrations: false,
        hasAIStory: true,
        hasKeyDriverAnalysis: true,
        hasSuccessionPlanning: true,
        hasUserManagementAccess: false,
        hasEmployeeMetrics: true,
        hasHRMetrics: true,
    },
    'Executive': {
        isReadOnly: true,
        hasPredictiveAnalytics: false,
        hasAIAssistant: true,
        hasROIAnalyzer: false,
        hasCustomization: false,
        hasAdvancedReports: true,
        hasIntegrations: false,
        hasAIStory: true,
        hasKeyDriverAnalysis: false,
        hasSuccessionPlanning: true,
        hasUserManagementAccess: false,
    },
};

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [permissions, setPermissions] = useState<Permissions>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure new permissions are added
                return {
                    ...DEFAULT_PERMISSIONS,
                    'Org Admin': { ...DEFAULT_PERMISSIONS['Org Admin'], ...parsed['Org Admin'] },
                    'HR Analyst': { ...DEFAULT_PERMISSIONS['HR Analyst'], ...parsed['HR Analyst'] },
                    'Executive': { ...DEFAULT_PERMISSIONS['Executive'], ...parsed['Executive'] },
                };
            }
        } catch (error) {
            console.error("Failed to load permissions from localStorage", error);
        }
        return DEFAULT_PERMISSIONS;
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(permissions));
        } catch (error) {
            console.error("Failed to save permissions to localStorage", error);
        }
    }, [permissions]);

    const updatePermission = (role: UserRole, key: ControllableFeature | 'isReadOnly', value: boolean) => {
        setPermissions(prev => ({
            ...prev,
            [role]: {
                ...prev[role],
                [key]: value,
            },
        }));
    };

    const isFeatureAllowed = (role: UserRole, feature: ControllableFeature): boolean => {
        return permissions[role]?.[feature] ?? true; // Default to allowed if not specified
    };
    
    const isRoleReadOnly = (role: UserRole): boolean => {
        return permissions[role]?.isReadOnly ?? false; // Default to not read-only
    };

    const value = useMemo(() => ({
        permissions,
        updatePermission,
        isFeatureAllowed,
        isRoleReadOnly,
    }), [permissions]);

    return (
        <PermissionContext.Provider value={value}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = (): PermissionContextType => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};