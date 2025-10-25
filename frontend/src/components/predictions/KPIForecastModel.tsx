import React, { useState, useMemo } from 'react';
import { Type } from '@google/genai';
import { getAIPrediction } from '../../services/geminiService';
import type { Employee, AttendanceRecord, KPIForecast } from '../../types';
import { getTurnoverTrend, getAbsenceTrend } from '../../services/hrCalculations';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { BrainCircuit, LineChart, Sparkles } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface KPIForecastModelProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
}

const forecastSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    period: { type: Type.STRING, description: "The forecast period label (e.g., 'Aug '24')." },
                    value: { type: Type.NUMBER, description: "The predicted value." },
                    lowerBound: { type: Type.NUMBER, description: "The lower bound of the 95% confidence interval." },
                    upperBound: { type: Type.NUMBER, description: "The upper bound of the 95% confidence interval." },
                },
                required: ['period', 'value', 'lowerBound', 'upperBound']
            }
        },
        analysis: { type: Type.STRING, description: "A brief, 1-2 sentence qualitative analysis of the forecast trend." }
    },
    required: ['forecast', 'analysis']
};

const KPIForecastModel: React.FC<KPIForecastModelProps> = ({ employees, attendance }) => {
    const { mode } = useTheme();
    const [selectedMetric, setSelectedMetric] = useState<'turnover' | 'attendance'>('turnover');
    const [forecastPeriod, setForecastPeriod] = useState<3 | 6 | 12>(6);
    const [forecast, setForecast] = useState<KPIForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const textPrimaryColor = useMemo(() => mode === 'dark' ? '#f8fafc' : '#1e293b', [mode]);

    const handleForecast = async () => {
        setIsLoading(true);
        setError(null);
        setForecast(null);

        const historicalData = selectedMetric === 'turnover'
            ? getTurnoverTrend(employees, '24m')
            : getAbsenceTrend(attendance, '24m');

        if (historicalData.length < 6) {
            setError("Not enough historical data to generate a reliable forecast. At least 6 months of data are recommended.");
            setIsLoading(false);
            return;
        }

        const prompt = `
            You are a time-series forecasting model. Given the historical data for the '${selectedMetric}' metric over the last 24 months, generate a forecast for the next ${forecastPeriod} months.
            Provide the forecast as a JSON object adhering to the specified schema. Ensure the confidence interval (lower and upper bounds) is reasonable.
            
            Historical Data:
            ${JSON.stringify(historicalData)}
        `;

        const result = await getAIPrediction<KPIForecast>(prompt, forecastSchema);
        
        if ('error' in result) {
            setError(result.error);
        } else {
            setForecast(result);
        }
        setIsLoading(false);
    };

    const chartData = useMemo(() => {
        const historicalData = selectedMetric === 'turnover'
            ? getTurnoverTrend(employees, '24m')
            : getAbsenceTrend(attendance, '24m');
        
        const labels = historicalData.map(d => d.name);
        const historicalValues = historicalData.map(d => d.value);
        
        if (!forecast) {
            return {
                labels,
                datasets: [{
                    label: `Historical ${selectedMetric === 'turnover' ? 'Turnover' : 'Absences'}`,
                    data: historicalValues,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.2)',
                    fill: false,
                    tension: 0.3,
                }]
            };
        }

        const forecastLabels = forecast.forecast.map(p => p.period);
        const forecastValues = forecast.forecast.map(p => p.value);
        
        const combinedLabels = [...labels, ...forecastLabels];
        const nulls = Array(labels.length).fill(null);

        return {
            labels: combinedLabels,
            datasets: [
                {
                    label: `Historical`,
                    data: [...historicalValues, ...Array(forecastLabels.length).fill(null)],
                    borderColor: '#60a5fa', // Blue
                    tension: 0.3,
                    fill: false,
                },
                {
                    label: 'Forecast',
                    data: [...nulls, ...forecastValues],
                    borderColor: '#34d399', // Green
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false,
                },
                {
                    label: 'Upper Bound',
                    data: [...nulls, ...forecast.forecast.map(p => p.upperBound)],
                    borderColor: 'rgba(236, 72, 153, 0.3)',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: '+1',
                    tension: 0.3,
                    pointRadius: 0,
                },
                {
                    label: 'Lower Bound',
                    data: [...nulls, ...forecast.forecast.map(p => p.lowerBound)],
                    borderColor: 'rgba(236, 72, 153, 0.3)',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: '-1',
                    tension: 0.3,
                    pointRadius: 0,
                }
            ]
        };
    }, [selectedMetric, employees, attendance, forecast]);


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><LineChart className="h-6 w-6 text-primary-400"/> KPI Forecasting Model</CardTitle>
                <CardDescription>Select a metric to forecast future trends using historical data.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Metric to Forecast</label>
                        <select
                            value={selectedMetric}
                            onChange={(e) => { setForecast(null); setSelectedMetric(e.target.value as any); }}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value="turnover">Turnover</option>
                            <option value="attendance">Absences</option>
                        </select>
                    </div>
                     <div className="flex-1">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Forecast Period</label>
                        <select
                            value={forecastPeriod}
                            onChange={(e) => { setForecast(null); setForecastPeriod(parseInt(e.target.value) as any); }}
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        >
                            <option value={3}>Next 3 Months</option>
                            <option value={6}>Next 6 Months</option>
                            <option value={12}>Next 12 Months</option>
                        </select>
                    </div>
                </div>
                 <Button onClick={handleForecast} disabled={isLoading} isLoading={isLoading} className="w-full">
                    Generate Forecast
                </Button>
                
                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                
                <div className="mt-6">
                    <div className="h-64 w-full">
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: { legend: { labels: { color: textPrimaryColor } } },
                                scales: { x: { ticks: { color: textPrimaryColor } }, y: { ticks: { color: textPrimaryColor } } }
                            }}
                        />
                    </div>
                </div>

                {forecast && (
                    <div className="mt-4 p-4 bg-card rounded-md border border-border">
                         <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400"/>AI Analysis</h4>
                         <p className="text-sm text-text-secondary">{forecast.analysis}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default KPIForecastModel;