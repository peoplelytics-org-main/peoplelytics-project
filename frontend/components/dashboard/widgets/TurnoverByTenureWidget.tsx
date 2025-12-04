import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverByTenureWidgetProps {
    data: any;
    options: any;
}

const TurnoverByTenureWidget: React.FC<TurnoverByTenureWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover by Tenure" description="Leavers by their tenure at the company.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverByTenureWidget;
