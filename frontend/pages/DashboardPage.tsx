
import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { useDashboardConfig } from '../contexts/DashboardConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

// Import UI Components
import DashboardFilters from '../components/DashboardFilters';
import MetricCard from '../components/MetricCard';
import AIStoryCard from '../components/AIStoryCard';
import KeyDriverAnalysisWidget from '../components/KeyDriverAnalysisWidget';
import SuccessionGapsWidget from '../components/SuccessionGapsWidget';
import Button from '../components/ui/Button';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import NineBoxGrid from '../components/reports/NineBoxGrid';
import TalentRiskMatrixView from '../components/reports/TalentRiskMatrixView';
import ChartCard from '../components/ChartCard';

// Import Widget Components
import GenderDiversityWidget from '../components/dashboard/widgets/GenderDiversityWidget';
import TurnoverTrendWidget from '../components/dashboard/widgets/TurnoverTrendWidget';
import DepartmentHeadcountWidget from '../components/dashboard/widgets/DepartmentHeadcountWidget';
import PerformanceDistributionWidget from '../components/dashboard/widgets/PerformanceDistributionWidget';
import HeadcountHeatmapWidget from '../components/dashboard/widgets/HeadcountHeatmapWidget';
import TurnoverByReasonWidget from '../components/dashboard/widgets/TurnoverByReasonWidget';
import TurnoverByDeptWidget from '../components/dashboard/widgets/TurnoverByDeptWidget';
import AttendanceTrendWidget from '../components/dashboard/widgets/AttendanceTrendWidget';
import RecruitmentFunnelWidget from '../components/dashboard/widgets/RecruitmentFunnelWidget';
import BurnoutHotspotsWidget from '../components/dashboard/widgets/BurnoutHotspotsWidget';
import RetentionByDeptWidget from '../components/dashboard/widgets/RetentionByDeptWidget';
import TurnoverByTenureWidget from '../components/dashboard/widgets/TurnoverByTenureWidget';
import PayForPerformanceWidget from '../components/dashboard/widgets/PayForPerformanceWidget';
import PerformanceTrendWidget from '../components/dashboard/widgets/PerformanceTrendWidget';
import PerformanceCalibrationWidget from '../components/dashboard/widgets/PerformanceCalibrationWidget';
import ManagerPerformanceWidget from '../components/dashboard/widgets/ManagerPerformanceWidget';
import OpenPosByDeptWidget from '../components/dashboard/widgets/OpenPosByDeptWidget';
import OpenPosByTitleWidget from '../components/dashboard/widgets/OpenPosByTitleWidget';
import TurnoverByJobTitleWidget from '../components/dashboard/widgets/TurnoverByJobTitleWidget';
import TurnoverByLocationWidget from '../components/dashboard/widgets/TurnoverByLocationWidget';
import SkillSetKPIsWidget from '../components/dashboard/widgets/SkillSetKPIsWidget';
import AtRiskSkillsWidget from '../components/dashboard/widgets/AtRiskSkillsWidget';
import TopSkillsByProficiencyWidget from '../components/dashboard/widgets/TopSkillsByProficiencyWidget';
import TopSkillsHighPerformersWidget from '../components/dashboard/widgets/TopSkillsHighPerformersWidget';


// Import Charting components
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler, type ChartEvent, type ActiveElement, type Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Import calculation functions
// FIX: Changed import path to the monolithic hrCalculations file.
import * as hrCalculations from '../services/hrCalculations';

// Import constants and types
import { AVAILABLE_WIDGETS } from '../constants';
import { FileWarning, Users, TrendingDown, Clock, Activity, BarChart2, X, Filter, BrainCircuit, Building } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { Employee } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler, ChartDataLabels);


