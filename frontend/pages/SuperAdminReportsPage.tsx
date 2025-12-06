import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { Server, Zap, Users, BarChart, Building2, Check, X, GitCompareArrows, ClipboardCheck, TrendingUp, TrendingDown, DollarSign, Database as DatabaseIcon } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import ChartCard from '../components/ChartCard';
import { APP_PACKAGES } from '../constants';
import * as hrCalculations from '../services/calculations';
import type { Employee, Organization } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

type Tab = 'health' | 'management' | 'benchmarking' | 'features' | 'variation' | 'data-quality';

const TABS: { id: Tab; name: string; icon: React.FC<any> }[] = [
    { id: 'health', name: 'Platform Health', icon: Zap },
    { id: 'management', name: 'Client Management', icon: Building2 },
    { id: 'benchmarking', name: 'Benchmarking', icon: BarChart },
    { id: 'features', name: 'Features Analytics', icon: ClipboardCheck },
    { id: 'variation', name: 'Data Variation', icon: GitCompareArrows },
    { id: 'data-quality', name: 'Data Quality', icon: DatabaseIcon },
];

const getHighlightClass = (value: number, warnThreshold: number, dangerThreshold: number) => {
    const absValue = Math.abs(value);
    if (!isFinite(absValue) || isNaN(absValue)) return 'text-text-secondary';
    if (absValue >= dangerThreshold) return 'text-red-400 font-bold';
    if (absValue >= warnThreshold) return 'text-yellow-400 font-semibold';
    return 'text-text-primary';
};

const SuperAdminReportsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('health');
    const { allOrganizations, allUsers, historicalEmployeeData, setActiveOrganizationId,globalHeadcount } = useData();
    const { mode } = useTheme();

    const latestEmployees = useMemo(() => {
        const latestEmployeeMap = new Map<string, Employee>();
        historicalEmployeeData.forEach(record => {
            const key = `${record.organizationId}-${record.id}`;
            const existing = latestEmployeeMap.get(key);
            if (!existing || (record.snapshotDate && (!existing.snapshotDate || new Date(record.snapshotDate) >= new Date(existing.snapshotDate)))) {
                latestEmployeeMap.set(key, record);
            }
        });
        return Array.from(latestEmployeeMap.values());
    }, [historicalEmployeeData]);

    const platformMetrics = useMemo(() => {
        const totalMRR = allOrganizations.reduce((acc, org) => {
            const orgPackage = APP_PACKAGES[org.package];
            if (org.status === 'Active' && orgPackage.pricePerEmployee) {
                const activeEmployeesInOrg = latestEmployees.filter(e => e.organizationId === org.id && !e.terminationDate).length;
                acc += activeEmployeesInOrg * orgPackage.pricePerEmployee;
            }
            return acc;
        }, 0);

        const orgGrowthData = (() => {
            const months: { name: string, new: number, churn: number }[] = [];
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                months.push({ name: d.toLocaleString('default', { month: 'short', year: '2-digit' }), new: 0, churn: 0 });
            }

            allOrganizations.forEach(org => {
                const startDate = new Date(org.subscriptionStartDate);
                const startMonth = startDate.toLocaleString('default', { month: 'short', year: '2-digit' });
                const monthData = months.find(m => m.name === startMonth);
                if (monthData) monthData.new++;

                if (org.status === 'Inactive') {
                    const endDate = new Date(org.subscriptionEndDate);
                    const endMonth = endDate.toLocaleString('default', { month: 'short', year: '2-digit' });
                    const churnMonthData = months.find(m => m.name === endMonth);
                    if (churnMonthData) churnMonthData.churn++;
                }
            });
            return {
                labels: months.map(m => m.name),
                datasets: [
                    { label: 'New Orgs', data: months.map(m => m.new), backgroundColor: '#22c55e' },
                    { label: 'Churned Orgs', data: months.map(m => m.churn), backgroundColor: '#ef4444' }
                ]
            };
        })();

        return {
            totalOrgs: allOrganizations.length,
            activeOrgs: allOrganizations.filter(o => o.status === 'Active').length,
            totalUsers: allUsers.length,
            totalEmployees:globalHeadcount, //latestEmployees.filter(e => !e.terminationDate).length,
            userRoleDistribution: allUsers.reduce((acc, user) => { acc[user.role] = (acc[user.role] || 0) + 1; return acc; }, {} as Record<string, number>),
            totalMRR,
            orgGrowthData,
        };
    }, [allOrganizations, allUsers, latestEmployees]);

    const clientData = useMemo(() => {
        const today = new Date();
        return allOrganizations.map(org => {
            const orgEmployees = latestEmployees.filter(e => e.organizationId === org.id && !e.terminationDate);
            const limit = APP_PACKAGES[org.package].headcountLimit;
            const usage = isFinite(limit) && limit > 0 ? (orgEmployees.length / limit) * 100 : 0;
            const endDate = new Date(org.subscriptionEndDate);
            const daysLeft = org.status === 'Active' ? Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : -1;
            const orgHistoricalData = historicalEmployeeData.filter(e => e.organizationId === org.id);
            const latestSnapshot = orgHistoricalData.reduce((latest, current) => !latest || (current.snapshotDate && new Date(current.snapshotDate) > new Date(latest)) ? current.snapshotDate : latest, null as string | null);

            return { ...org, employeeCount: orgEmployees.length, limit, usage, daysLeft, lastUpdate: latestSnapshot };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [allOrganizations, latestEmployees, historicalEmployeeData]);

    const benchmarkData = useMemo(() => {
        const activeOrgsData = allOrganizations
            .filter(org => org.status === 'Active')
            .map(org => {
                const orgAllEmployees = historicalEmployeeData.filter(e => e.organizationId === org.id);
                const orgActiveEmployees = latestEmployees.filter(e => e.organizationId === org.id && !e.terminationDate);
                if (orgActiveEmployees.length < 10) return null;
                return { name: org.name, turnoverRate: hrCalculations.getAnnualTurnoverRateFromData(orgAllEmployees, '12m'), engagementScore: hrCalculations.calculateAverageEngagement(orgActiveEmployees) };
            })
            .filter((d): d is { name: string; turnoverRate: number; engagementScore: number } => d !== null);
        
        const avgTurnover = activeOrgsData.reduce((acc, d) => acc + d.turnoverRate, 0) / (activeOrgsData.length || 1);
        const avgEngagement = activeOrgsData.reduce((acc, d) => acc + d.engagementScore, 0) / (activeOrgsData.length || 1);

        return { data: activeOrgsData, avgTurnover, avgEngagement };
    }, [allOrganizations, historicalEmployeeData, latestEmployees]);

    const dataQualityScores = useMemo(() => {
        return allOrganizations.map(org => {
            const orgEmployees = latestEmployees.filter(e => e.organizationId === org.id && !e.terminationDate);
            if (orgEmployees.length === 0) return { orgName: org.name, skills: 0, satisfaction: 0, potential: 0, manager: 0, overallScore: 0 };
            
            const skills = (orgEmployees.filter(e => e.skills && e.skills.length > 0).length / orgEmployees.length) * 100;
            const satisfaction = (orgEmployees.filter(e => e.compensationSatisfaction && e.managementSatisfaction).length / orgEmployees.length) * 100;
            const potential = (orgEmployees.filter(e => e.potentialRating).length / orgEmployees.length) * 100;
            const manager = (orgEmployees.filter(e => e.managerId).length / orgEmployees.length) * 100;
            const overallScore = (skills + satisfaction + potential + manager) / 4;
            
            return { orgName: org.name, skills, satisfaction, potential, manager, overallScore };
        }).sort((a, b) => b.overallScore - a.overallScore);
    }, [allOrganizations, latestEmployees]);

    const { cardColor, textPrimaryColor, borderColor, gridColor } = useMemo(() => ({
        cardColor: mode === 'dark' ? '#1a1a1a' : '#ffffff',
        textPrimaryColor: mode === 'dark' ? '#f8fafc' : '#1e293b',
        borderColor: mode === 'dark' ? '#27272a' : '#e2e8f0',
        gridColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.5)',
    }), [mode]);

    const baseChartOptions = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: textPrimaryColor } },
            tooltip: { backgroundColor: cardColor, titleColor: textPrimaryColor, bodyColor: textPrimaryColor, borderColor, borderWidth: 1 },
            datalabels: { color: '#fff', font: { weight: 'bold' as const } }
        },
        scales: {
            x: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } },
            y: { ticks: { color: textPrimaryColor }, grid: { color: gridColor }, border: { color: borderColor } }
        }
    }), [textPrimaryColor, cardColor, borderColor, gridColor]);

    const getQualityColor = (score: number) => score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-900/50 rounded-lg"><Server className="h-8 w-8 text-primary-400"/></div>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-text-primary">Platform Reports</h2>
                    <p className="text-text-secondary mt-1">Global insights across all organizations.</p>
                </div>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary'}`}>
                            <tab.icon className="mr-2 h-5 w-5"/>{tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            {activeTab === 'health' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <MetricCard title="Active Orgs" value={platformMetrics.activeOrgs.toString()} icon={<Building2 />} />
                        <MetricCard title="Total Users" value={platformMetrics.totalUsers.toString()} icon={<Users />} />
                        <MetricCard title="Total Employees" value={platformMetrics.totalEmployees.toLocaleString()} icon={<Users />} />
                        <MetricCard title="Total MRR" value={`$${platformMetrics.totalMRR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<DollarSign />} />
                        <MetricCard title="Total Orgs" value={platformMetrics.totalOrgs.toString()} icon={<Building2 />} />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ChartCard title="User Role Distribution" description="Breakdown of all users by their assigned role.">
                            <div className="h-80"><Pie data={{ labels: Object.keys(platformMetrics.userRoleDistribution), datasets: [{ data: Object.values(platformMetrics.userRoleDistribution), backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'], borderColor: cardColor }]}} options={{ ...baseChartOptions, plugins: { ...baseChartOptions.plugins, legend: { display: true, position: 'right' }, datalabels: { ...baseChartOptions.plugins.datalabels, formatter: (val: any) => val > 0 ? val : '' } } }} /></div>
                        </ChartCard>
                         <ChartCard title="Organization Growth (Last 12 Months)" description="New client acquisition versus churn.">
                            <div className="h-80"><Bar data={platformMetrics.orgGrowthData} options={{...baseChartOptions, scales: {...baseChartOptions.scales, x: {stacked: true}, y: {stacked: true}}}} /></div>
                        </ChartCard>
                    </div>
                </div>
            )}

            {activeTab === 'management' && (
                <ChartCard title="Client Subscription & Health" description="Overview of all client organizations, their subscription status, and data freshness.">
                    <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-text-secondary uppercase bg-card"><tr><th className="px-4 py-3">Organization</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Package</th><th className="px-4 py-3 text-center">Expires In</th><th className="px-4 py-3 text-center">Headcount</th><th className="px-4 py-3 text-center">Usage</th><th className="px-4 py-3 text-center">Last Data Update</th></tr></thead><tbody>{clientData.map(org => (<tr key={org.id} className="border-b border-border last:border-b-0 hover:bg-border/50"><td className="px-4 py-3"><button onClick={() => setActiveOrganizationId(org.id)} className="font-semibold text-primary-400 hover:underline">{org.name}</button></td><td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${org.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{org.status}</span></td><td className="px-4 py-3 text-text-primary">{org.package}</td><td className={`px-4 py-3 text-center font-semibold ${org.daysLeft < 0 ? 'text-text-secondary' : org.daysLeft < 30 ? 'text-red-400' : 'text-text-primary'}`}>{org.daysLeft < 0 ? 'Expired' : `${org.daysLeft} days`}</td><td className="px-4 py-3 text-center text-text-primary">{org.employeeCount} / {isFinite(org.limit) ? org.limit : '∞'}</td><td className="px-4 py-3 text-center">{isFinite(org.limit) && <div className="w-full bg-border rounded-full h-2.5"><div className={`${org.usage > 90 ? 'bg-red-500' : 'bg-primary-600'} h-2.5 rounded-full`} style={{width: `${Math.min(org.usage, 100)}%`}}></div></div>}</td><td className="px-4 py-3 text-center text-text-primary">{org.lastUpdate || 'N/A'}</td></tr>))}</tbody></table></div>
                </ChartCard>
            )}

            {activeTab === 'benchmarking' && (
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ChartCard title="Avg. Annual Turnover Rate (Anonymized)" description={`Comparison across active organizations. Platform Average: ${benchmarkData.avgTurnover.toFixed(2)}%`}>
                        <div className="h-96"><Bar data={{ labels: benchmarkData.data.sort((a,b) => b.turnoverRate - a.turnoverRate).map(d => d.name), datasets: [{ data: benchmarkData.data.sort((a,b) => b.turnoverRate - a.turnoverRate).map(d => d.turnoverRate), backgroundColor: '#ef4444' }]}} options={{ ...baseChartOptions, indexAxis: 'y', scales: { ...baseChartOptions.scales, x: { ticks: { ...baseChartOptions.scales.x.ticks, callback: (v: any) => `${v}%` }}} }} /></div>
                    </ChartCard>
                    <ChartCard title="Avg. Engagement Score (Anonymized)" description={`Comparison across active organizations. Platform Average: ${benchmarkData.avgEngagement.toFixed(2)}`}>
                        <div className="h-96"><Bar data={{ labels: benchmarkData.data.sort((a,b) => b.engagementScore - a.engagementScore).map(d => d.name), datasets: [{ data: benchmarkData.data.sort((a,b) => b.engagementScore - a.engagementScore).map(d => d.engagementScore), backgroundColor: '#22c55e' }]}} options={{ ...baseChartOptions, indexAxis: 'y' }} /></div>
                    </ChartCard>
                 </div>
            )}
            
            {activeTab === 'features' && (
                <ChartCard title="Feature Adoption by Organization" description="Which organizations have access to premium features based on their package.">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary uppercase bg-card"><tr><th className="px-4 py-3">Organization</th>{Object.values(APP_PACKAGES).flatMap(pkg => Object.keys(pkg.features)).filter((v,i,a)=>a.indexOf(v)===i).map(f => <th key={f} className="px-4 py-3 text-center">{f.replace('has','')}</th>)}</tr></thead>
                            <tbody>{allOrganizations.map(org => (<tr key={org.id} className="border-b border-border last:border-b-0">
                                <td className="px-4 py-3 font-semibold text-text-primary">{org.name}</td>
                                {Object.values(APP_PACKAGES).flatMap(pkg => Object.keys(pkg.features)).filter((v,i,a)=>a.indexOf(v)===i).map(f => {
                                    const hasFeature = APP_PACKAGES[org.package].features[f as keyof typeof APP_PACKAGES.Pro.features];
                                    return <td key={f} className="px-4 py-3 text-center">{hasFeature ? <Check className="h-5 w-5 text-green-400 mx-auto" /> : <X className="h-5 w-5 text-text-secondary mx-auto" />}</td>
                                })}
                            </tr>))}</tbody>
                        </table>
                    </div>
                </ChartCard>
            )}

            {activeTab === 'data-quality' && (
                <ChartCard title="Client Data Quality Score" description="Measures the completeness of optional (but important) data fields for each active organization.">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-text-secondary uppercase bg-card"><tr><th className="px-4 py-3">Organization</th><th className="px-4 py-3 text-center">Overall Score</th><th className="px-4 py-3 text-center">Skills Data</th><th className="px-4 py-3 text-center">Satisfaction Scores</th><th className="px-4 py-3 text-center">Potential Ratings</th><th className="px-4 py-3 text-center">Manager IDs</th></tr></thead>
                            <tbody>{dataQualityScores.map((data, index) => (<tr key={index} className="border-b border-border last:border-b-0">
                                <td className="px-4 py-3 font-semibold text-text-primary">{data.orgName}</td>
                                <td className={`px-4 py-3 text-center font-bold ${getQualityColor(data.overallScore)}`}>{data.overallScore.toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${getQualityColor(data.skills)}`}>{data.skills.toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${getQualityColor(data.satisfaction)}`}>{data.satisfaction.toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${getQualityColor(data.potential)}`}>{data.potential.toFixed(1)}%</td>
                                <td className={`px-4 py-3 text-center ${getQualityColor(data.manager)}`}>{data.manager.toFixed(1)}%</td>
                            </tr>))}</tbody>
                        </table>
                    </div>
                </ChartCard>
            )}
        </div>
    );
};

export default SuperAdminReportsPage;