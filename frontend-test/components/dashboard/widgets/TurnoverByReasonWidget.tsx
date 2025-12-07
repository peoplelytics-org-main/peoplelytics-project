import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TurnoverByReasonWidgetProps {
    data: any;
    options: any;
}

const TurnoverByReasonWidget: React.FC<TurnoverByReasonWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Turnover by Reason" description="Breakdown of voluntary vs. involuntary turnover.">
            <div className="h-80">
                <Pie data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TurnoverByReasonWidget;
