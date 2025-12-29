import React, { useState, useCallback } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import { getAIAssistance } from '../services/geminiService';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { Sparkles } from 'lucide-react';
import Button from './ui/Button';

interface AIStoryCardProps {
  filteredData: any[];
  metrics: Record<string, any>;
  filters: Record<string, any>;
}

const AIStoryCard: React.FC<AIStoryCardProps> = ({ filteredData, metrics, filters }) => {
  const [story, setStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generateStory = useCallback(async () => {
    setIsLoading(true);
    setStory('');
    setHasGenerated(true);
    
    if (filteredData.length === 0) {
        setStory("Not enough data to generate a story. Please adjust your filters or upload more data.");
        setIsLoading(false);
        return;
    }

    const filterDescriptions = Object.entries(filters)
      .filter(([, value]) => value !== 'all' && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');

    const prompt = `
      You are an expert HR Business Partner providing a high-level summary for an executive. Your tone should be concise, strategic, and data-driven.

      **Current Data Context:**
      - **Filters Applied:** ${filterDescriptions || 'No specific filters applied (viewing all data).'}
      - **Time Period:** The data considers the "${filters.timePeriod}" timeframe.

      **Key Metrics for this View:**
      - **Active Headcount:** ${metrics.totalEmployees}
      - **Annualized Turnover Rate:** ${metrics.turnoverRate.toFixed(1)}%
      - **Average Employee Engagement:** ${metrics.averageEngagement.toFixed(1)} out of 100
      - **Average Employee Tenure:** ${metrics.averageTenure.toFixed(1)} years
      - **Revenue per Employee:** $${metrics.revenuePerEmployee.toLocaleString()}

      **Your Task:**
      Analyze the metrics within the given context. Create a short, insightful narrative. DO NOT just list the metrics back. Interpret them and explain what they mean for the business.

      **Required Format (use Markdown):**
      ### Executive Summary
      A 1-2 sentence summary of the current situation. For example, "The Sales department shows strong engagement but is facing high turnover among new hires, impacting team stability."

      ### Key Observations
      *   Provide 2-3 bullet points. Each point should highlight a key insight, a potential risk, or a success.
      *   Connect the metrics. For example, does high turnover correlate with low engagement? Is low tenure affecting productivity?

      ### Strategic Recommendations
      *   Provide 1-2 brief, actionable recommendations based on your observations. For example, "Focus retention efforts on high-performing new hires in Sales." or "Investigate management practices in departments with low engagement."
    `;

    const result = await getAIAssistance(prompt);
    setStory(result);
    setIsLoading(false);
  }, [filteredData, metrics, filters]);

  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-400" />
            AI Story
        </CardTitle>
      </CardHeader>
      <CardContent className="min-h-[150px] flex flex-col justify-center">
        {!hasGenerated && !isLoading && (
            <div className="text-center py-4">
               <p className="text-sm text-text-secondary mb-3">Generate an AI-powered narrative summary of the current data view.</p>
               <Button onClick={generateStory}><Sparkles className="h-4 w-4 mr-2"/> Generate Summary</Button>
            </div>
        )}
        {isLoading && (
            <div className="space-y-2 animate-pulse">
                <div className="h-4 bg-border rounded w-1/3"></div>
                <div className="h-3 bg-border rounded w-full"></div>
                <div className="h-3 bg-border rounded w-5/6"></div>
            </div>
        )}
        {!isLoading && hasGenerated && story && (
            <div className="prose prose-invert prose-sm max-w-none text-text-secondary">
                <MarkdownRenderer text={story} />
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIStoryCard;