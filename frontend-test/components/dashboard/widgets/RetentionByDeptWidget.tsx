import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface RetentionByDeptWidgetProps {
    data: any;
    options: any;
}

const RetentionByDeptWidget: React.FC<RetentionByDeptWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Retention by Department" description="Comparing employee retention rates.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default RetentionByDeptWidget;
