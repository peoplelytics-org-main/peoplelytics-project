import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useReportSettings } from '../../contexts/ReportSettingsContext';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import ChartCard from '../ChartCard';
import MetricCard from '../MetricCard';
import NineBoxGrid from './NineBoxGrid';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler, RadialLinearScale, ScriptableContext, type ChartEvent, type ActiveElement, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie, Line, Scatter, Radar } from 'react-chartjs-2';
import { MOCK_JOB_POSITIONS, MOCK_RECRUITMENT_FUNNEL_DATA } from '../../constants';
import StatusBadge from '../ui/StatusBadge';
import { 
    getGenderDiversity, 
    getPerformanceDistribution, 
    getHeadcountHeatmap, 
    getOverallAbsenceRate,
    getUnscheduledAbsenceRate,
    calculatePTOUtilizationFromData,
    getAttendanceSummary,
    getTopAbsentees,
    getAbsenceTrend, 
    getAbsencesByDepartment, 
    getHeadcountByDepartmentAndGender,
    getAnnualTurnoverRateFromData,
    getTurnoverByReason,
    getTurnoverByDepartment,
    getTurnoverByLocation,
    getTurnoverByTenureBuckets,
    getTurnoverTrend,
    getTurnoverByJobTitle,
    getSickLeaveRateFromAttendance,
    calculateAveragePositionAge,
    calculateOfferAcceptanceRateFromFunnel,
    getRecruitmentFunnelTotals,
    getOpenPositionsByDepartment,
    getOpenPositionsByTitle,
    calculateOverallRetentionRate,
    calculateHighPerformerRetentionRate,
    calculateFirstYearRetentionRate,
    getRetentionByDepartment,
    getRetentionByManager,
    getAverageTenureOfLeavers,
    getNineBoxGridData,
    getPerformanceByManager,
    getPayForPerformanceData,
    getPerformanceTrend,
    getHighPerformerAttritionData,
    getPerformanceCalibrationData,
    getSkillMatrix,
    getSkillSetKPIs,
    getAtRiskSkills,
    getSkillProficiencyMetrics,
    getSkillImpactOnPerformance,
    getHighPerformerSkillsWithScarcity,
    getSkillDensityByDepartment,
    getSkillComparisonByDepartment,
    analyzeSkillGaps,
    type SkillMatrixData,
} from '../../services/hrCalculations';
import { Activity, Thermometer, TrendingDown, Users, Clock, UserMinus, Calendar, Briefcase, Target, Check, FolderOpen, HeartHandshake, ShieldCheck, UserCheck as UserCheckIcon, PauseCircle, X, BrainCircuit, Star, AlertTriangle } from 'lucide-react';
import type { JobPosition, Employee, SkillLevel, SkillGapData } from '../../types';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler, ChartDataLabels, RadialLinearScale);

const radarChartColors = [
    {
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
    },
    {
        backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red
        borderColor: 'rgba(239, 68, 68, 1)',
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
    },
    {
        backgroundColor: 'rgba(34, 197, 94, 0.2)', // Green
        borderColor: 'rgba(34, 197, 94, 1)',
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
    },
    {
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // Amber
        borderColor: 'rgba(245, 158, 11, 1)',
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
    },
     {
        backgroundColor: 'rgba(168, 85, 247, 0.2)', // Purple
        borderColor: 'rgba(168, 85, 247, 1)',
        pointBackgroundColor: 'rgba(168, 85, 247, 1)',
    },
];

type ReportType = 'diversity' | 'performance' | 'recruitment' | 'attendance' | 'turnover' | 'retention' | 'skillset';

