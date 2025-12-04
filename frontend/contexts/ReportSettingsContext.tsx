import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';

export interface ScarcityLevel {
  threshold: number; // max number of people for this level
  color: string;
}

interface ReportSettingsContextType {
  skillScarcityKey: ScarcityLevel[];
  updateSkillScarcityKey: (newKey: ScarcityLevel[]) => void;
}

const ReportSettingsContext = createContext<ReportSettingsContextType | undefined>(undefined);

const DEFAULT_SCARCITY_KEY: ScarcityLevel[] = [
    { threshold: 5, color: '#ef4444' }, // Red
    { threshold: 35, color: '#f97316' }, // Orange
    { threshold: 65, color: '#84cc16' }, // Lime Green
    { threshold: Infinity, color: '#16a34a' }, // Dark Green
];

const STORAGE_KEY = 'report-settings';

export const ReportSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [skillScarcityKey, setSkillScarcityKey] = useState<ScarcityLevel[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Basic validation
                if (Array.isArray(parsed) && parsed.every(item => typeof item.threshold === 'number' && typeof item.color === 'string')) {
                    return parsed;
                }
            }
            return DEFAULT_SCARCITY_KEY;
        } catch (error) {
            console.error("Failed to parse report settings from localStorage", error);
            return DEFAULT_SCARCITY_KEY;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(skillScarcityKey));
        } catch (error) {
            console.error("Failed to save report settings to localStorage", error);
        }
    }, [skillScarcityKey]);

    const updateSkillScarcityKey = (newKey: ScarcityLevel[]) => {
        setSkillScarcityKey(newKey);
    };

    const value = useMemo(() => ({
        skillScarcityKey,
        updateSkillScarcityKey,
    }), [skillScarcityKey]);

    return (
        <ReportSettingsContext.Provider value={value}>
            {children}
        </ReportSettingsContext.Provider>
    );
};

export const useReportSettings = (): ReportSettingsContextType => {
    const context = useContext(ReportSettingsContext);
    if (context === undefined) {
        throw new Error('useReportSettings must be used within a ReportSettingsProvider');
    }
    return context;
};
