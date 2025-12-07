import React from 'react';
import { Line } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface PerformanceTrendWidgetProps {
    data: any;
    options: any;
}

const PerformanceTrendWidget: React.FC<PerformanceTrendWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Performance Over Time" description="Simulated trend of average performance ratings.">
            <div className="h-80">
                <Line data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default PerformanceTrendWidget;
