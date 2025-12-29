import React from 'react';
import ChartCard from '../../ChartCard';
import type { getHeadcountHeatmap } from '../../../services/calculations';

interface HeadcountHeatmapData {
  departments: string[];
  locations: string[];
  data: { [department: string]: { [location: string]: { total: number; Male: number; Female: number; Other: number; } } };
  maxHeadcount: number;
}

const HeadcountHeatmap: React.FC<{ data: HeadcountHeatmapData }> = ({ data }) => {
    const { departments, locations, data: heatmapData } = data;

    if (!departments || departments.length === 0) {
      return <div className="flex items-center justify-center h-full text-text-secondary">No data to display.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse text-text-primary">
                <thead>
                    <tr>
                        <th className="p-2 border border-border bg-card sticky left-0 z-10">Department</th>
                        {locations.map(loc => <th key={loc} className="p-2 border border-border bg-card text-center min-w-[120px]">{loc}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept}>
                            <td className="p-2 border border-border font-semibold bg-card sticky left-0 z-10 whitespace-nowrap">{dept}</td>
                            {locations.map(loc => {
                                const cellData = heatmapData[dept]?.[loc];
                                const total = cellData?.total || 0;

                                if (total === 0) {
                                    return <td key={loc} className="p-2 border border-border text-center text-text-secondary">-</td>;
                                }

                                const maleWidth = (cellData.Male / total) * 100;
                                const femaleWidth = (cellData.Female / total) * 100;
                                const otherWidth = (cellData.Other / total) * 100;
                                
                                const tooltipText = `Male: ${cellData.Male}, Female: ${cellData.Female}, Other: ${cellData.Other}`;

                                return (
                                    <td key={loc} className="p-2 border border-border text-center align-middle">
                                        <div className="flex items-center gap-2 group relative" title={tooltipText}>
                                            <span className="font-semibold w-8 text-right">{total}</span>
                                            <div className="w-full bg-border rounded-sm h-5 flex overflow-hidden">
                                                {maleWidth > 0 && <div className="h-full" style={{ width: `${maleWidth}%`, backgroundColor: '#3b82f6' }}></div>}
                                                {femaleWidth > 0 && <div className="h-full" style={{ width: `${femaleWidth}%`, backgroundColor: '#f43f5e' }}></div>}
                                                {otherWidth > 0 && <div className="h-full" style={{ width: `${otherWidth}%`, backgroundColor: '#6b7280' }}></div>}
                                            </div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


const HeadcountHeatmapWidget: React.FC<{ data: HeadcountHeatmapData }> = ({ data }) => {
    return (
        <ChartCard title="Headcount Heatmap" description="Headcount by department and location.">
            <HeadcountHeatmap data={data} />
        </ChartCard>
    );
};

export default HeadcountHeatmapWidget;
