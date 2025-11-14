import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface RecruitmentFunnelWidgetProps {
    data: any;
    options: any;
}

const RecruitmentFunnelWidget: React.FC<RecruitmentFunnelWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Recruitment Funnel" description="Total candidates across all recruitment stages.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default RecruitmentFunnelWidget;
