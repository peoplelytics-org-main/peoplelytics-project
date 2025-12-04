import React from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/Card';
import { BrainCircuit } from 'lucide-react';

interface SkillSetKPIsWidgetProps {
    kpis: {
        uniqueSkillCount: number;
        mostCommonSkill: string;
        topExpertSkill: string;
        mostSkilledDepartment: string;
    };
}

const SkillSetKPIsWidget: React.FC<SkillSetKPIsWidgetProps> = ({ kpis }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5 text-primary-400"/> Skill Set KPIs</CardTitle>
                <CardDescription>An overview of the company's skill landscape.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-3xl font-bold text-primary-400">{kpis.uniqueSkillCount}</p>
                    <p className="text-xs text-text-secondary mt-1">Unique Skills</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-xl font-bold truncate" title={kpis.mostCommonSkill}>{kpis.mostCommonSkill}</p>
                    <p className="text-xs text-text-secondary mt-1">Most Common Skill</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-xl font-bold truncate" title={kpis.topExpertSkill}>{kpis.topExpertSkill}</p>
                    <p className="text-xs text-text-secondary mt-1">Top Expert Skill</p>
                </div>
                <div className="p-3 bg-background rounded-lg border border-border">
                    <p className="text-xl font-bold truncate" title={kpis.mostSkilledDepartment}>{kpis.mostSkilledDepartment}</p>
                    <p className="text-xs text-text-secondary mt-1">Most Skilled Dept</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default SkillSetKPIsWidget;
