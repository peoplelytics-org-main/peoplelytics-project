import React from 'react';
import { Link } from 'react-router-dom';
import type { SuccessionGap } from '../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { AlertTriangle, User, ShieldCheck } from 'lucide-react';

interface SuccessionGapsWidgetProps {
    gaps: SuccessionGap[];
}

const SuccessionGapsWidget: React.FC<SuccessionGapsWidgetProps> = ({ gaps }) => {
    const highRiskGaps = gaps.filter(gap => gap.readyNowCount === 0 && gap.atRiskSuccessors.length > 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    Succession Pipeline Risks
                </CardTitle>
                <CardDescription>
                    {highRiskGaps.length > 0
                        ? `Found ${highRiskGaps.length} critical role(s) with potential leadership gaps.`
                        : "No immediate succession risks detected."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {highRiskGaps.length > 0 ? (
                    <div className="space-y-4">
                        {highRiskGaps.map((gap, index) => (
                            <div key={index} className="p-3 bg-background rounded-md border border-border">
                                <h4 className="font-bold text-text-primary">{gap.criticalRole}</h4>
                                <div className="text-sm text-text-secondary mt-1">
                                    <p className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Incumbent: <Link to={`/app/profiles/${gap.incumbent.id}`} className="font-semibold hover:underline">{gap.incumbent.name}</Link>
                                    </p>
                                    <p className="flex items-center gap-2 text-red-400 font-semibold mt-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        No 'Ready Now' successors identified.
                                    </p>
                                </div>
                                <div className="mt-3 border-t border-border pt-2">
                                    <p className="text-xs text-text-secondary mb-1">Potential successors are a flight risk:</p>
                                    <ul className="space-y-1">
                                        {gap.atRiskSuccessors.map(s => (
                                            <li key={s.employee.id} className="text-sm flex justify-between items-center">
                                                <Link to={`/app/profiles/${s.employee.id}`} className="hover:underline">{s.employee.name}</Link>
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-900/50 text-red-400">
                                                    {s.risk} Risk ({s.score}%)
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-text-secondary py-8">
                        All critical roles have a healthy succession pipeline.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default SuccessionGapsWidget;