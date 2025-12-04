
import React, { useState, useRef, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import type { ScheduledReport } from '../../types';
import { PlusCircle, Trash2, ChevronDown } from 'lucide-react';

const REPORT_TYPES = [
    'Diversity & Inclusion Report',
    'Performance Report',
    'Recruitment Report',
    'Attendance Report',
    'Turnover Report',
    'Retention Report'
];

const REPORT_SUBTYPES_MAP: Record<string, string[]> = {
    'Diversity & Inclusion Report': [
        'Gender Diversity',
        'Headcount by Department',
        'Headcount Heatmap'
    ],
    'Performance Report': [
        'Performance Distribution',
        'Pay for Performance Analysis',
        'Performance Over Time (Simulated)',
        'Performance Calibration',
        '9-Box Grid',
        'Team/Manager Performance Distribution',
        'High-Performer Attrition Deep-Dive'
    ],
    'Recruitment Report': [
        'Recruitment Funnel',
        'Open Positions by Department',
        'Open Positions by Designation',
        'Oldest Open Positions',
        'Recently Closed Positions',
        'Positions on Hold'
    ],
    'Attendance Report': [
        'Absence Trend',
        'Absence Breakdown',
        'Absences by Department',
        'Top 10 Employees by Absences'
    ],
    'Turnover Report': [
        'Turnover Trend',
        'Turnover by Reason',
        'Turnover by Department',
        'Top 10 Job Titles by Turnover',
        'Turnover by Location',
        'Turnover by Tenure'
    ],
    'Retention Report': [
        'High-Performer vs. Overall Retention',
        'Retention Rate by Department',
        'Manager Retention Hotspots',
        'Recent Regrettable Departures'
    ]
};

const ReportScheduler: React.FC = () => {
    const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
        { id: '1', reportName: 'Diversity & Inclusion Report', recipients: 'hr-team@example.com, exec-team@example.com', frequency: 'Monthly', nextRun: '2024-08-01', subTypes: [] },
        { id: '2', reportName: 'Turnover Report', recipients: 'hr-analysts@example.com', frequency: 'Weekly', nextRun: '2024-07-22', subTypes: ['Turnover by Department'] },
    ]);
    
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [newReport, setNewReport] = useState({
        reportName: REPORT_TYPES[0],
        recipients: 'managers@example.com',
        frequency: 'Weekly' as 'Daily' | 'Weekly' | 'Monthly',
        subTypes: [] as string[],
    });

    const [isSubtypeDropdownOpen, setIsSubtypeDropdownOpen] = useState(false);
    const subtypeDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (subtypeDropdownRef.current && !subtypeDropdownRef.current.contains(event.target as Node)) {
                setIsSubtypeDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'reportName') {
            setNewReport(prev => ({ ...prev, reportName: value, subTypes: [] }));
        } else {
            setNewReport(prev => ({ ...prev, [name]: value as any }));
        }
    };

    const handleSubtypeChange = (subtype: string) => {
        setNewReport(prev => {
            const newSubtypes = prev.subTypes.includes(subtype)
                ? prev.subTypes.filter(s => s !== subtype)
                : [...prev.subTypes, subtype];
            return { ...prev, subTypes: newSubtypes };
        });
    };
    
    const currentSubtypes = REPORT_SUBTYPES_MAP[newReport.reportName] || [];
    const isAllSelected = currentSubtypes.length > 0 && newReport.subTypes.length === currentSubtypes.length;

    const handleSelectAllSubtypes = () => {
        setNewReport(prev => ({
            ...prev,
            subTypes: isAllSelected ? [] : [...currentSubtypes]
        }));
    };

    const handleAddReport = (e: React.FormEvent) => {
        e.preventDefault();
        const nextRun = new Date();
        if(newReport.frequency === 'Daily') nextRun.setDate(nextRun.getDate() + 1);
        if(newReport.frequency === 'Weekly') nextRun.setDate(nextRun.getDate() + 7);
        if(newReport.frequency === 'Monthly') nextRun.setMonth(nextRun.getMonth() + 1);

        const scheduled: ScheduledReport = {
            id: Date.now().toString(),
            ...newReport,
            nextRun: nextRun.toISOString().split('T')[0],
        };
        setScheduledReports(prev => [...prev, scheduled]);
        setIsFormVisible(false);
        setNewReport({
            reportName: REPORT_TYPES[0],
            recipients: 'managers@example.com',
            frequency: 'Weekly',
            subTypes: [],
        });
    };
    
    const handleRemoveReport = (id: string) => {
        setScheduledReports(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle>Report Scheduler</CardTitle>
                        <CardDescription>Automate and schedule reports for stakeholders.</CardDescription>
                    </div>
                    <Button onClick={() => setIsFormVisible(!isFormVisible)} className="gap-2">
                        <PlusCircle className="h-4 w-4"/>
                        {isFormVisible ? 'Cancel' : 'New Scheduled Report'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isFormVisible && (
                        <form onSubmit={handleAddReport} className="p-4 mb-6 bg-card border border-border rounded-lg space-y-4">
                            <h3 className="font-semibold text-lg text-text-primary">New Report Schedule</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="reportName" className="block text-sm font-medium text-text-secondary mb-1">Report Type</label>
                                    <select id="reportName" name="reportName" value={newReport.reportName} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                        {REPORT_TYPES.map(report => (
                                            <option key={report} value={report}>{report}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative" ref={subtypeDropdownRef}>
                                    <label htmlFor="subTypes" className="block text-sm font-medium text-text-secondary mb-1">Sub-type (Optional)</label>
                                    <button type="button" onClick={() => setIsSubtypeDropdownOpen(!isSubtypeDropdownOpen)} disabled={currentSubtypes.length === 0} className="w-full flex justify-between items-center bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50">
                                        <span className="truncate pr-2">
                                            {newReport.subTypes.length === 0 ? 'Select content...' : `${newReport.subTypes.length} selected`}
                                        </span>
                                        <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${isSubtypeDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isSubtypeDropdownOpen && currentSubtypes.length > 0 && (
                                        <div className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                            <div className="p-2 border-b border-border">
                                                <label className="flex items-center gap-2 px-2 py-1 text-sm text-text-primary hover:bg-border rounded-md cursor-pointer">
                                                    <input type="checkbox" checked={isAllSelected} onChange={handleSelectAllSubtypes} className="form-checkbox h-4 w-4 bg-background border-border text-primary-600 focus:ring-primary-500" />
                                                    Select All
                                                </label>
                                            </div>
                                            <div className="p-2 space-y-1">
                                                {currentSubtypes.map(subtype => (
                                                    <label key={subtype} className="flex items-center gap-2 px-2 py-1 text-sm text-text-primary hover:bg-border rounded-md cursor-pointer">
                                                        <input type="checkbox" checked={newReport.subTypes.includes(subtype)} onChange={() => handleSubtypeChange(subtype)} className="form-checkbox h-4 w-4 bg-background border-border text-primary-600 focus:ring-primary-500" />
                                                        {subtype}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Input label="Recipients (comma-separated emails)" name="recipients" value={newReport.recipients} onChange={handleInputChange} placeholder="e.g., ceo@example.com"/>
                            <div>
                                <label htmlFor="frequency" className="block text-sm font-medium text-text-secondary mb-1">Frequency</label>
                                <select id="frequency" name="frequency" value={newReport.frequency} onChange={handleInputChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                    <option>Daily</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                            <Button type="submit">Schedule Report</Button>
                        </form>
                    )}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[700px]">
                            <thead className="text-xs text-text-secondary uppercase bg-card">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Report Name</th>
                                    <th scope="col" className="px-6 py-3">Content</th>
                                    <th scope="col" className="px-6 py-3">Recipients</th>
                                    <th scope="col" className="px-6 py-3">Frequency</th>
                                    <th scope="col" className="px-6 py-3">Next Run</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scheduledReports.map(report => {
                                    const allSubtypesCount = REPORT_SUBTYPES_MAP[report.reportName]?.length || 0;
                                    const selectedCount = report.subTypes?.length || 0;
                                    let contentText = 'Full Report';
                                    if (selectedCount > 0) {
                                        if (allSubtypesCount > 0 && selectedCount === allSubtypesCount) {
                                            contentText = 'All Sub-types';
                                        } else {
                                            contentText = `${selectedCount} Sub-type(s)`;
                                        }
                                    }

                                    return (
                                        <tr key={report.id} className="border-b border-border hover:bg-card">
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{report.reportName}</td>
                                            <td className="px-6 py-4 text-text-secondary" title={report.subTypes?.join(', ')}>{contentText}</td>
                                            <td className="px-6 py-4 text-text-secondary truncate max-w-xs">{report.recipients}</td>
                                            <td className="px-6 py-4 text-text-secondary">{report.frequency}</td>
                                            <td className="px-6 py-4 text-text-secondary">{report.nextRun}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveReport(report.id)}><Trash2 className="h-4 w-4 text-red-400"/></Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                     {scheduledReports.length === 0 && <p className="text-center text-text-secondary py-8">No reports scheduled.</p>}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportScheduler;
