
import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { getEmployeeFlightRisk, calculateFlightRiskScore, calculateImpactScore } from '../../services/hrCalculations';
import type { Employee } from '../../types';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import { X } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend, type ChartEvent, type ActiveElement } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';


ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);


// --- SHARED TYPES & MODAL ---

type PerformanceCategory = 'High' | 'Medium' | 'Low';
type RiskCategory = 'Low' | 'Medium' | 'High';

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
                    {employees.length > 0 ? employees.map(emp => (
                        <Link to={`/profiles/${emp.id}`} key={emp.id} className="block p-3 bg-background rounded-md hover:bg-border transition-colors">
                            <p className="font-semibold text-text-primary">{emp.name}</p>
                            <p className="text-sm text-text-secondary">{emp.jobTitle}</p>
                        </Link>
                    )) : <p className="text-center text-text-secondary py-8">No employees in this segment.</p>}
                </CardContent>
            </Card>
            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

// --- PERFORMANCE vs RISK MATRIX ---

const performanceCategories: PerformanceCategory[] = ['High', 'Medium', 'Low'];
const riskCategories: RiskCategory[] = ['Low', 'Medium', 'High'];

const perfRiskCellConfig: Record<PerformanceCategory, Record<RiskCategory, { title: string; color: string; textColor: string; description: string; }>> = {
  High: {
    Low: { title: "Future Stars", color: "bg-green-800/50 border-green-600", textColor: "text-green-300", description: "High performers, low flight risk. Nurture and develop for leadership." },
    Medium: { title: "High Potentials", color: "bg-emerald-800/50 border-emerald-600", textColor: "text-emerald-300", description: "Strong performers to retain. Monitor engagement and growth opportunities." },
    High: { title: "Critical Flight Risk", color: "bg-yellow-700/50 border-yellow-500", textColor: "text-yellow-300", description: "High-impact employees at risk of leaving. Immediate retention focus required." }
  },
  Medium: {
    Low: { title: "Solid Performers", color: "bg-blue-800/50 border-blue-600", textColor: "text-blue-300", description: "Core of the workforce. Keep engaged and recognize contributions." },
    Medium: { title: "Core Employees", color: "bg-gray-700/50 border-gray-500", textColor: "text-gray-300", description: "Steady contributors. Ensure they have clear career paths." },
    High: { title: "At-Risk Performers", color: "bg-orange-800/50 border-orange-600", textColor: "text-orange-300", description: "Satisfactory performers who are a flight risk. Investigate reasons." }
  },
  Low: {
    Low: { title: "Misaligned Talent", color: "bg-purple-900/50 border-purple-700", textColor: "text-purple-400", description: "Low performers, low flight risk. Consider role fit or performance management." },
    Medium: { title: "Needs Development", color: "bg-red-900/50 border-red-700", textColor: "text-red-400", description: "Low performers with potential to leave. Requires coaching and a development plan." },
    High: { title: "Urgent Concern", color: "bg-red-800/50 border-red-600", textColor: "text-red-300", description: "Low performers who are actively disengaged. Requires immediate intervention." }
  }
};

const PerformanceRiskMatrix: React.FC = () => {
    const { displayedData } = useData();
    const [selectedCell, setSelectedCell] = useState<{ perf: PerformanceCategory; risk: RiskCategory } | null>(null);

    const matrixData = useMemo(() => {
        const initialMatrix = {
            High: { Low: { e: [] }, Medium: { e: [] }, High: { e: [] } },
            Medium: { Low: { e: [] }, Medium: { e: [] }, High: { e: [] } },
            Low: { Low: { e: [] }, Medium: { e: [] }, High: { e: [] } },
        } as Record<PerformanceCategory, Record<RiskCategory, { e: Employee[] }>>;

        const activeEmployees = displayedData.filter(e => !e.terminationDate);
        activeEmployees.forEach(employee => {
            let perfCat: PerformanceCategory;
            if (employee.performanceRating >= 4) perfCat = 'High'; else if (employee.performanceRating === 3) perfCat = 'Medium'; else perfCat = 'Low';
            const { risk: riskCat } = getEmployeeFlightRisk(employee);
            if (initialMatrix[perfCat]?.[riskCat]) initialMatrix[perfCat][riskCat].e.push(employee);
        });
        return initialMatrix;
    }, [displayedData]);

    const handleCellClick = (perf: PerformanceCategory, risk: RiskCategory) => {
        if (matrixData[perf][risk].e.length > 0) setSelectedCell({ perf, risk });
    };

    return (
        <div className="flex flex-col md:flex-row items-stretch gap-4">
            <div className="flex-shrink-0 md:flex md:items-center">
                <h3 className="w-full text-center md:w-auto md:transform md:-rotate-90 text-sm font-bold text-text-secondary whitespace-nowrap"><span className="md:hidden">&darr; Performance &darr;</span><span className="hidden md:inline">&larr; Performance &larr;</span></h3>
            </div>
            <div className="flex-1 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                    {performanceCategories.map(perfCat => riskCategories.map(riskCat => {
                        const cell = matrixData[perfCat][riskCat];
                        const config = perfRiskCellConfig[perfCat][riskCat];
                        return (
                            <div key={`${perfCat}-${riskCat}`} className={`p-4 rounded-lg border-2 min-h-[140px] flex flex-col justify-between transition-all duration-200 ${cell.e.length > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'opacity-60'} ${config.color}`} onClick={() => handleCellClick(perfCat, riskCat)} title={config.description}>
                                <div><h4 className="font-bold text-text-primary">{config.title}</h4><p className="text-xs text-text-secondary mt-1">{config.description}</p></div>
                                <p className={`text-4xl font-black self-end ${config.textColor}`}>{cell.e.length}</p>
                            </div>
                        );
                    }))}
                </div>
                <div className="grid grid-cols-3 text-center text-sm font-semibold text-text-secondary"><span>Low Risk</span><span>Medium Risk</span><span>High Risk</span></div>
                <div className="text-center md:mt-2 text-sm font-bold text-text-primary"><span>&rarr; Flight Risk &rarr;</span></div>
            </div>
            {selectedCell && <EmployeeListModal employees={matrixData[selectedCell.perf][selectedCell.risk].e} title={perfRiskCellConfig[selectedCell.perf][selectedCell.risk].title} onClose={() => setSelectedCell(null)} />}
        </div>
    );
};

