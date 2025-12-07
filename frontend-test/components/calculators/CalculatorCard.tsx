import React, { useState, useMemo, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import { getAIAssistance } from '../../services/geminiService';
import type { CalculatorConfig } from './calculatorConfig';
import { useTheme } from '../../contexts/ThemeContext';
import type { Currency } from '../../types';

const CalculatorCard: React.FC<CalculatorConfig> = ({
  title,
  description,
  inputs,
  calculateFn,
  resultType,
  aiPromptFn
}) => {
  const initialInputState = useMemo(() => 
    inputs.reduce((acc, input) => ({ ...acc, [input.id]: input.defaultValue || '' }), {}),
    [inputs]
  );
  
  const [inputValues, setInputValues] = useState<Record<string, string>>(initialInputState);
  const [result, setResult] = useState<number | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currency } = useTheme();

  const canInitiallyCalculate = useMemo(() => {
    return inputs.every(input => input.defaultValue && input.defaultValue.trim() !== '' && !isNaN(Number(input.defaultValue)));
  }, [inputs]);

  useEffect(() => {
    if (canInitiallyCalculate) {
        const numericInputs = Object.fromEntries(
            Object.entries(initialInputState).map(([key, value]) => [key, Number(value) || 0])
        );
        const calculatedResult = calculateFn(numericInputs);
        setResult(calculatedResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // This should only run on mount

  const handleInputChange = (id: string, value: string) => {
    setInputValues(prev => ({ ...prev, [id]: value }));
    setResult(null);
    setAiInsight('');
  };

  const handleCalculate = () => {
    const numericInputs = Object.fromEntries(
        Object.entries(inputValues).map(([key, value]) => [key, Number(value) || 0])
    );
    const calculatedResult = calculateFn(numericInputs);
    setResult(calculatedResult);
  };

  const handleGetInsights = async () => {
    if (result === null) return;
    setIsLoading(true);
    setAiInsight('');
    const numericInputs = Object.fromEntries(
        Object.entries(inputValues).map(([key, value]) => [key, Number(value) || 0])
    );
    const prompt = aiPromptFn(numericInputs, result);
    const insight = await getAIAssistance(prompt);
    setAiInsight(insight);
    setIsLoading(false);
  };

  const canCalculate = useMemo(() => {
    return inputs.every(input => {
        const value = inputValues[input.id];
        return value.trim() !== '' && !isNaN(Number(value));
    })
  }, [inputValues, inputs]);

  const currencySymbols: Record<Currency, string> = {
      PKR: 'Rs',
      USD: '$',
      EUR: '€',
      GBP: '£',
  };

  const formatResult = (res: number): string => {
      if (res === null || res === undefined) return '';

      switch (resultType) {
          case 'currency':
              return `${currencySymbols[currency]}${res.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          case 'percent':
              if (!isFinite(res)) return 'N/A (from 0 start)';
              return `${res.toFixed(2)}%`;
          case 'days':
              return `${res.toFixed(1)} days`;
          case 'daysPerEmployee':
              return `${res.toFixed(2)} days/employee`;
          case 'decimal':
              return res.toFixed(2);
          case 'ratio':
              return `${res.toFixed(2)}:1`;
          case 'score':
                return `${res.toFixed(1)} / 100`;
          case 'hours':
              return `${res.toFixed(1)} hrs/week`;
          case 'return':
              return `${res.toFixed(2)}x Return`;
          case 'per100':
              return `${res.toFixed(2)} per 100`;
          case 'generic':
          default:
              if (!isFinite(res)) return 'N/A';
              return res.toLocaleString('en-US');
      }
  };


  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="space-y-4">
            {inputs.map(input => (
                <Input
                    key={input.id}
                    id={input.id}
                    label={input.label.replace('($)', `(${currencySymbols[currency]})`)}
                    type={input.type}
                    value={inputValues[input.id]}
                    onChange={e => handleInputChange(input.id, e.target.value)}
                    placeholder={input.placeholder}
                />
            ))}
        </div>

        <div className="flex gap-2 mt-4">
            <Button onClick={handleCalculate} disabled={!canCalculate}>Calculate</Button>
            {result !== null && <Button onClick={handleGetInsights} isLoading={isLoading} variant="secondary">Get AI Insights</Button>}
        </div>

        {result !== null && (
          <div className="mt-4 p-4 bg-primary-900/50 rounded-md text-center">
            <p className="text-text-secondary text-sm">{title}</p>
            <p className="text-3xl font-bold text-white">{formatResult(result)}</p>
          </div>
        )}

        <div className="mt-auto pt-4">
            {isLoading && <p className="text-text-secondary text-sm">Generating AI insights...</p>}
            {aiInsight && (
                <div className="mt-4 p-4 bg-background rounded-md prose prose-invert prose-sm max-w-none text-text-secondary">
                    <h4 className="font-semibold text-text-primary">AI Insights</h4>
                    <MarkdownRenderer text={aiInsight} />
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculatorCard;