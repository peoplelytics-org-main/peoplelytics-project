

import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import type { Theme, Currency } from '../types';
import { THEMES } from '../constants';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    mode: 'light' | 'dark';
    setMode: (mode: 'light' | 'dark') => void;
    currency: Currency;
    setCurrency: (currency: Currency) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        try {
            const storedThemeName = localStorage.getItem('app-theme');
            const storedTheme = THEMES.find(t => t.name === storedThemeName);
            return storedTheme || THEMES[0];
        } catch (error) {
            return THEMES[0];
        }
    });

    const [mode, setMode] = useState<'light' | 'dark'>(() => {
        try {
            const storedMode = localStorage.getItem('app-mode');
            return storedMode === 'light' ? 'light' : 'dark';
        } catch (error) {
            return 'dark'; // default to dark
        }
    });

    const [currency, setCurrency] = useState<Currency>(() => {
        try {
            const storedCurrency = localStorage.getItem('app-currency') as Currency;
            return ['PKR', 'USD', 'EUR', 'GBP'].includes(storedCurrency) ? storedCurrency : 'PKR';
        } catch (error) {
            return 'PKR';
        }
    });

    useEffect(() => {
        localStorage.setItem('app-theme', theme.name);
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
            // FIX: Added type assertion to resolve 'unknown' type error.
            root.style.setProperty(key, value as string);
        });
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('app-mode', mode);
        const root = document.documentElement;
        if (mode === 'light') {
            root.style.setProperty('--color-background', '#f8fafc');
            root.style.setProperty('--color-card', '#ffffff');
            root.style.setProperty('--color-card-foreground', '#0f172a');
            root.style.setProperty('--color-text-primary', '#1e293b');
            root.style.setProperty('--color-text-secondary', '#64748b');
            root.style.setProperty('--color-border', '#e2e8f0');
        } else {
            // Dark mode (current theme)
            root.style.setProperty('--color-background', '#0a0a0a');
            root.style.setProperty('--color-card', '#1a1a1a');
            root.style.setProperty('--color-card-foreground', '#f8fafc');
            root.style.setProperty('--color-text-primary', '#f8fafc');
            root.style.setProperty('--color-text-secondary', '#a1a1aa');
            root.style.setProperty('--color-border', '#27272a');
        }
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('app-currency', currency);
    }, [currency]);


    const value = useMemo(() => ({
        theme,
        setTheme,
        mode,
        setMode,
        currency,
        setCurrency,
    }), [theme, mode, setMode, currency]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};