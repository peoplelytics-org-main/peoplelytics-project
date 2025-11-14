import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverByJobTitleWidgetProps {
    data: any;
    options: any;
}

const TurnoverByJobTitleWidget: React.FC<TurnoverByJobTitleWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover by Job Title" description="Job titles with the most leavers (top 10).">
            <div className="h-96">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverByJobTitleWidget;
