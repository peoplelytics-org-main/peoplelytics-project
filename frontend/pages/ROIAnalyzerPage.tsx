
import React, { useState, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { calculateTurnoverSavings } from '../services/calculations';
import { getAIAssistance } from '../services/geminiService';
import { ChevronDown, ChevronUp, Lightbulb, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../hooks/useCurrency';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, isOpen, onToggle }) => (
  <div className="border border-border rounded-lg bg-background">
    <button type="button" onClick={onToggle} className="w-full flex justify-between items-center p-4 hover:bg-border/50 transition-colors">
      <h4 className="font-semibold text-text-primary text-left">{title}</h4>
      {isOpen ? <ChevronUp className="h-5 w-5 text-text-secondary" /> : <ChevronDown className="h-5 w-5 text-text-secondary" />}
    </button>
    {isOpen && <div className="p-4 border-t border-border">{children}</div>}
  </div>
);

const TurnoverSavingsCalculator: React.FC = () => {
    const { format, symbol } = useCurrency();
    const [inputs, setInputs] = useState({ avgCostPerTermination: '5000', turnoverReductionPercent: '10', annualTerminations: '50' });
    const [result, setResult] = useState<number | null>(null);
    const [insight, setInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputs({ ...inputs, [e.target.id]: e.target.value });
    };

    const handleCalculate = () => {
        const savings = calculateTurnoverSavings(
            Number(inputs.avgCostPerTermination),
            Number(inputs.turnoverReductionPercent),
            Number(inputs.annualTerminations)
        );
        setResult(savings);
    };
    
    const handleGetInsight = async () => {
        if (result === null) return;
        setIsLoadingInsight(true);
        setInsight('');
        const prompt = `An initiative is projected to save ${format(result)} by reducing turnover. It assumes an average cost per termination of ${format(Number(inputs.avgCostPerTermination))}, a turnover reduction of ${inputs.turnoverReductionPercent}%, and ${inputs.annualTerminations} annual terminations. Briefly explain the other, less obvious financial benefits of reducing employee turnover.`;
        const aiInsight = await getAIAssistance(prompt);
        setInsight(aiInsight);
        setIsLoadingInsight(false);
    };

    return (
        <div className="space-y-4">
            <Input label={`Average Cost per Termination (${symbol})`} id="avgCostPerTermination" type="number" value={inputs.avgCostPerTermination} onChange={handleInputChange} />
            <Input label="Turnover Reduction (%)" id="turnoverReductionPercent" type="number" value={inputs.turnoverReductionPercent} onChange={handleInputChange} />
            <Input label="Annual Terminations" id="annualTerminations" type="number" value={inputs.annualTerminations} onChange={handleInputChange} />
            <Button onClick={handleCalculate}>Calculate Savings</Button>
            {result !== null && (
                <div className="mt-4 space-y-4">
                    <div className="p-4 bg-primary-900/50 rounded-md text-center">
                        <p className="text-text-secondary text-sm">Estimated Annual Savings</p>
                        <p className="text-3xl font-bold text-white">{format(result, { maximumFractionDigits: 0 })}</p>
                    </div>
                    <Button onClick={handleGetInsight} isLoading={isLoadingInsight} variant="secondary" className="gap-2"><Lightbulb className="h-4 w-4" /> Get AI Insights</Button>
                    {isLoadingInsight && <p className="text-sm text-text-secondary">Generating insights...</p>}
                    {insight && (
                        <div className="prose prose-sm prose-invert max-w-none text-text-secondary">
                             <MarkdownRenderer text={insight} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const ROIAnalyzerPage: React.FC = () => {
    const [openAccordion, setOpenAccordion] = useState<string>('turnover');

    return (
        <div className="space-y-6">
            <header className="flex items-center gap-4">
                 <div className="p-3 bg-primary-900/50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-primary-400"/>
                 </div>
                 <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">ROI Analyzer</h2>
                    <p className="text-text-secondary mt-1">Build business cases for HR initiatives by quantifying their financial impact.</p>
                 </div>
            </header>
            <Accordion title="Turnover Reduction Savings" isOpen={openAccordion === 'turnover'} onToggle={() => setOpenAccordion(openAccordion === 'turnover' ? '' : 'turnover')}>
                <TurnoverSavingsCalculator />
            </Accordion>
            {/* Other calculators could be added here in a similar fashion */}
        </div>
    );
};

export default ROIAnalyzerPage;
