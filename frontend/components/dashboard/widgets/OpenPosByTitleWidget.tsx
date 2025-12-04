import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface OpenPosByTitleWidgetProps {
    data: any;
    options: any;
}

const OpenPosByTitleWidget: React.FC<OpenPosByTitleWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Open Positions by Title" description="Breakdown of top open roles by type.">
            <div className="h-96">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default OpenPosByTitleWidget;
