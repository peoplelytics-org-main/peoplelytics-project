import React, { useState, useMemo } from 'react';
import { getBurnoutHotspots } from '../../services/hrCalculations';
import { getAIAssistance } from '../../services/geminiService';
import type { Employee, BurnoutRiskResult } from '../../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { Bar } from 'react-chartjs-2';
import { Flame, Activity, TrendingDown as TrendingDownIcon, Star, Lightbulb, Sparkles } from 'lucide-react';

interface BurnoutRiskModelProps {
  employees: Employee[];
}

const factorIcons = {
    highWorkload: { icon: Activity, label: 'High Workload' },
    lowEngagement: { icon: TrendingDownIcon, label: 'Low Engagement' },
    highPerformancePressure: { icon: Star, label: 'High Perf. Pressure' },
};

const getRiskColor = (score: number) => {
    if (score >= 65) return 'rgba(239, 68, 68, 0.7)'; // Red
    if (score >= 40) return 'rgba(245, 158, 11, 0.7)'; // Yellow
    return 'rgba(34, 197, 94, 0.7)'; // Green
};

const AIEnhancedStrategies: React.FC<{ department: string, factors: BurnoutRiskResult['contributingFactors'] }> = ({ department, factors }) => {
    const [strategies, setStrategies] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getTopFactors = () => {
        return (Object.entries(factors) as [string, number][])
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([key]) => factorIcons[key as keyof typeof factorIcons].label.toLowerCase())
            .join(' and ');
    };

    const handleGetStrategies = async () => {
        setIsLoading(true);
        const topFactors = getTopFactors();
        const prompt = `The ${department} department has a high average burnout risk score, driven primarily by ${topFactors}. Suggest three proactive, non-monetary interventions leadership can take to mitigate burnout risk for this team. Format as a markdown list.`;
        const result = await getAIAssistance(prompt);
        setStrategies(result);
        setIsLoading(false);
    };

    return (
        <div className="mt-4 pt-4 border-t border-border">
            {!strategies && (
                <Button onClick={handleGetStrategies} isLoading={isLoading} size="sm" variant="secondary" className="gap-2">
                    <Lightbulb className="h-4 w-4" /> Get Mitigation Strategies
                </Button>
            )}
             {isLoading && <p className="text-xs text-text-secondary mt-2">Generating strategies...</p>}
             {strategies && (
                <div className="mt-2">
                    <h5 className="font-semibold text-sm text-text-primary mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary-400" /> AI-Powered Recommendations
                    </h5>
                    <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                        <MarkdownRenderer text={strategies} />
                    </div>
                </div>
            )}
        </div>
    );
};

const BurnoutRiskModel: React.FC<BurnoutRiskModelProps> = ({ employees }) => {
    const hotspots = useMemo(() => getBurnoutHotspots(employees), [employees]);

    const chartData = {
        labels: hotspots.map(h => h.department),
        datasets: [{
            label: 'Average Burnout Risk Score',
            data: hotspots.map(h => h.averageRiskScore),
            backgroundColor: hotspots.map(h => getRiskColor(h.averageRiskScore)),
            borderColor: hotspots.map(h => getRiskColor(h.averageRiskScore).replace('0.7', '1')),
            borderWidth: 1,
        }],
    };

    const chartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    // FIX: Added a type check to ensure `toFixed` is called on a number.
                    label: (context: any) => {
                        if (typeof context.raw === 'number') {
                            return `Risk Score: ${context.raw.toFixed(2)}`;
                        }
                        return `Risk Score: ${context.raw}`;
                    }
                }
            },
            datalabels: {
                display: true,
                color: '#fff',
                font: {
                    weight: 'bold' as const,
                    size: 10,
                },
                anchor: 'center' as const,
                align: 'center' as const,
                formatter: (value: any) => {
                    if (typeof value === 'number') {
                        return value.toFixed(2);
                    }
                    return value;
                }
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                title: { display: true, text: 'Average Burnout Risk Score' }
            }
        }
    };

    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Flame className="h-6 w-6 text-primary-400" /> Burnout Risk Hotspots
                </CardTitle>
                <CardDescription>
                    Analysis of departments with the highest risk of employee burnout based on workload, engagement, and performance pressure.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-96 w-full mb-6">
                    <Bar data={chartData} options={chartOptions as any} />
                </div>

                <div>
                    <h4 className="font-semibold text-text-primary mb-2">Department Risk Breakdown</h4>
                    <div className="space-y-4">
                        {hotspots.map(dept => (
                            <Card key={dept.department} className="p-4">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                    <h5 className="font-bold text-text-primary">{dept.department}</h5>
                                    <div className="text-sm text-text-secondary">
                                        <span className="font-semibold" style={{color: getRiskColor(dept.averageRiskScore).replace('0.7', '1')}}>
                                            Avg. Score: {dept.averageRiskScore.toFixed(2)}
                                        </span>
                                        <span className="mx-2">|</span>
                                        <span>{dept.highRiskEmployeeCount} High-Risk Employees</span>
                                    </div>
                                </div>
                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                    {Object.entries(dept.contributingFactors).map(([key, value]) => {
                                        const FactorIcon = factorIcons[key as keyof typeof factorIcons].icon;
                                        return (
                                            <div key={key} className="flex items-center gap-2 p-2 bg-background rounded-md">
                                                <FactorIcon className="h-4 w-4 text-text-secondary"/>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-text-secondary">
                                                        <span>{factorIcons[key as keyof typeof factorIcons].label}</span>
                                                        {/* FIX: Added a type check to ensure .toFixed() is only called on numbers. */}
                                                        <span className="font-semibold text-text-primary">{typeof value === 'number' ? value.toFixed(2) : value}%</span>
                                                    </div>
                                                    <div className="w-full bg-border h-1.5 rounded-full mt-1">
                                                        <div className="bg-primary-600 h-1.5 rounded-full" style={{width: `${value}%`}}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                {dept.averageRiskScore >= 65 && <AIEnhancedStrategies department={dept.department} factors={dept.contributingFactors} />}
                            </Card>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BurnoutRiskModel;