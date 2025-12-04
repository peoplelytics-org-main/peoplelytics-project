import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { ExitInterviewAnalysis } from '../types';
import { MOCK_EXIT_INTERVIEW_ANALYSES } from '../constants/data';

interface AnalysisContextType {
    analyses: ExitInterviewAnalysis[];
    addAnalysis: (analysis: ExitInterviewAnalysis) => void;
    clearAnalyses: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const STORAGE_KEY = 'exit-interview-analyses';

export const AnalysisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [analyses, setAnalyses] = useState<ExitInterviewAnalysis[]>(() => {
        try {
            const storedAnalyses = localStorage.getItem(STORAGE_KEY);
            if (storedAnalyses) {
                const parsed = JSON.parse(storedAnalyses);
                if (Array.isArray(parsed)) {
                    return parsed;
                }
            }
            // If there's no stored data or it's invalid, fall back to mock data.
            return MOCK_EXIT_INTERVIEW_ANALYSES;
        } catch (error) {
            console.error("Failed to parse analyses from localStorage", error);
            // Fallback to mock data if parsing fails
            return MOCK_EXIT_INTERVIEW_ANALYSES;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
        } catch (error) {
            console.error("Failed to save analyses to localStorage", error);
        }
    }, [analyses]);

    const addAnalysis = (analysis: ExitInterviewAnalysis) => {
        setAnalyses(prev => [analysis, ...prev]);
    };

    const clearAnalyses = () => {
        setAnalyses([]);
    };

    const value = useMemo(() => ({
        analyses,
        addAnalysis,
        clearAnalyses,
    }), [analyses]);

    return (
        <AnalysisContext.Provider value={value}>
            {children}
        </AnalysisContext.Provider>
    );
};

export const useAnalysis = (): AnalysisContextType => {
    const context = useContext(AnalysisContext);
    if (context === undefined) {
        throw new Error('useAnalysis must be used within an AnalysisProvider');
    }
    return context;
};