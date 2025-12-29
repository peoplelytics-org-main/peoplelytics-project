import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';
import type { ChartEvent, ActiveElement } from 'chart.js';

interface TopSkillsByProficiencyWidgetProps {
    data: any;
    options: any;
}

const TopSkillsByProficiencyWidget: React.FC<TopSkillsByProficiencyWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Top Skills by Proficiency" description="Avg. proficiency of top 10 skills. Click a bar to view employees.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default TopSkillsByProficiencyWidget;
