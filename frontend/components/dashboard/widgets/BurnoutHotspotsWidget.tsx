import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface BurnoutHotspotsWidgetProps {
    data: any;
    options: any;
}

const BurnoutHotspotsWidget: React.FC<BurnoutHotspotsWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Burnout Risk Hotspots" description="Departments with the highest risk of burnout.">
            <div className="h-96">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default BurnoutHotspotsWidget;
