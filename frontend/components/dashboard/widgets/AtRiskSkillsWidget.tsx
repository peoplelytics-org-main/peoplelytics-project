import React from 'react';
import type { Employee } from '../../../types';
import ChartCard from '../../ChartCard';

interface AtRiskSkillsWidgetProps {
    atRiskSkills: {
        skillName: string;
        employees: Employee[];
        highRiskEmployeeCount: number;
    }[];
    onRowClick: (title: string, employees: Employee[]) => void;
}

const AtRiskSkillsWidget: React.FC<AtRiskSkillsWidgetProps> = ({ atRiskSkills, onRowClick }) => {
    return (
        <ChartCard title="At-Risk Skills" description="Skills held by 3 or fewer employees. Click a row to view employees.">
            <div className="overflow-y-auto max-h-80">
                <table className="w-full text-sm">
                    <thead className="text-xs text-text-secondary uppercase bg-card sticky top-0">
                        <tr>
                            <th className="py-2 px-4 text-left font-medium">Skill</th>
                            <th className="py-2 px-4 text-center font-medium">Count</th>
                            <th className="py-2 px-4 text-center font-medium">High Flight Risk</th>
                        </tr>
                    </thead>
                    <tbody>
                        {atRiskSkills.map(skill => (
                            <tr key={skill.skillName} className="border-b border-border last:border-b-0 hover:bg-border/50 cursor-pointer" onClick={() => onRowClick(`Employees with skill: ${skill.skillName}`, skill.employees)}>
                                <td className="py-2 px-4 font-semibold text-text-primary">{skill.skillName}</td>
                                <td className="py-2 px-4 text-center text-text-primary">{skill.employees.length}</td>
                                <td className={`py-2 px-4 text-center font-bold ${skill.highRiskEmployeeCount > 0 ? 'text-red-400' : 'text-text-primary'}`}>{skill.highRiskEmployeeCount}</td>
                            </tr>
                        ))}
                        {atRiskSkills.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center text-text-secondary py-8">No skills identified as "at-risk".</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </ChartCard>
    );
};

export default AtRiskSkillsWidget;
