import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface OpenPosByDeptWidgetProps {
    data: any;
    options: any;
}

const OpenPosByDeptWidget: React.FC<OpenPosByDeptWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Open Positions by Department" description="Breakdown of open roles by type.">
            <div className="h-96">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default OpenPosByDeptWidget;
