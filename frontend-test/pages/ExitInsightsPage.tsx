import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAnalysis } from '../contexts/AnalysisContext';
import { useTheme } from '../contexts/ThemeContext';
import { Bar } from 'react-chartjs-2';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import ChartCard from '../components/ChartCard';
import MetricCard from '../components/MetricCard';
import Button from '../components/ui/Button';
import { ClipboardCheck, FileWarning, Trash2, ThumbsUp, ThumbsDown, Meh, MessageSquare, Banknote, Building2, BookOpen } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const sentimentConfig = {
    Positive: { icon: ThumbsUp, color: 'text-green-400' },
    Neutral: { icon: Meh, color: 'text-yellow-400' },
    Negative: { icon: ThumbsDown, color: 'text-red-400' },
};

const topicConfig = {
    management: { icon: MessageSquare, title: 'Management' },
    compensation: { icon: Banknote, title: 'Compensation' },
    culture: { icon: Building2, title: 'Company Culture' },
};

const ExitInsightsPage: React.FC = () => {
    const { analyses, clearAnalyses } = useAnalysis();
    const { mode } = useTheme();

    const { cardColor, textPrimaryColor, borderColor, gridColor } = useMemo(() => ({
        cardColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
        textPrimaryColor: mode === 'dark' ? '#f8fafc' : '#1e293b',
        borderColor: mode === 'dark' ? '#27272a' : '#e2e8f0',
        gridColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
    }), [mode]);
    
    const baseChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: textPrimaryColor, boxWidth: 12, padding: 20 } },
            tooltip: { backgroundColor: cardColor, titleColor: textPrimaryColor, bodyColor: textPrimaryColor, borderColor: borderColor, borderWidth: 1 },
        },
        scales: {
            x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } },
            y: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } },
        }
    }), [textPrimaryColor, cardColor, borderColor, gridColor]);

    const aggregatedData = useMemo(() => {
        if (analyses.length === 0) return null;

        const primaryReasons = analyses.reduce((acc, curr) => {
            const reason = curr.primaryReasonForLeaving;
            acc[reason] = (acc[reason] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const sortedReasons = Object.entries(primaryReasons).sort((a, b) => b[1] - a[1]);

        const sentimentByTopic = analyses.reduce((acc, curr) => {
            acc.management[curr.management.sentiment]++;
            acc.compensation[curr.compensation.sentiment]++;
            acc.culture[curr.culture.sentiment]++;
            return acc;
        }, {
            management: { Positive: 0, Neutral: 0, Negative: 0 },
            compensation: { Positive: 0, Neutral: 0, Negative: 0 },
            culture: { Positive: 0, Neutral: 0, Negative: 0 },
        });

        const keyQuotes = {
            management: {
                positive: analyses.find(a => a.management.sentiment === 'Positive')?.management.quote,
                negative: analyses.find(a => a.management.sentiment === 'Negative')?.management.quote,
            },
            compensation: {
                positive: analyses.find(a => a.compensation.sentiment === 'Positive')?.compensation.quote,
                negative: analyses.find(a => a.compensation.sentiment === 'Negative')?.compensation.quote,
            },
            culture: {
                positive: analyses.find(a => a.culture.sentiment === 'Positive')?.culture.quote,
                negative: analyses.find(a => a.culture.sentiment === 'Negative')?.culture.quote,
            },
        };

        return {
            totalAnalyzed: analyses.length,
            topReason: sortedReasons[0] ? sortedReasons[0][0] : 'N/A',
            sentimentByTopic,
            primaryReasonsChart: {
                labels: sortedReasons.map(r => r[0]),
                datasets: [{ label: 'Count', data: sortedReasons.map(r => r[1]), backgroundColor: '#8b5cf6' }],
            },
            sentimentChart: {
                labels: ['Management', 'Compensation', 'Culture'],
                datasets: [
                    { label: 'Positive', data: [sentimentByTopic.management.Positive, sentimentByTopic.compensation.Positive, sentimentByTopic.culture.Positive], backgroundColor: 'rgba(34, 197, 94, 0.7)' },
                    { label: 'Neutral', data: [sentimentByTopic.management.Neutral, sentimentByTopic.compensation.Neutral, sentimentByTopic.culture.Neutral], backgroundColor: 'rgba(245, 158, 11, 0.7)' },
                    { label: 'Negative', data: [sentimentByTopic.management.Negative, sentimentByTopic.compensation.Negative, sentimentByTopic.culture.Negative], backgroundColor: 'rgba(239, 68, 68, 0.7)' }
                ]
            },
            keyQuotes,
        };
    }, [analyses]);

    if (!aggregatedData) {
        return (
            <Card>
                <CardContent className="text-center py-16">
                    <FileWarning className="mx-auto h-12 w-12 text-text-secondary mb-4" />
                    <h3 className="text-xl font-semibold text-text-primary">No Exit Interview Data Analyzed</h3>
                    <p className="text-text-secondary mt-2 mb-4">
                        Analyze exit interview transcripts on the Data Management page to populate this hub.
                    </p>
                    <Link to="/app/data-management">
                        <Button>Go to Data Management</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight text-text-primary">Exit Insight Hub</h3>
                    <p className="text-text-secondary mt-1">Aggregated analytics from all analyzed exit interviews.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => { if (window.confirm('Are you sure you want to clear all analyzed interview data?')) clearAnalyses(); }} className="gap-2">
                    <Trash2 className="h-4 w-4 text-red-400"/> Clear All Data
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard title="Interviews Analyzed" value={aggregatedData.totalAnalyzed.toString()} icon={<ClipboardCheck />} />
                <MetricCard title="Top Reason for Leaving" value={aggregatedData.topReason} icon={<FileWarning />} />
                <MetricCard title="Positive Management Sentiment" value={`${((aggregatedData.sentimentByTopic.management.Positive / aggregatedData.totalAnalyzed) * 100).toFixed(0)}%`} icon={<MessageSquare />} />
                <MetricCard title="Negative Compensation Sentiment" value={`${((aggregatedData.sentimentByTopic.compensation.Negative / aggregatedData.totalAnalyzed) * 100).toFixed(0)}%`} icon={<Banknote />} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Primary Reasons for Leaving" description="Frequency of the main reasons employees stated for their departure.">
                    <div className="h-96 w-full"><Bar data={aggregatedData.primaryReasonsChart} options={{ ...baseChartOptions, indexAxis: 'y', plugins: { ...baseChartOptions.plugins, datalabels: { display: true, color: '#fff', anchor: 'center', align: 'center', font: { weight: 'bold' } } } }} /></div>
                </ChartCard>
                <ChartCard title="Sentiment by Topic" description="Sentiment distribution across key exit interview topics.">
                    <div className="h-96 w-full"><Bar data={aggregatedData.sentimentChart} options={{ ...baseChartOptions, plugins: { ...baseChartOptions.plugins, datalabels: { display: (context: any) => context.dataset.data[context.dataIndex] > 0, color: '#fff', anchor: 'center', align: 'center', font: { weight: 'bold' } } } }} /></div>
                </ChartCard>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Voice of the Employee: Key Quotes</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(['management', 'compensation', 'culture'] as const).map(topic => {
                        const TopicIcon = topicConfig[topic].icon;
                        return (
                            <div key={topic} className="space-y-4">
                                <h4 className="font-semibold text-text-primary flex items-center gap-2"><TopicIcon className="h-5 w-5" />{topicConfig[topic].title}</h4>
                                <div className="space-y-3">
                                    {aggregatedData.keyQuotes[topic].positive ? (
                                        <div className="p-3 bg-background rounded-md">
                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-green-400 mb-1"><ThumbsUp className="h-3 w-3" /> Positive Feedback</p>
                                            <p className="text-sm italic text-text-secondary">"{aggregatedData.keyQuotes[topic].positive}"</p>
                                        </div>
                                    ) : <div className="p-3 bg-background rounded-md text-center text-xs text-text-secondary">No positive quotes found.</div>}
    
                                    {aggregatedData.keyQuotes[topic].negative ? (
                                        <div className="p-3 bg-background rounded-md">
                                            <p className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1"><ThumbsDown className="h-3 w-3" /> Negative Feedback</p>
                                            <p className="text-sm italic text-text-secondary">"{aggregatedData.keyQuotes[topic].negative}"</p>
                                        </div>
                                    ) : <div className="p-3 bg-background rounded-md text-center text-xs text-text-secondary">No negative quotes found.</div>}
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary-400" />
                        Understanding the Insights
                    </CardTitle>
                    <CardDescription>How to interpret the data in this hub.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc space-y-3 pl-5 text-sm text-text-secondary">
                        <li>
                            <strong>Aggregated View:</strong> This hub consolidates and visualizes data from all exit interview transcripts you analyze, providing a high-level overview of attrition drivers.
                        </li>
                        <li>
                            <strong>AI-Powered Analysis:</strong> The system uses AI to read unstructured transcripts (including PDFs and Word documents) and extract structured data points like primary leaving reasons and sentiment on key topics.
                        </li>
                        <li>
                            <strong>Primary Reason vs. Sentiment:</strong> It's important to distinguish between the two main charts. The "Primary Reasons for Leaving" chart reflects the single most important factor for departure. The "Sentiment by Topic" chart captures all feelings (positive, neutral, or negative) expressed about a topic, even if it wasn't the main reason for leaving.
                        </li>
                        <li>
                            <strong>Identify Trends:</strong> Use this dashboard to spot patterns. For example, a high negative sentiment in "Culture" across many interviews might indicate a systemic issue, even if it's not always the primary reason for leaving.
                        </li>
                        <li>
                            <strong>Persistent Data:</strong> Your analysis results are saved in your browser. You can continue adding new interviews over time. Use the "Clear All Data" button to start fresh with a new analysis project.
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default ExitInsightsPage;