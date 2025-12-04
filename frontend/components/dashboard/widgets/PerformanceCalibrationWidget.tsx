import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';
import type { Chart, ChartEvent, ActiveElement } from 'chart.js';

interface PerformanceCalibrationWidgetProps {
    calibrationData: any[];
    calibrationCounts: any[];
    baseChartOptions: any;
    textPrimaryColor: string;
    // FIX: Update onClick and onHover to accept the full chart object argument.
    onClick: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void;
    onHover: (event: ChartEvent, elements: ActiveElement[], chart: Chart) => void;
}

const PerformanceCalibrationWidget: React.FC<PerformanceCalibrationWidgetProps> = ({
    calibrationData,
    calibrationCounts,
    baseChartOptions,
    textPrimaryColor,
    onClick,
    onHover
}) => {
    const [viewMode, setViewMode] = useState<'count' | 'percentage'>('percentage');

    const chartData = {
        labels: calibrationData.map(d => d.department), 
        datasets: Object.keys(calibrationData[0]?.distribution || {}).map((rating, i) => ({ 
            label: `Rating ${rating}`, 
            data: viewMode === 'percentage'
                ? calibrationData.map(d => d.distribution[rating])
                : calibrationCounts.map(d => d.distribution[rating as keyof typeof d.distribution]),
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
                ticks: { color: textPrimaryColor, callback: viewMode === 'percentage' ? (v: any) => `${v}%` : undefined } 
            }, 
            y: { stacked: true, ticks: {color: textPrimaryColor} } 
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
                        const total = calibrationCounts[dataIndex].total;
                        return `Total: ${total}`;
                    }
                }
            }, 
            datalabels: { 
                display: true, 
                color: '#fff', 
                formatter: (value: any) => {
                    if (value === 0) return '';
                    return viewMode === 'count'
                        ? value
                        : value > 5 ? `${Math.round(value)}%` : '';
                }
            }
        }
    };

    return (
        <ChartCard title="Performance Calibration" description="Rating distribution by department. Click a segment to view employees.">
            <div className="flex justify-end mb-2">
                <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5">
                    <button onClick={() => setViewMode('count')} className={`px-2 py-1 text-xs font-semibold rounded ${viewMode === 'count' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>Count</button>
                    <button onClick={() => setViewMode('percentage')} className={`px-2 py-1 text-xs font-semibold rounded ${viewMode === 'percentage' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>%</button>
                </div>
            </div>
            <div className="h-96">
                <Bar data={chartData} options={chartOptions as any} />
            </div>
        </ChartCard>
    );
};

export default PerformanceCalibrationWidget;