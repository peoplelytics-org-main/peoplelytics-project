
import React, { useState, useMemo, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { calculateROI, calculateTurnoverSavings, calculateProductivityGains, calculateRecruitmentSavings } from '../services/hrCalculations';
import { getAIAssistance } from '../services/geminiService';
import { ChevronDown, PlusCircle, Trash2, Lightbulb, TrendingUp, TrendingDown, Target, DollarSign, BrainCircuit, BarChart, Info } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Currency } from '../types';

// --- Local Components ---

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  startOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, startOpen = false }) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 hover:bg-border/50 transition-colors"
      >
        <h3 className="font-semibold text-text-primary text-left">{title}</h3>
        <ChevronDown
          className={`h-5 w-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="p-4 border-t border-border bg-background">
          {children}
        </div>
      )}
    </div>
  );
};


// --- Main ROI Analyzer Page Component ---

const ROIAnalyzerPage: React.FC = () => {
  const { currency } = useTheme();
  const [initiativeName, setInitiativeName] = useState('Improve Onboarding Process');
  
  // Costs State
  const [costs, setCosts] = useState([
    { id: 1, name: 'HR Analyst Time', amount: '5000' },
    { id: 2, name: 'New Onboarding Software', amount: '15000' },
  ]);
  const handleCostChange = (id: number, field: 'name' | 'amount', value: string) => {
    setCosts(costs.map(c => c.id === id ? { ...c, [field]: value } : c));
  };
  const addCost = () => setCosts([...costs, { id: Date.now(), name: '', amount: '' }]);
  const removeCost = (id: number) => setCosts(costs.filter(c => c.id !== id));
  
  // Benefits State
  const [benefits, setBenefits] = useState({
    turnover: { enabled: true, inputs: { avgCostPerTermination: '50000', turnoverReductionPercent: '3', annualTerminations: '50' }},
    productivity: { enabled: false, inputs: { revenuePerEmployee: '200000', productivityIncreasePercent: '1', numberOfEmployees: '500' }},
    recruitment: { enabled: false, inputs: { avgCostPerHire: '8000', hiresAvoided: '5' }},
  });
  const handleBenefitInputChange = (benefitType: 'turnover' | 'productivity' | 'recruitment', inputName: string, value: string) => {
      setBenefits(prev => ({
          ...prev,
          [benefitType]: { ...prev[benefitType], inputs: { ...prev[benefitType].inputs, [inputName]: value } }
      }));
  };
  const toggleBenefit = (benefitType: 'turnover' | 'productivity' | 'recruitment') => {
      setBenefits(prev => ({ ...prev, [benefitType]: { ...prev[benefitType], enabled: !prev[benefitType].enabled }}));
  };
  
  // Other State
  const [qualitativeBenefits, setQualitativeBenefits] = useState('Enhanced new hire engagement & faster time-to-productivity.\nStronger employer brand perception.');
  const [aiReport, setAiReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetAudience, setTargetAudience] = useState('CFO');

  const currencySymbols: Record<Currency, string> = {
      PKR: 'Rs',
      USD: '$',
      EUR: '€',
      GBP: '£',
  };
  const currencySymbol = currencySymbols[currency];

  // Calculations
  const totalCost = useMemo(() => costs.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0), [costs]);

  const calculatedBenefits = useMemo(() => {
    const i_t = benefits.turnover.inputs;
    const i_p = benefits.productivity.inputs;
    const i_r = benefits.recruitment.inputs;
    
    const turnoverSavings = benefits.turnover.enabled ? calculateTurnoverSavings(Number(i_t.avgCostPerTermination), Number(i_t.turnoverReductionPercent), Number(i_t.annualTerminations)) : 0;
    const productivityGains = benefits.productivity.enabled ? calculateProductivityGains(Number(i_p.revenuePerEmployee), Number(i_p.productivityIncreasePercent), Number(i_p.numberOfEmployees)) : 0;
    const recruitmentSavings = benefits.recruitment.enabled ? calculateRecruitmentSavings(Number(i_r.avgCostPerHire), Number(i_r.hiresAvoided)) : 0;
    
    return { turnoverSavings, productivityGains, recruitmentSavings };
  }, [benefits]);
  
  const totalBenefit = useMemo(() => Object.values(calculatedBenefits).reduce((sum: number, value: number) => sum + value, 0), [calculatedBenefits]);
  const netBenefit = useMemo(() => totalBenefit - totalCost, [totalBenefit, totalCost]);
  const roi = useMemo(() => calculateROI(netBenefit, totalCost), [netBenefit, totalCost]);
  
  // AI Report Generation
  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    setAiReport('');

    const costDetails = costs.filter(c => c.amount).map(c => `- ${c.name}: ${currencySymbol}${Number(c.amount).toLocaleString()}`).join('\n');
    const benefitDetails = [
      benefits.turnover.enabled && `*   **Turnover Reduction Savings:** ${currencySymbol}${calculatedBenefits.turnoverSavings.toLocaleString()} (by reducing turnover by ${benefits.turnover.inputs.turnoverReductionPercent}%)`,
      benefits.productivity.enabled && `*   **Productivity Gains:** ${currencySymbol}${calculatedBenefits.productivityGains.toLocaleString()} (from a ${benefits.productivity.inputs.productivityIncreasePercent}% productivity increase)`,
      benefits.recruitment.enabled && `*   **Recruitment Savings:** ${currencySymbol}${calculatedBenefits.recruitmentSavings.toLocaleString()} (by avoiding ${benefits.recruitment.inputs.hiresAvoided} hires)`
    ].filter(Boolean).join('\n');

    const prompt = `
        As an expert business consultant, create a compelling ROI report for an HR initiative named "${initiativeName}".
        The target audience for this report is the **${targetAudience}**. Tailor the language, focus, and key takeaways specifically for them.

        ### Initiative Overview
        ${initiativeName}

        ### Financial Breakdown
        *   **Total Project Costs:** ${currencySymbol}${totalCost.toLocaleString()}
        ${costDetails}
        *   **Total Estimated Financial Benefits:** ${currencySymbol}${totalBenefit.toLocaleString()}
        ${benefitDetails}
        *   **Net Financial Benefit:** ${currencySymbol}${netBenefit.toLocaleString()}
        *   **Projected ROI:** ${roi.toFixed(2)}%

        ### Qualitative Benefits
        ${qualitativeBenefits || "None specified."}

        ### Your Task
        Generate a narrative report based on all the data above. Structure it as follows:
        1.  **Executive Summary:** A brief, powerful summary tailored to the ${targetAudience}. For a CFO, focus on numbers, financial health, and payback period. For a CEO, focus on strategic impact and bottom-line growth. For HR Leadership, focus on operational improvements and alignment with HR goals.
        2.  **Analysis of Financials:** Briefly explain where the costs and benefits come from. Highlight the most significant drivers.
        3.  **Strategic Impact:** Discuss the qualitative benefits and link them to broader business objectives (e.g., how improved morale can reduce long-term attrition risk).
        4.  **Recommendation:** Conclude with a clear recommendation on whether to proceed with the initiative, based on this analysis.
    `;
    const result = await getAIAssistance(prompt);
    setAiReport(result);
    setIsGenerating(false);
  }, [initiativeName, costs, benefits, calculatedBenefits, qualitativeBenefits, totalCost, totalBenefit, netBenefit, roi, targetAudience, currencySymbol]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary">ROI Business Case Builder</h2>
            <p className="text-text-secondary mt-1">Create a comprehensive business case for any HR initiative.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Project Overview & Costs</CardTitle>
                    <CardDescription>Define the initiative and its associated costs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Input label="Initiative Name" type="text" value={initiativeName} onChange={e => setInitiativeName(e.target.value)} placeholder="e.g., Leadership Training Program" />
                    {costs.map((cost, index) => (
                        <div key={cost.id} className="flex flex-wrap items-end gap-2">
                           <div className="flex-1 min-w-[12rem]">
                             <Input label={index === 0 ? 'Cost Item' : ''} type="text" value={cost.name} onChange={e => handleCostChange(cost.id, 'name', e.target.value)} placeholder="e.g., Software License"/>
                           </div>
                           <div className="w-full sm:w-40">
                              <Input label={index === 0 ? `Amount (${currencySymbol})` : ''} type="number" value={cost.amount} onChange={e => handleCostChange(cost.id, 'amount', e.target.value)} placeholder="e.g., 15000" />
                           </div>
                           <Button variant="ghost" size="sm" onClick={() => removeCost(cost.id)} className="p-2 h-10 w-10 flex-shrink-0"><Trash2 className="h-4 w-4 text-red-400"/></Button>
                        </div>
                    ))}
                    <Button variant="secondary" size="sm" onClick={addCost} className="gap-2"><PlusCircle className="h-4 w-4"/> Add Cost Item</Button>
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>2. Financial Benefits</CardTitle>
                    <CardDescription>Quantify the expected financial gains from the initiative.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Accordion title="Turnover Reduction Savings">
                         <div className="space-y-3">
                             <div className="flex justify-end"><label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={benefits.turnover.enabled} onChange={() => toggleBenefit('turnover')} className="form-checkbox h-4 w-4 bg-background border-border text-primary-600 focus:ring-primary-500" /> Enable</label></div>
                            <Input label={`Avg. Cost per Termination (${currencySymbol})`} type="number" value={benefits.turnover.inputs.avgCostPerTermination} onChange={e => handleBenefitInputChange('turnover', 'avgCostPerTermination', e.target.value)} disabled={!benefits.turnover.enabled} />
                            <Input label="Expected Turnover Reduction (%)" type="number" value={benefits.turnover.inputs.turnoverReductionPercent} onChange={e => handleBenefitInputChange('turnover', 'turnoverReductionPercent', e.target.value)} disabled={!benefits.turnover.enabled} />
                            <Input label="Baseline Annual Terminations" type="number" value={benefits.turnover.inputs.annualTerminations} onChange={e => handleBenefitInputChange('turnover', 'annualTerminations', e.target.value)} disabled={!benefits.turnover.enabled} />
                         </div>
                    </Accordion>
                     <Accordion title="Productivity Gains">
                         <div className="space-y-3">
                            <div className="flex justify-end"><label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={benefits.productivity.enabled} onChange={() => toggleBenefit('productivity')} className="form-checkbox h-4 w-4 bg-background border-border text-primary-600 focus:ring-primary-500"/> Enable</label></div>
                            <Input label={`Avg. Revenue per Employee (${currencySymbol})`} type="number" value={benefits.productivity.inputs.revenuePerEmployee} onChange={e => handleBenefitInputChange('productivity', 'revenuePerEmployee', e.target.value)} disabled={!benefits.productivity.enabled}/>
                            <Input label="Expected Productivity Increase (%)" type="number" value={benefits.productivity.inputs.productivityIncreasePercent} onChange={e => handleBenefitInputChange('productivity', 'productivityIncreasePercent', e.target.value)} disabled={!benefits.productivity.enabled}/>
                            <Input label="Number of Affected Employees" type="number" value={benefits.productivity.inputs.numberOfEmployees} onChange={e => handleBenefitInputChange('productivity', 'numberOfEmployees', e.target.value)} disabled={!benefits.productivity.enabled}/>
                         </div>
                    </Accordion>
                     <Accordion title="Recruitment Savings">
                         <div className="space-y-3">
                             <div className="flex justify-end"><label className="flex items-center gap-2 text-sm text-text-secondary"><input type="checkbox" checked={benefits.recruitment.enabled} onChange={() => toggleBenefit('recruitment')} className="form-checkbox h-4 w-4 bg-background border-border text-primary-600 focus:ring-primary-500"/> Enable</label></div>
                            <Input label={`Avg. Cost per Hire (${currencySymbol})`} type="number" value={benefits.recruitment.inputs.avgCostPerHire} onChange={e => handleBenefitInputChange('recruitment', 'avgCostPerHire', e.target.value)} disabled={!benefits.recruitment.enabled} />
                            <Input label="Number of Hires Avoided" type="number" value={benefits.recruitment.inputs.hiresAvoided} onChange={e => handleBenefitInputChange('recruitment', 'hiresAvoided', e.target.value)} disabled={!benefits.recruitment.enabled} />
                         </div>
                    </Accordion>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>3. Qualitative Benefits</CardTitle>
                    <CardDescription>List the non-monetary benefits, such as improved morale or culture.</CardDescription>
                </CardHeader>
                <CardContent>
                    <textarea value={qualitativeBenefits} onChange={e => setQualitativeBenefits(e.target.value)} rows={4} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none" placeholder="e.g., Improved employee morale..."></textarea>
                </CardContent>
            </Card>

        </div>
        
        {/* Right Column: Summary & AI */}
        <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-text-secondary flex items-center gap-2"><TrendingDown className="h-4 w-4 text-red-400"/> Total Costs</span>
                           <span className="font-semibold text-text-primary">{currencySymbol}{totalCost.toLocaleString()}</span>
                       </div>
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-text-secondary flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-400"/> Total Benefits</span>
                           <span className="font-semibold text-text-primary">{currencySymbol}{totalBenefit.toLocaleString()}</span>
                       </div>
                        <div className="flex justify-between items-center text-sm font-bold border-t border-border pt-3">
                           <span className="text-text-primary flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary-400"/> Net Benefit</span>
                           <span className="text-text-primary">{currencySymbol}{netBenefit.toLocaleString()}</span>
                       </div>
                        <div className="text-center bg-primary-900/50 p-4 rounded-lg mt-2">
                            <p className="text-sm text-primary-300 font-semibold flex items-center justify-center gap-2"><Target className="h-4 w-4"/> Return on Investment (ROI)</p>
                            <p className={`text-4xl font-bold mt-1 ${roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{roi.toFixed(2)}%</p>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center gap-2"><Lightbulb className="h-5 w-5 text-primary-400"/> AI Narrative Builder</CardTitle>
                         <CardDescription>Generate a tailored report for stakeholders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Target Audience</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['CEO', 'CFO', 'HR'].map(role => (
                                     <button key={role} onClick={() => setTargetAudience(role)} className={`px-2 py-1.5 text-xs rounded-md transition-colors ${targetAudience === role ? 'bg-primary-600 text-white font-semibold' : 'bg-border text-text-secondary hover:bg-border/70'}`}>{role === 'HR' ? 'HR Leadership' : role}</button>
                                ))}
                            </div>
                        </div>
                        <Button onClick={generateReport} isLoading={isGenerating} className="w-full mt-4">
                            {isGenerating ? 'Generating Report...' : `Generate ${targetAudience} Report`}
                        </Button>
                        
                        {(isGenerating || aiReport) && <div className="border-t border-border mt-4 pt-4">
                            {isGenerating && <div className="space-y-2 animate-pulse">
                                <div className="h-4 bg-border rounded w-1/3"></div>
                                <div className="h-3 bg-border rounded w-full"></div>
                                <div className="h-3 bg-border rounded w-5/6"></div>
                            </div>}
                            {aiReport && 
                                <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                                    <MarkdownRenderer text={aiReport} />
                                </div>
                            }
                        </div>}
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ROIAnalyzerPage;