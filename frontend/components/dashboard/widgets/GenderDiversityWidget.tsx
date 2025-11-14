import React from 'react';
import { Pie } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';

interface GenderDiversityWidgetProps {
    data: any;
    options: any;
}

const GenderDiversityWidget: React.FC<GenderDiversityWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Gender Diversity" description="Distribution of gender across the workforce.">
            <div className="h-80">
                <Pie data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default GenderDiversityWidget;