const DashboardPage: React.FC = () => {
    // ... (All hooks and state remain the same) ...
    const { displayedData, attendanceData, jobPositions, recruitmentFunnels, activeOrganization, currentPackageFeatures } = useData();
    const { currentUser } = useAuth();
    const { widgetConfigs, setAllWidgetSizes, resetWidgetSizesToDefault } = useDashboardConfig();
    const { mode, currency } = useTheme();
    const navigate = useNavigate();

    const DASHBOARD_FILTERS_KEY = 'dashboardFilters';
    const DASHBOARD_REVENUE_KEY = 'dashboardTotalRevenue';

    const [filters, setFilters] = useState(() => {
        try {
            const storedFilters = localStorage.getItem(DASHBOARD_FILTERS_KEY);
            if (storedFilters) {
                const parsed = JSON.parse(storedFilters);
                if (parsed.department && parsed.jobTitle && parsed.location && parsed.timePeriod) {
                    return parsed;
                }
            }
        } catch (error) {
            console.error("Failed to load dashboard filters from localStorage", error);
        }
        return { department: 'all', jobTitle: 'all', location: 'all', timePeriod: '12m' };
    });
    
    const [totalRevenue, setTotalRevenue] = useState(() => {
        try {
            const storedRevenue = localStorage.getItem(DASHBOARD_REVENUE_KEY);
            return storedRevenue || '50000000';
        } catch (error) {
            console.error("Failed to load total revenue from localStorage", error);
            return '50000000';
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(DASHBOARD_FILTERS_KEY, JSON.stringify(filters));
        } catch (error) {
            console.error("Failed to save dashboard filters to localStorage", error);
        }
    }, [filters]);
    
    useEffect(() => {
        try {
            localStorage.setItem(DASHBOARD_REVENUE_KEY, totalRevenue);
        } catch (error) {
            console.error("Failed to save total revenue to localStorage", error);
        }
    }, [totalRevenue]);

    const [interactiveFilter, setInteractiveFilter] = useState<{ type: string; value: string } | null>(null);
    const [employeeListModal, setEmployeeListModal] = useState<{ isOpen: boolean; title: string; description?: string; employees: Employee[] }>({ isOpen: false, title: '', employees: [] });
    
    // ... (All useMemo hooks for data calculation remain the same) ...
     const uniqueValues = useMemo(() => {
        const activeEmployees = displayedData.filter(e => !e.terminationDate);
        console.log(activeEmployees)
        return {
            // FIX: Add explicit sort with localeCompare and filter out falsy values to prevent type errors.
            // FIX: Added explicit string types to sort callback arguments to resolve 'unknown' type error.
            departments: [...new Set(activeEmployees.map(e => e.department).filter(Boolean))].sort((a: string, b: string) => a.localeCompare(b)),
            jobTitles: [...new Set(activeEmployees.map(e => e.jobTitle).filter(Boolean))].sort((a: string, b: string) => a.localeCompare(b)),
            locations: [...new Set(activeEmployees.map(e => e.location).filter(Boolean))].sort((a: string, b: string) => a.localeCompare(b)),
        };
    }, [displayedData]);

    const { filteredData, activeFilteredData, leaversInPeriod } = useMemo(() => {
        let data = displayedData.filter(emp => {
            const departmentMatch = filters.department === 'all' || emp.department === filters.department;
            const jobTitleMatch = filters.jobTitle === 'all' || emp.jobTitle === filters.jobTitle;
            const locationMatch = filters.location === 'all' || emp.location === filters.location;
            return departmentMatch && jobTitleMatch && locationMatch;
        });
        
        if (interactiveFilter) {
            if (interactiveFilter.type === 'department') {
                data = data.filter(emp => emp.department === interactiveFilter.value);
            }
        }

        const activeData = data.filter(e => !e.terminationDate);

        const leavers = data.filter(e => {
            if (!e.terminationDate) return false;
            if (filters.timePeriod === 'all') return true;
            let months = 12;
            if (filters.timePeriod === '6m') months = 6;
            if (filters.timePeriod === '3m') months = 3;
            const cutoff = new Date(new Date().setMonth(new Date().getMonth() - months));
            return new Date(e.terminationDate) >= cutoff;
        });

        return { filteredData: data, activeFilteredData: activeData, leaversInPeriod: leavers };
    }, [displayedData, filters, interactiveFilter]);

    const metrics = useMemo(() => {
        const activeFilteredEmployeeIds = new Set(activeFilteredData.map(e => e.id));
        const filteredAttendance = attendanceData.filter(att => activeFilteredEmployeeIds.has(att.employeeId));
        const openPositions = jobPositions.filter(p => p.status === 'Open');

        const activeEmployeesForSkills = activeFilteredData;
        const skillMatrix = hrCalculations.getSkillMatrix(activeEmployeesForSkills);

        return {
            totalEmployees: activeFilteredData.length,
            turnoverRate: hrCalculations.getAnnualTurnoverRateFromData(filteredData, filters.timePeriod as any),
            averageTenure: hrCalculations.getAverageTenure(activeFilteredData),
            averageEngagement: hrCalculations.calculateAverageEngagement(activeFilteredData),
            revenuePerEmployee: hrCalculations.calculateRevenuePerEmployee(Number(totalRevenue), activeFilteredData),
            genderDiversity: hrCalculations.getGenderDiversity(activeFilteredData),
            turnoverTrend: hrCalculations.getTurnoverTrend(leaversInPeriod, filters.timePeriod as any),
            departmentHeadcount: hrCalculations.getHeadcountByDepartment(activeFilteredData),
            performanceDistribution: hrCalculations.getPerformanceDistribution(activeFilteredData),
            headcountHeatmap: hrCalculations.getHeadcountHeatmap(activeFilteredData),
            turnoverByReason: hrCalculations.getTurnoverByReason(leaversInPeriod),
            turnoverByDept: hrCalculations.getTurnoverByDepartment(leaversInPeriod),
            attendanceTrend: hrCalculations.getAbsenceTrend(filteredAttendance, '6m'),
            recruitmentFunnel: hrCalculations.getRecruitmentFunnelTotals(recruitmentFunnels),
            successionGaps: hrCalculations.analyzeSuccessionGaps(activeFilteredData),
            burnoutHotspots: hrCalculations.getBurnoutHotspots(activeFilteredData),
            retentionByDept: hrCalculations.getRetentionByDepartment(filteredData, '12m'),
            turnoverByTenure: hrCalculations.getTurnoverByTenureBuckets(leaversInPeriod),
            payForPerformance: hrCalculations.getPayForPerformanceData(activeFilteredData),
            performanceTrend: hrCalculations.getPerformanceTrend(activeFilteredData),
            performanceCalibration: hrCalculations.getPerformanceCalibrationData(activeFilteredData),
            performanceCalibrationCounts: (() => {
                // FIX: Add explicit sort with localeCompare and filter out falsy values to prevent type errors.
                // FIX: Added explicit string types to sort callback arguments to resolve 'unknown' type error.
                const departments = [...new Set(activeFilteredData.map(e => e.department).filter(Boolean))].sort((a: string, b: string) => a.localeCompare(b));
                const results = departments.map(dept => {
                    const deptEmployees = activeFilteredData.filter(e => e.department === dept);
                    const counts = deptEmployees.reduce((acc, emp) => {
                        const ratingKey = String(emp.performanceRating);
                        acc[ratingKey] = (acc[ratingKey] || 0) + 1;
                        return acc;
                    }, {} as Record<string, number>);

                    return {
                        department: dept,
                        total: deptEmployees.length,
                        distribution: {
                            '1': counts['1'] || 0,
                            '2': counts['2'] || 0,
                            '3': counts['3'] || 0,
                            '4': counts['4'] || 0,
                            '5': counts['5'] || 0,
                        }
                    };
                });
                return results;
            })(),
            nineBoxGrid: hrCalculations.getNineBoxGridData(activeFilteredData),
            managerPerformance: hrCalculations.getPerformanceByManager(activeFilteredData),
            openPosByDept: hrCalculations.getOpenPositionsByDepartment(openPositions),
            openPosByTitle: hrCalculations.getOpenPositionsByTitle(openPositions),
            turnoverByJobTitle: hrCalculations.getTurnoverByJobTitle(leaversInPeriod),
            turnoverByLocation: hrCalculations.getTurnoverByLocation(leaversInPeriod),
            // Skill metrics
            skillSetKPIs: hrCalculations.getSkillSetKPIs(activeEmployeesForSkills, skillMatrix),
            atRiskSkills: hrCalculations.getAtRiskSkills(activeEmployeesForSkills, 3), // Threshold of 3
            topSkillsByProficiency: hrCalculations.getSkillProficiencyMetrics(activeEmployeesForSkills),
            highPerformerSkills: hrCalculations.getHighPerformerSkills(activeEmployeesForSkills),
        };
    }, [filteredData, activeFilteredData, leaversInPeriod, filters.timePeriod, totalRevenue, attendanceData, jobPositions, recruitmentFunnels]);

    // ... (All chart option and color hooks remain the same) ...
    const cardColor = useMemo(() => mode === 'dark' ? '#1a1a1a' : '#ffffff', [mode]);
    const textPrimaryColor = useMemo(() => mode === 'dark' ? '#f8fafc' : '#1e293b', [mode]);
    const borderColor = useMemo(() => mode === 'dark' ? '#27272a' : '#e2e8f0', [mode]);
    const gridColor = useMemo(() => mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)', [mode]);
    
    const baseChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { color: textPrimaryColor, boxWidth: 12, padding: 20 } },
            tooltip: {
                backgroundColor: cardColor, titleColor: textPrimaryColor, bodyColor: textPrimaryColor, borderColor: borderColor, borderWidth: 1,
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || context.label || '';
                        if (label) { label += ': '; }
                        if (context.parsed.y !== null) { label += context.parsed.y.toLocaleString(undefined, { maximumFractionDigits: 2 }); }
                        else if (context.parsed.x !== null) { label += context.parsed.x.toLocaleString(undefined, { maximumFractionDigits: 2 }); }
                        return label;
                    }
                }
            },
            datalabels: { display: false }
        },
        scales: {
            x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } },
            y: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }
        }
    }), [textPrimaryColor, cardColor, borderColor, gridColor]);

    const canUpload = currentUser?.role === 'Org Admin' || currentUser?.role === 'HR Analyst';
    // ... (All event handlers for clicks, hovers, and modals remain the same) ...
    const handleEmployeeListModal = (title: string, employees: Employee[]) => {
        setEmployeeListModal({ isOpen: true, title, employees });
    };

    const handleInteractiveChartHover = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (!chart) return;
        const canvas = chart.canvas;
        if (canvas && event.y !== null) {
            const yAxis = chart.scales.y;
            const index = yAxis.getValueForPixel(event.y);
            const isOverLabel = index !== undefined && index >= 0 && index < yAxis.ticks.length;
            canvas.style.cursor = elements.length > 0 || isOverLabel ? 'pointer' : 'default';
        }
    };
    
    const handleDepartmentChartClick = (chartLabels: { name: string }[]) => (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const departmentName = chartLabels[index].name;
            if (interactiveFilter && interactiveFilter.type === 'department' && interactiveFilter.value === departmentName) {
                setInteractiveFilter(null);
            } else {
                setInteractiveFilter({ type: 'department', value: departmentName });
            }
        }
    };

    const handleManagerPerformanceClick = (event: ChartEvent, elements: ActiveElement[], chart: Chart) => {
        if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const managerData = metrics.managerPerformance[index];
            if (!managerData) return;
    
            const ratingKeys = Object.keys(metrics.managerPerformance[0]?.ratings || {}).filter(r => r !== 'count').sort((a, b) => parseInt(a) - parseInt(b));
            const rating = ratingKeys[datasetIndex];
            
            const ratingLabels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
            
            const employeesInSegment = activeFilteredData.filter(emp => 
                emp.managerId === managerData.managerId && 
                String(emp.performanceRating) === rating
            );
    
            setEmployeeListModal({
                isOpen: true,
                title: `Team Members of ${managerData.managerName}`,
                description: `Performance Rating: ${rating} (${ratingLabels[datasetIndex]})`,
                employees: employeesInSegment
            });
        } else {
            if (chart && event.y !== null) {
                const yAxis = chart.scales.y;
                const index = yAxis.getValueForPixel(event.y);
                if (index !== undefined && metrics.managerPerformance[index]) {
                    const managerData = metrics.managerPerformance[index];
                    navigate(`/app/profiles/${managerData.managerId}`);
                }
            }
        }
    };
    
    const handleCalibrationChartClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index, datasetIndex } = elements[0];
            const department = metrics.performanceCalibration[index].department;
            const rating = String(datasetIndex + 1);
            const ratingLabels = ['Needs Improvement', 'Below Expectations', 'Meets Expectations', 'Exceeds Expectations', 'Outstanding'];
            
            const employeesInSegment = activeFilteredData.filter(e => 
                !e.terminationDate &&
                e.department === department && 
                String(e.performanceRating) === rating
            );
            
            setEmployeeListModal({
                isOpen: true,
                title: `Employees in ${department}`,
                description: `List of active employees with performance rating ${rating} (${ratingLabels[datasetIndex]}).`,
                employees: employeesInSegment,
            });
        }
    };

    const handlePerformanceDistClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const ratingLabel = metrics.performanceDistribution[index].name;
            const ratingMapping: { [label: string]: number } = {
                'Needs Improvement': 1, 'Below Expectations': 2, 'Meets Expectations': 3,
                'Exceeds Expectations': 4, 'Outstanding': 5,
            };
            const rating = ratingMapping[ratingLabel];
            const employeesInSegment = activeFilteredData.filter(e => e.performanceRating === rating);
            setEmployeeListModal({
                isOpen: true,
                title: `Employees with '${ratingLabel}' Performance`,
                description: `List of active employees with a performance rating of ${rating}.`,
                employees: employeesInSegment,
            });
        }
    };

    const handleTurnoverByJobTitleClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const jobTitle = metrics.turnoverByJobTitle.slice(0, 10)[index].name;
            const employeesInSegment = leaversInPeriod.filter(e => e.jobTitle === jobTitle);
            setEmployeeListModal({
                isOpen: true,
                title: `Leavers with Job Title: ${jobTitle}`,
                description: `List of employees with this job title who left in the selected period.`,
                employees: employeesInSegment,
            });
        }
    };

    const handleTurnoverByTenureClick = (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
            const { index } = elements[0];
            const bucketLabel = metrics.turnoverByTenure[index].name;
            const employeesInSegment = leaversInPeriod.filter(emp => {
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
            setEmployeeListModal({
                isOpen: true,
                title: `Leavers with Tenure: ${bucketLabel}`,
                description: `List of employees who left the company within this tenure range.`,
                employees: employeesInSegment,
            });
        }
    };

    const handleSkillChartClick = (event: ChartEvent, elements: ActiveElement[], chartType: 'proficiency' | 'high_performers') => {
        if (elements.length > 0) {
            const { index } = elements[0];
            let skillName = '';
            
            if (chartType === 'proficiency') {
                const topSkills = metrics.topSkillsByProficiency.slice(0, 10);
                if (topSkills[index]) {
                    skillName = topSkills[index].skillName;
                }
            } else if (chartType === 'high_performers') {
                const topSkills = metrics.highPerformerSkills.slice(0, 10);
                if (topSkills[index]) {
                    skillName = topSkills[index].skillName;
                }
            }

            if (skillName) {
                const employeesWithSkill = activeFilteredData.filter(emp => 
                    emp.skills.some(s => s.name === skillName)
                );

                setEmployeeListModal({
                    isOpen: true,
                    title: `Employees with Skill: ${skillName}`,
                    description: `List of active employees who possess the '${skillName}' skill.`,
                    employees: employeesWithSkill,
                });
            }
        }
    };
    
    // ... (sortedVisibleWidgets logic remains the same) ...
     const sortedVisibleWidgets = useMemo(() => {
        if (!currentUser) return [];
        return AVAILABLE_WIDGETS
            .filter(widget => {
                const isConfigVisible = widgetConfigs[widget.id]?.visible;
                if (!isConfigVisible) return false;

                const hasFeatureAccess = !widget.featureFlag || (currentPackageFeatures && currentPackageFeatures[widget.featureFlag]);
                if (!hasFeatureAccess) return false;
    
                if (currentUser.role === 'Super Admin') {
                    // If an organization is selected, Super Admin should see all widgets for that org's package.
                    // If no organization is selected, they will see the empty state anyway, so this is fine.
                    return true;
                }
                
                return widget.roles.includes(currentUser.role);
            })
            .sort((a, b) => (widgetConfigs[a.id]?.priority || 999) - (widgetConfigs[b.id]?.priority || 999));
    }, [widgetConfigs, currentUser, currentPackageFeatures]);

    if (displayedData.length === 0) {
        return (
          <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-4">
              <FileWarning className="mx-auto h-16 w-16 text-text-secondary" />
              <h3 className="text-xl font-semibold text-text-primary">
                  {currentUser?.role === 'Super Admin' ? 'Select an Organization' : 'No Data Loaded'}
              </h3>
              <p className="text-text-secondary">
                {currentUser?.role === 'Super Admin' 
                    ? "As a Super Admin, please select an organization from the sidebar to view its dashboard."
                    : canUpload
                        ? "Please provide data to view the dashboard."
                        : "Employee data has not been uploaded yet. The dashboard is unavailable."
                }
              </p>
              {canUpload && currentUser?.role !== 'Super Admin' && (
                <div className="flex gap-2 justify-center">
                  <Link to="/app/data-management">
                    <Button>Manage Data</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      }

    const renderWidget = (widgetId: string) => {
        const onHover = (e: ChartEvent, el: ActiveElement[], chart: Chart) => chart.canvas.style.cursor = el.length > 0 ? 'pointer' : 'default';
        switch (widgetId) {
            case 'ai_story': return <AIStoryCard filteredData={activeFilteredData} metrics={metrics} filters={filters} />;
            case 'key_driver_analysis': return <KeyDriverAnalysisWidget filteredData={filteredData} />;
            case 'gender_diversity': return <GenderDiversityWidget data={{labels: metrics.genderDiversity.map(d => d.name), datasets: [{ data: metrics.genderDiversity.map(d => d.value), backgroundColor: ['#3b82f6', '#f43f5e', '#6b7280'], borderColor: cardColor }]}} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, legend: {position: 'right'}, tooltip: { callbacks: { label: (ctx: any) => {
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
                return `${ctx.label}: ${(((ctx.raw as number) / (total || 1)) * 100).toFixed(2)}%`;
            } }}, datalabels: { display: true, color: '#fff', formatter: (val: any, ctx: any) => {
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
                const percentage = (val / (total || 1)) * 100;
                return percentage > 5 ? `${percentage.toFixed(2)}%` : '';
            } }}}} />;
            case 'turnover_trend': return <TurnoverTrendWidget data={{labels: metrics.turnoverTrend.map(d => d.name), datasets: [{ label: 'Leavers', data: metrics.turnoverTrend.map(d => d.value), borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.2)', fill: true, tension: 0.3 }]}} options={baseChartOptions}/>;
            case 'department_headcount': return <DepartmentHeadcountWidget data={{labels: metrics.departmentHeadcount.map(d => d.name), datasets: [{ label: 'Headcount', data: metrics.departmentHeadcount.map(d => d.value), backgroundColor: '#8b5cf6' }]}} options={{...baseChartOptions, indexAxis: 'y', onClick: handleDepartmentChartClick(metrics.departmentHeadcount), onHover: handleInteractiveChartHover, plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: {label: (context: any) => { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += context.parsed.x; } return label; }}}, datalabels: { display: true, color: '#fff', anchor: 'center', align: 'center' }}}}/>;
            case 'performance_distribution': return <PerformanceDistributionWidget data={{labels: metrics.performanceDistribution.map(d => d.name), datasets: [{ label: 'Employee Count', data: metrics.performanceDistribution.map(d => d.value), backgroundColor: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'] }]}} options={{...baseChartOptions, onClick: handlePerformanceDistClick, onHover, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#fff', anchor: 'center', align: 'center' }}}}/>;
            case 'headcount_heatmap': return <HeadcountHeatmapWidget data={metrics.headcountHeatmap} />;
            case 'turnover_by_reason': return <TurnoverByReasonWidget data={{labels: metrics.turnoverByReason.map(d => d.name), datasets: [{ data: metrics.turnoverByReason.map(d => d.value), backgroundColor: ['#f59e0b', '#ef4444'], borderColor: cardColor}]}} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, legend: {position: 'right'}, tooltip: { callbacks: { label: (ctx: any) => {
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
                return `${ctx.label}: ${(((ctx.raw as number) / (total || 1)) * 100).toFixed(2)}%`;
            } }}, datalabels: { display: true, color: '#fff', formatter: (val: any, ctx: any) => {
                const total = (ctx.chart.data.datasets[0].data as number[]).reduce((a: number, b: number) => a + (b || 0), 0);
                const percentage = (val / (total || 1)) * 100;
                return percentage > 5 ? `${percentage.toFixed(2)}%` : '';
            } }}}}/>;
            case 'turnover_by_dept': return <TurnoverByDeptWidget data={{labels: metrics.turnoverByDept.map(d => d.name), datasets: [{ label: 'Leavers', data: metrics.turnoverByDept.map(d => d.value), backgroundColor: '#ec4899' }]}} options={{...baseChartOptions, indexAxis: 'y', onClick: handleDepartmentChartClick(metrics.turnoverByDept), onHover: handleInteractiveChartHover, plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: {label: (context: any) => { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += context.parsed.x; } return label; }}}, datalabels: { display: true, color: '#fff', anchor: 'center', align: 'center' }}}}/>;
            case 'attendance_trend': return <AttendanceTrendWidget data={{labels: metrics.attendanceTrend.map(d => d.name), datasets: [{ label: 'Absences', data: metrics.attendanceTrend.map(d => d.value), borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.2)', fill: true, tension: 0.3 }]}} options={baseChartOptions}/>;
            case 'recruitment_funnel': return <RecruitmentFunnelWidget data={{labels: ['Shortlisted', 'Interviewed', 'Offers', 'Accepted', 'Joined'], datasets: [{ label: 'Count', data: Object.values(metrics.recruitmentFunnel), backgroundColor: '#10b981' }]}} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#fff' }}}}/>;
            case 'succession_gaps': return <SuccessionGapsWidget gaps={metrics.successionGaps} />;
            case 'burnout_hotspots': return <BurnoutHotspotsWidget data={{labels: metrics.burnoutHotspots.map(d => d.department), datasets: [{label: 'Avg Risk Score', data: metrics.burnoutHotspots.map(d => d.averageRiskScore), backgroundColor: metrics.burnoutHotspots.map(d => d.averageRiskScore > 65 ? '#ef4444' : d.averageRiskScore > 40 ? '#f59e0b' : '#22c55e')}]}} options={{...baseChartOptions, indexAxis: 'y', plugins: {...baseChartOptions.plugins, legend: { display: false }, tooltip: { ...baseChartOptions.plugins.tooltip, callbacks: { label: (context: any) => { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += context.parsed.x.toFixed(2); } return label; } } }, datalabels: { display: true, color: '#fff', anchor: 'center', align: 'center', font: { weight: 'bold' }, formatter: (value: any) => value.toFixed(2)}}, scales: { x: { beginAtZero: true, max: 100 }}}} />;
            case 'retention_by_dept': return <RetentionByDeptWidget data={{labels: metrics.retentionByDept.map(d => d.name), datasets:[{ label: 'Retention Rate', data: metrics.retentionByDept.map(d => d.value), backgroundColor: '#22c55e'}]}} options={{...baseChartOptions, indexAxis: 'y', scales: {...baseChartOptions.scales, x: { ...baseChartOptions.scales.x, ticks: { callback: (v: any) => `${Number(v).toFixed(0)}%` }}}, plugins: {...baseChartOptions.plugins, tooltip: { callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${ctx.formattedValue}%`}}, datalabels: { display: true, color: '#fff', formatter: (v: any) => `${Number(v).toFixed(2)}` }}}} />;
            case 'turnover_by_tenure': return <TurnoverByTenureWidget data={{labels: metrics.turnoverByTenure.map(d => d.name), datasets:[{ label: 'Leavers', data: metrics.turnoverByTenure.map(d => d.value), backgroundColor: '#6ee7b7'}]}} options={{...baseChartOptions, onClick: handleTurnoverByTenureClick, onHover, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#000' }}}} />;
            case 'pay_for_performance': return <PayForPerformanceWidget data={{datasets: [{ label: 'Employees', data: metrics.payForPerformance, backgroundColor: 'rgba(59, 130, 246, 0.5)'}]}} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, tooltip: { callbacks: { label: (ctx: any) => `${ctx.raw.label}: Perf ${ctx.raw.x}, Salary ${ctx.raw.y.toLocaleString()}` }}}}} />;
            case 'performance_trend': return <PerformanceTrendWidget data={{labels: metrics.performanceTrend.map(d => d.period), datasets: [{ label: 'Avg Performance', data: metrics.performanceTrend.map(d => d.avgPerformance), borderColor: '#10b981'}]}} options={{...baseChartOptions, scales: {...baseChartOptions.scales, y: {min: 3, max: 4}}}}/>;
            case 'performance_calibration': return <PerformanceCalibrationWidget calibrationData={metrics.performanceCalibration} calibrationCounts={metrics.performanceCalibrationCounts} baseChartOptions={baseChartOptions} textPrimaryColor={textPrimaryColor} onClick={handleCalibrationChartClick} onHover={handleInteractiveChartHover} />;
            case 'nine_box_grid': return <ChartCard title="9-Box Grid (Full View)" description="Detailed talent segmentation."><NineBoxGrid data={metrics.nineBoxGrid} /></ChartCard>;
            case 'manager_performance': return <ManagerPerformanceWidget managerPerformance={metrics.managerPerformance} baseChartOptions={baseChartOptions} textPrimaryColor={textPrimaryColor} gridColor={gridColor} borderColor={borderColor} onClick={handleManagerPerformanceClick} onHover={handleInteractiveChartHover} />;
            case 'open_pos_by_dept': return <OpenPosByDeptWidget data={{labels: metrics.openPosByDept.map(d => d.department), datasets: [{ label: 'Replacement', data: metrics.openPosByDept.map(d => d.replacement), backgroundColor: '#3b82f6' }, { label: 'New (Budgeted)', data: metrics.openPosByDept.map(d => d.newBudgeted), backgroundColor: '#22c55e' }, { label: 'New (Non-Budgeted)', data: metrics.openPosByDept.map(d => d.newNonBudgeted), backgroundColor: '#f97316' }]}} options={{...baseChartOptions, indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true }}, plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: {label: (context: any) => {const label = context.dataset.label || ''; const value = context.parsed.x; if (label && value != null) { return `${label}: ${value}`; } return ''; }, footer: (tooltipItems: any[]) => {if (!tooltipItems || tooltipItems.length === 0) return ''; const dataIndex = tooltipItems[0].dataIndex; let total = 0; tooltipItems[0].chart.data.datasets.forEach((dataset: any) => { const value = dataset.data[dataIndex]; if (typeof value === 'number') { total += value; }}); return `Total: ${total}`; }}}, datalabels: { display: true, color: '#fff', formatter: (v: any) => v > 0 ? v : '' }}}}/>;
            case 'open_pos_by_title': const topTitles = metrics.openPosByTitle.slice(0, 15); return <OpenPosByTitleWidget data={{labels: topTitles.map(d => d.title), datasets: [{ label: 'Replacement', data: topTitles.map(d => d.replacement), backgroundColor: '#3b82f6' }, { label: 'New (Budgeted)', data: topTitles.map(d => d.newBudgeted), backgroundColor: '#22c55e' }, { label: 'New (Non-Budgeted)', data: topTitles.map(d => d.newNonBudgeted), backgroundColor: '#f97316' }]}} options={{...baseChartOptions, indexAxis: 'y', scales: { x: { stacked: true }, y: { stacked: true }}, plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: {label: (context: any) => {const label = context.dataset.label || ''; const value = context.parsed.x; if (label && value != null) { return `${label}: ${value}`; } return ''; }, footer: (tooltipItems: any[]) => {if (!tooltipItems || tooltipItems.length === 0) return ''; const dataIndex = tooltipItems[0].dataIndex; let total = 0; tooltipItems[0].chart.data.datasets.forEach((dataset: any) => { const value = dataset.data[dataIndex]; if (typeof value === 'number') { total += value; }}); return `Total: ${total}`; }}}, datalabels: { display: true, color: '#fff', formatter: (v: any) => v > 0 ? v : '' }}}}/>;
            case 'turnover_by_job_title': return <TurnoverByJobTitleWidget data={{labels: metrics.turnoverByJobTitle.slice(0, 10).map(d => d.name), datasets:[{ label: 'Leavers', data: metrics.turnoverByJobTitle.slice(0, 10).map(d => d.value), backgroundColor: '#3b82f6'}]}} options={{...baseChartOptions, onClick: handleTurnoverByJobTitleClick, onHover, indexAxis: 'y', plugins: {...baseChartOptions.plugins, tooltip: {...baseChartOptions.plugins.tooltip, callbacks: {label: (context: any) => { let label = context.dataset.label || ''; if (label) { label += ': '; } if (context.parsed.x !== null) { label += context.parsed.x; } return label; }}}, datalabels: { display: true, color: '#fff' }}}}/>;
            case 'turnover_by_location': return <TurnoverByLocationWidget data={{labels: metrics.turnoverByLocation.map(d => d.name), datasets: [{ label: 'Leavers', data: metrics.turnoverByLocation.map(d => d.value), backgroundColor: '#ec4899'}]}} options={{...baseChartOptions, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#fff' }}}}/>;
            case 'talent_risk_matrix': return <TalentRiskMatrixView />;
            case 'skill_set_kpis': return <SkillSetKPIsWidget kpis={metrics.skillSetKPIs} />;
            case 'at_risk_skills': return <AtRiskSkillsWidget atRiskSkills={metrics.atRiskSkills} onRowClick={(title, employees) => setEmployeeListModal({isOpen: true, title, employees})} />;
            case 'top_skills_proficiency': return <TopSkillsByProficiencyWidget data={{labels: metrics.topSkillsByProficiency.slice(0, 10).map(s => s.skillName), datasets: [{ label: 'Avg. Proficiency (1-5)', data: metrics.topSkillsByProficiency.slice(0, 10).map(s => s.avgProficiency), backgroundColor: '#a855f7' }]}} options={{...baseChartOptions, onClick: (event: any, elements: any) => handleSkillChartClick(event, elements, 'proficiency'), onHover, indexAxis: 'y', scales: { x: { min: 1, max: 5, ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }, y: { ticks: { color: textPrimaryColor }, grid: { drawOnChartArea: false }, border: { color: borderColor } } }, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#fff', formatter: (value: any) => value.toFixed(2) }}}} />;
            case 'top_skills_high_performers': return <TopSkillsHighPerformersWidget data={{labels: metrics.highPerformerSkills.slice(0, 10).map(s => s.skillName), datasets: [{ label: 'Count among High Performers', data: metrics.highPerformerSkills.slice(0, 10).map(s => s.count), backgroundColor: '#10b981' }]}} options={{...baseChartOptions, onClick: (event: any, elements: any) => handleSkillChartClick(event, elements, 'high_performers'), onHover, indexAxis: 'y', scales: { x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }, y: { ticks: { color: textPrimaryColor }, grid: { drawOnChartArea: false }, border: { color: borderColor } } }, plugins: {...baseChartOptions.plugins, datalabels: { display: true, color: '#fff' }}}} />;
            default: return null;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-text-primary">Executive Dashboard</h1>
                    <p className="text-sm text-text-secondary flex items-center gap-2 mt-1"><Building className="h-4 w-4"/>{currentUser?.organizationName || 'No Organization Selected'}</p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={resetWidgetSizesToDefault}>Auto</Button>
                    <Button variant="secondary" size="sm" onClick={() => setAllWidgetSizes('small')}>Small</Button>
                    <Button variant="secondary" size="sm" onClick={() => setAllWidgetSizes('medium')}>Medium</Button>
                    <Button variant="secondary" size="sm" onClick={() => setAllWidgetSizes('large')}>Large</Button>
                </div>
            </div>

            <DashboardFilters
                filters={filters}
                setFilters={setFilters}
                totalRevenue={totalRevenue}
                setTotalRevenue={setTotalRevenue}
                uniqueValues={uniqueValues}
                isDepartmentDisabled={!!interactiveFilter}
            />
            
            {interactiveFilter && (
                <div className="flex items-center gap-2 p-2 bg-card border border-border rounded-md">
                    <Filter className="h-4 w-4 text-text-secondary"/>
                    <span className="text-sm font-medium text-text-secondary">Active Filter:</span>
                    <span className="px-3 py-1 text-sm font-semibold text-primary-200 bg-primary-800 rounded-full flex items-center gap-2">
                        {interactiveFilter.type}: {interactiveFilter.value}
                        <button onClick={() => setInteractiveFilter(null)} className="p-0.5 rounded-full hover:bg-white/20">
                            <X className="h-3 w-3" />
                        </button>
                    </span>
                </div>
            )}

            {widgetConfigs['kpi_cards']?.visible && (
                 <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    <MetricCard title="Active Headcount" value={metrics.totalEmployees.toString()} icon={<Users className="h-5 w-5"/>} />
                    <MetricCard title="Annualized Turnover" value={`${metrics.turnoverRate.toFixed(1)}%`} icon={<TrendingDown className="h-5 w-5"/>} />
                    <MetricCard title="Average Tenure" value={`${metrics.averageTenure.toFixed(1)} yrs`} icon={<Clock className="h-5 w-5"/>} />
                    <MetricCard title="Engagement Score" value={metrics.averageEngagement.toFixed(1)} icon={<Activity className="h-5 w-5"/>} />
                    <MetricCard title="Revenue Per Employee" value={`${currency === 'PKR' ? 'Rs' : '$'}${(metrics.revenuePerEmployee / 1000).toFixed(0)}k`} icon={<BarChart2 className="h-5 w-5"/>} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedVisibleWidgets.map(widget => {
                    if (widget.id === 'kpi_cards') return null;
                    const size = widgetConfigs[widget.id]?.size ?? 'small';
                    const sizeClass = size === 'large' ? 'md:col-span-2 lg:col-span-4' : size === 'medium' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1 lg:col-span-1';

                    const widgetComponent = renderWidget(widget.id);
                    return widgetComponent ? (
                        <div key={widget.id} className={sizeClass}>
                            {widgetComponent}
                        </div>
                    ) : null;
                })}
            </div>

            {employeeListModal.isOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                        <CardHeader>
                            <CardTitle>{employeeListModal.title}</CardTitle>
                            {employeeListModal.description && <CardDescription>{employeeListModal.description}</CardDescription>}
                            <button onClick={() => setEmployeeListModal({ isOpen: false, title: '', employees: [] })} className="absolute top-4 right-4 p-2 rounded-full hover:bg-border transition-colors">
                                <X className="h-5 w-5 text-text-secondary"/>
                            </button>
                        </CardHeader>
                        <CardContent className="overflow-y-auto">
                            <div className="space-y-3">
                                {employeeListModal.employees.length > 0 ? employeeListModal.employees.map(emp => (
                                    <Link to={`/app/profiles/${emp.id}`} key={emp.id} className="block p-3 bg-background rounded-md hover:bg-border transition-colors">
                                        <p className="font-semibold text-text-primary">{emp.name}</p>
                                        <p className="text-sm text-text-secondary">{emp.jobTitle} - {emp.department}</p>
                                    </Link>
                                )) : <p className="text-center text-text-secondary py-8">No employees in this segment.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