// --- RISK & IMPACT QUADRANT ---

type QuadrantKey = 'HighImpact_HighRisk' | 'HighImpact_LowRisk' | 'LowImpact_HighRisk' | 'LowImpact_LowRisk';

const quadrantInfo: Record<QuadrantKey, { title: string; description: string; action: string; color: string; bgColor: string }> = {
    'HighImpact_HighRisk': { title: "Critical Retention Priorities", description: "Most vulnerable and valuable employees showing clear signs of leaving.", action: "ACT IMMEDIATELY with personalized retention plans, executive sponsorship, and succession planning.", color: "text-red-400", bgColor: "rgba(239, 68, 68, 0.7)" },
    'HighImpact_LowRisk': { title: "Talent & Succession Risks", description: "Highly impactful, stable employees whose departure would be devastating.", action: "PROTECT AND PREPARE with succession planning, knowledge management, and proactive engagement.", color: "text-primary-400", bgColor: "rgba(59, 130, 246, 0.7)" },
    'LowImpact_HighRisk': { title: "Manageable Turnover", description: "Employees likely to leave but with low overall impact; may be low performers.", action: "MANAGE AND MONITOR. For low performers, manage out gracefully. For others, conduct exit interviews.", color: "text-yellow-400", bgColor: "rgba(245, 158, 11, 0.7)" },
    'LowImpact_LowRisk': { title: "Stable Contributors", description: "The backbone of the organization; reliable performers in non-critical roles.", action: "MAINTAIN AND APPRECIATE with general engagement, fair compensation, and a positive environment.", color: "text-green-400", bgColor: "rgba(34, 197, 94, 0.7)" },
};

const getQuadrant = (flightScore: number, impactScore: number): QuadrantKey => {
    if (impactScore > 5) {
        return flightScore > 5 ? 'HighImpact_HighRisk' : 'HighImpact_LowRisk';
    } else {
        return flightScore > 5 ? 'LowImpact_HighRisk' : 'LowImpact_LowRisk';
    }
};

const quadrantRenderOrder: QuadrantKey[] = [
    'HighImpact_LowRisk',   // Upper Left
    'HighImpact_HighRisk',  // Upper Right
    'LowImpact_LowRisk',    // Lower Left
    'LowImpact_HighRisk'    // Lower Right
];