const HeadcountHeatmap: React.FC<{ data: ReturnType<typeof getHeadcountHeatmap> }> = ({ data }) => {
    const { departments, locations, data: heatmapData } = data;

    if (!departments || departments.length === 0) {
      return <div className="flex items-center justify-center h-full text-text-secondary">No data to display.</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse text-text-primary">
                <thead>
                    <tr>
                        <th className="p-2 border border-border bg-card sticky left-0 z-10">Department</th>
                        {locations.map(loc => <th key={loc} className="p-2 border border-border bg-card text-center min-w-[120px]">{loc}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {departments.map(dept => (
                        <tr key={dept}>
                            <td className="p-2 border border-border font-semibold bg-card sticky left-0 z-10 whitespace-nowrap">{dept}</td>
                            {locations.map(loc => {
                                const cellData = heatmapData[dept]?.[loc];
                                const total = cellData?.total || 0;

                                if (total === 0) {
                                    return <td key={loc} className="p-2 border border-border text-center text-text-secondary">-</td>;
                                }

                                const maleWidth = (cellData.Male / total) * 100;
                                const femaleWidth = (cellData.Female / total) * 100;
                                const otherWidth = (cellData.Other / total) * 100;
                                
                                const tooltipText = `Male: ${cellData.Male}, Female: ${cellData.Female}, Other: ${cellData.Other}`;

                                return (
                                    <td key={loc} className="p-2 border border-border text-center align-middle">
                                        <div className="flex items-center gap-2 group relative" title={tooltipText}>
                                            <span className="font-semibold w-8 text-right">{total}</span>
                                            <div className="w-full bg-border rounded-sm h-5 flex overflow-hidden">
                                                {maleWidth > 0 && <div className="h-full" style={{ width: `${maleWidth}%`, backgroundColor: '#3b82f6' }}></div>}
                                                {femaleWidth > 0 && <div className="h-full" style={{ width: `${femaleWidth}%`, backgroundColor: '#f43f5e' }}></div>}
                                                {otherWidth > 0 && <div className="h-full" style={{ width: `${otherWidth}%`, backgroundColor: '#6b7280' }}></div>}
                                            </div>
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const skillLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];

const skillLevelColors: Record<SkillLevel, string> = {
    Novice: 'rgba(107, 114, 128, 1)',
    Beginner: 'rgba(59, 130, 246, 1)',
    Competent: 'rgba(34, 197, 94, 1)',
    Proficient: 'rgba(168, 85, 247, 1)',
    Expert: 'rgba(245, 158, 11, 1)',
};

export const StandardReportsView: React.FC = () => {
    const { displayedData, attendanceData, jobPositions, recruitmentFunnels } = useData();
    const { mode, currency, theme } = useTheme();
    const { skillScarcityKey } = useReportSettings();
    const navigate = useNavigate();
    const [activeReport, setActiveReport] = useState<ReportType>('skillset');
    
    const calibrationChartRef = useRef<ChartJS<'bar'>>(null);
    const managerPerfChartRef = useRef<ChartJS<'bar'>>(null);
    const performanceDistChartRef = useRef<ChartJS<'bar'>>(null);

    const [turnoverFilters, setTurnoverFilters] = useState({ timePeriod: '12m', location: 'all' });
    const [attendanceFilters, setAttendanceFilters] = useState({ timePeriod: '90', department: 'all' });
    const [retentionTimePeriod, setRetentionTimePeriod] = useState<'12m' | '6m' | '24m'>('12m');
    const [managerPerfViewMode, setManagerPerfViewMode] = useState<'count' | 'percentage'>('count');
    const [perfCalibViewMode, setPerfCalibViewMode] = useState<'count' | 'percentage'>('percentage');
    const [skillsetTab, setSkillsetTab] = useState<'matrix' | 'advanced' | 'gap_analysis'>('advanced');
    const [selectedImpactSkill, setSelectedImpactSkill] = useState<string>('');
    const [requiredSkillsInput, setRequiredSkillsInput] = useState('Cloud Computing: 15\nMachine Learning: 10\nCybersecurity Forensics: 5\nQuantitative Analysis: 5');
    const [skillGapData, setSkillGapData] = useState<SkillGapData[] | null>(null);

    const [positionModal, setPositionModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        positions: JobPosition[];
    }>({
        isOpen: false,
        title: '',
        description: '',
        positions: [],
    });
    
    const [employeeListModal, setEmployeeListModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        employees: Employee[];
    }>({
        isOpen: false,
        title: '',
        description: '',
        employees: [],
    });

    const hexToRgba = (hex: string, opacity: number): string => {
        if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return hex;
        let c = hex.substring(1).split('');
        if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        const r = parseInt(c.slice(0, 2).join(''), 16);
        const g = parseInt(c.slice(2, 4).join(''), 16);
        const b = parseInt(c.slice(4, 6).join(''), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    const getSkillScarcityColor = useMemo(() => {
        const sortedKey = [...skillScarcityKey].sort((a, b) => a.threshold - b.threshold);
        return (count: number, opacity: number = 1) => {
            const level = sortedKey.find(l => count <= l.threshold);
            const colorHex = level ? level.color : (sortedKey[sortedKey.length - 1]?.color || '#6b7280');
            return hexToRgba(colorHex, opacity);
        };
    }, [skillScarcityKey]);

    const scarcityLegendData = useMemo(() => {
        let lastThreshold = 0;
        return skillScarcityKey.map((level, index) => {
            const isLast = index === skillScarcityKey.length - 1;
            let label = '';
            if (index === 0) {
                label = `<= ${level.threshold}`;
            } else if (isLast) {
                label = `> ${lastThreshold}`;
            } else {
                label = `${lastThreshold + 1} - ${level.threshold}`;
            }
            lastThreshold = level.threshold;
            return { label: `${label} Employees`, color: level.color };
        });
    }, [skillScarcityKey]);

    const SkillScarcityLegend: React.FC = () => (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary mb-4">
            <span className="font-semibold text-text-primary">Scarcity Key:</span>
            {scarcityLegendData.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                    <span>{label}</span>
                </div>
            ))}
        </div>
    );

    const cardColor = useMemo(() => mode === 'dark' ? '#1a1a1a' : '#ffffff', [mode]);
    const textPrimaryColor = useMemo(() => mode === 'dark' ? '#f8fafc' : '#1e293b', [mode]);
    const borderColor = useMemo(() => mode === 'dark' ? '#27272a' : '#e2e8f0', [mode]);
    const gridColor = useMemo(() => mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)', [mode]);
    const dataLabelColor = useMemo(() => mode === 'dark' ? '#ffffff' : '#333333', [mode]);

    const baseChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: textPrimaryColor, boxWidth: 12, padding: 20 } },
            tooltip: { backgroundColor: cardColor, titleColor: textPrimaryColor, bodyColor: textPrimaryColor, borderColor: borderColor, borderWidth: 1 },
            datalabels: { display: false }
        },
    }), [textPrimaryColor, cardColor, borderColor]);
    
    const dataLabelsConfig = useMemo(() => ({
      display: (context: any) => {
        const value = context.dataset.data[context.dataIndex];
        return typeof value === 'number' && value > 0;
      },
      color: '#fff',
      font: { weight: 'bold' as const, size: 10 },
      anchor: 'center' as const,
      align: 'center' as const,
    }), []);
    
    const uniqueDepartments = useMemo(() => [...new Set(displayedData.map(e => e.department))].sort(), [displayedData]);
    const uniqueLocations = useMemo(() => [...new Set(displayedData.map(e => e.location))].sort(), [displayedData]);

    const { att_filteredAttendance, att_relevantEmployees } = useMemo(() => {
        const now = new Date();
        const cutoffDate = new Date(new Date().setDate(now.getDate() - parseInt(attendanceFilters.timePeriod)));
        
        const relevantEmployees = attendanceFilters.department === 'all' 
            ? displayedData 
            : displayedData.filter(e => e.department === attendanceFilters.department);
        
        const relevantEmployeeIds = new Set(relevantEmployees.map(e => e.id));

        const filteredAttendance = attendanceData.filter(att => {
            const recordDate = new Date(att.date);
            return relevantEmployeeIds.has(att.employeeId) && recordDate >= cutoffDate;
        });

        return { att_filteredAttendance: filteredAttendance, att_relevantEmployees: relevantEmployees };
    }, [displayedData, attendanceData, attendanceFilters]);

    const filteredLeavers = useMemo(() => {
        const now = new Date();
        const locationFilteredEmployees = turnoverFilters.location === 'all' 
            ? displayedData 
            : displayedData.filter(e => e.location === turnoverFilters.location);

        if (turnoverFilters.timePeriod === 'all') {
            return locationFilteredEmployees.filter(e => e.terminationDate);
        }

        let monthsToSubtract = 12;
        if (turnoverFilters.timePeriod === '24m') monthsToSubtract = 24;
        if (turnoverFilters.timePeriod === '6m') monthsToSubtract = 6;
        if (turnoverFilters.timePeriod === '3m') monthsToSubtract = 3;
        
        const cutoffDate = new Date(now.getFullYear(), now.getMonth() - monthsToSubtract, now.getDate());

        return locationFilteredEmployees.filter(e => e.terminationDate && new Date(e.terminationDate) >= cutoffDate);
    }, [displayedData, turnoverFilters]);

    const chartData = useMemo(() => {
        const activeEmployees = displayedData.filter(e => !e.terminationDate);

        const genderDiversity = getGenderDiversity(activeEmployees);
        const departmentHeadcountGender = getHeadcountByDepartmentAndGender(activeEmployees);
        const departmentLabels = Object.keys(departmentHeadcountGender).sort();
        const headcountHeatmap = getHeadcountHeatmap(activeEmployees);
        
        const performanceDistribution = getPerformanceDistribution(activeEmployees);
        const nineBoxGridData = getNineBoxGridData(activeEmployees);
        const performanceByManager = getPerformanceByManager(activeEmployees);
        const payForPerformance = getPayForPerformanceData(activeEmployees);
        const performanceTrend = getPerformanceTrend(activeEmployees);
        const highPerformerAttrition = getHighPerformerAttritionData(displayedData);
        const performanceCalibration = getPerformanceCalibrationData(activeEmployees);
        const performanceCalibrationCounts = (() => {
            const departments = [...new Set(activeEmployees.map(e => e.department))];
            const results = departments.map(dept => {
                const deptEmployees = activeEmployees.filter(e => e.department === dept);
                const counts = deptEmployees.reduce((acc, emp) => {
                    acc[emp.performanceRating] = (acc[emp.performanceRating] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>);

                return {
                    department: dept,
                    total: deptEmployees.length,
                    distribution: {
                        '1': counts['1'] || 0, '2': counts['2'] || 0, '3': counts['3'] || 0,
                        '4': counts['4'] || 0, '5': counts['5'] || 0,
                    }
                };
            });
            return results.sort((a, b) => a.department.localeCompare(b.department));
        })();
        
        const att_summary = getAttendanceSummary(att_filteredAttendance);

        const turnover_now = new Date();
        const turnover_locationFilteredEmployees = turnoverFilters.location === 'all' ? displayedData : displayedData.filter(e => e.location === turnoverFilters.location);
       
        const openPositions = jobPositions.filter(p => p.status === 'Open');
        const closedPositions = jobPositions.filter(p => p.status === 'Closed');
        const onHoldPositions = jobPositions.filter(p => p.status === 'On Hold');


        const regrettableLeavers = displayedData.filter(e => e.terminationDate && e.performanceRating >= 4 && e.terminationReason === 'Voluntary').sort((a, b) => new Date(b.terminationDate!).getTime() - new Date(a.terminationDate!).getTime());

        const skillMatrix = getSkillMatrix(activeEmployees);
        const skillSetKPIs = getSkillSetKPIs(activeEmployees, skillMatrix);
        const atRiskSkills = getAtRiskSkills(activeEmployees, 3);
        const skillProficiencyMetrics = getSkillProficiencyMetrics(activeEmployees);
        const skillImpactOnPerformance = getSkillImpactOnPerformance(activeEmployees, selectedImpactSkill);
        const highPerformerSkillsWithScarcity = getHighPerformerSkillsWithScarcity(activeEmployees);
        const skillDensity = getSkillDensityByDepartment(activeEmployees);
        const skillComparisonData = getSkillComparisonByDepartment(activeEmployees);
        const skillComparison = {
            labels: skillComparisonData.labels,
            datasets: skillComparisonData.datasets.map((dataset, index) => ({
                ...dataset,
                ...radarChartColors[index % radarChartColors.length]
            }))
        };


        return {
            diversity: {
                genderDiversity: {
                    labels: genderDiversity.map(d => d.name),
                    datasets: [{ data: genderDiversity.map(d => d.value), backgroundColor: ['#3b82f6', '#f43f5e', '#6b7280'], borderColor: cardColor, borderWidth: 2 }]
                },
                departmentHeadcount: {
                    labels: departmentLabels,
                    datasets: [
                        { label: 'Male', data: departmentLabels.map(dept => departmentHeadcountGender[dept]?.Male || 0), backgroundColor: '#3b82f6' },
                        { label: 'Female', data: departmentLabels.map(dept => departmentHeadcountGender[dept]?.Female || 0), backgroundColor: '#f43f5e' },
                        { label: 'Other', data: departmentLabels.map(dept => departmentHeadcountGender[dept]?.Other || 0), backgroundColor: '#6b7280' }
                    ].filter(ds => ds.data.some(d => d > 0))
                },
                headcountHeatmap: headcountHeatmap
            },
            performance: {
                performanceDistribution: {
                    labels: performanceDistribution.map(d => d.name),
                    datasets: [{ label: 'Employee Count', data: performanceDistribution.map(d => d.value), backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'] }]
                },
                nineBoxGrid: nineBoxGridData,
                performanceByManager,
                payForPerformance: {
                    datasets: [{
                        label: 'Employee',
                        data: payForPerformance,
                        backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    }]
                },
                performanceTrend: {
                    labels: performanceTrend.map(p => p.period),
                    datasets: [{ label: 'Average Performance Rating', data: performanceTrend.map(p => p.avgPerformance), borderColor: '#10b981', tension: 0.3 }]
                },
                highPerformerAttrition,
                performanceCalibration,
                performanceCalibrationCounts,
            },
            attendance: {
                kpis: {
                    overall: getOverallAbsenceRate(att_filteredAttendance),
                    unscheduled: getUnscheduledAbsenceRate(att_filteredAttendance),
                    sick: getSickLeaveRateFromAttendance(att_filteredAttendance),
                    pto: calculatePTOUtilizationFromData(att_filteredAttendance, att_relevantEmployees),
                },
                topAbsentees: getTopAbsentees(att_filteredAttendance, displayedData, 10),
                absenceBreakdown: {
                    labels: ['Sick Leave', 'Unscheduled Absence'],
                    datasets: [{ data: [att_summary.sick, att_summary.unscheduled], backgroundColor: ['#f59e0b', '#ef4444'], borderColor: cardColor, borderWidth: 2 }]
                },
                absenceTrend: {
                    labels: getAbsenceTrend(att_filteredAttendance).map(d => d.name),
                    datasets: [{ label: 'Absences', data: getAbsenceTrend(att_filteredAttendance).map(d => d.value), borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', fill: true, tension: 0.3 }]
                },
                absencesByDept: {
                    labels: getAbsencesByDepartment(att_filteredAttendance, displayedData).map(d => d.name),
                    datasets: [{ label: 'Total Absences', data: getAbsencesByDepartment(att_filteredAttendance, displayedData).map(d => d.value), backgroundColor: '#8b5cf6' }]
                }
            },
            turnover: {
                kpis: {
                    rate: getAnnualTurnoverRateFromData(turnover_locationFilteredEmployees, turnoverFilters.timePeriod as any),
                    total: filteredLeavers.length,
                    voluntary: filteredLeavers.filter(e => e.terminationReason === 'Voluntary').length,
                    involuntary: filteredLeavers.filter(e => e.terminationReason === 'Involuntary').length,
                },
                turnoverTrend: {
                    labels: getTurnoverTrend(filteredLeavers, turnoverFilters.timePeriod as any).map(d => d.name),
                    datasets: [{ label: 'Leavers', data: getTurnoverTrend(filteredLeavers, turnoverFilters.timePeriod as any).map(d => d.value), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.3 }]
                },
                byReason: {
                    labels: getTurnoverByReason(filteredLeavers).map(d => d.name),
                    datasets: [{ data: getTurnoverByReason(filteredLeavers).map(d => d.value), backgroundColor: ['#f59e0b', '#ef4444'], borderColor: cardColor, borderWidth: 2 }]
                },
                byDept: {
                     labels: getTurnoverByDepartment(filteredLeavers).map(d => d.name),
                     datasets: [{ label: 'Leavers', data: getTurnoverByDepartment(filteredLeavers).map(d => d.value), backgroundColor: '#8b5cf6' }]
                },
                byJobTitle: {
                     labels: getTurnoverByJobTitle(filteredLeavers).slice(0, 10).map(d => d.name),
                     datasets: [{ label: 'Leavers', data: getTurnoverByJobTitle(filteredLeavers).slice(0, 10).map(d => d.value), backgroundColor: '#3b82f6' }]
                 },
                 byTenure: {
                     labels: getTurnoverByTenureBuckets(filteredLeavers).map(d => d.name),
                     datasets: [{ label: 'Leavers', data: getTurnoverByTenureBuckets(filteredLeavers).map(d => d.value), backgroundColor: ['#6ee7b7', '#34d399', '#10b981', '#059669'] }]
                 },
                byLocation: {
                     labels: getTurnoverByLocation(filteredLeavers).map(d => d.name),
                     datasets: [{ label: 'Leavers', data: getTurnoverByLocation(filteredLeavers).map(d => d.value), backgroundColor: '#ec4899' }]
                 }
            },
            recruitment: {
                kpis: {
                    openPositions: openPositions.length,
                    onHoldPositions: onHoldPositions.length,
                    avgAge: calculateAveragePositionAge(openPositions),
                    closedThisMonth: closedPositions.filter(p => p.closeDate && new Date(p.closeDate).getMonth() === new Date().getMonth()).length,
                    acceptanceRate: calculateOfferAcceptanceRateFromFunnel(recruitmentFunnels)
                },
                funnel: getRecruitmentFunnelTotals(recruitmentFunnels),
                openByDept: getOpenPositionsByDepartment(openPositions),
                openByTitle: getOpenPositionsByTitle(openPositions),
                oldestOpen: openPositions.sort((a,b) => new Date(a.openDate).getTime() - new Date(b.openDate).getTime()).slice(0, 5),
                recentlyClosed: closedPositions.sort((a,b) => new Date(b.closeDate!).getTime() - new Date(a.closeDate!).getTime()).slice(0,5),
                topOnHold: onHoldPositions.sort((a,b) => new Date(a.onHoldDate!).getTime() - new Date(b.onHoldDate!).getTime()).slice(0, 5),
                allOpen: openPositions,
                allClosed: closedPositions,
                allOnHold: onHoldPositions,
            },
            retention: {
                kpis: {
                    overall: calculateOverallRetentionRate(displayedData, retentionTimePeriod),
                    highPerformer: calculateHighPerformerRetentionRate(displayedData, retentionTimePeriod),
                    firstYear: calculateFirstYearRetentionRate(displayedData),
                },
                byDept: getRetentionByDepartment(displayedData, retentionTimePeriod),
                byManager: getRetentionByManager(displayedData, retentionTimePeriod).slice(0,10),
                regrettableLeavers: regrettableLeavers.slice(0,10),
            },
            skillset: {
                kpis: skillSetKPIs,
                matrix: skillMatrix,
                atRiskSkills: atRiskSkills,
                skillProficiencyMetrics: skillProficiencyMetrics,
                skillImpactOnPerformance: skillImpactOnPerformance,
                highPerformerSkillsWithScarcity: highPerformerSkillsWithScarcity,
                skillDensity: skillDensity,
                skillComparison: skillComparison,
            }
        };
    }, [displayedData, attendanceData, turnoverFilters, attendanceFilters, retentionTimePeriod, cardColor, selectedImpactSkill, att_filteredAttendance, att_relevantEmployees, filteredLeavers, jobPositions, recruitmentFunnels]);

    useEffect(() => {
        if (activeReport === 'skillset' && !selectedImpactSkill && chartData.skillset.kpis.mostCommonSkill !== 'N/A') {
            setSelectedImpactSkill(chartData.skillset.kpis.mostCommonSkill);
        }
    }, [activeReport, selectedImpactSkill, chartData]);

    const handleChartHover = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        const canvas = chart.canvas;
        if (canvas && event.y !== null) {
            const yAxis = chart.scales.y;
            const index = yAxis.getValueForPixel(event.y);
            const isOverLabel = index !== undefined && index >= 0 && index < yAxis.ticks.length;
            canvas.style.cursor = elements.length > 0 || isOverLabel ? 'pointer' : 'default';
        }
    };
    
    const onHoverVertical = (e: ChartEvent, el: ActiveElement[], chart: Chart) => chart.canvas.style.cursor = el.length > 0 ? 'pointer' : 'default';

    const handlePerformanceDistClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const ratingLabel = chartData.performance.performanceDistribution.labels[index];
            const ratingMapping: { [label: string]: number } = {
                'Needs Improvement': 1, 'Below Expectations': 2, 'Meets Expectations': 3,
                'Exceeds Expectations': 4, 'Outstanding': 5,
            };
            const rating = ratingMapping[ratingLabel];
            
            const employeesInSegment = displayedData.filter(e => !e.terminationDate && e.performanceRating === rating);
            
            setEmployeeListModal({
                isOpen: true, title: `Employees with '${ratingLabel}' Performance`,
                description: `List of active employees with a performance rating of ${rating}.`, employees: employeesInSegment,
            });
        }
    };

    const handleOpenPositionsByDeptClick = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const department = chartData.recruitment.openByDept[index].department;
            const datasetLabel = chart.data.datasets[datasetIndex].label || '';
            
            const filteredPositions = jobPositions.filter(pos => {
                if (pos.status !== 'Open' || pos.department !== department) return false;
                if (datasetLabel === 'Replacement') return pos.positionType === 'Replacement' || !pos.positionType;
                if (datasetLabel === 'New (Budgeted)') return pos.positionType === 'New' && pos.budgetStatus === 'Budgeted';
                if (datasetLabel === 'New (Non-Budgeted)') return pos.positionType === 'New' && (pos.budgetStatus === 'Non-Budgeted' || !pos.budgetStatus);
                return false;
            });

            setPositionModal({ isOpen: true, title: `${datasetLabel} Positions in ${department}`,
                description: `List of open positions matching the selected criteria.`, positions: filteredPositions,
            });
        }
    };

    const handleTurnoverByDeptClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const department = chartData.turnover.byDept.labels[index];
            const employeesInSegment = filteredLeavers.filter(e => e.department === department);

            setEmployeeListModal({ isOpen: true, title: `Leavers from ${department}`,
                description: `List of employees who left the ${department} department in the selected period.`, employees: employeesInSegment,
            });
        }
    };

    const handleTurnoverByLocationClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const location = chartData.turnover.byLocation.labels[index];
            const employeesInSegment = filteredLeavers.filter(e => e.location === location);
            setEmployeeListModal({ isOpen: true, title: `Leavers from ${location}`,
                description: `List of employees who left from ${location} in the selected period.`, employees: employeesInSegment,
            });
        }
    };

    const handleAbsencesByDeptClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const department = chartData.attendance.absencesByDept.labels[index];
            const empMap = new Map(displayedData.map(e => [e.id, e]));
            const employeeIdsWithAbsence = new Set<string>();
            att_filteredAttendance.forEach(r => {
                const emp = empMap.get(r.employeeId);
                if (emp && emp.department === department && (r.status === 'Sick Leave' || r.status === 'Unscheduled Absence')) {
                    employeeIdsWithAbsence.add(r.employeeId);
                }
            });
            const employeesInSegment = displayedData.filter(e => employeeIdsWithAbsence.has(e.id));
            setEmployeeListModal({ isOpen: true, title: `Employees with Absences in ${department}`,
                description: `List of employees with sick or unscheduled absences in ${department} for the selected period.`, employees: employeesInSegment,
            });
        }
    };

    const handleTurnoverByJobTitleClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const jobTitle = chartData.turnover.byJobTitle.labels[index];
            const employeesInSegment = filteredLeavers.filter(e => e.jobTitle === jobTitle);
            setEmployeeListModal({ isOpen: true, title: `Leavers with Job Title: ${jobTitle}`,
                description: `List of employees with this job title who left in the selected period.`, employees: employeesInSegment,
            });
        }
    };

    const handleTurnoverByTenureClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const bucketLabel = chartData.turnover.byTenure.labels[index];
            const employeesInSegment = filteredLeavers.filter(emp => {
                if (!emp.terminationDate) return false;
                const tenureYears = (new Date(emp.terminationDate).getTime() - new Date(emp.hireDate).getTime()) / (1000 * 3600 * 24 * 365.25);
                switch (bucketLabel) {
                    case '< 1 Year': return tenureYears < 1;
                    case '1-2 Years': return tenureYears >= 1 && tenureYears <= 2;
                    case '2-5 Years': return tenureYears > 2 && tenureYears <= 5;
                    case '5+ Years': return tenureYears > 5;
                    default: return false;
                }
            });
            setEmployeeListModal({ isOpen: true, title: `Leavers with Tenure: ${bucketLabel}`,
                description: `List of employees who left the company within this tenure range.`, employees: employeesInSegment,
            });
        }
    };

    const handleCalibrationChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const department = chartData.performance.performanceCalibration[index].department;
            const rating = String(datasetIndex + 1);
            const ratingLabels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
            
            const employeesInSegment = displayedData.filter(e => 
                !e.terminationDate && e.department === department && String(e.performanceRating) === rating
            );
            
            setEmployeeListModal({ isOpen: true, title: `Employees in ${department}`,
                description: `List of active employees with performance rating ${rating} (${ratingLabels[datasetIndex]}).`,
                employees: employeesInSegment,
            });
        }
    };

    const handleManagerChartClick = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const managerData = chartData.performance.performanceByManager[index];
            if (!managerData) return;
    
            const ratingKeys = Object.keys(chartData.performance.performanceByManager[0]?.ratings || {}).filter(r => r !== 'count').sort((a,b) => parseInt(a) - parseInt(b));
            const rating = ratingKeys[datasetIndex];
            const ratingLabels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
            
            const employeesInSegment = displayedData.filter(emp => 
                !emp.terminationDate && emp.managerId === managerData.managerId && String(emp.performanceRating) === rating
            );
    
            setEmployeeListModal({ isOpen: true, title: `Team Members of ${managerData.managerName}`,
                description: `List of active team members with performance rating ${rating} (${ratingLabels[datasetIndex]}).`,
                employees: employeesInSegment
            });

        } else if (chart && event.y !== null) {
            const yAxis = chart.scales.y;
            const index = yAxis.getValueForPixel(event.y);
            if (index !== undefined && chartData.performance.performanceByManager[index]) {
                const managerData = chartData.performance.performanceByManager[index];
                navigate(`/profiles/${managerData.managerId}`);
            }
        }
    };

    const handleSkillCellClick = (skill: string, level: SkillLevel, employees: Employee[]) => {
        setEmployeeListModal({ isOpen: true, title: `Employees with skill: ${skill}`,
            description: `Proficiency Level: ${level}`, employees,
        });
    };

    const handleRunGapAnalysis = () => {
        const results = analyzeSkillGaps(displayedData, requiredSkillsInput);
        setSkillGapData(results);
    };

    const SkillMatrix: React.FC<{
        data: SkillMatrixData;
        onCellClick: (skill: string, level: SkillLevel, employees: Employee[]) => void;
    }> = ({ data, onCellClick }) => {
        const [primaryRgb, setPrimaryRgb] = useState('59, 130, 246');
    
        useEffect(() => {
            setTimeout(() => {
                const color = getComputedStyle(document.documentElement).getPropertyValue('--color-primary-500').trim();
                if (color.startsWith('#')) {
                    const r = parseInt(color.slice(1, 3), 16);
                    const g = parseInt(color.slice(3, 5), 16);
                    const b = parseInt(color.slice(5, 7), 16);
                    setPrimaryRgb(`${r}, ${g}, ${b}`);
                }
            }, 0);
        }, [theme]);
        
        const maxCount = useMemo(() => Math.max(1, ...Object.values(data).flatMap(d => skillLevels.map(l => d[l].length))), [data]);
        const sortedSkills = useMemo(() => Object.keys(data).sort((a,b) => data[b].total.length - data[a].total.length), [data]);
    
        if (sortedSkills.length === 0) {
            return <p className="text-center text-text-secondary py-8">No skills data available for active employees.</p>;
        }
    
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr>
                            <th className="p-3 border border-border bg-card text-text-primary sticky left-0 z-10">Skill</th>
                            {skillLevels.map(level => (
                                <th key={level} className="p-3 border border-border text-white text-center font-semibold" style={{ backgroundColor: skillLevelColors[level] }}>
                                    {level}
                                </th>
                            ))}
                             <th className="p-3 border border-border bg-card text-text-primary text-center">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedSkills.map(skillName => {
                            const totalEmployees = data[skillName].total;
                            const totalCount = totalEmployees.length;
                            const totalColor = getSkillScarcityColor(totalCount);
                            
                            return (
                                <tr key={skillName}>
                                    <td className="p-3 border border-border font-semibold bg-card text-text-primary sticky left-0 z-10 whitespace-nowrap">{skillName}</td>
                                    {skillLevels.map(level => {
                                        const employees = data[skillName][level as SkillLevel];
                                        const count = employees.length;
                                        const opacity = count > 0 ? Math.max(0.3, count / maxCount) : 0;
                                        const canClick = count > 0;
                                        const color = `rgba(${primaryRgb}, ${opacity})`;
    
                                        return (
                                            <td
                                                key={level}
                                                className={`p-3 border border-border text-center font-bold text-text-primary transition-colors ${canClick ? 'cursor-pointer hover:ring-2 hover:ring-primary-500' : ''}`}
                                                style={{ backgroundColor: count > 0 ? color : 'transparent' }}
                                                onClick={() => canClick && onCellClick(skillName, level as SkillLevel, employees)}
                                            >
                                                {count > 0 ? count : '-'}
                                            </td>
                                        );
                                    })}
                                    <td
                                        className={`p-3 border border-border text-center font-bold text-white ${totalCount > 0 ? 'cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-offset-card hover:ring-primary-500' : ''}`}
                                        style={{ backgroundColor: totalColor }}
                                        onClick={() => totalCount > 0 && onCellClick(skillName, 'total' as any, totalEmployees)}
                                    >
                                        {totalCount}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const tabs: { id: ReportType, name: string, icon: React.FC<any> }[] = [
        { id: 'diversity', name: 'Diversity & Inclusion', icon: Users },
        { id: 'performance', name: 'Performance', icon: Target },
        { id: 'skillset', name: 'Skill Set', icon: BrainCircuit },
        { id: 'recruitment', name: 'Recruitment', icon: Briefcase },
        { id: 'attendance', name: 'Attendance', icon: Clock },
        { id: 'turnover', name: 'Turnover', icon: TrendingDown },
        { id: 'retention', name: 'Retention', icon: HeartHandshake }
    ];
    const skillsetTabs = [
        { id: 'matrix', name: 'Skill Matrix' },
        { id: 'advanced', name: 'Advanced Analytics' },
        { id: 'gap_analysis', name: 'Skill Gap Analysis' },
    ];

    const genderColorMap = { Male: '#3b82f6', Female: '#f43f5e', Other: '#6b7280' };
    
    const robustPieChartLabelFormatter = (value: number, ctx: any) => {
        const data = ctx.chart?.data?.datasets?.[0]?.data;
        if (!Array.isArray(data) || data.length === 0) return '0%';
        const total = data.reduce((acc, val) => acc + (Number.isFinite(val) ? Number(val) : 0), 0);
        if (total === 0) return '0%';
        const numericValue = Number.isFinite(value) ? Number(value) : 0;
        const percentage = (numericValue / total) * 100;
        return `${percentage.toFixed(1)}%`;
    };

    const robustPieChartLabelFormatterConditional = (value: number, ctx: any) => {
        const data = ctx.chart?.data?.datasets?.[0]?.data;
        if (!Array.isArray(data) || data.length === 0) return '';
        const total = data.reduce((acc, val) => acc + (Number.isFinite(val) ? Number(val) : 0), 0);
        if (total === 0) return '';
        const numericValue = Number.isFinite(value) ? Number(value) : 0;
        const percentage = (numericValue / total) * 100;
        return percentage > 5 ? `${percentage.toFixed(1)}%` : '';
    };

    const modalTableType = positionModal.positions.length > 0 ? positionModal.positions[0].status : null;
    const openByTitleData = chartData.recruitment.openByTitle.slice(0, 15);

    return (
        <div className="space-y-6">
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveReport(tab.id)}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeReport === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" /><span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            {activeReport === 'diversity' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Gender Diversity" description="Distribution of gender across the workforce.">
                        <div className="h-96 w-full">
                            <Pie data={{
                                labels: chartData.diversity.genderDiversity.labels,
                                datasets: [{ ...chartData.diversity.genderDiversity.datasets[0], backgroundColor: chartData.diversity.genderDiversity.labels.map((l: string) => genderColorMap[l as keyof typeof genderColorMap]) }]
                            }} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, legend: {...baseChartOptions.plugins.legend, position: 'right'}, datalabels: { display: true, color: dataLabelColor, font: { weight: 'bold' }, formatter: robustPieChartLabelFormatterConditional }}}} />
                        </div>
                    </ChartCard>
                    <ChartCard title="Headcount by Department" description="Gender distribution within each department.">
                        <div className="h-96 w-full">
                           <Bar data={chartData.diversity.departmentHeadcount} options={{ ...baseChartOptions, indexAxis: 'y', scales: { x: { stacked: true, ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }, y: { stacked: true, ticks: { color: textPrimaryColor }, grid: { color: 'transparent' }, border: { color: borderColor } } }, plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: { label: (context: any) => { const label = context.dataset.label || ''; const value = context.parsed.x; return `${label}: ${value}`; }, footer: (tooltipItems: any[]) => { const dataIndex = tooltipItems[0].dataIndex; let total = 0; tooltipItems[0].chart.data.datasets.forEach((dataset: any) => { total += dataset.data[dataIndex] as number; }); return `Total: ${total}`; }}}, datalabels: { ...dataLabelsConfig, formatter: (value) => (value as number > 1 ? value : '') } } }} />
                        </div>
                    </ChartCard>
                    <div className="lg:col-span-2">
                        <ChartCard title="Headcount Heatmap" description="Headcount distribution across departments and locations.">
                            <HeadcountHeatmap data={chartData.diversity.headcountHeatmap} />
                        </ChartCard>
                    </div>
                </div>
            )}
            
            {activeReport === 'performance' && (
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="Performance Distribution" description="Distribution of employee performance scores. Click a bar to view employees.">
                            <div className="h-96 w-full">
                                <Bar ref={performanceDistChartRef} data={chartData.performance.performanceDistribution} options={{ ...baseChartOptions, onClick: handlePerformanceDistClick, onHover: onHoverVertical, scales: { x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }, y: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } } }, plugins: {...baseChartOptions.plugins, datalabels: dataLabelsConfig } }} />
                            </div>
                        </ChartCard>
                        <ChartCard title="Pay for Performance Analysis" description="Correlation between employee performance and salary.">
                             <div className="h-96 w-full">
                                <Scatter data={chartData.performance.payForPerformance} options={{ ...baseChartOptions, scales: { x: { title: { display: true, text: 'Performance Rating', color: textPrimaryColor } }, y: { title: { display: true, text: `Salary (${currency})`, color: textPrimaryColor } } }, plugins: { ...baseChartOptions.plugins, tooltip: { callbacks: { label: (context: any) => { const raw = context.raw; return `${raw.label}: Perf ${raw.x.toFixed(1)}, Salary ${currency}${raw.y.toLocaleString()}`; } } } } }} />
                            </div>
                        </ChartCard>
                         <ChartCard title="Performance Over Time (Simulated)" description="Simulated trend of average performance ratings over the last 2 years.">
                            <div className="h-96 w-full">
                                <Line data={chartData.performance.performanceTrend} options={{...baseChartOptions, scales: {y: { min: 2.5, max: 4 }}}} />
                            </div>
                        </ChartCard>
                        <ChartCard title="Performance Calibration" description="Distribution of performance ratings across departments. Click a segment to view employees.">
                            <div className="flex justify-end mb-2">
                                <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5">
                                    <button onClick={() => setPerfCalibViewMode('count')} className={`px-2 py-1 text-xs font-semibold rounded ${perfCalibViewMode === 'count' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>Count</button>
                                    <button onClick={() => setPerfCalibViewMode('percentage')} className={`px-2 py-1 text-xs font-semibold rounded ${perfCalibViewMode === 'percentage' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>%</button>
                                </div>
                            </div>
                            <div className="h-96 w-full">
                                <Bar ref={calibrationChartRef} data={{
                                    labels: chartData.performance.performanceCalibration.map(d => d.department),
                                    datasets: Object.keys(chartData.performance.performanceCalibration[0]?.distribution || {}).map((rating, i) => ({ 
                                        label: `Rating ${rating}`, 
                                        data: perfCalibViewMode === 'percentage' 
                                            ? chartData.performance.performanceCalibration.map(d => d.distribution[rating])
                                            : chartData.performance.performanceCalibrationCounts.map(d => d.distribution[rating as keyof typeof d.distribution]),
                                        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][i] 
                                    }))
                                }} options={{ 
                                    ...baseChartOptions, 
                                    onClick: handleCalibrationChartClick, 
                                    onHover: handleChartHover, 
                                    indexAxis: 'y', 
                                    scales: { 
                                        x: { 
                                            stacked: true, 
                                            max: perfCalibViewMode === 'percentage' ? 100 : undefined,
                                            ticks: { color: textPrimaryColor, callback: perfCalibViewMode === 'percentage' ? (v) => `${v}%` : undefined } 
                                        }, 
                                        y: { stacked: true, ticks: { color: textPrimaryColor } } 
                                    }, 
                                    plugins: {
                                        ...baseChartOptions.plugins, 
                                        tooltip: { 
                                            ...baseChartOptions.plugins.tooltip, 
                                            callbacks: { 
                                                label: (context: any) => { 
                                                    const label = context.dataset.label || ''; 
                                                    const value = context.parsed.x; 
                                                    if (label && value != null) { 
                                                        return perfCalibViewMode === 'count' 
                                                            ? `${label}: ${value}` 
                                                            : `${label}: ${value.toFixed(2)}%`; 
                                                    } 
                                                    return ''; 
                                                }, 
                                                footer: (tooltipItems: any[]) => { 
                                                    if (!tooltipItems || tooltipItems.length === 0) return ''; 
                                                    const dataIndex = tooltipItems[0].dataIndex;
                                                    const total = chartData.performance.performanceCalibrationCounts[dataIndex].total;
                                                    return `Total: ${total}`;
                                                }
                                            }
                                        }, 
                                        datalabels: { 
                                            ...dataLabelsConfig, 
                                            formatter: (value) => {
                                                if (value === 0) return '';
                                                return perfCalibViewMode === 'count' 
                                                    ? value 
                                                    : value > 5 ? `${Math.round(value)}%` : '';
                                            }
                                        } 
                                    } 
                                }} />
                            </div>
                        </ChartCard>
                    </div>
                    <ChartCard title="Performance vs. Potential (9-Box Grid)" description="Segment employees to identify key talent groups. Click a box to view employees.">
                        <NineBoxGrid data={chartData.performance.nineBoxGrid} />
                    </ChartCard>
                    <ChartCard title="Team/Manager Performance Distribution" description="Performance rating distribution for each manager's team. Click a name or segment to view details.">
                        <div className="flex justify-end mb-2">
                            <div className="inline-flex rounded-md shadow-sm bg-background border border-border p-0.5">
                                <button onClick={() => setManagerPerfViewMode('count')} className={`px-2 py-1 text-xs font-semibold rounded ${managerPerfViewMode === 'count' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>Count</button>
                                <button onClick={() => setManagerPerfViewMode('percentage')} className={`px-2 py-1 text-xs font-semibold rounded ${managerPerfViewMode === 'percentage' ? 'bg-primary-600 text-white' : 'text-text-secondary hover:bg-border'}`}>%</button>
                            </div>
                        </div>
                        <div style={{height: `${chartData.performance.performanceByManager.length * 30}px`, minHeight: '300px'}}>
                           <Bar 
                                ref={managerPerfChartRef} 
                                data={{
                                    labels: chartData.performance.performanceByManager.map(m => m.managerName),
                                    datasets: Object.keys(chartData.performance.performanceByManager[0]?.ratings || {})
                                        .filter(r => r !== 'count')
                                        .sort((a,b) => parseInt(a) - parseInt(b))
                                        .map((rating, i) => ({
                                            label: `Rating ${rating}`,
                                            data: managerPerfViewMode === 'count' 
                                                ? chartData.performance.performanceByManager.map(m => m.ratings[rating])
                                                : chartData.performance.performanceByManager.map(m => m.teamSize > 0 ? (m.ratings[rating] / m.teamSize) * 100 : 0),
                                            backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][i]
                                        }))
                               }} 
                               options={{
                                   ...baseChartOptions,
                                   onClick: (event, elements, chart) => handleManagerChartClick(event, elements, chart),
                                   indexAxis: 'y',
                                   onHover: handleChartHover,
                                   scales: { 
                                       x: { 
                                           stacked: true, 
                                           max: managerPerfViewMode === 'percentage' ? 100 : undefined,
                                           ticks: { color: textPrimaryColor, precision: 0, callback: managerPerfViewMode === 'percentage' ? (v) => `${v}%` : undefined }, 
                                           grid: { color: gridColor }, 
                                           border: { color: borderColor } 
                                       }, 
                                       y: { stacked: true, ticks: { color: textPrimaryColor, font: { weight: 'bold' } }, grid: { drawOnChartArea: false }, border: { color: borderColor } } 
                                   },
                                   plugins: {
                                       ...baseChartOptions.plugins,
                                       tooltip: {
                                           ...baseChartOptions.plugins.tooltip,
                                           callbacks: {
                                               label: (context: any) => {
                                                   const label = context.dataset.label || '';
                                                   const value = context.parsed.x;
                                                   if (label && value != null) {
                                                       return managerPerfViewMode === 'count'
                                                            ? `${label}: ${value}`
                                                            : `${label}: ${value.toFixed(2)}%`;
                                                   }
                                                   return '';
                                               },
                                               footer: (tooltipItems: any[]) => {
                                                   if (!tooltipItems || tooltipItems.length === 0) return '';
                                                   const dataIndex = tooltipItems[0].dataIndex;
                                                   const managerData = chartData.performance.performanceByManager[dataIndex];
                                                   return managerData ? `Total Team Size: ${managerData.teamSize}` : '';
                                               }
                                           }
                                       },
                                       datalabels: {
                                           display: true,
                                           color: '#fff',
                                           font: { weight: 'bold' as const },
                                           formatter: (value: number, context: any) => {
                                                if (value === 0) return '';
                                                if (managerPerfViewMode === 'count') {
                                                    const dataIndex = context.dataIndex;
                                                    const managerData = chartData.performance.performanceByManager[dataIndex];
                                                    if (!managerData || managerData.teamSize === 0) return '';
                                                    const percentage = (value / managerData.teamSize) * 100;
                                                    if (percentage < 5) return '';
                                                    return Math.round(value);
                                                } else { // percentage
                                                    if (value < 5) return '';
                                                    return `${Math.round(value)}%`;
                                                }
                                           }
                                       }
                                   }
                               }} 
                            />
                        </div>
                    </ChartCard>
                    {chartData.performance.highPerformerAttrition && (
                         <Card>
                            <CardHeader>
                                <CardTitle>High-Performer Attrition Deep-Dive</CardTitle>
                                <CardDescription>Analysis of terminated employees with a performance rating of 4 or 5.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-center">
                                    <div className="p-4 bg-background rounded-lg"><p className="text-2xl font-bold">{chartData.performance.highPerformerAttrition.summary.count}</p><p className="text-sm text-text-secondary">High Performers Left</p></div>
                                    <div className="p-4 bg-background rounded-lg"><p className="text-2xl font-bold">{chartData.performance.highPerformerAttrition.summary.avgTenure.toFixed(1)} yrs</p><p className="text-sm text-text-secondary">Avg. Tenure at Exit</p></div>
                                    <div className="p-4 bg-background rounded-lg"><p className="text-2xl font-bold">{chartData.performance.highPerformerAttrition.summary.topDept}</p><p className="text-sm text-text-secondary">Top Dept for Attrition</p></div>
                                </div>
                                <h4 className="font-semibold text-text-primary mb-2">Recently Departed High Performers</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="text-xs text-text-secondary uppercase"><tr><th className="py-2 px-4 text-left">Employee</th><th className="py-2 px-4 text-left">Job Title</th><th className="py-2 px-4 text-left">Termination Date</th></tr></thead>
                                        <tbody>
                                            {chartData.performance.highPerformerAttrition.leavers.map(e => (
                                                <tr key={e.id} className="border-b border-border">
                                                    <td className="py-2 px-4 font-semibold text-text-primary hover:underline"><Link to={`/profiles/${e.id}`}>{e.name}</Link></td>
                                                    <td className="py-2 px-4 text-text-secondary">{e.jobTitle}</td>
                                                    <td className="py-2 px-4 text-text-secondary">{e.terminationDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
            {activeReport === 'skillset' && (
                <div className="space-y-6">
                    <div className="border-b border-border">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto" aria-label="Skill Set Tabs">
                            {skillsetTabs.map(tab => (
                                <button key={tab.id} onClick={() => setSkillsetTab(tab.id as any)}
                                    className={`whitespace-nowrap group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${skillsetTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                                >
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {skillsetTab === 'matrix' && (
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <MetricCard title="Unique Skills" value={chartData.skillset.kpis.uniqueSkillCount.toString()} icon={<BrainCircuit />} />
                                <MetricCard title="Most Common Skill" value={chartData.skillset.kpis.mostCommonSkill} icon={<Users />} />
                                <MetricCard title="Top Expert Skill" value={chartData.skillset.kpis.topExpertSkill} icon={<Star />} />
                                <MetricCard title="Most Skilled Dept." value={chartData.skillset.kpis.mostSkilledDepartment} icon={<Briefcase />} />
                            </div>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skill Matrix</CardTitle>
                                    <CardDescription>Distribution of skills and proficiency levels across the organization. Click a cell to view employees.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SkillScarcityLegend />
                                    <SkillMatrix data={chartData.skillset.matrix} onCellClick={handleSkillCellClick} />
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    {skillsetTab === 'advanced' && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ChartCard title="At-Risk Skills" description="Critical skills held by 3 or fewer employees. Click a row to see who.">
                                <SkillScarcityLegend />
                                <div className="overflow-y-auto max-h-80">
                                    <table className="w-full text-sm">
                                        <thead className="text-xs text-text-secondary uppercase bg-card sticky top-0">
                                            <tr>
                                                <th className="py-2 px-4 text-left font-medium">Skill Name</th>
                                                <th className="py-2 px-4 text-center font-medium">Employee Count</th>
                                                <th className="py-2 px-4 text-center font-medium">High Flight Risk</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chartData.skillset.atRiskSkills.map(skill => (
                                                <tr key={skill.skillName} className="border-b border-border last:border-b-0 hover:bg-border/50 cursor-pointer" onClick={() => setEmployeeListModal({isOpen: true, title: `Employees with skill: ${skill.skillName}`, description: ``, employees: skill.employees})}>
                                                    <td className="py-2 px-4 font-semibold text-text-primary">{skill.skillName}</td>
                                                    <td className="py-2 px-4 text-center text-text-primary" style={{color: getSkillScarcityColor(skill.employees.length, 1)}}>{skill.employees.length}</td>
                                                    <td className={`py-2 px-4 text-center font-bold ${skill.highRiskEmployeeCount > 0 ? 'text-red-400' : 'text-text-primary'}`}>{skill.highRiskEmployeeCount}</td>
                                                </tr>
                                            ))}
                                            {chartData.skillset.atRiskSkills.length === 0 && (
                                                <tr><td colSpan={3} className="text-center text-text-secondary py-8">No skills identified as "at-risk".</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>
                            <ChartCard title="Top Skills by Proficiency" description="Average proficiency level for the 15 most common skills.">
                                <SkillScarcityLegend />
                                <div className="h-96">
                                    <Bar 
                                        data={{
                                            labels: chartData.skillset.skillProficiencyMetrics.slice(0, 15).map(s => s.skillName),
                                            datasets: [{
                                                label: 'Avg. Proficiency (1-5)',
                                                data: chartData.skillset.skillProficiencyMetrics.slice(0, 15).map(s => s.avgProficiency),
                                                backgroundColor: (context: ScriptableContext<"bar">) => {
                                                    const skillName = context.chart.data.labels![context.dataIndex] as string;
                                                    const skillData = chartData.skillset.matrix[skillName];
                                                    return skillData ? getSkillScarcityColor(skillData.total.length, 0.8) : 'grey';
                                                },
                                            }]
                                        }}
                                        options={{ ...baseChartOptions, indexAxis: 'y', scales: { x: { min: 1, max: 5 } }, plugins: { ...baseChartOptions.plugins, datalabels: { display: true, color: '#fff', formatter: (value) => value.toFixed(2) }}}}
                                    />
                                </div>
                            </ChartCard>
                             <ChartCard title="Skill Impact on Performance" description="How proficiency in a skill correlates with performance ratings.">
                                <div className="mb-4">
                                    <SearchableSelect
                                        label="Select Skill"
                                        options={Object.keys(chartData.skillset.matrix).sort().map(s => ({ value: s, label: s }))}
                                        value={selectedImpactSkill}
                                        onChange={setSelectedImpactSkill}
                                        includeAll={false}
                                    />
                                </div>
                                <div className="h-80">
                                    <Bar
                                        data={{
                                            labels: chartData.skillset.skillImpactOnPerformance.map(d => d.level),
                                            datasets: [{
                                                label: 'Avg. Performance Rating',
                                                data: chartData.skillset.skillImpactOnPerformance.map(d => d.avgPerformance),
                                                backgroundColor: [
                                                    'rgba(107, 114, 128, 0.7)',
                                                    'rgba(59, 130, 246, 0.7)',
                                                    'rgba(34, 197, 94, 0.7)',
                                                    'rgba(168, 85, 247, 0.7)',
                                                    'rgba(245, 158, 11, 0.7)',
                                                ]
                                            }]
                                        }}
                                        options={{
                                            ...baseChartOptions,
                                            scales: { y: { min: 1, max: 5, title: { display: true, text: 'Avg. Performance Rating' } } },
                                            plugins: {
                                                ...baseChartOptions.plugins,
                                                legend: { display: false },
                                                datalabels: {
                                                    display: true,
                                                    color: dataLabelColor,
                                                    anchor: 'end',
                                                    align: 'top',
                                                    formatter: (value) => value.toFixed(2)
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </ChartCard>
                            <ChartCard title="Top Skills of High Performers" description="Most common skills among employees with performance rating 4 or 5.">
                                <SkillScarcityLegend />
                                <div className="h-96">
                                    <Bar
                                        data={{
                                            labels: chartData.skillset.highPerformerSkillsWithScarcity.slice(0, 10).map(s => s.skillName),
                                            datasets: [{
                                                label: 'Count among High Performers',
                                                data: chartData.skillset.highPerformerSkillsWithScarcity.slice(0, 10).map(s => s.highPerformerCount),
                                                backgroundColor: chartData.skillset.highPerformerSkillsWithScarcity.slice(0, 10).map(s => getSkillScarcityColor(s.totalCount, 0.8)),
                                            }]
                                        }}
                                        options={{
                                            ...baseChartOptions,
                                            indexAxis: 'y',
                                            plugins: {
                                                ...baseChartOptions.plugins,
                                                legend: { display: false },
                                                datalabels: {
                                                    display: true,
                                                    color: dataLabelColor,
                                                    anchor: 'end',
                                                    align: 'right',
                                                    padding: { right: 6 }
                                                }
                                            }
                                        }}
                                    />
                                </div>
                            </ChartCard>
                            <div className="lg:col-span-2">
                                <ChartCard title="Skill Density by Department" description="Percentage of employees in top departments possessing key skills.">
                                    <SkillScarcityLegend />
                                    <div className="h-96">
                                        <Bar
                                            data={{
                                                labels: chartData.skillset.skillDensity.skills,
                                                datasets: chartData.skillset.skillDensity.datasets.map((ds, index) => ({
                                                    label: ds.department,
                                                    data: ds.data,
                                                    backgroundColor: radarChartColors[index % radarChartColors.length].borderColor,
                                                }))
                                            }}
                                            options={{
                                                ...baseChartOptions,
                                                indexAxis: 'y',
                                                scales: {
                                                    x: { stacked: true, max: 100, ticks: { callback: (v) => `${v}%` } },
                                                    y: { stacked: true }
                                                },
                                                plugins: {
                                                    ...baseChartOptions.plugins,
                                                    legend: { ...baseChartOptions.plugins.legend, position: 'top' },
                                                    datalabels: {
                                                        display: (context) => (context.dataset.data[context.dataIndex] as number) > 5,
                                                        color: '#fff',
                                                        formatter: (value) => `${Math.round(value as number)}%`,
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </ChartCard>
                            </div>
                            <div className="lg:col-span-2">
                                <ChartCard title="Skill Proficiency Comparison" description="Average proficiency for top skills across major departments.">
                                    <div className="h-[28rem]">
                                        <Radar 
                                            data={chartData.skillset.skillComparison}
                                            options={{
                                                ...baseChartOptions,
                                                scales: {
                                                    r: {
                                                        angleLines: { color: gridColor },
                                                        grid: { color: gridColor },
                                                        pointLabels: { color: textPrimaryColor, font: { size: 12 } },
                                                        ticks: {
                                                            color: textPrimaryColor,
                                                            backdropColor: cardColor,
                                                            stepSize: 1
                                                        },
                                                        min: 0,
                                                        max: 5
                                                    }
                                                },
                                                plugins: {
                                                    ...baseChartOptions.plugins,
                                                    legend: {
                                                        ...baseChartOptions.plugins.legend,
                                                        position: 'top'
                                                    },
                                                    datalabels: { display: false }
                                                }
                                            }}
                                        />
                                    </div>
                                </ChartCard>
                            </div>
                        </div>
                    )}
                    {skillsetTab === 'gap_analysis' && (
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skill Gap Analysis Setup</CardTitle>
                                    <CardDescription>Define your future skill requirements to identify talent gaps.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <label htmlFor="requiredSkills" className="block text-sm font-medium text-text-secondary mb-2">Required Skills & Headcount</label>
                                    <textarea
                                        id="requiredSkills"
                                        rows={5}
                                        value={requiredSkillsInput}
                                        onChange={(e) => setRequiredSkillsInput(e.target.value)}
                                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                                        placeholder="Skill Name: Headcount"
                                    />
                                    <p className="text-xs text-text-secondary mt-1">Format: Skill Name: Required Headcount. Only employees with 'Proficient' or 'Expert' levels will be counted.</p>
                                    <Button onClick={handleRunGapAnalysis} className="mt-4">Run Analysis</Button>
                                </CardContent>
                            </Card>
                            {skillGapData && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Analysis Results</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="text-xs text-text-secondary uppercase">
                                                    <tr>
                                                        <th className="py-2 px-4 text-left">Skill Name</th>
                                                        <th className="py-2 px-4 text-center">Required</th>
                                                        <th className="py-2 px-4 text-center">Current</th>
                                                        <th className="py-2 px-4 text-center">Gap</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {skillGapData.map(item => (
                                                        <tr key={item.skillName} className="border-b border-border last:border-b-0">
                                                            <td className="py-2 px-4 font-semibold text-text-primary">{item.skillName}</td>
                                                            <td className="py-2 px-4 text-center">{item.required}</td>
                                                            <td className="py-2 px-4 text-center">{item.current}</td>
                                                            <td className={`py-2 px-4 text-center font-bold ${item.gap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                {item.gap > 0 ? `-${item.gap}` : `+${Math.abs(item.gap)}`}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};