import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';
// FIX: Import `Chart`, `ChartEvent`, and `ActiveElement` types to resolve 'Cannot find name' errors.
import type { Chart, ChartEvent, ActiveElement } from 'chart.js';

interface ManagerPerformanceWidgetProps {
    managerPerformance: any[];
    baseChartOptions: any;
    textPrimaryColor: string;
    gridColor: string;
    borderColor: string;
    // FIX: Update onClick and onHover to accept the full chart object argument.
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void;
    onHover: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void;
}

const ManagerPerformanceWidget: React.FC<ManagerPerformanceWidgetProps> = ({
    managerPerformance,
    baseChartOptions,
    textPrimaryColor,
    gridColor,
    borderColor,
    onClick,
    onHover
}) => {
    const [viewMode, setViewMode] = useState<'count' | 'percentage'>('count');

    const chartData = {
        labels: managerPerformance.map(m => m.managerName), 
        datasets: Object.keys(managerPerformance[0]?.ratings || {})
            .filter(r => r !== 'count')
            .sort((a,b) => parseInt(a)-parseInt(b))
            .map((rating, i) => ({ 
                label: `Rating ${rating}`, 
                data: viewMode === 'count'
                    ? managerPerformance.map(m => m.ratings[rating])
                    : managerPerformance.map(m => m.teamSize > 0 ? (m.ratings[rating] / m.teamSize) * 100 : 0),
                backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][i] 
            }))
    };

    const chartOptions = {
        ...baseChartOptions, 
        onClick: onClick,
        onHover: onHover,
        indexAxis: 'y' as const, 
        scales: { 
            x: { 
                stacked: true, 
                max: viewMode === 'percentage' ? 100 : undefined,
                ticks: { 
                    color: textPrimaryColor, 
                    callback: viewMode === 'percentage' ? (v: any) => `${v}%` : undefined
                }, 
                grid: { color: gridColor }, 
                border: { color: borderColor } 
            }, 
            y: { stacked: true, ticks: { color: textPrimaryColor, font: { weight: 'bold' } }, grid: { drawOnChartArea: false }, border: { color: borderColor } } 
        }, 
        plugins: {
            ...baseChartOptions.plugins, 
            tooltip: { 
                ...baseChartOptions.plugins.tooltip, 
                callbacks: { 
                    label: (context: any) => {
                        const label = context.dataset.label || ''; 
                        const value = context.parsed.x; 
                        if (label && value != null) { 
                            return viewMode === 'count'
                                ? `${label}: ${value}`
                                : `${label}: ${value.toFixed(2)}%`;
                        } 
                        return ''; 
                    }, 
                    footer: (tooltipItems: any[]) => {
                        if (!tooltipItems || tooltipItems.length === 0) return ''; 
                        const dataIndex = tooltipItems[0].dataIndex;
                        const managerData = managerPerformance[dataIndex];
                        return managerData ? `Total Team Size: ${managerData.teamSize}` : '';
                    }
                }
            }, 
            datalabels: { 
                display: true, 
                color: '#fff', 
                formatter: (value: any, context: any) => {
                    if (value === 0) return '';
                    const dataIndex = context.dataIndex;
                    const managerData = managerPerformance[dataIndex];
                    if (!managerData) return '';
                    const total = managerData.teamSize;
                    if (total === 0) return '';
                    
                    if (viewMode === 'count') {
                        const percentage = (value / total) * 100;
                        if (percentage < 5) return '';
                        return Math.round(value);
                    } else { // percentage mode
                        if (value < 5) return '';
                        return `${Math.round(value)}%`;
                    }
                }
            }
        }
    };

    return (
        <ChartCard title="Team Performance by Manager" description="Performance rating distribution for each manager's team.">
            <div className="flex justify-end mb-2">
                <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5">
                    <button onClick={() => setViewMode('count')} className={`px-2 py-1 text-xs font-semibold rounded ${viewMode === 'count' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>Count</button>
                    <button onClick={() => setViewMode('percentage')} className={`px-2 py-1 text-xs font-semibold rounded ${viewMode === 'percentage' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>%</button>
                </div>
            </div>
            <div style={{height: `${managerPerformance.length * 30}px`, minHeight: '300px'}}>
                <Bar data={chartData} options={chartOptions as any} />
            </div>
        </ChartCard>
    );
};

export default ManagerPerformanceWidget;