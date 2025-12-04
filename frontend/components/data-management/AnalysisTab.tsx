import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import ExitInterviewAnalyzer from '../analysis/ExitInterviewAnalyzer';

const AnalysisTab: React.FC = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ExitInterviewAnalyzer />
            <Card>
                 <CardHeader>
                    <CardTitle>More Analysis Tools Coming Soon</CardTitle>
                    <CardDescription>We're building more AI-powered tools to help you analyze your data.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-text-secondary">Future tools may include sentiment analysis on performance reviews, competency framework analysis, and more.</p>
                </CardContent>
            </Card>
        </div>
    );
}

export default AnalysisTab;
