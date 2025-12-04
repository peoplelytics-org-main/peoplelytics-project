import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BookOpen, BrainCircuit } from 'lucide-react';

interface PredictionExplanationCardProps {
  title: string;
  explanation: string;
  factors: string[];
}

const PredictionExplanationCard: React.FC<PredictionExplanationCardProps> = ({ title, explanation, factors }) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary-400" />
          <span>Model Explained: {title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-text-primary mb-1">How it works:</h4>
          <p className="text-sm text-text-secondary">{explanation}</p>
        </div>
        <div>
          <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" /> Key Factors Considered
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
            {factors.map((factor, i) => (
              <li key={i}>{factor}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionExplanationCard;
