import React, { useState, useCallback } from 'react';
import { Type } from '@google/genai';
import { getAIPrediction } from '../services/geminiService';
import type { Employee, KeyDriverAnalysisResult } from '../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from './ui/Card';
import { BrainCircuit, TrendingDown, ArrowUpCircle } from 'lucide-react';
import Button from './ui/Button';

// Schema for the AI response
const keyDriverSchema = {
  type: Type.OBJECT,
  properties: {
    topDrivers: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          feature: { type: Type.STRING, description: 'The feature and condition identified as a key driver (e.g., "Engagement Score < 65").' },
          impact: { type: Type.NUMBER, description: 'The percentage point increase in turnover risk associated with this feature (e.g., for 5.4, it means +5.4%).' },
          description: { type: Type.STRING, description: 'A brief, one-sentence explanation of why this factor is significant.' }
        },
        required: ['feature', 'impact', 'description']
      }
    }
  },
  required: ['topDrivers']
};

const KeyDriverAnalysisWidget: React.FC<{ filteredData: Employee[] }> = ({ filteredData }) => {
  const [analysis, setAnalysis] = useState<KeyDriverAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const performAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setHasAnalyzed(true);

    if (filteredData.length < 20) {
      setError("Not enough data for a meaningful analysis. A minimum of 20 records is recommended for the current filter.");
      setIsLoading(false);
      return;
    }

    const leavers = filteredData.filter(e => e.terminationDate && e.terminationReason === 'Voluntary');
    if (leavers.length < 5) {
        setError("Not enough voluntary leavers in the current data slice for a meaningful turnover analysis.");
        setIsLoading(false);
        return;
    }

    const summarizedData = filteredData.map(emp => ({
        isLeaver: !!emp.terminationDate && emp.terminationReason === 'Voluntary',
        tenureYears: (new Date(emp.terminationDate || new Date()).getTime() - new Date(emp.hireDate).getTime()) / (1000 * 3600 * 24 * 365.25),
        performance: emp.performanceRating,
        engagement: emp.engagementScore,
        compSatisfaction: emp.compensationSatisfaction || -1, // Use -1 to denote missing data
        mgmtSatisfaction: emp.managementSatisfaction || -1,
    }));

    const dataForPrompt = summarizedData.length > 500 ? summarizedData.slice(0, 500) : summarizedData;
    
    const prompt = `
      You are a data scientist specializing in HR analytics. Analyze the provided sample of employee data to identify the top 3 statistically significant drivers of voluntary turnover (where 'isLeaver' is true).
      For each driver, identify a clear threshold (e.g., 'engagement < 65'). Quantify the impact as the positive percentage point increase in turnover risk for employees matching that condition compared to the baseline.
      Provide the result as a JSON object adhering to the schema. Do not output drivers with a negative impact.

      Data Sample (JSON format):
      ${JSON.stringify(dataForPrompt)}
    `;

    const result = await getAIPrediction<KeyDriverAnalysisResult>(prompt, keyDriverSchema);

    if ('error' in result) {
        setError(result.error);
    } else if (result.topDrivers && result.topDrivers.length > 0) {
        setAnalysis(result);
    } else {
        setError("The AI could not identify clear drivers from the current data slice.");
    }
    setIsLoading(false);

  }, [filteredData]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-primary-400" />
          Key Driver Analysis for Turnover
        </CardTitle>
        <CardDescription>AI-powered breakdown of factors contributing to turnover.</CardDescription>
      </CardHeader>
      <CardContent className="min-h-[150px] flex flex-col justify-center">
        {!hasAnalyzed && !isLoading && (
            <div className="text-center">
                <p className="text-sm text-text-secondary mb-3">Analyze the current data to identify key turnover drivers.</p>
                <Button onClick={performAnalysis}><BrainCircuit className="h-4 w-4 mr-2"/> Run Analysis</Button>
            </div>
        )}
        {isLoading && (
            <div className="flex items-center justify-center h-full text-text-secondary">
                <div className="space-y-2 animate-pulse w-full">
                    <div className="h-4 bg-border rounded w-full"></div>
                    <div className="h-4 bg-border rounded w-5/6"></div>
                    <div className="h-4 bg-border rounded w-full"></div>
                </div>
            </div>
        )}
        {!isLoading && hasAnalyzed && error && <p className="text-sm text-yellow-400 text-center">{error}</p>}
        {!isLoading && hasAnalyzed && !error && analysis && (
            <div className="space-y-4">
                {analysis.topDrivers.map((driver, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-text-primary">{driver.feature}</span>
                            <span className="flex items-center gap-1 text-red-400">
                                <ArrowUpCircle className="h-4 w-4"/>
                                +{driver.impact.toFixed(1)}% Risk
                            </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1">{driver.description}</p>
                    </div>
                ))}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeyDriverAnalysisWidget;