
import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BookOpen, FunctionSquare } from 'lucide-react';

interface MetricExplanationCardProps {
  title: string;
  explanation: string;
  formula: string;
}

const MetricExplanationCard: React.FC<MetricExplanationCardProps> = ({ title, explanation, formula }) => {
  if (!explanation || !formula) {
    return null; // Don't render if data is missing
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-400" />
          <span>Metric Explained: {title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-text-primary mb-1">What it measures:</h4>
          <p className="text-sm text-text-secondary">{explanation}</p>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <FunctionSquare className="h-4 w-4" /> Formula
          </h4>
          <div className="p-3 bg-background rounded-md text-sm text-primary-300 font-mono border border-border">
            {formula}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricExplanationCard;
