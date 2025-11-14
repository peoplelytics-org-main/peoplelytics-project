import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { getEmployeeFlightRisk } from '../../services/calculations';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import OrgChartNode from './OrgChartNode';
import type { Employee } from '../../types';

interface OrgNode extends Employee {
  children: OrgNode[];
}

export type OrgChartOverlay = 'none' | 'performance' | 'engagement' | 'flightRisk';

// --- Modified Legend Component ---
const Legend: React.FC<{
  mode: OrgChartOverlay;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}> = ({ mode, activeFilter, onFilterChange }) => {
    const legends = {
        performance: [
            { color: 'border-green-500', label: '5 (Outstanding)' },
            { color: 'border-emerald-500', label: '4 (Exceeds)' },
            { color: 'border-blue-500', label: '3 (Meets)' },
            { color: 'border-yellow-500', label: '2 (Below)' },
            { color: 'border-red-500', label: '1 (Needs Imp.)' },
        ],
        engagement: [
            { color: 'border-green-500', label: '> 85%' },
            { color: 'border-blue-500', label: '70-85%' },
            { color: 'border-yellow-500', label: '55-70%' },
            { color: 'border-red-500', label: '< 55%' },
        ],
        flightRisk: [
            { color: 'border-red-500', label: 'High Risk' },
            { color: 'border-yellow-500', label: 'Medium Risk' },
            { color: 'border-green-500', label: 'Low Risk' },
        ]
    };

    if (mode === 'none' || !legends[mode]) return null;
    
    const handleFilterClick = (filterLabel: string) => {
        if (activeFilter === filterLabel) {
            onFilterChange(null); // Toggle off if clicking the active filter
        } else {
            onFilterChange(filterLabel);
        }
    };

    return (
        <div className="flex items-center flex-wrap gap-2 text-xs text-text-secondary">
            <span className="font-semibold">Filter by:</span>
            {legends[mode].map(item => (
                <button
                    key={item.label}
                    className={`flex items-center gap-1.5 p-1.5 rounded-md transition-colors ${activeFilter === item.label ? 'bg-primary-900 ring-2 ring-primary-500' : 'bg-background hover:bg-border'}`}
                    onClick={() => handleFilterClick(item.label)}
                >
                    <div className={`w-3 h-3 rounded-sm border-2 ${item.color}`}></div>
                    <span className="text-text-primary">{item.label}</span>
                </button>
            ))}
        </div>
    );
};

// Helper function to check if an engagement score matches a filter label
const engagementMatches = (score: number, filterLabel: string): boolean => {
    if (filterLabel.startsWith('>')) {
        const value = parseInt(filterLabel.replace('>', '').replace('%', '').trim());
        return score > value;
    }
    if (filterLabel.startsWith('<')) {
        const value = parseInt(filterLabel.replace('<', '').replace('%', '').trim());
        return score < value;
    }
    if (filterLabel.includes('-')) {
        const [min, max] = filterLabel.replace('%', '').split('-').map(Number);
        return score >= min && score <= max;
    }
    return false;
};

// --- Main Component ---
const OrgChartExplorer: React.FC = () => {
    const { displayedData } = useData();
    const [overlayMode, setOverlayMode] = useState<OrgChartOverlay>('none');
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const employeeMetrics = useMemo(() => {
        const metrics = new Map<string, { risk: 'Low' | 'Medium' | 'High' }>();
        displayedData.forEach(emp => {
            const { risk } = getEmployeeFlightRisk(emp);
            metrics.set(emp.id, { risk });
        });
        return metrics;
    }, [displayedData]);

    const hierarchy = useMemo(() => {
        if (!displayedData || displayedData.length === 0) return [];
        
        let finalData = displayedData;

        if (activeFilter && overlayMode !== 'none') {
            const matchingEmployeeIds = new Set<string>();
            const allEmployeesMap = new Map(displayedData.map(e => [e.id, e]));

            // 1. Find initial set of employees that match the filter
            displayedData.forEach(emp => {
                let match = false;
                switch (overlayMode) {
                    case 'performance':
                        const perfValue = parseInt(activeFilter.split(' ')[0]);
                        if (emp.performanceRating === perfValue) match = true;
                        break;
                    case 'engagement':
                        if (engagementMatches(emp.engagementScore, activeFilter)) match = true;
                        break;
                    case 'flightRisk':
                        const riskValue = activeFilter.split(' ')[0];
                        const metric = employeeMetrics.get(emp.id);
                        if (metric?.risk === riskValue) match = true;
                        break;
                }
                if (match) {
                    matchingEmployeeIds.add(emp.id);
                }
            });

            // 2. Traverse up the hierarchy for each matching employee to include their managers
            const employeesToShow = new Set<string>(matchingEmployeeIds);
            matchingEmployeeIds.forEach(empId => {
                let current = allEmployeesMap.get(empId);
                while (current && current.managerId) {
                    employeesToShow.add(current.managerId);
                    current = allEmployeesMap.get(current.managerId);
                }
            });
            
            // 3. Filter the data to only include the employees to show
            finalData = displayedData.filter(emp => employeesToShow.has(emp.id));
        }


        const employeeMap: { [id: string]: OrgNode } = {};
        finalData.forEach(employee => {
            employeeMap[employee.id] = { ...employee, children: [] };
        });

        const roots: OrgNode[] = [];
        Object.values(employeeMap).forEach(node => {
            if (node.managerId && employeeMap[node.managerId]) {
                employeeMap[node.managerId].children.push(node);
            } else {
                roots.push(node);
            }
        });
        
        Object.values(employeeMap).forEach(node => {
            node.children.sort((a, b) => a.name.localeCompare(b.name));
        });
        
        roots.sort((a, b) => a.name.localeCompare(b.name));

        return roots;
    }, [displayedData, overlayMode, activeFilter, employeeMetrics]);

    const handleOverlayChange = (mode: OrgChartOverlay) => {
        setOverlayMode(mode);
        setActiveFilter(null); // Reset filter when changing overlay mode
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Org Chart Controls</CardTitle>
                    <CardDescription>Select a heatmap overlay to analyze the organization, then click a legend item to filter.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-wrap gap-2">
                        {(['none', 'performance', 'engagement', 'flightRisk'] as OrgChartOverlay[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => handleOverlayChange(mode)}
                                className={`px-3 py-1.5 text-xs rounded-md font-semibold transition-colors ${overlayMode === mode ? 'bg-primary-600 text-white' : 'bg-border text-text-secondary hover:bg-border/70'}`}
                            >
                                {mode === 'none' ? 'None' : mode === 'flightRisk' ? 'Talent Risk' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                    <Legend mode={overlayMode} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Organizational Chart</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {hierarchy.length > 0 ? (
                            hierarchy.map(rootNode => (
                                <OrgChartNode 
                                    key={rootNode.id} 
                                    node={rootNode} 
                                    level={0} 
                                    overlayMode={overlayMode}
                                    employeeMetrics={employeeMetrics}
                                />
                            ))
                        ) : (
                            <p className="text-text-secondary text-center py-8">
                                {activeFilter ? "No employees match the current filter." : "No organizational hierarchy could be built. Check that manager IDs are set correctly."}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OrgChartExplorer;