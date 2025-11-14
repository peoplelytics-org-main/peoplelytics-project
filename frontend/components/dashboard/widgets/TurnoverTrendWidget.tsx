import React from 'react';
import { Line } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverTrendWidgetProps {
    data: any;
    options: any;
}

const TurnoverTrendWidget: React.FC<TurnoverTrendWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover Trend" description="Leavers over the selected time period.">
            <div className="h-80">
                <Line data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverTrendWidget;
