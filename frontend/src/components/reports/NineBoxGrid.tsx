import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Employee } from '../../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { X } from 'lucide-react';

// Types
export type PerformanceCategory = 'High' | 'Medium' | 'Low';
export type PotentialCategory = 'High' | 'Medium' | 'Low';

export interface NineBoxGridData {
  High: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Medium: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
  Low: { Low: Employee[]; Medium: Employee[]; High: Employee[] };
}

interface NineBoxGridProps {
    data: NineBoxGridData;
}

const potentialCategories: PotentialCategory[] = ['Low', 'Medium', 'High'];
const performanceCategories: PerformanceCategory[] = ['High', 'Medium', 'Low'];

// Config for cell appearance and titles
const cellConfig: Record<PerformanceCategory, Record<PotentialCategory, { title: string; color: string; textColor: string; description: string; }>> = {
  High: {
    Low: { title: "Inconsistent Performer", color: "bg-purple-900/50 border-purple-700", textColor: "text-purple-400", description: "High performance but limited potential. Valuable specialists." },
    Medium: { title: "High Performer", color: "bg-emerald-800/50 border-emerald-600", textColor: "text-emerald-300", description: "Strong performers with growth potential. Key contributors." },
    High: { title: "Future Leader", color: "bg-green-800/50 border-green-600", textColor: "text-green-300", description: "Top talent. Groom for leadership roles immediately." }
  },
  Medium: {
    Low: { title: "Solid Performer", color: "bg-blue-800/50 border-blue-600", textColor: "text-blue-300", description: "Reliable contributors, likely specialists. Core of the workforce." },
    Medium: { title: "Core Employee", color: "bg-gray-700/50 border-gray-500", textColor: "text-gray-300", description: "Steady performers with potential. Nurture and develop." },
    High: { title: "Emerging Potential", color: "bg-yellow-700/50 border-yellow-500", textColor: "text-yellow-300", description: "High potential, but performance needs development. Invest in coaching." }
  },
  Low: {
    Low: { title: "Action Required", color: "bg-red-800/50 border-red-600", textColor: "text-red-300", description: "Low performance and potential. Requires performance management or role change." },
    Medium: { title: "Inconsistent Player", color: "bg-red-900/50 border-red-700", textColor: "text-red-400", description: "Has potential but struggling in current role. Requires support and development." },
    High: { title: "Enigma", color: "bg-orange-800/50 border-orange-600", textColor: "text-orange-300", description: "High potential but low performance. Investigate for blockers or disengagement." }
  }
};

const EmployeeListModal: React.FC<{
    employees: Employee[];
    title: string;
    onClose: () => void;
}> = ({ employees, title, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-lg relative max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{employees.length} employee(s)</CardDescription>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border transition-colors">
                        <X className="h-5 w-5 text-text-secondary"/>
                    </button>
                </CardHeader>
                <CardContent className="overflow-y-auto space-y-3">
                    {employees.map(emp => (
                        <Link to={`/app/profiles/${emp.id}`} key={emp.id} className="block p-3 bg-background rounded-md hover:bg-border transition-colors">
                            <p className="font-semibold text-text-primary">{emp.name}</p>
                            <p className="text-sm text-text-secondary">{emp.jobTitle}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};


const NineBoxGrid: React.FC<NineBoxGridProps> = ({ data }) => {
    const [selectedCell, setSelectedCell] = useState<{ perf: PerformanceCategory; pot: PotentialCategory } | null>(null);

    const handleCellClick = (perf: PerformanceCategory, pot: PotentialCategory) => {
        if (data[perf]?.[pot]?.length > 0) {
            setSelectedCell({ perf, pot });
        }
    };

    const closeModal = () => setSelectedCell(null);

    return (
        <div className="flex items-stretch gap-4">
            <div className="flex items-center">
                <h3 className="transform -rotate-90 text-sm font-bold text-text-secondary whitespace-nowrap">&larr; Performance &larr;</h3>
            </div>
            <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                    {performanceCategories.map(perfCat =>
                        potentialCategories.map(potCat => {
                            const cellData = data[perfCat]?.[potCat];
                            const cellLength = cellData?.length ?? 0;
                            const config = cellConfig[perfCat][potCat];
                            return (
                                <div
                                    key={`${perfCat}-${potCat}`}
                                    className={`p-4 rounded-lg border-2 min-h-[140px] flex flex-col justify-between transition-all duration-200 ${cellLength > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'opacity-60'} ${config.color}`}
                                    onClick={() => handleCellClick(perfCat, potCat)}
                                    title={config.description}
                                >
                                    <div>
                                        <h4 className="font-bold text-text-primary">{config.title}</h4>
                                        <p className="text-xs text-text-secondary mt-1">{config.description}</p>
                                    </div>
                                    <p className={`text-4xl font-black self-end ${config.textColor}`}>{cellLength}</p>
                                </div>
                            );
                        })
                    )}
                </div>
                <div className="grid grid-cols-3 text-center text-sm font-semibold text-text-secondary">
                    <span>Low Potential</span>
                    <span>Medium Potential</span>
                    <span>High Potential</span>
                </div>
                <div className="text-center mt-2 text-sm font-bold text-text-primary">
                    <span>&rarr; Potential &rarr;</span>
                </div>
            </div>
            {selectedCell && (
                <EmployeeListModal
                    employees={data[selectedCell.perf]?.[selectedCell.pot] ?? []}
                    title={cellConfig[selectedCell.perf][selectedCell.pot].title}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default NineBoxGrid;