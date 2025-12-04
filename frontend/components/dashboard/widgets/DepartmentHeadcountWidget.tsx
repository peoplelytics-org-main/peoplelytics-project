import React from 'react';
import { Bar } from 'react-chartjs-2';
import ChartCard from '../../ChartCard';
import type { ChartEvent, ActiveElement } from 'chart.js';

interface DepartmentHeadcountWidgetProps {
    data: any;
    options: any;
}

const DepartmentHeadcountWidget: React.FC<DepartmentHeadcountWidgetProps> = ({ data, options }) => {
    return (
        <ChartCard title="Department Headcount" description="Number of employees per department.">
            <div className="h-80">
                <Bar data={data} options={options} />
            </div>
        </ChartCard>
    );
};

export default DepartmentHeadcountWidget;
