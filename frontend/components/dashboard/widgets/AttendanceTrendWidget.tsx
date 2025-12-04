import React from 'react';
import { Line } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface AttendanceTrendWidgetProps {
    data: any;
    options: any;
}

const AttendanceTrendWidget: React.FC<AttendanceTrendWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Absence Trend (Last 6 Months)" description="Total sick & unscheduled absences.">
            <div className="h-80">
                <Line data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default AttendanceTrendWidget;
