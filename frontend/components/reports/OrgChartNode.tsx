
import React, { useState } from 'react';
import type { Employee } from '../../types';
import type { OrgChartOverlay } from './OrgChartExplorer';

interface OrgNode extends Employee {
  children: OrgNode[];
}

interface OrgChartNodeProps {
    node: OrgNode;
    level: number;
    overlayMode: OrgChartOverlay;
    employeeMetrics: Map<string, { risk: 'Low' | 'Medium' | 'High' }>;
}

const getAvatarColor = (gender: Employee['gender']) => {
  switch (gender) {
    case 'Female': return 'bg-rose-600';
    case 'Other': return 'bg-gray-600';
    case 'Male': default: return 'bg-primary-800';
  }
};

const getNodeStyle = (node: Employee, overlayMode: OrgChartOverlay, metrics: Map<string, { risk: 'Low' | 'Medium' | 'High' }>) => {
    let borderColorClass = 'border-border';

    switch(overlayMode) {
        case 'performance':
            if (node.performanceRating === 5) borderColorClass = 'border-green-500';
            else if (node.performanceRating === 4) borderColorClass = 'border-emerald-500';
            else if (node.performanceRating === 3) borderColorClass = 'border-blue-500';
            else if (node.performanceRating === 2) borderColorClass = 'border-yellow-500';
            else borderColorClass = 'border-red-500';
            break;
        case 'engagement':
            if (node.engagementScore > 85) borderColorClass = 'border-green-500';
            else if (node.engagementScore >= 70) borderColorClass = 'border-blue-500';
            else if (node.engagementScore >= 55) borderColorClass = 'border-yellow-500';
            else borderColorClass = 'border-red-500';
            break;
        case 'flightRisk':
            const metric = metrics.get(node.id);
            if (metric?.risk === 'High') borderColorClass = 'border-red-500';
            else if (metric?.risk === 'Medium') borderColorClass = 'border-yellow-500';
            else borderColorClass = 'border-green-500';
            break;
        case 'none':
        default:
             borderColorClass = 'border-border';
    }
    
    return `border-l-4 ${borderColorClass}`;
};


const OrgChartNode: React.FC<OrgChartNodeProps> = ({ node, level, overlayMode, employeeMetrics }) => {
    const [isExpanded, setIsExpanded] = useState(level < 2);
    
    const nodeStyle = getNodeStyle(node, overlayMode, employeeMetrics);

    return (
        <div className={level > 0 ? 'pl-4 sm:pl-8' : ''}>
            <div className="flex items-center my-2">
                {node.children.length > 0 && (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 p-1 rounded-full hover:bg-border transition-colors">
                        <svg className={`h-4 w-4 text-text-secondary transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
                 <div className={`flex-1 flex items-center p-2 rounded-md ${nodeStyle} ${level === 0 ? 'bg-primary-900/50' : 'bg-card'}`}>
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getAvatarColor(node.gender)} flex items-center justify-center font-bold text-white text-sm mr-3`}>
                         {node.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-text-primary">{node.name}</p>
                        <p className="text-xs text-text-secondary">{node.jobTitle}</p>
                    </div>
                </div>
            </div>
            {isExpanded && node.children.length > 0 && (
                <div className="border-l-2 border-border ml-2 sm:ml-4">
                    {node.children.map(child => 
                        <OrgChartNode 
                            key={child.id} 
                            node={child} 
                            level={level + 1} 
                            overlayMode={overlayMode}
                            employeeMetrics={employeeMetrics}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default OrgChartNode;
