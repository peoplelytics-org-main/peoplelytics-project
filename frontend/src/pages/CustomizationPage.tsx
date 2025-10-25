



import React, { useState } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../contexts/ThemeContext';
import { useDashboardConfig, FIXED_LARGE_WIDGETS } from '../contexts/DashboardConfigContext';
import { THEMES, AVAILABLE_WIDGETS } from '../constants';
import Switch from '../components/ui/Switch';
import { Palette, LayoutDashboard, Check, Sun, Moon, DollarSign, X, Settings } from 'lucide-react';
import type { Currency, DashboardWidget } from '../types';
import { useReportSettings } from '../contexts/ReportSettingsContext';

const CustomizationPage: React.FC = () => {
    const { theme, setTheme, mode, setMode, currency, setCurrency } = useTheme();
    const { widgetConfigs, updateWidgetConfig } = useDashboardConfig();
    const { skillScarcityKey, updateSkillScarcityKey } = useReportSettings();

    const [activeTab, setActiveTab] = useState('appearance');
    
    const toggleMode = () => {
        setMode(mode === 'dark' ? 'light' : 'dark');
    };
    
    const sortedWidgets = AVAILABLE_WIDGETS.sort((a,b) => (widgetConfigs[a.id]?.priority || 999) - (widgetConfigs[b.id]?.priority || 999));

    const handleScarcityChange = (index: number, field: 'threshold' | 'color', value: string) => {
        const newKey = [...skillScarcityKey];
        const updatedLevel = { ...newKey[index] };

        if (field === 'threshold') {
            const numValue = parseInt(value, 10);
            if (!isNaN(numValue) && numValue > 0) {
                updatedLevel.threshold = numValue;
            }
        } else if (field === 'color') {
            updatedLevel.color = value;
        }

        newKey[index] = updatedLevel;
        updateSkillScarcityKey(newKey);
    };

    const tabs = [
        { id: 'appearance', label: 'App Appearance', icon: Palette },
        { id: 'localization', label: 'Localization', icon: DollarSign },
        { id: 'widgets', label: 'Dashboard Widgets', icon: LayoutDashboard },
        { id: 'reports', label: 'Report Settings', icon: Settings }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <Palette className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Customization</h2>
                    <p className="text-text-secondary mt-1">Personalize your dashboard layout, theme, and report settings.</p>
                 </div>
            </div>

            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>

            <div className="pt-4">
                {activeTab === 'appearance' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5"/> App Appearance</CardTitle>
                            <CardDescription>Select a mode (Day/Night) and a color scheme for the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md mb-6">
                                <h4 className="font-semibold text-text-primary mb-2">Display Mode</h4>
                                <div className="p-3 bg-background rounded-md border border-border">
                                    <label htmlFor="day-night-mode" className="flex items-center justify-between cursor-pointer">
                                        <span className="text-sm font-medium text-text-primary flex items-center gap-2">
                                            {mode === 'dark' ? <Moon className="h-5 w-5 text-primary-400"/> : <Sun className="h-5 w-5 text-primary-400"/>}
                                            {mode === 'dark' ? 'Night Mode' : 'Day Mode'}
                                        </span>
                                        <div className="relative">
                                            <input
                                            id="day-night-mode"
                                            type="checkbox"
                                            className="sr-only"
                                            checked={mode === 'dark'}
                                            onChange={toggleMode}
                                            />
                                            <div className={`block w-10 h-6 rounded-full transition-colors ${mode === 'dark' ? 'bg-primary-600' : 'bg-border'}`}></div>
                                            <div
                                            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                                                mode === 'dark' ? 'transform translate-x-full' : ''
                                            }`}
                                            ></div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <h4 className="font-semibold text-text-primary mb-2">Accent Color</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {THEMES.map((t) => (
                                    <button key={t.name} onClick={() => setTheme(t)} className="text-left relative">
                                        <div className="p-4 rounded-lg border-2 bg-card" style={{ borderColor: theme.name === t.name ? t.colors['--color-primary-500'] : 'transparent' }}>
                                            <div className="flex gap-2">
                                                <div className="w-6 h-6 rounded-full" style={{backgroundColor: t.colors['--color-primary-500']}}></div>
                                                <div className="w-6 h-6 rounded-full" style={{backgroundColor: t.colors['--color-primary-700']}}></div>
                                                <div className="w-6 h-6 rounded-full" style={{backgroundColor: t.colors['--color-primary-300']}}></div>
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-text-primary">{t.name}</p>
                                        </div>
                                        {theme.name === t.name && <div className="absolute top-2 right-2 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center text-white"><Check className="h-3 w-3" /></div>}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'localization' && (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5"/> Localization</CardTitle>
                            <CardDescription>Set your preferred currency for display across the application.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-md">
                                <h4 className="font-semibold text-text-primary mb-2">Currency</h4>
                                <div className="p-3 bg-background rounded-md border border-border">
                                    <label htmlFor="currency-select" className="block text-sm font-medium text-text-secondary mb-1">Currency Symbol</label>
                                    <select
                                        id="currency-select"
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as Currency)}
                                        className="w-full bg-card border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    >
                                        <option value="PKR">Pakistani Rupee (Rs)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                        <option value="GBP">British Pound (£)</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'widgets' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><LayoutDashboard className="h-5 w-5"/> Dashboard Widgets</CardTitle>
                            <CardDescription>Enable, disable, and set the display order and size for widgets on the Executive Dashboard.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {sortedWidgets.map((widget: DashboardWidget) => {
                                const config = widgetConfigs[widget.id] ?? { visible: true, priority: 999, size: 'small' };
                                const isFixed = FIXED_LARGE_WIDGETS.includes(widget.id);
                                return (
                                    <div key={widget.id} className="p-3 bg-background rounded-md border border-border">
                                        <div className="flex flex-col sm:flex-row items-start gap-4">
                                            <div className="flex-1">
                                                <Switch
                                                    id={widget.id}
                                                    label={widget.name}
                                                    checked={config.visible}
                                                    onChange={() => updateWidgetConfig(widget.id, { visible: !config.visible })}
                                                />
                                                <p className="text-xs text-text-secondary mt-1">{widget.description}</p>
                                            </div>
                                            <div className="w-full sm:w-24">
                                                <label htmlFor={`${widget.id}-priority`} className="block text-xs font-medium text-text-secondary mb-1">Display Order</label>
                                                <input
                                                    id={`${widget.id}-priority`}
                                                    type="number"
                                                    min="1"
                                                    step="10"
                                                    value={config.priority}
                                                    onChange={(e) => {
                                                        const priority = parseInt(e.target.value, 10);
                                                        if (!isNaN(priority)) {
                                                            updateWidgetConfig(widget.id, { priority });
                                                        }
                                                    }}
                                                    className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-border/50">
                                            <label className="block text-xs font-medium text-text-secondary mb-1">Size</label>
                                            <div className="flex gap-2">
                                                {(['small', 'medium', 'large'] as const).map(size => (
                                                    <button key={size} 
                                                        onClick={() => updateWidgetConfig(widget.id, { size })}
                                                        disabled={isFixed && size !== 'large'}
                                                        className={`px-3 py-1 text-xs rounded-md font-semibold transition-colors ${config.size === size ? 'bg-primary-600 text-white' : 'bg-card text-text-secondary hover:bg-border/70'} ${isFixed && size !== 'large' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                        {size.charAt(0).toUpperCase() + size.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                            {isFixed && <p className="text-xs text-text-secondary mt-1">This widget size is fixed for optimal display.</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                )}

                 {activeTab === 'reports' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Report Settings</CardTitle>
                            <CardDescription>Customize settings used across various reports.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <h4 className="font-semibold text-text-primary mb-2">Skill Scarcity Key</h4>
                            <p className="text-sm text-text-secondary mb-4">Define the thresholds and colors for identifying skill scarcity. This impacts charts in the Skill Set report.</p>
                            <div className="space-y-3 max-w-lg">
                                {skillScarcityKey.map((level, index) => {
                                    const isLast = index === skillScarcityKey.length - 1;
                                    const prevThreshold = index > 0 ? skillScarcityKey[index - 1].threshold : 0;
                                    const label = isLast ? `> ${prevThreshold}` : `${prevThreshold + 1} - ${level.threshold}`;

                                    return (
                                        <div key={index} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-background rounded-md border border-border">
                                            <input type="color" value={level.color} onChange={(e) => handleScarcityChange(index, 'color', e.target.value)} className="w-10 h-10 rounded-md bg-transparent border-none cursor-pointer flex-shrink-0" />
                                            <div className="flex-1 w-full sm:w-auto">
                                                <p className="text-sm font-medium text-text-primary">Level {index + 1}: {label} Employees</p>
                                            </div>
                                            {!isLast && (
                                                <div className="w-full sm:w-32">
                                                    <label className="block text-xs text-text-secondary mb-1">Max Employees</label>
                                                    <input type="number" value={level.threshold} onChange={(e) => handleScarcityChange(index, 'threshold', e.target.value)} className="w-full bg-card border border-border rounded-md px-2 py-1.5 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default CustomizationPage;