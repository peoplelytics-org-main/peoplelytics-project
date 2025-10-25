
import React from 'react';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon }) => {
  const changeColor = changeType === 'increase' ? 'text-green-400' : 'text-red-400';
  const Arrow = changeType === 'increase' ? '↑' : '↓';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
        <div className="p-2.5 rounded-lg bg-primary-900/40 text-primary-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-text-primary">{value}</div>
        {change && (
            <p className={`text-xs ${changeColor}`}>
                {Arrow} {change} from last period
            </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MetricCard;
