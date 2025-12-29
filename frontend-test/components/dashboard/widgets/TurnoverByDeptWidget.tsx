import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverByDeptWidgetProps {
    data: any;
    options: any;
}

const TurnoverByDeptWidget: React.FC<TurnoverByDeptWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover by Department" description="Departments with the most leavers.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverByDeptWidget;
