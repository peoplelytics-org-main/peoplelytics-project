import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';
import type { ChartEvent, ActiveElement } from 'chart.js';

interface PerformanceDistributionWidgetProps {
    data: any;
    options: any;
}

const PerformanceDistributionWidget: React.FC<PerformanceDistributionWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Performance Distribution" description="Distribution of employee performance scores.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default PerformanceDistributionWidget;