const RiskAndImpactQuadrant: React.FC = () => {
    const { displayedData } = useData();
    const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; employees: Employee[] }>({ isOpen: false, title: '', employees: [] });
    const { mode } = useTheme();
    const textPrimaryColor = useMemo(() => mode === 'dark' ? '#f8fafc' : '#1e293b', [mode]);
    const gridColor = useMemo(() => mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)', [mode]);


    const employeeRiskData = useMemo(() => {
        const activeEmployees = displayedData.filter(e => !e.terminationDate);
        return activeEmployees.map(emp => ({
            x: calculateFlightRiskScore(emp),
            y: calculateImpactScore(emp),
            employee: emp,
        }));
    }, [displayedData]);

    const quadrants = useMemo(() => {
        const data: Record<QuadrantKey, Employee[]> = {
            HighImpact_HighRisk: [], HighImpact_LowRisk: [], LowImpact_HighRisk: [], LowImpact_LowRisk: []
        };
        employeeRiskData.forEach(item => {
            const quadrant = getQuadrant(item.x, item.y);
            data[quadrant].push(item.employee);
        });
        return data;
    }, [employeeRiskData]);

    const scatterData = useMemo(() => ({
        datasets: Object.keys(quadrants).map(key => ({
            label: quadrantInfo[key as QuadrantKey].title,
            data: employeeRiskData.filter(d => getQuadrant(d.x, d.y) === key),
            backgroundColor: quadrantInfo[key as QuadrantKey].bgColor,
            pointRadius: 5,
            pointHoverRadius: 8,
        }))
    }), [employeeRiskData, quadrants]);

    const handleQuadrantClick = (key: QuadrantKey) => {
        if (quadrants[key].length > 0) {
            setModalData({ isOpen: true, title: quadrantInfo[key].title, employees: quadrants[key] });
        }
    };

    const handleChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { datasetIndex, index } = elements[0];
            const employeeData = scatterData.datasets[datasetIndex].data[index];
            if (employeeData) {
                setModalData({ isOpen: true, title: employeeData.employee.name, employees: [employeeData.employee] });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="relative h-[32rem] p-8 border border-border rounded-lg bg-background">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 transform -rotate-90 origin-center">
                    <span className="text-sm font-semibold text-text-secondary whitespace-nowrap">Impact Magnitude</span>
                </div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    <span className="text-sm font-semibold text-text-secondary">Flight Risk</span>
                </div>
                {/* Lines and labels */}
                <div className="absolute left-8 right-8 top-1/2 -mt-px h-px bg-border border-dashed"></div>
                <div className="absolute top-8 bottom-8 left-1/2 -ml-px w-px bg-border border-dashed"></div>
                
                <Scatter
                    data={scatterData}
                    options={{
                        onClick: handleChartClick,
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { min: 0, max: 10, ticks: { color: textPrimaryColor }, grid: { color: gridColor }, title: { display: false } },
                            y: { min: 0, max: 10, ticks: { color: textPrimaryColor }, grid: { color: gridColor }, title: { display: false } }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: (context: any) => {
                                        const dataPoint = context.raw;
                                        return [
                                            `${dataPoint.employee.name}`,
                                            `${dataPoint.employee.jobTitle}`,
                                            `Risk: ${dataPoint.x.toFixed(1)}, Impact: ${dataPoint.y.toFixed(1)}`
                                        ];
                                    }
                                }
                            },
                            datalabels: {
                                display: false
                            }
                        }
                    }}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quadrantRenderOrder.map(key => {
                    const info = quadrantInfo[key];
                    const count = quadrants[key].length;
                    return (
                        <Card key={key} className={`cursor-pointer hover:border-primary-500/50 transition-colors ${count === 0 ? 'opacity-60 cursor-default' : ''}`} onClick={() => handleQuadrantClick(key)}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-bold ${info.color}`}>{info.title}</h4>
                                        <p className="text-xs text-text-secondary mt-1">{info.description}</p>
                                    </div>
                                    <p className={`text-4xl font-black ${info.color}`}>{count}</p>
                                </div>
                                <p className="text-xs text-text-primary mt-3 pt-3 border-t border-border">
                                    <span className="font-semibold">Action Plan:</span> {info.action}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            {modalData.isOpen && <EmployeeListModal title={modalData.title} employees={modalData.employees} onClose={() => setModalData({ isOpen: false, title: '', employees: [] })} />}
        </div>
    );
};


// --- MAIN VIEW COMPONENT ---

const TalentRiskMatrixView: React.FC = () => {
    const [activeView, setActiveView] = useState<'perf_risk' | 'impact_risk'>('perf_risk');

    return (
        <Card className="lg:col-span-4">
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                    <div>
                        <CardTitle>Talent Risk Matrix</CardTitle>
                        <CardDescription>Analyze talent segments by performance, flight risk, and impact.</CardDescription>
                    </div>
                    <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5 self-start sm:self-center">
                        <button onClick={() => setActiveView('perf_risk')} className={`px-3 py-1 text-xs font-semibold rounded ${activeView === 'perf_risk' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>
                            Performance vs. Risk
                        </button>
                        <button onClick={() => setActiveView('impact_risk')} className={`px-3 py-1 text-xs font-semibold rounded ${activeView === 'impact_risk' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>
                            Risk & Impact Quadrant
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {activeView === 'perf_risk' && <PerformanceRiskMatrix />}
                {activeView === 'impact_risk' && <RiskAndImpactQuadrant />}
            </CardContent>
        </Card>
    );
};

export default TalentRiskMatrixView;
