import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { AVAILABLE_WIDGETS } from '../constants';

export interface WidgetConfig {
    visible: boolean;
    priority: number;
    size: 'small' | 'medium' | 'large';
}
type WidgetConfigs = Record<string, WidgetConfig>;

interface DashboardConfigContextType {
    widgetConfigs: WidgetConfigs;
    updateWidgetConfig: (widgetId: string, configUpdate: Partial<WidgetConfig>) => void;
    setAllWidgetSizes: (size: 'small' | 'medium' | 'large') => void;
    resetWidgetSizesToDefault: () => void;
}

const DashboardConfigContext = createContext<DashboardConfigContextType | undefined>(undefined);

// Define and export widgets that should remain large
export const FIXED_LARGE_WIDGETS = ['kpi_cards', 'headcount_heatmap', 'nine_box_grid', 'talent_risk_matrix'];

const getDefaultWidgetConfigs = (): WidgetConfigs => {
    return AVAILABLE_WIDGETS.reduce((acc, widget, index) => {
        let defaultSize: 'small' | 'medium' | 'large' = 'small';
        if (['headcount_heatmap', 'nine_box_grid', 'talent_risk_matrix', 'manager_performance', 'performance_calibration', 'kpi_cards', 'ai_story', 'succession_gaps'].includes(widget.id)) {
            defaultSize = 'large';
        } else if (['turnover_trend', 'department_headcount', 'performance_distribution', 'turnover_by_dept', 'attendance_trend', 'recruitment_funnel', 'retention_by_dept', 'burnout_hotspots', 'pay_for_performance', 'performance_trend', 'open_pos_by_dept', 'open_pos_by_title', 'turnover_by_job_title', 'turnover_by_location'].includes(widget.id)) {
            defaultSize = 'medium';
        }

        acc[widget.id] = { 
            visible: true, 
            priority: (index + 1) * 10,
            size: defaultSize,
        };
        
        // Force large size for fixed widgets, overriding defaults
        if (FIXED_LARGE_WIDGETS.includes(widget.id)) {
            acc[widget.id].size = 'large';
        }

        return acc;
    }, {} as WidgetConfigs);
};

export const DashboardConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfigs>(() => {
        try {
            const storedConfig = localStorage.getItem('dashboard-config');
            if (storedConfig) {
                const parsed = JSON.parse(storedConfig);
                const defaults = getDefaultWidgetConfigs();
                Object.keys(defaults).forEach(key => {
                    if (!parsed[key]) {
                        parsed[key] = defaults[key];
                    } else {
                        // Ensure all properties exist, especially newly added ones like 'size'
                        if (parsed[key].size === undefined) {
                            parsed[key].size = defaults[key].size;
                        }
                    }
                });
                return parsed;
            }
        } catch (error) {
            console.error("Failed to parse dashboard config from localStorage", error);
        }
        return getDefaultWidgetConfigs();
    });

    useEffect(() => {
        try {
            localStorage.setItem('dashboard-config', JSON.stringify(widgetConfigs));
        } catch (error) {
            console.error("Failed to save dashboard config to localStorage", error);
        }
    }, [widgetConfigs]);

    const updateWidgetConfig = (widgetId: string, configUpdate: Partial<WidgetConfig>) => {
        setWidgetConfigs(prev => ({
            ...prev,
            [widgetId]: {
                ...(prev[widgetId] || { visible: true, priority: 999, size: 'small' }), // Fallback for safety
                ...configUpdate,
            },
        }));
    };

    const setAllWidgetSizes = (size: 'small' | 'medium' | 'large') => {
        setWidgetConfigs(prevConfigs => {
            const newConfigs: WidgetConfigs = {};
            for (const widgetId in prevConfigs) {
                // If the widget is in the fixed list, force its size to large. Otherwise, update it.
                if (FIXED_LARGE_WIDGETS.includes(widgetId)) {
                    newConfigs[widgetId] = { ...prevConfigs[widgetId], size: 'large' };
                } else {
                    newConfigs[widgetId] = { ...prevConfigs[widgetId], size: size };
                }
            }
            return newConfigs;
        });
    };

    const resetWidgetSizesToDefault = () => {
        const defaultConfigs = getDefaultWidgetConfigs();
        setWidgetConfigs(prevConfigs => {
            const newConfigs: WidgetConfigs = {};
            for (const widgetId in prevConfigs) {
                if (defaultConfigs[widgetId]) {
                    newConfigs[widgetId] = {
                        ...prevConfigs[widgetId],
                        size: defaultConfigs[widgetId].size, // This resets fixed widgets to large
                    };
                } else {
                    newConfigs[widgetId] = prevConfigs[widgetId];
                }
            }
            return newConfigs;
        });
    };

    const value = useMemo(() => ({
        widgetConfigs,
        updateWidgetConfig,
        setAllWidgetSizes,
        resetWidgetSizesToDefault,
    }), [widgetConfigs]);

    return (
        <DashboardConfigContext.Provider value={value}>
            {children}
        </DashboardConfigContext.Provider>
    );
};

export const useDashboardConfig = (): DashboardConfigContextType => {
    const context = useContext(DashboardConfigContext);
    if (context === undefined) {
        throw new Error('useDashboardConfig must be used within a DashboardConfigProvider');
    }
    return context;
};