import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverByLocationWidgetProps {
    data: any;
    options: any;
}

const TurnoverByLocationWidget: React.FC<TurnoverByLocationWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover by Location" description="Locations with the most leavers.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverByLocationWidget;
