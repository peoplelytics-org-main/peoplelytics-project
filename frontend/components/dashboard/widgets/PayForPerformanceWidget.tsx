import React from 'react';
import { Scatter } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface PayForPerformanceWidgetProps {
    data: any;
    options: any;
}

const PayForPerformanceWidget: React.FC<PayForPerformanceWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Pay for Performance" description="Performance rating vs. Salary.">
            <div className="h-80">
                <Scatter data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default PayForPerformanceWidget;
