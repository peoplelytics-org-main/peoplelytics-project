import React, { useState, useMemo, useEffect } from 'react';
import type { Employee, Skill, SkillLevel, JobPosition, RecruitmentFunnel } from '../types';
import { useData } from '../contexts/DataContext';
import { 
    generateEmployeeData,
    generateAttendanceData,
    generateJobPositions,
    generateRecruitmentFunnelData 
} from '../constants';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import DataUpload from '../components/DataUpload';
import AttendanceUpload from '../components/AttendanceUpload';
import RecruitmentDataUpload from '../components/RecruitmentDataUpload';
import DataExport from '../components/DataExport';
import IntegrationCard from '../components/integrations/IntegrationCard';
import ExitInterviewAnalyzer from '../components/analysis/ExitInterviewAnalyzer';
import { useAuth } from '../contexts/AuthContext';
import { PlusCircle, TestTube2, AlertCircle, FileText, UploadCloud, FileDown, Zap, ClipboardCheck, ChevronDown, FileCog, Download, Edit } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useNotifications } from '../contexts/NotificationContext';

type ActiveTab = 'import' | 'analysis' | 'export' | 'integrations' | 'convert';

const Accordion: React.FC<{ title: string; children: React.ReactNode; startOpen?: boolean }> = ({ title, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);
    return (
        <div className="border border-border rounded-lg bg-background">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 hover:bg-border/50 transition-colors">
                <h4 className="font-semibold text-text-primary text-left">{title}</h4>
                <ChevronDown className={`h-5 w-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 border-t border-border">{children}</div>}
        </div>
    );
};

const ExcelToCsvConverter = () => {
    const { currentOrgHeadcount, currentOrgHeadcountLimit } = useData();
    const [excelFile, setExcelFile] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedCsv, setGeneratedCsv] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExcelFile(null);
            setFileName(file.name);
            setStatus('idle');
            setError(null);
            setGeneratedCsv(null);
            try {
                const buffer = await file.arrayBuffer();
                setExcelFile({ name: file.name, buffer });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Could not read file.';
                setError(`Error reading file: ${message}`);
                setStatus('error');
            }
        }
    };
    
    const smartParseDate = (dateInput: any): string | null => {
        if (dateInput === null || dateInput === undefined || dateInput === '') return null;

        if (dateInput instanceof Date) {
            if (isNaN(dateInput.getTime())) return null;
            return `${dateInput.getFullYear()}-${String(dateInput.getMonth() + 1).padStart(2, '0')}-${String(dateInput.getDate()).padStart(2, '0')}`;
        }

        if (typeof dateInput === 'string') {
            const trimmed = dateInput.trim();
            let date: Date | null = null;
            let parts: string[];

            if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(trimmed)) {
                parts = trimmed.split(/[-\/]/);
                date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            else if (/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2}|\d{4})$/.test(trimmed)) {
                parts = trimmed.split(/[-\/]/);
                const d = parseInt(parts[0], 10);
                const m = parseInt(parts[1], 10) - 1;
                let y = parseInt(parts[2], 10);
                if (y < 100) y += (y > 50 ? 1900 : 2000);
                date = new Date(y, m, d);
            }
            else {
                const parsed = Date.parse(trimmed);
                if (!isNaN(parsed)) date = new Date(parsed);
            }
            
            if (date && !isNaN(date.getTime())) {
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            }
        }
        
        if (typeof dateInput === 'number' && dateInput > 1) {
            const d = XLSX.SSF.parse_date_code(dateInput);
            if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        }

        return null;
    };

    const handleConvert = async () => {
        if (!excelFile) return;

        setStatus('processing');
        setError(null);
        setGeneratedCsv(null);

        try {
            const data = excelFile.buffer;
            const workbook = XLSX.read(data, { cellDates: true });

            const employeeMap = new Map<string, any>();
            const skillsMap = new Map<string, { name: string; level: string }[]>();

            const employeeKeyMap: Record<string, keyof Employee | 'skills'> = {
                'id': 'id', 'employeeid': 'id', 'empid': 'id',
                'name': 'name', 'fullname': 'name', 'employeename': 'name',
                'gender': 'gender',
                'jobtitle': 'jobTitle', 'position': 'jobTitle', 'role': 'jobTitle',
                'department': 'department', 'dept': 'department',
                'location': 'location', 'worklocation': 'location', 'office': 'location',
                'managerid': 'managerId', 'manager': 'managerId', 'reportsto': 'managerId',
                'hiredate': 'hireDate', 'startdate': 'hireDate',
                'terminationdate': 'terminationDate', 'exitdate': 'terminationDate', 'enddate': 'terminationDate',
                'terminationreason': 'terminationReason', 'exitreason': 'terminationReason',
                'successionstatus': 'successionStatus', 'succession': 'successionStatus',
                'salary': 'salary', 'annualsalary': 'salary', 'basesalary': 'salary',
                'bonus': 'bonus', 'annualbonus': 'bonus',
                'lastraiseamount': 'lastRaiseAmount', 'lastraise': 'lastRaiseAmount',
                'performancerating': 'performanceRating', 'performance': 'performanceRating', 'rating': 'performanceRating',
                'potentialrating': 'potentialRating', 'potential': 'potentialRating',
                'engagementscore': 'engagementScore', 'engagement': 'engagementScore',
                'weeklyhours': 'weeklyHours', 'avgweeklyhours': 'weeklyHours', 'hours': 'weeklyHours',
                'compensationsatisfaction': 'compensationSatisfaction', 'paysatisfaction': 'compensationSatisfaction',
                'benefitssatisfaction': 'benefitsSatisfaction',
                'managementsatisfaction': 'managementSatisfaction', 'managersatisfaction': 'managementSatisfaction',
                'trainingsatisfaction': 'trainingSatisfaction',
                'skills': 'skills', 'skillset': 'skills',
                'trainingcompleted': 'trainingCompleted', 'trainingscompleted': 'trainingCompleted',
                'trainingtotal': 'trainingTotal', 'totaltrainings': 'trainingTotal',
                'hasgrievance': 'hasGrievance', 'grievance': 'hasGrievance',
            };

            const skillKeyMap: Record<string, string> = {
                'employeeid': 'employeeId', 'id': 'employeeId',
                'skillname': 'skillName', 'skill': 'skillName',
                'skilllevel': 'skillLevel', 'level': 'skillLevel', 'proficiency': 'skillLevel',
            };

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });
                
                if (json.length === 0) continue;

                const headers = Object.keys(json[0]).map(h => h.toLowerCase().trim().replace(/ /g, '').replace(/_/g, ''));
                const isSkillSheet = (headers.includes('skillname') || headers.includes('skill')) && (headers.includes('skilllevel') || headers.includes('level') || headers.includes('proficiency'));

                if (isSkillSheet) {
                    for (const row of json) {
                        const normalizedSkillRow: any = {};
                        for (const key in row) {
                            const normalizedKey = key.toLowerCase().trim().replace(/ /g, '').replace(/_/g, '');
                            if (skillKeyMap[normalizedKey]) {
                                normalizedSkillRow[skillKeyMap[normalizedKey]] = row[key];
                            }
                        }
                        
                        const { employeeId, skillName, skillLevel } = normalizedSkillRow;
                        if (employeeId && skillName && skillLevel) {
                            const currentSkills = skillsMap.get(String(employeeId)) || [];
                            skillsMap.set(String(employeeId), [...currentSkills, { name: String(skillName), level: String(skillLevel) }]);
                        }
                    }
                } else {
                    for (const row of json) {
                        const normalizedRow: any = {};
                        let rowId: string | null = null;
                        
                        for (const key in row) {
                            const normalizedKey = String(key).toLowerCase().trim().replace(/ /g, '').replace(/_/g, '');
                            if (employeeKeyMap[normalizedKey]) {
                                const newKey = employeeKeyMap[normalizedKey];
                                let value = row[key];
                                
                                if (newKey === 'hireDate' || newKey === 'terminationDate') {
                                    value = smartParseDate(value);
                                }
                                
                                if (newKey === 'hasGrievance') {
                                    value = String(value).trim().toLowerCase() === 'true' || String(value).trim() === '1';
                                }

                                if (value !== null && value !== undefined) {
                                    normalizedRow[newKey] = value;
                                }

                                if (newKey === 'id') {
                                    rowId = String(row[key]);
                                }
                            }
                        }
                        
                        if (rowId) {
                            const existingData = employeeMap.get(rowId) || {};
                            employeeMap.set(rowId, { ...existingData, ...normalizedRow });
                        }
                    }
                }
            }

            skillsMap.forEach((skills, employeeId) => {
                const employeeData = employeeMap.get(employeeId);
                if (employeeData) {
                    const skillsString = skills.map(skill => `${skill.name}:${skill.level}`).join(',');
                    employeeMap.set(employeeId, { ...employeeData, skills: skillsString });
                }
            });
            
            if (employeeMap.size === 0) {
                throw new Error("Could not find any employees with an 'ID' column. Please ensure at least one sheet has a unique identifier column named 'ID', 'Employee ID', etc.");
            }
            
             // Check against headcount limit
            if (currentOrgHeadcount + employeeMap.size > currentOrgHeadcountLimit) {
                throw new Error(`Headcount limit exceeded. Your plan allows ${currentOrgHeadcountLimit} employees. You have ${currentOrgHeadcount}, and this Excel file contains ${employeeMap.size} records. Please upgrade or reduce the file size.`);
            }
            
            const headers = [ 'id', 'name', 'gender', 'jobTitle', 'department', 'location', 'managerId', 'hireDate', 'terminationDate', 'terminationReason', 'successionStatus', 'salary', 'bonus', 'lastRaiseAmount', 'performanceRating', 'potentialRating', 'engagementScore', 'weeklyHours', 'compensationSatisfaction', 'benefitsSatisfaction', 'managementSatisfaction', 'trainingSatisfaction', 'skills', 'trainingCompleted', 'trainingTotal', 'hasGrievance' ];
            
            const dataForCsv = Array.from(employeeMap.values()).map(emp => {
                const csvRow: any = {};
                for (const header of headers) csvRow[header] = emp[header] ?? '';
                return csvRow;
            });
            
            const newWorksheet = XLSX.utils.json_to_sheet(dataForCsv, { header: headers });
            const csvOutput = XLSX.utils.sheet_to_csv(newWorksheet);
            
            setGeneratedCsv(csvOutput);
            setStatus('success');

        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during conversion.';
            setError(errorMessage);
            setStatus('error');
        }
    };
    
    const handleDownload = () => {
        if (!generatedCsv) return;
        const blob = new Blob([generatedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted_employee_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>1 - Employee Data</CardTitle>
                <CardDescription>Upload an Excel file. The tool will consolidate data from all sheets and generate a single CSV formatted for this application.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="excel-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload Excel File</label>
                        <div className="flex items-center gap-2">
                             <Button as="label" htmlFor="excel-upload" variant="secondary" className="cursor-pointer">Select File</Button>
                             <input id="excel-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileChange} />
                             {fileName && <span className="text-sm text-text-secondary">{fileName}</span>}
                        </div>
                    </div>
                    
                    <Button onClick={handleConvert} disabled={!excelFile || status === 'processing'} isLoading={status === 'processing'}>
                        Fetch Employee Data
                    </Button>
                    
                    {status === 'error' && error && (
                        <div className="p-3 bg-red-900/50 text-red-300 border border-red-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    
                    {status === 'success' && generatedCsv && (
                        <div className="p-3 bg-green-900/50 text-green-300 border border-green-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Successful!</p>
                            <p>Your file is ready for download.</p>
                             <Button onClick={handleDownload} size="sm" className="mt-2 gap-2"><Download className="h-4 w-4"/> Download CSV</Button>
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
};

const AttendanceExcelToCsvConverter = () => {
    const [excelFile, setExcelFile] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedCsv, setGeneratedCsv] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExcelFile(null);
            setFileName(file.name);
            setStatus('idle');
            setError(null);
            setGeneratedCsv(null);
            try {
                const buffer = await file.arrayBuffer();
                setExcelFile({ name: file.name, buffer });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Could not read file.';
                setError(`Error reading file: ${message}`);
                setStatus('error');
            }
        }
    };

    const handleConvert = async () => {
        if (!excelFile) return;
        setStatus('processing');
        try {
            const data = excelFile.buffer;
            const workbook = XLSX.read(data, { cellDates: true });
            let allRecords: any[] = [];

            const attendanceKeyMap: Record<string, string> = {
                'employeeid': 'employeeId', 'empid': 'employeeId', 'id': 'employeeId',
                'date': 'date', 'attendancedate': 'date',
                'status': 'status', 'attendancestatus': 'status', 'type': 'status'
            };

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

                for (const row of json) {
                    const normalizedRow: any = {};
                    for (const key in row) {
                        const normalizedKey = String(key).toLowerCase().trim().replace(/ /g, '').replace(/_/g, '');
                        if (attendanceKeyMap[normalizedKey]) {
                            const newKey = attendanceKeyMap[normalizedKey];
                            let value = row[key];
                            if (value instanceof Date) {
                                value = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
                            }
                            if (value !== null) {
                                normalizedRow[newKey] = value;
                            }
                        }
                    }
                    if (normalizedRow.employeeId && normalizedRow.date && normalizedRow.status) {
                        allRecords.push(normalizedRow);
                    }
                }
            }

            if (allRecords.length === 0) {
                throw new Error("No valid attendance records found. Ensure sheets have 'employeeId', 'date', and 'status' columns.");
            }

            const headers = ['employeeId', 'date', 'status'];
            const ws = XLSX.utils.json_to_sheet(allRecords, { header: headers });
            const csv = XLSX.utils.sheet_to_csv(ws);
            setGeneratedCsv(csv);
            setStatus('success');

        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setStatus('error');
        }
    };
    
    const handleDownload = () => {
        if (!generatedCsv) return;
        const blob = new Blob([generatedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted_attendance_data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>2 - Attendance Data</CardTitle>
                <CardDescription>Upload an Excel file with attendance records to format it into the required CSV template.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="attendance-excel-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload Excel File</label>
                        <div className="flex items-center gap-2">
                            <Button as="label" htmlFor="attendance-excel-upload" variant="secondary" className="cursor-pointer">Select File</Button>
                            <input id="attendance-excel-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileChange} />
                            {fileName && <span className="text-sm text-text-secondary">{fileName}</span>}
                        </div>
                    </div>
                    <Button onClick={handleConvert} disabled={!excelFile || status === 'processing'} isLoading={status === 'processing'}>
                        Fetch Attendance Data
                    </Button>
                    {status === 'error' && error && (
                        <div className="p-3 bg-red-900/50 text-red-300 border border-red-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {status === 'success' && generatedCsv && (
                        <div className="p-3 bg-green-900/50 text-green-300 border border-green-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Successful!</p>
                            <p>Your attendance data is ready for download.</p>
                            <Button onClick={handleDownload} size="sm" className="mt-2 gap-2"><Download className="h-4 w-4"/> Download CSV</Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const RecruitmentExcelToCsvConverter = () => {
    const [excelFile, setExcelFile] = useState<{ name: string; buffer: ArrayBuffer } | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [generatedCsv, setGeneratedCsv] = useState<string | null>(null);
    const [fileName, setFileName] = useState('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExcelFile(null);
            setFileName(file.name);
            setStatus('idle');
            setError(null);
            setGeneratedCsv(null);
            try {
                const buffer = await file.arrayBuffer();
                setExcelFile({ name: file.name, buffer });
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Could not read file.';
                setError(`Error reading file: ${message}`);
                setStatus('error');
            }
        }
    };
    
    const smartParseDate = (dateInput: any): string | null => {
        if (dateInput === null || dateInput === undefined || dateInput === '') return null;
        if (dateInput instanceof Date) {
            if (isNaN(dateInput.getTime())) return null;
            return `${dateInput.getFullYear()}-${String(dateInput.getMonth() + 1).padStart(2, '0')}-${String(dateInput.getDate()).padStart(2, '0')}`;
        }
        if (typeof dateInput === 'string') {
            const parsed = Date.parse(dateInput.trim());
            if (!isNaN(parsed)) {
                const d = new Date(parsed);
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
        }
        if (typeof dateInput === 'number' && dateInput > 1) {
            const d = XLSX.SSF.parse_date_code(dateInput);
            if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
        }
        return null;
    };

    const handleConvert = async () => {
        if (!excelFile) return;
        setStatus('processing');
        setError(null);
        setGeneratedCsv(null);

        try {
            const data = excelFile.buffer;
            const workbook = XLSX.read(data, { cellDates: true });

            const positionMap = new Map<string, any>();
            const funnelMap = new Map<string, any>();

            const positionKeyMap: Record<string, string> = {
                'id': 'id', 'positionid': 'id', 'reqid': 'id', 'requisitionid': 'id',
                'title': 'title', 'jobtitle': 'title', 'position': 'title',
                'department': 'department',
                'status': 'status', 'positionstatus': 'status',
                'opendate': 'openDate', 'dateopened': 'openDate',
                'closedate': 'closeDate', 'dateclosed': 'closeDate',
                'hiredemployeeid': 'hiredEmployeeId', 'hiredid': 'hiredEmployeeId',
                'onholddate': 'onHoldDate',
                'heldby': 'heldBy',
                'positiontype': 'positionType', 'type': 'positionType',
                'budgetstatus': 'budgetStatus', 'budget': 'budgetStatus',
            };
    
            const funnelKeyMap: Record<string, string> = {
                'id': 'id', 'positionid': 'id', 'reqid': 'id', 'requisitionid': 'id',
                'shortlisted': 'shortlisted', 'screened': 'shortlisted', 'applied': 'shortlisted',
                'interviewed': 'interviewed', 'interviews': 'interviewed',
                'offersextended': 'offersExtended', 'offers': 'offersExtended',
                'offersaccepted': 'offersAccepted', 'accepted': 'offersAccepted',
                'joined': 'joined', 'hired': 'joined', 'started': 'joined',
            };

            for (const sheetName of workbook.SheetNames) {
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false, defval: null });

                if (json.length === 0) continue;
                
                const headers = Object.keys(json[0]).map(h => h.toLowerCase().trim().replace(/ /g, '').replace(/_/g, ''));
                
                const isPositionSheet = headers.includes('title') && headers.includes('status');
                const isFunnelSheet = headers.includes('shortlisted') && headers.includes('interviewed');

                if (isPositionSheet) {
                    for (const row of json) {
                        const normalizedRow: any = {};
                        let rowId: string | null = null;
                        for (const key in row) {
                            const normalizedKey = String(key).toLowerCase().trim().replace(/ /g, '').replace(/_/g, '');
                            if (positionKeyMap[normalizedKey]) {
                                const newKey = positionKeyMap[normalizedKey];
                                let value = row[key];
                                if (['openDate', 'closeDate', 'onHoldDate'].includes(newKey)) {
                                    value = smartParseDate(value);
                                }
                                if (value !== null) normalizedRow[newKey] = value;
                                if (newKey === 'id') rowId = String(row[key]);
                            }
                        }
                        if (rowId) {
                            const existingData = positionMap.get(rowId) || {};
                            positionMap.set(rowId, { ...existingData, ...normalizedRow });
                        }
                    }
                } else if (isFunnelSheet) {
                    for (const row of json) {
                        const normalizedRow: any = {};
                        let rowId: string | null = null;
                        for (const key in row) {
                            const normalizedKey = String(key).toLowerCase().trim().replace(/ /g, '').replace(/_/g, '');
                            if (funnelKeyMap[normalizedKey]) {
                                const newKey = funnelKeyMap[normalizedKey];
                                if (row[key] !== null) normalizedRow[newKey] = row[key];
                                if (newKey === 'id') rowId = String(row[key]);
                            }
                        }
                        if (rowId) {
                            const existingData = funnelMap.get(rowId) || {};
                            funnelMap.set(rowId, { ...existingData, ...normalizedRow });
                        }
                    }
                }
            }

            if (positionMap.size === 0) {
                 throw new Error("Could not find a sheet with job position data (e.g., columns 'id', 'title', 'status'). Please check your Excel file.");
            }

            const mergedRecords = Array.from(positionMap.values()).map(positionData => {
                const funnelData = funnelMap.get(positionData.id) || {};
                return { ...positionData, ...funnelData };
            });

            const headers = ['id', 'title', 'department', 'status', 'openDate', 'closeDate', 'hiredEmployeeId', 'onHoldDate', 'heldBy', 'positionType', 'budgetStatus', 'shortlisted', 'interviewed', 'offersExtended', 'offersAccepted', 'joined'];
            const dataForCsv = mergedRecords.map(rec => {
                const csvRow: any = {};
                for (const header of headers) csvRow[header] = rec[header] ?? '';
                return csvRow;
            });

            const newWs = XLSX.utils.json_to_sheet(dataForCsv, { header: headers });
            const csvOutput = XLSX.utils.sheet_to_csv(newWs);
            setGeneratedCsv(csvOutput);
            setStatus('success');

        } catch (e) {
            const msg = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(msg);
            setStatus('error');
        }
    };

    const handleDownload = () => {
        if (!generatedCsv) return;
        const blob = new Blob([generatedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'converted_recruitment_data.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>3 - Recruitment Data</CardTitle>
                <CardDescription>Upload an Excel file with recruitment data to format it into the required CSV template.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="recruitment-excel-upload" className="block text-sm font-medium text-text-secondary mb-1">Upload Excel File</label>
                        <div className="flex items-center gap-2">
                            <Button as="label" htmlFor="recruitment-excel-upload" variant="secondary" className="cursor-pointer">Select File</Button>
                            <input id="recruitment-excel-upload" type="file" className="sr-only" accept=".xlsx, .xls" onChange={handleFileChange} />
                            {fileName && <span className="text-sm text-text-secondary">{fileName}</span>}
                        </div>
                    </div>
                    <Button onClick={handleConvert} disabled={!excelFile || status === 'processing'} isLoading={status === 'processing'}>
                        Fetch Recruitment Data
                    </Button>
                    {status === 'error' && error && (
                        <div className="p-3 bg-red-900/50 text-red-300 border border-red-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Failed</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {status === 'success' && generatedCsv && (
                        <div className="p-3 bg-green-900/50 text-green-300 border border-green-500/30 rounded-md text-sm">
                            <p className="font-semibold">Conversion Successful!</p>
                            <p>Your recruitment data is ready for download.</p>
                            <Button onClick={handleDownload} size="sm" className="mt-2 gap-2"><Download className="h-4 w-4"/> Download CSV</Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const parseSkills = (skillsString: string): Skill[] => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    const validLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];
    return skillsString.split(',').map(s => {
        const part = s.trim();
        if (!part) return null;
        const parts = part.split(':');
        const name = parts[0].trim();
        if (!name) return null;
        const levelInput = parts.length > 1 ? parts[1].trim() : 'Competent';
        const capitalizedLevel = levelInput.charAt(0).toUpperCase() + levelInput.slice(1).toLowerCase();
        const level = validLevels.includes(capitalizedLevel as SkillLevel) ? capitalizedLevel as SkillLevel : 'Competent';
        return { name, level };
    }).filter((skill): skill is Skill => skill !== null);
};


const ManualEntryForm: React.FC<{
    onAddEmployee: (employee: Employee) => void;
    onUpdateEmployee: (employee: Employee) => void;
    existingIds: string[];
    allEmployees: Employee[];
    organizationId: string;
}> = ({ onAddEmployee, onUpdateEmployee, existingIds, allEmployees, organizationId }) => {
    const { currentOrgHeadcount, currentOrgHeadcountLimit } = useData();
    const initialState = {
        id: '', name: '', department: '', jobTitle: '', location: '', hireDate: '', salary: '', gender: 'Male' as 'Male' | 'Female' | 'Other', performanceRating: '3', engagementScore: '75',
        terminationDate: '', terminationReason: '', potentialRating: '1', skills: '',
        compensationSatisfaction: '75', benefitsSatisfaction: '75', managementSatisfaction: '75', trainingSatisfaction: '75',
        managerId: '', trainingCompleted: '0', trainingTotal: '8', successionStatus: 'Not Assessed' as Employee['successionStatus'],
        bonus: '', lastRaiseAmount: '', hasGrievance: 'false', weeklyHours: '40',
    };
    const [formData, setFormData] = useState(initialState);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const isAtLimit = currentOrgHeadcount >= currentOrgHeadcountLimit;

    const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newId = e.target.value;
        if (isEditing) {
            setIsEditing(false);
            setFormData({ ...initialState, id: newId });
        } else {
            setFormData({ ...formData, id: newId });
        }
    };
    
    const handleIdBlur = () => {
        const employeeToEdit = allEmployees.find(emp => emp.id === formData.id);
        if (employeeToEdit) {
            setFormData({
                id: employeeToEdit.id,
                name: employeeToEdit.name,
                department: employeeToEdit.department,
                jobTitle: employeeToEdit.jobTitle,
                location: employeeToEdit.location || '',
                hireDate: employeeToEdit.hireDate,
                salary: String(employeeToEdit.salary),
                gender: employeeToEdit.gender,
                performanceRating: String(employeeToEdit.performanceRating),
                engagementScore: String(employeeToEdit.engagementScore),
                terminationDate: employeeToEdit.terminationDate || '',
                terminationReason: employeeToEdit.terminationReason || '',
                potentialRating: String(employeeToEdit.potentialRating),
                skills: employeeToEdit.skills.map(s => `${s.name}:${s.level}`).join(','),
                compensationSatisfaction: String(employeeToEdit.compensationSatisfaction || 75),
                benefitsSatisfaction: String(employeeToEdit.benefitsSatisfaction || 75),
                managementSatisfaction: String(employeeToEdit.managementSatisfaction || 75),
                trainingSatisfaction: String(employeeToEdit.trainingSatisfaction || 75),
                managerId: employeeToEdit.managerId || '',
                trainingCompleted: String(employeeToEdit.trainingCompleted),
                trainingTotal: String(employeeToEdit.trainingTotal),
                successionStatus: employeeToEdit.successionStatus,
                bonus: String(employeeToEdit.bonus || ''),
                lastRaiseAmount: String(employeeToEdit.lastRaiseAmount || ''),
                hasGrievance: String(employeeToEdit.hasGrievance || false),
                weeklyHours: String(employeeToEdit.weeklyHours || 40),
            });
            setIsEditing(true);
            setError('');
        } else if (isEditing) {
            setIsEditing(false);
            setFormData({ ...initialState, id: formData.id });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        const requiredFields = ['id', 'name', 'department', 'jobTitle', 'hireDate', 'salary', 'performanceRating', 'engagementScore'];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                setError(`Field "${field}" is required.`);
                return;
            }
        }
        if (!isEditing && existingIds.includes(formData.id)) {
            setError(`Error: Employee with ID "${formData.id}" already exists. To update, enter the ID and tab out to load their data.`);
            return;
        }

        if (!isEditing && isAtLimit) {
            setError(`Cannot add employee. You have reached your plan's headcount limit of ${currentOrgHeadcountLimit}.`);
            return;
        }

        setError('');

        const newEmployee: Employee = {
            id: formData.id,
            name: formData.name,
            department: formData.department,
            jobTitle: formData.jobTitle,
            location: formData.location,
            hireDate: formData.hireDate,
            terminationDate: formData.terminationDate || undefined,
            terminationReason: (formData.terminationReason as Employee['terminationReason']) || undefined,
            salary: Number(formData.salary) || 0,
            gender: formData.gender,
            performanceRating: Number(formData.performanceRating) || 3,
            potentialRating: Number(formData.potentialRating) || 1,
            engagementScore: Number(formData.engagementScore) || 75,
            skills: parseSkills(formData.skills),
            compensationSatisfaction: formData.compensationSatisfaction ? Number(formData.compensationSatisfaction) : undefined,
            benefitsSatisfaction: formData.benefitsSatisfaction ? Number(formData.benefitsSatisfaction) : undefined,
            managementSatisfaction: formData.managementSatisfaction ? Number(formData.managementSatisfaction) : undefined,
            trainingSatisfaction: formData.trainingSatisfaction ? Number(formData.trainingSatisfaction) : undefined,
            managerId: formData.managerId || undefined,
            trainingCompleted: Number(formData.trainingCompleted) || 0,
            trainingTotal: Number(formData.trainingTotal) || 8,
            successionStatus: formData.successionStatus,
            bonus: formData.bonus ? Number(formData.bonus) : undefined,
            lastRaiseAmount: formData.lastRaiseAmount ? Number(formData.lastRaiseAmount) : undefined,
            hasGrievance: formData.hasGrievance === 'true',
            weeklyHours: formData.weeklyHours ? Number(formData.weeklyHours) : undefined,
            organizationId,
        };
        
        if (isEditing) {
            onUpdateEmployee(newEmployee);
        } else {
            onAddEmployee(newEmployee);
        }
        setFormData(initialState);
        setIsEditing(false);
    };
    
    const managers = useMemo(() => allEmployees.filter(e => !e.terminationDate).sort((a,b) => a.name.localeCompare(b.name)), [allEmployees]);
    const isDisabled = !isEditing && isAtLimit;

    return (
        <div className={`space-y-4 ${isDisabled ? 'opacity-60' : ''}`}>
             {isDisabled && (
                <div className="p-3 bg-yellow-900/50 text-yellow-300 border border-yellow-500/30 rounded-md text-sm">
                    <p className="font-semibold">Headcount Limit Reached</p>
                    <p>You cannot add new employees. Please upgrade your plan or upload a new file to replace existing data.</p>
                </div>
            )}
            <fieldset disabled={isDisabled}>
                <Accordion title="Core Information" startOpen>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Employee ID*" name="id" value={formData.id} onChange={handleIdChange} onBlur={handleIdBlur} placeholder="e.g., E1001" disabled={isAtLimit && !isEditing} />
                        <Input label="Full Name*" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Alex Ray" />
                        <Input label="Department*" name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Finance" />
                        <Input label="Job Title*" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="e.g., Financial Analyst" />
                        <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., New York" />
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-text-secondary mb-1">Gender</label>
                            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="managerId" className="block text-sm font-medium text-text-secondary mb-1">Manager</label>
                            <select id="managerId" name="managerId" value={formData.managerId} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                <option value="">-- No Manager --</option>
                                {managers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Employment Status">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Hire Date*" name="hireDate" type="date" value={formData.hireDate} onChange={handleChange} />
                        <Input label="Termination Date" name="terminationDate" type="date" value={formData.terminationDate} onChange={handleChange} />
                        <div>
                            <label htmlFor="terminationReason" className="block text-sm font-medium text-text-secondary mb-1">Termination Reason</label>
                            <select id="terminationReason" name="terminationReason" value={formData.terminationReason} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                <option value="">-- N/A --</option><option>Voluntary</option><option>Involuntary</option>
                            </select>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Performance & Potential">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Performance Rating* (1-5)" name="performanceRating" type="number" min="1" max="5" value={formData.performanceRating} onChange={handleChange} />
                        <Input label="Potential Rating (1-3)" name="potentialRating" type="number" min="1" max="3" value={formData.potentialRating} onChange={handleChange} />
                        <Input label="Engagement Score* (1-100)" name="engagementScore" type="number" min="1" max="100" value={formData.engagementScore} onChange={handleChange} />
                    </div>
                </Accordion>
                <Accordion title="Compensation">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label={`Salary* (${organizationId === 'org_1' ? '$' : 'Rs'})`} name="salary" type="number" value={formData.salary} onChange={handleChange} placeholder="e.g., 80000" />
                        <Input label={`Bonus (${organizationId === 'org_1' ? '$' : 'Rs'})`} name="bonus" type="number" value={formData.bonus} onChange={handleChange} placeholder="e.g., 5000" />
                        <Input label={`Last Raise (${organizationId === 'org_1' ? '$' : 'Rs'})`} name="lastRaiseAmount" type="number" value={formData.lastRaiseAmount} onChange={handleChange} placeholder="e.g., 3000" />
                    </div>
                </Accordion>
                <Accordion title="Satisfaction Scores (1-100)">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Compensation" name="compensationSatisfaction" type="number" min="1" max="100" value={formData.compensationSatisfaction} onChange={handleChange} />
                        <Input label="Benefits" name="benefitsSatisfaction" type="number" min="1" max="100" value={formData.benefitsSatisfaction} onChange={handleChange} />
                        <Input label="Management" name="managementSatisfaction" type="number" min="1" max="100" value={formData.managementSatisfaction} onChange={handleChange} />
                        <Input label="Training" name="trainingSatisfaction" type="number" min="1" max="100" value={formData.trainingSatisfaction} onChange={handleChange} />
                    </div>
                </Accordion>
                <Accordion title="Skills & Development">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <Input label="Skills" name="skills" value={formData.skills} onChange={handleChange} placeholder="e.g., React:Proficient,SQL:Expert" />
                        </div>
                        <Input label="Training Completed" name="trainingCompleted" type="number" value={formData.trainingCompleted} onChange={handleChange} />
                        <Input label="Training Total" name="trainingTotal" type="number" value={formData.trainingTotal} onChange={handleChange} />
                        <div>
                            <label htmlFor="successionStatus" className="block text-sm font-medium text-text-secondary mb-1">Succession Status</label>
                            <select id="successionStatus" name="successionStatus" value={formData.successionStatus} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                <option>Not Assessed</option><option>Future Potential</option><option>Ready in 1-2 Years</option><option>Ready Now</option>
                            </select>
                        </div>
                    </div>
                </Accordion>
                <Accordion title="Other Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Avg. Weekly Hours" name="weeklyHours" type="number" value={formData.weeklyHours} onChange={handleChange} />
                        <div>
                            <label htmlFor="hasGrievance" className="block text-sm font-medium text-text-secondary mb-1">Grievance Status</label>
                            <select id="hasGrievance" name="hasGrievance" value={formData.hasGrievance} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-3 py-2 text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none">
                                <option value="false">No Grievances</option><option value="true">Active Grievance</option>
                            </select>
                        </div>
                    </div>
                </Accordion>
            </fieldset>

            {error && <p className="text-sm text-red-400 flex items-center gap-2 mt-4"><AlertCircle className="h-4 w-4" />{error}</p>}
            <Button type="button" onClick={handleSubmit} className="gap-2 mt-4" disabled={isDisabled && !isEditing}>
                {isEditing ? <><Edit className="h-4 w-4"/>Update Employee</> : <><PlusCircle className="h-4 w-4"/>Add Employee</>}
            </Button>
        </div>
    );
};

const DataManagementPage: React.FC = () => {
    const { 
        appendEmployeeData,
        replaceEmployeeDataForOrg,
        allOrganizations,
        employeeData, 
        setAttendanceData, 
        setJobPositions, 
        setRecruitmentFunnels,
        activeOrganizationId,
        currentPackageFeatures
    } = useData();
    const { addNotification } = useNotifications();
    const { currentUser } = useAuth();

    const [activeTab, setActiveTab] = useState<ActiveTab>('import');
    
    const orgId = useMemo(() => (
        currentUser?.role === 'Super Admin' ? activeOrganizationId : currentUser?.organizationId
    ), [currentUser, activeOrganizationId]);

    const handleEmployeeUploadComplete = (data: Employee[]) => {
        appendEmployeeData(data);
        addNotification({
            title: 'Append Successful',
            message: `Appended ${data.length} new employee records.`,
            type: 'success',
        });
    };
    
    const handleAttendanceUploadComplete = (data: any[]) => {
        setAttendanceData(prev => [...prev.filter(a => a.organizationId !== orgId), ...data]);
    };
    
    const handleRecruitmentUploadComplete = (data: { positions: JobPosition[], funnels: RecruitmentFunnel[] }) => {
        setJobPositions(prev => [...prev.filter(p => p.organizationId !== orgId), ...data.positions]);
        setRecruitmentFunnels(prev => [...prev.filter(f => f.organizationId !== orgId), ...data.funnels]);
    };

    const handleLoadSampleData = () => {
        if (!orgId) return;
        const org = allOrganizations.find(o => o.id === orgId);
        if (!org) {
            addNotification({
                title: 'Error Loading Data',
                message: 'Could not find the selected organization to generate data for.',
                type: 'error',
            });
            return;
        }

        const employeeCount = org.employeeCount || 50; // Use count from org state
        const newEmployeeData = generateEmployeeData(employeeCount, orgId);
        
        replaceEmployeeDataForOrg(orgId, newEmployeeData);

        // Generate dependent data based on the newly created employees
        const newAttendanceData = generateAttendanceData(newEmployeeData, employeeCount * 2);
        setAttendanceData(prev => [...prev.filter(a => a.organizationId !== orgId), ...newAttendanceData]);
        
        const newJobPositions = generateJobPositions(orgId);
        setJobPositions(prev => [...prev.filter(p => p.organizationId !== orgId), ...newJobPositions]);
        
        const newRecruitmentFunnels = generateRecruitmentFunnelData(orgId);
        setRecruitmentFunnels(prev => [...prev.filter(f => f.organizationId !== orgId), ...newRecruitmentFunnels]);
        
        addNotification({
            title: 'Sample Data Loaded',
            message: `A new sample dataset with ${employeeCount} employees has been generated and loaded for ${org.name}.`,
            type: 'success',
        });
    };

    const handleAddEmployee = (employee: Employee) => {
        appendEmployeeData([employee]);
    };

    const handleUpdateEmployee = (updatedEmployee: Employee) => {
        // Appending the updated record creates a new version
        appendEmployeeData([updatedEmployee]);
    };

    const handleDownloadEmployeeTemplate = () => {
        const headers = [
            'id', 'name', 'gender', 'jobTitle', 'department', 'location', 'managerId', 'hireDate', 'terminationDate', 'terminationReason', 'successionStatus', 'salary', 'bonus', 'lastRaiseAmount', 'performanceRating', 'potentialRating', 'engagementScore', 'weeklyHours', 'compensationSatisfaction', 'benefitsSatisfaction', 'managementSatisfaction', 'trainingSatisfaction', 'skills', 'trainingCompleted', 'trainingTotal', 'hasGrievance'
        ];
        const notes = [
            'Unique employee identifier', 'Full Name', 'Male/Female/Other', 'Official job title', 'Primary department', 'Work location (e.g., City, Remote)', 'The Employee ID of their direct manager', 'Date of hire (YYYY-MM-DD)', 'Date of termination (YYYY-MM-DD, optional)', 'Voluntary/Involuntary', 'Succession readiness status (e.g., Ready Now)', 'Annual base salary (numeric)', 'Annual bonus (numeric, optional)', 'Last raise amount (numeric, optional)', 'Performance rating (1-5)', 'Potential rating (1-3)', 'Engagement score (1-100)', 'Average weekly hours worked', 'Compensation satisfaction (1-100)', 'Benefits satisfaction (1-100)', 'Management satisfaction (1-100)', 'Training satisfaction (1-100)', 'Comma-separated skills, e.g. "React:Proficient,SQL:Expert"', 'Number of training modules completed', 'Total training modules assigned', 'Does the employee have an active grievance? (TRUE/FALSE)'
        ];
    
        const notesRow = notes.map(note => `"${note.replace(/"/g, '""')}"`).join(',');
        const csvContent = [headers.join(','), notesRow].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'employee_data_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAttendanceTemplate = () => {
        const headers = ['employeeId', 'date', 'status'];
        const notes = [
            'The ID of the employee this record belongs to (must match an ID from the employee data)', 'Date of the record (YYYY-MM-DD)', 'Status must be one of: Present, Unscheduled Absence, PTO, Sick Leave'
        ];
        const notesRow = notes.map(note => `"${note.replace(/"/g, '""')}"`).join(',');
        const csvContent = [headers.join(','), notesRow].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'attendance_data_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleDownloadRecruitmentTemplate = () => {
        const headers = ['id', 'title', 'department', 'status', 'openDate', 'closeDate', 'hiredEmployeeId', 'onHoldDate', 'heldBy', 'positionType', 'budgetStatus', 'shortlisted', 'interviewed', 'offersExtended', 'offersAccepted', 'joined'];
        const notes = [
            'Unique ID for the job position (e.g., POS001)', 'Job title', 'Department name', 'Status: Open, Closed, or On Hold', 'Date position opened (YYYY-MM-DD)', 'Date position closed (YYYY-MM-DD, optional)', 'Employee ID of the person hired (optional)', 'Date position was put on hold (YYYY-MM-DD, optional)', 'Name of the person who put the position on hold (optional)', 'Type: Replacement or New', 'Budget Status: Budgeted or Non-Budgeted', 'Number of candidates shortlisted (optional)', 'Number of candidates interviewed (optional)', 'Number of offers extended (optional)', 'Number of offers accepted (optional)', 'Number of candidates who joined (optional)'
        ];
        const notesRow = notes.map(note => `"${note.replace(/"/g, '""')}"`).join(',');
        const csvContent = [headers.join(','), notesRow].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'recruitment_data_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const existingIds = useMemo(() => employeeData.map(e => e.id), [employeeData]);
    
    const tabs = useMemo(() => {
        const baseTabs = [
            { id: 'import', name: 'Data Import', icon: UploadCloud },
            { id: 'convert', name: 'Convert to CSV', icon: FileCog },
            { id: 'analysis', name: 'Exit Interview Analysis', icon: ClipboardCheck },
            { id: 'export', name: 'Data Export', icon: FileDown }
        ];
        if (currentPackageFeatures?.hasIntegrations) {
            baseTabs.push({ id: 'integrations', name: 'Integrations', icon: Zap });
        }
        return baseTabs;
    }, [currentPackageFeatures]);
    
    useEffect(() => {
        if (activeTab === 'integrations' && !currentPackageFeatures?.hasIntegrations) {
            setActiveTab('import');
        }
    }, [activeTab, currentPackageFeatures]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-text-primary">Data Management</h2>
                <p className="text-text-secondary mt-1">Load, enter, export, or connect your employee data sources.</p>
            </div>
            
            <div className="border-b border-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`group inline-flex items-center py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${activeTab === tab.id ? 'border-primary-500 text-primary-400' : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-500'}`}
                        >
                            <tab.icon className="mr-2 h-5 w-5" />
                            <span>{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="pt-4">
                {activeTab === 'import' && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                         <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2"><TestTube2 className="h-5 w-5 text-primary-400"/>Fetch Your Organization's Data</CardTitle>
                                    <CardDescription>
                                        In a real application, you would connect to your HRIS. For this demo, click here to generate and load a sample dataset that reflects your organization's current settings.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={handleLoadSampleData}>Fetch Sample Dataset</Button>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardHeader><CardTitle>1 - Employee Data</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-xs text-text-secondary mb-2">Upload a CSV file with core employee records. This will append to, not replace, existing employee data.</p>
                                    <Button onClick={handleDownloadEmployeeTemplate} variant="secondary" size="sm" className="gap-2 mb-4"><FileText className="h-4 w-4"/>Download Employee Template</Button>
                                    {orgId && <DataUpload onComplete={handleEmployeeUploadComplete} organizationId={orgId} />}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>2 - Attendance Data</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-xs text-text-secondary mb-2">Upload a CSV file with attendance records. This requires employee data to be loaded first.</p>
                                    <Button onClick={handleDownloadAttendanceTemplate} variant="secondary" size="sm" className="gap-2 mb-4"><FileText className="h-4 w-4"/>Download Attendance Template</Button>
                                    {orgId && <AttendanceUpload onComplete={handleAttendanceUploadComplete} organizationId={orgId} />}
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader><CardTitle>3 - Recruitment Data</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-xs text-text-secondary mb-2">Upload a single CSV with job positions and their funnel metrics.</p>
                                    <Button onClick={handleDownloadRecruitmentTemplate} variant="secondary" size="sm" className="gap-2 mb-4"><FileText className="h-4 w-4"/>Download Recruitment Template</Button>
                                    {orgId && <RecruitmentDataUpload onComplete={handleRecruitmentUploadComplete} organizationId={orgId} />}
                                </CardContent>
                            </Card>
                         </div>
                         <div className="space-y-6">
                            <Card>
                               <CardHeader>
                                   <CardTitle className="flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary-400"/>Manual Entry &amp; Edit</CardTitle>
                                   <CardDescription>Add a new employee or enter an existing ID to load and edit their data. Submitting creates a new version of the record.</CardDescription>
                               </CardHeader>
                               <CardContent>
                                    {orgId && <ManualEntryForm onAddEmployee={handleAddEmployee} onUpdateEmployee={handleUpdateEmployee} existingIds={existingIds} allEmployees={employeeData} organizationId={orgId} />}
                               </CardContent>
                            </Card>
                         </div>
                    </div>
                )}

                {activeTab === 'analysis' && (
                    <ExitInterviewAnalyzer />
                )}

                {activeTab === 'convert' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ExcelToCsvConverter />
                        <AttendanceExcelToCsvConverter />
                        <RecruitmentExcelToCsvConverter />
                    </div>
                )}

                {activeTab === 'export' && (
                    <div className="max-w-lg">
                        <DataExport />
                    </div>
                )}

                {activeTab === 'integrations' && currentPackageFeatures?.hasIntegrations && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <IntegrationCard 
                            name="Workday"
                            description="Connect to your Workday HRIS for employee and compensation data."
                            logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Workday_Logo.svg/2560px-Workday_Logo.svg.png"
                        />
                         <IntegrationCard 
                            name="SAP SuccessFactors"
                            description="Sync data from SAP SuccessFactors for a comprehensive workforce view."
                            logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/SAP-SuccessFactors-Logo.svg/2560px-SAP-SuccessFactors-Logo.svg.png"
                        />
                         <IntegrationCard 
                            name="Qualtrics"
                            description="Pull in employee engagement and survey data directly from Qualtrics."
                            logoUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Qualtrics_Logo.svg/2560px-Qualtrics_Logo.svg.png"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataManagementPage;
