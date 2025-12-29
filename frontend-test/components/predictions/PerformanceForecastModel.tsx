import React, { useState, useMemo } from 'react';
import { Type } from '@google/genai';
import { getAIPrediction } from '../../services/geminiService';
import type { Employee, PerformanceForecast } from '../../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { Sparkles, BrainCircuit, TrendingUp, Check } from 'lucide-react';

interface PerformanceForecastModelProps {
  employees: Employee[];
  employeesForAI: Employee[];
}

const performanceSchema = {
    type: Type.OBJECT,
    properties: {
        predictedPerformance: { type: Type.STRING, description: 'The predicted performance category for the next year (e.g., "Exceeds Expectations", "Meets Expectations", "Needs Improvement").' },
        confidenceScore: { type: Type.NUMBER, description: 'A score from 0 to 1 representing confidence in the prediction.' },
        rationale: { type: Type.STRING, description: 'A brief, 1-2 sentence explanation for the prediction, citing key factors from the data.' }
    },
    required: ['predictedPerformance', 'confidenceScore', 'rationale']
};

const ForecastDisplay: React.FC<{ prediction: PerformanceForecast, employee: Employee }> = ({ prediction, employee }) => {
    const { predictedPerformance, confidenceScore, rationale } = prediction;
    
    return (
        <div className="mt-6 space-y-4">
             <div className="p-6 rounded-lg bg-primary-900/50 border border-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Predicted Performance (Next 12 Mo.)</p>
                        <p className="text-3xl font-bold text-primary-400 flex items-center gap-2"><TrendingUp className="h-7 w-7"/> {predictedPerformance}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">Confidence</p>
                        <p className="text-3xl font-bold text-primary-400">{(confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                </div>
                 <div className="w-full bg-border rounded-full h-2.5 mt-4">
                    <div className="bg-primary-500" style={{ width: `${confidenceScore * 100}%`, height: '100%', borderRadius: '9999px'}}></div>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><Sparkles className="h-5 w-5 text-yellow-400"/>AI Rationale</h4>
                <p className="text-sm text-text-secondary p-3 bg-card rounded-md">{rationale}</p>
            </div>
        </div>
    );
};


const PerformanceForecastModel: React.FC<PerformanceForecastModelProps> = ({ employees, employeesForAI }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [prediction, setPrediction] = useState<PerformanceForecast | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedEmployeeForUI = useMemo(() => {
        return employees.find(e => e.id === selectedEmployeeId);
    }, [selectedEmployeeId, employees]);

    const handlePredict = async () => {
        const selectedEmployeeForAI = employeesForAI.find(e => e.id === selectedEmployeeId);
        if (!selectedEmployeeForAI) return;
        setIsLoading(true);
        setError(null);
        setPrediction(null);
        
        const prompt = `
            Analyze the following employee's data to forecast their performance trajectory over the next year.
            Provide your prediction as a JSON object adhering to the specified schema.

            Employee Data:
            - Job Title: ${selectedEmployeeForAI.jobTitle}
            - Tenure: Hired on ${selectedEmployeeForAI.hireDate}. Today is ${new Date().toISOString().split('T')[0]}.
            - Current Performance Rating (1-5, where 5 is highest): ${selectedEmployeeForAI.performanceRating}
            - Engagement Score (1-100, where 100 is highest): ${selectedEmployeeForAI.engagementScore}

            Consider factors like high engagement and strong past performance as positive indicators. A low engagement score might suppress future performance, even if past performance was good. Also consider if their tenure suggests they are still ramping up or have hit a plateau.
        `;

        const result = await getAIPrediction<PerformanceForecast>(prompt, performanceSchema);

        if ('error' in result) {
            setError(result.error);
        } else {
            setPrediction(result);
        }
        setIsLoading(false);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3"><BrainCircuit className="h-6 w-6 text-primary-400"/> Employee Performance Forecast</CardTitle>
                <CardDescription>Select an employee to forecast their performance potential for the next year.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                     <label htmlFor="employee-select-performance" className="block text-sm font-medium text-text-secondary">Select Employee</label>
                    <select
                        id="employee-select-performance"
                        value={selectedEmployeeId}
                        onChange={(e) => { setPrediction(null); setError(null); setSelectedEmployeeId(e.target.value);}}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.jobTitle})</option>)}
                    </select>
                </div>
                <Button onClick={handlePredict} disabled={!selectedEmployeeId || isLoading} isLoading={isLoading} className="mt-4 w-full">
                    Forecast Performance
                </Button>
                
                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}

                {prediction && selectedEmployeeForUI && <ForecastDisplay prediction={prediction} employee={selectedEmployeeForUI}/>}
            </CardContent>
        </Card>
    );
};

export default PerformanceForecastModel;