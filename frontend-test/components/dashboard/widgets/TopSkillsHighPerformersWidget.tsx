import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface TopSkillsHighPerformersWidgetProps {
    data: any;
    options: any;
}

const TopSkillsHighPerformersWidget: React.FC<TopSkillsHighPerformersWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Top Skills of High Performers" description="Most common skills among top performers (top 10). Click a bar to view employees.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TopSkillsHighPerformersWidget;
