import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  label: string;
  displayValue?: string;
  displayMaxValue?: string;
}

const Gauge: React.FC<GaugeProps> = ({ value, label, displayValue, displayMaxValue }) => {
  const clampedValue = Math.max(0, Math.min(value, 100));
  const strokeWidth = 10;
  const radius = 50;
  
  // An inverted U-shape is a semi-circle
  const circumference = Math.PI * radius;
  const progress = clampedValue / 100;
  const offset = circumference * (1 - progress);
  
  const getProgressColor = () => {
    switch (label) {
      case 'Flight Risk': // Higher is worse
      case 'Impact': // Higher impact is more critical, so use the same risk coloring
        if (clampedValue > 80) return '#be123c'; // Dark Red
        if (clampedValue > 60) return '#ef4444'; // Red
        if (clampedValue > 40) return '#facc15'; // Yellow
        if (clampedValue > 20) return '#a3e635'; // Lime Green
        return '#22c55e'; // Green
      case 'Potential':
        if (clampedValue > 80) return '#22c55e'; // Green for 3/3 (value 100)
        if (clampedValue > 40) return '#facc15'; // Yellow for 2/3 (value 50)
        return '#ef4444'; // Red for 1/3 (value 0)
      case 'Performance':
      case 'Engagement':
      default: // Higher is better
        if (clampedValue > 80) return '#22c55e'; // Green
        if (clampedValue > 60) return '#a3e635'; // Lime Green
        if (clampedValue > 40) return '#facc15'; // Yellow
        if (clampedValue > 20) return '#ef4444'; // Red
        return '#be123c'; // Dark Red
    }
  };

  // Path for a semi-circle arc, open at the bottom.
  // M moves to start point (left), A defines the arc to the end point (right).
  const arcPath = `M ${60 - radius} 60 A ${radius} ${radius} 0 0 1 ${60 + radius} 60`;

  return (
    <div className="relative flex flex-col items-center">
      {/* SVG is sized to fit the arc snugly */}
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path
          d={arcPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
          strokeLinecap="round"
        />
        <path
          d={arcPath}
          fill="none"
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {/* Position text inside the arc */}
      <div className="absolute top-8 left-1/2 w-full -translate-x-1/2 text-center">
         <div className="text-xl font-bold text-text-primary">
            {displayValue || value.toFixed(0)}
            {displayMaxValue && <span className="text-sm text-text-secondary">{displayMaxValue}</span>}
        </div>
        <div className="text-xs text-text-secondary uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
};

export default Gauge;