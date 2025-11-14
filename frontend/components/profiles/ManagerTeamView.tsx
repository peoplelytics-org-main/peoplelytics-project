import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, type ChartEvent, type ActiveElement, type Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import type { Employee, TurnoverPrediction } from '../../types';
import { getAIAssistance, getAIPrediction } from '../../services/geminiService';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import StatusBadge from '../ui/StatusBadge';
import { Zap, AlertTriangle, CheckCircle, ShieldQuestion, Lightbulb, Sparkles, ShieldCheck, Star, X } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';
import { calculateOverallRetentionRate, getPerformanceDistribution, getRegrettableLeaversForManager, calculateFlightRiskScore, calculateImpactScore } from '../../services/calculations';
import ChartCard from '../ChartCard';
import MetricCard from '../MetricCard';
import Gauge from '../ui/Gauge';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface TeamMemberCardProps {
    employee: Employee;
    managerName: string;
}

const MiniSatisfactionBar: React.FC<{ label: string; value: number | undefined }> = ({ label, value = 0 }) => {
    const color = value < 60 ? 'bg-red-500' : value < 80 ? 'bg-yellow-500' : 'bg-green-500';
    return (
        <div>
            <div className="flex justify-between items-end text-xs mb-0.5">
                <span className="text-text-secondary">{label}</span>
                <span className="font-semibold text-text-primary">{value.toFixed(0)}<span className="text-xs text-text-secondary">/100</span></span>
            </div>
            <div className="w-full bg-border rounded-full h-1.5">
                <div className={`${color} h-1.5 rounded-full`} style={{ width: `${value}%`, transition: 'width 0.5s ease-in-out' }}></div>
            </div>
        </div>
    );
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ employee, managerName }) => {
    const [prediction, setPrediction] = useState<TurnoverPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useNotifications();
    
    const [retentionStrategies, setRetentionStrategies] = useState<string | null>(null);
    const [isFetchingStrategies, setIsFetchingStrategies] = useState(false);

    const flightRiskScore = useMemo(() => calculateFlightRiskScore(employee), [employee]);
    const impactScore = useMemo(() => calculateImpactScore(employee), [employee]);


    const handlePredict = async () => {
        setIsLoading(true);
        setError(null);
        setPrediction(null);
        setRetentionStrategies(null); // Reset strategies on new prediction
        const prompt = `Analyze this employee's data to predict turnover risk in the next 6 months as a JSON object: Department: ${employee.department}, Job Title: ${employee.jobTitle}, Performance Rating (1-5): ${employee.performanceRating}, Engagement Score (1-100): ${employee.engagementScore}.`;
        const result = await getAIPrediction<TurnoverPrediction>(prompt, { type: 'object', properties: { riskLevel: { type: 'string', enum: ['Low', 'Medium', 'High'] }, confidenceScore: { type: 'number' }, contributingFactors: { type: 'array', items: { type: 'string' } } } });
        if ('error' in result) {
            setError(result.error);
        } else {
            setPrediction(result);
            if(result.riskLevel === 'High') {
                addNotification({
                    title: 'High Turnover Risk Alert',
                    message: `${employee.name} (${employee.jobTitle}) has been identified as a high turnover risk.`,
                    type: 'error'
                });
            }
        }
        setIsLoading(false);
    };
    
    const handleGetStrategies = async () => {
        setIsFetchingStrategies(true);
        const perfDesc = employee.performanceRating >= 4 ? 'high-performing' : employee.performanceRating === 3 ? 'solid-performing' : 'underperforming';
        const prompt = `My direct report, a ${perfDesc} ${employee.jobTitle}, has a low engagement score (${employee.engagementScore}/100) and is predicted as a high flight risk. Suggest three distinct and actionable retention strategies for me, their manager, to implement. Format the response as a markdown list.`;
        const result = await getAIAssistance(prompt);
        setRetentionStrategies(result);
        setIsFetchingStrategies(false);
    };

    const riskConfig = {
        Low: { icon: CheckCircle, color: 'text-green-400', text: 'Low Risk' },
        Medium: { icon: AlertTriangle, color: 'text-yellow-400', text: 'Medium Risk' },
        High: { icon: AlertTriangle, color: 'text-red-400', text: 'High Risk' },
    };
    const config = prediction ? riskConfig[prediction.riskLevel] : null;
    const RiskIcon = config?.icon || ShieldQuestion;

    return (
        <Card className="flex flex-col p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Link to={`/app/profiles/${employee.id}`} className="hover:underline">
                            <p className="font-bold text-text-primary">{employee.name}</p>
                        </Link>
                        <StatusBadge employee={employee} />
                    </div>
                    <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                    {!employee.terminationDate && (
                        <Button onClick={handlePredict} isLoading={isLoading} size="sm" variant="secondary" className="gap-2 w-full sm:w-auto">
                            <Zap className="h-4 w-4"/> Predict Risk
                        </Button>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                     <Gauge
                        value={employee.performanceRating * 20}
                        label="Performance"
                        displayValue={employee.performanceRating.toFixed(1)}
                        displayMaxValue="/5"
                    />
                    <Gauge
                        value={employee.engagementScore}
                        label="Engagement"
                        displayValue={employee.engagementScore.toFixed(0)}
                        displayMaxValue="%"
                    />
                     <Gauge
                        value={flightRiskScore * 10}
                        label="Flight Risk"
                        displayValue={flightRiskScore.toFixed(1)}
                        displayMaxValue="/10"
                    />
                    <Gauge
                        value={impactScore * 10}
                        label="Impact"
                        displayValue={impactScore.toFixed(1)}
                        displayMaxValue="/10"
                    />
                </div>
                <div className="space-y-4">
                    <div className="text-left min-h-[60px]">
                        {prediction && config && (
                            <div className="space-y-1">
                                <p className={`font-bold flex items-center gap-2 ${config.color}`}>
                                    <RiskIcon className="h-5 w-5"/> {config.text}
                                </p>
                                <p className="text-xs text-text-secondary">
                                    Confidence: {(prediction.confidenceScore * 100).toFixed(0)}%
                                </p>
                                <p className="text-xs text-text-secondary truncate" title={prediction.contributingFactors.join(', ')}>
                                    Factors: {prediction.contributingFactors.join(', ')}
                                </p>
                            </div>
                        )}
                        {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>
                     <div>
                        <h4 className="text-sm font-semibold text-text-primary mb-2">Satisfaction Scores</h4>
                        <div className="space-y-2">
                            <MiniSatisfactionBar label="Compensation" value={employee.compensationSatisfaction} />
                            <MiniSatisfactionBar label="Benefits" value={employee.benefitsSatisfaction} />
                            <MiniSatisfactionBar label="Management" value={employee.managementSatisfaction} />
                            <MiniSatisfactionBar label="Training" value={employee.trainingSatisfaction} />
                        </div>
                    </div>
                </div>
            </div>

            {prediction?.riskLevel === 'High' && (
                <div className="mt-4 pt-4 border-t border-border">
                    {!retentionStrategies && (
                         <Button onClick={handleGetStrategies} isLoading={isFetchingStrategies} size="sm" variant="primary" className="gap-2">
                            <Lightbulb className="h-4 w-4"/> Get Retention Strategies
                        </Button>
                    )}
                    {isFetchingStrategies && <p className="text-xs text-text-secondary mt-2">Fetching strategies...</p>}
                    {retentionStrategies && (
                        <div className="mt-2 p-3 bg-background rounded-md">
                            <h5 className="font-semibold text-sm text-text-primary mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-primary-400" />
                                AI-Driven Strategies
                            </h5>
                            <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                                <MarkdownRenderer text={retentionStrategies} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

const BasicTeamMemberCard: React.FC<{ employee: Employee }> = ({ employee }) => {
    return (
        <Link to={`/app/profiles/${employee.id}`} className="block group">
            <Card className="p-4 flex items-center gap-4 h-full transition-all duration-200 hover:border-primary-500/80 hover:shadow-md hover:shadow-primary-900/20 transform hover:-translate-y-0.5">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-text-primary">{employee.name}</p>
                        <StatusBadge employee={employee} />
                    </div>
                    <p className="text-sm text-text-secondary">{employee.jobTitle}</p>
                </div>
            </Card>
        </Link>
    )
};


interface ManagerTeamViewProps {
    manager: Employee;
    allEmployees: Employee[];
}

const ManagerTeamView: React.FC<ManagerTeamViewProps> = ({ manager, allEmployees }) => {
    const [performanceFilter, setPerformanceFilter] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'basic' | 'extended'>('extended');
    const navigate = useNavigate();

    const teamMembers = useMemo(() => 
        allEmployees.filter(e => e.managerId === manager.id),
    [allEmployees, manager.id]);

    const activeTeamMembers = useMemo(() => teamMembers.filter(e => !e.terminationDate), [teamMembers]);

    // --- New Calculations ---
    const teamRetentionRate = useMemo(() => calculateOverallRetentionRate(teamMembers, '12m'), [teamMembers]);
    const teamPerformanceDistribution = useMemo(() => getPerformanceDistribution(activeTeamMembers), [activeTeamMembers]);
    const regrettableLeavers = useMemo(() => getRegrettableLeaversForManager(manager.id, allEmployees).slice(0, 5), [manager.id, allEmployees]);
    
    const filteredTeamMembers = useMemo(() => {
        if (!performanceFilter) {
            return teamMembers;
        }
        return teamMembers.filter(member => member.performanceRating === performanceFilter);
    }, [teamMembers, performanceFilter]);

    // --- Chart Config ---
    const { mode } = useTheme();
    const cardColor = useMemo(() => mode === 'dark' ? '#1a1a1a' : '#ffffff', [mode]);
    const textPrimaryColor = useMemo(() => mode === 'dark' ? '#f8fafc' : '#1e293b', [mode]);
    const borderColor = useMemo(() => mode === 'dark' ? '#27272a' : '#e2e8f0', [mode]);
    const gridColor = useMemo(() => mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)', [mode]);
    
    const handlePerformanceChartClick = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            // The labels are ordered from rating 1 to 5. Index 0 is rating 1.
            const clickedRating = index + 1;
            setPerformanceFilter(prevFilter => prevFilter === clickedRating ? null : clickedRating);
        }
    };
    
    const onHover = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        chart.canvas.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    };
    
    const performanceChartData = useMemo(() => ({
        labels: teamPerformanceDistribution.map(d => d.name),
        datasets: [{
            label: 'Employee Count',
            data: teamPerformanceDistribution.map(d => d.value),
            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'],
        }]
    }), [teamPerformanceDistribution]);

    const performanceChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        onClick: handlePerformanceChartClick,
        onHover: onHover,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: cardColor,
                titleColor: textPrimaryColor,
                bodyColor: textPrimaryColor,
                borderColor: borderColor,
                borderWidth: 1,
            },
            datalabels: {
                display: (context: any) => context.dataset.data[context.dataIndex] > 0,
                color: '#fff',
                font: { weight: 'bold' as const },
                anchor: 'center' as const,
                align: 'center' as const,
            }
        },
        scales: {
            x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } },
            y: { ticks: { color: textPrimaryColor, precision: 0 }, grid: { color: gridColor }, border: { color: borderColor } }
        }
    }), [textPrimaryColor, cardColor, borderColor, gridColor, handlePerformanceChartClick, onHover]);


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <MetricCard 
                        title="12-Month Team Retention" 
                        value={`${teamRetentionRate.toFixed(1)}%`}
                        icon={<ShieldCheck />}
                    />
                    {regrettableLeavers.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Regrettable Departures</CardTitle>
                                <CardDescription>High-performers who recently left your team.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {regrettableLeavers.map(e => (
                                    <div key={e.id} className="p-2 bg-background rounded-md flex justify-between items-center text-sm">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link to={`/app/profiles/${e.id}`} className="font-semibold text-text-primary hover:underline">{e.name}</Link>
                                                <StatusBadge employee={e} />
                                            </div>
                                             <p className="text-xs text-text-secondary">{e.jobTitle}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-text-primary flex items-center gap-1"><Star className="h-3 w-3 text-yellow-400" />{e.performanceRating}/5</p>
                                            <p className="text-xs text-text-secondary">Left: {e.terminationDate ? new Date(e.terminationDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <ChartCard title="Team Performance Distribution" description="Performance rating breakdown. Click a bar to filter the roster.">
                    <div className="h-96">
                        <Bar data={performanceChartData} options={performanceChartOptions as any} />
                    </div>
                </ChartCard>
            </div>
            
            <Card>
                <CardHeader>
                     <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                        <div>
                             <CardTitle>My Team Roster</CardTitle>
                             <CardDescription>
                                {performanceFilter
                                    ? `Showing team members with performance rating "${teamPerformanceDistribution.map(d => d.name)[performanceFilter - 1]}"`
                                    : `View key metrics and AI-powered insights for your direct reports.`
                                }
                            </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5">
                                <button onClick={() => setViewMode('basic')} className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === 'basic' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>
                                    Basic
                                </button>
                                <button onClick={() => setViewMode('extended')} className={`px-3 py-1 text-xs font-semibold rounded ${viewMode === 'extended' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>
                                    Extended
                                </button>
                            </div>
                             {performanceFilter && (
                                <Button variant="secondary" size="sm" onClick={() => setPerformanceFilter(null)} className="gap-2">
                                    <X className="h-4 w-4"/> Clear Filter
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredTeamMembers.length > 0 ? (
                        <div className={viewMode === 'extended' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                            {filteredTeamMembers.map(member => (
                                viewMode === 'extended' ? (
                                    <TeamMemberCard key={member.id} employee={member} managerName={manager.name} />
                                ) : (
                                    <BasicTeamMemberCard key={member.id} employee={member} />
                                )
                            ))}
                        </div>
                    ) : (
                        <p className="text-text-secondary text-center py-8">
                            {teamMembers.length > 0 ? 'No team members match the current filter.' : 'You have no direct reports in the system.'}
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ManagerTeamView;