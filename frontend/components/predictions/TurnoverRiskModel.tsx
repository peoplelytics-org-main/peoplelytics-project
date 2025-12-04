import React, { useState, useMemo } from 'react';
import { Type } from '@google/genai';
import { getAIPrediction } from '../../services/geminiService';
import type { Employee, TurnoverPrediction } from '../../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { AlertTriangle, CheckCircle, ShieldQuestion, BarChart, Check, Zap } from 'lucide-react';

interface TurnoverRiskModelProps {
  employees: Employee[];
  employeesForAI: Employee[];
}

const turnoverSchema = {
  type: Type.OBJECT,
  properties: {
    riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: 'The predicted risk level.' },
    confidenceScore: { type: Type.NUMBER, description: 'A score from 0 to 1 representing confidence in the prediction.' },
    contributingFactors: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'A list of the top 2-4 factors influencing the prediction (e.g., "Low engagement score", "High-demand job title").'
    }
  },
  required: ['riskLevel', 'confidenceScore', 'contributingFactors']
};

const RiskDisplay: React.FC<{ prediction: TurnoverPrediction }> = ({ prediction }) => {
    const { riskLevel, confidenceScore, contributingFactors } = prediction;
    const riskConfig = {
        Low: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/50' },
        Medium: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-900/50' },
        High: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-900/50' },
    };
    const config = riskConfig[riskLevel] || { icon: ShieldQuestion, color: 'text-gray-400', bg: 'bg-gray-900/50' };
    const Icon = config.icon;

    return (
        <div className="mt-6 space-y-4">
            <div className={`p-6 rounded-lg ${config.bg} border border-border`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">Predicted Risk Level</p>
                        <p className={`text-3xl font-bold ${config.color} flex items-center gap-2`}><Icon className="h-7 w-7"/> {riskLevel}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-secondary">Confidence</p>
                        <p className={`text-3xl font-bold ${config.color}`}>{(confidenceScore * 100).toFixed(0)}%</p>
                    </div>
                </div>
                <div className="w-full bg-border rounded-full h-2.5 mt-4">
                    <div className={`${config.color.replace('text','bg')}`} style={{ width: `${confidenceScore * 100}%`, height: '100%', borderRadius: '9999px'}}></div>
                </div>
            </div>
            
            <div>
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2"><Zap className="h-5 w-5 text-primary-400"/>Key Contributing Factors</h4>
                <ul className="space-y-2">
                    {contributingFactors.map((factor, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-text-secondary p-2 bg-card rounded-md">
                           <Check className="h-4 w-4 text-green-500 flex-shrink-0"/>
                           <span>{factor}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const TurnoverRiskModel: React.FC<TurnoverRiskModelProps> = ({ employees, employeesForAI }) => {
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0]?.id || '');
    const [prediction, setPrediction] = useState<TurnoverPrediction | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePredict = async () => {
        const selectedEmployee = employeesForAI.find(e => e.id === selectedEmployeeId);
        if (!selectedEmployee) return;
        setIsLoading(true);
        setError(null);
        setPrediction(null);

        const prompt = `
            Analyze the following employee's data to predict their turnover risk in the next 6 months.
            Provide your prediction as a JSON object adhering to the specified schema.
            
            Employee Data:
            - Department: ${selectedEmployee.department}
            - Job Title: ${selectedEmployee.jobTitle}
            - Tenure: Hired on ${selectedEmployee.hireDate}. Today is ${new Date().toISOString().split('T')[0]}.
            - Performance Rating (1-5, where 1 is lowest): ${selectedEmployee.performanceRating}
            - Engagement Score (1-100, where 1 is lowest): ${selectedEmployee.engagementScore}
            
            Consider industry norms. For example, a Software Engineer in 'Engineering' might have higher turnover risk than an HR Specialist in 'HR'. Low engagement and performance are strong risk indicators. Tenure is also important; very new employees (<1 year) or very tenured employees (>5 years) might have different risk profiles.
        `;

        const result = await getAIPrediction<TurnoverPrediction>(prompt, turnoverSchema);
        
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
                <CardTitle className="flex items-center gap-3"><BarChart className="h-6 w-6 text-primary-400"/> Employee Turnover Risk Model</CardTitle>
                <CardDescription>Select an employee to predict their likelihood of leaving in the next 6 months.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <label htmlFor="employee-select-turnover" className="block text-sm font-medium text-text-secondary">Select Employee</label>
                    <select
                        id="employee-select-turnover"
                        value={selectedEmployeeId}
                        onChange={(e) => { setPrediction(null); setError(null); setSelectedEmployeeId(e.target.value);}}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.jobTitle})</option>)}
                    </select>
                </div>
                <Button onClick={handlePredict} disabled={!selectedEmployeeId || isLoading} isLoading={isLoading} className="mt-4 w-full">
                    Predict Turnover Risk
                </Button>
                
                {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
                
                {prediction && <RiskDisplay prediction={prediction} />}
            </CardContent>
        </Card>
    );
};

export default TurnoverRiskModel;