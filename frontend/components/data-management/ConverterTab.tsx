import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

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

            const employeeKeyMap: Record<string, string> = {
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
                'flightriskscore':'flightRiskScore',
                'impactscore':'impactScore',

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
            
            const headers = [ 'id', 'name', 'gender', 'jobTitle', 'department', 'location', 'managerId', 'hireDate', 'terminationDate', 'terminationReason', 'successionStatus', 'salary', 'bonus', 'lastRaiseAmount', 'performanceRating', 'potentialRating', 'engagementScore', 'weeklyHours', 'compensationSatisfaction', 'benefitsSatisfaction', 'managementSatisfaction', 'trainingSatisfaction', 'skills', 'trainingCompleted', 'trainingTotal', 'hasGrievance','flightRiskScore', 'impactScore'];
            
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
                // ID Mappings
                'employeeid': 'employeeId', 
                'empid': 'employeeId', 
                'id': 'employeeId', 
                'attid': 'employeeId', // Added 'attid' just in case you want to use column A later
            
                // Date Mappings (FIX IS HERE)
                'date': 'date', 
                'attendancedate': 'date', 
                'datetimein': 'date',   // <--- Matches "date_time_in" from your screenshot
                'datetime': 'date',
            
                // Status Mappings
                'status': 'status', 
                'attendancestatus': 'status', 
                'type': 'status'
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

            const headers = [,'employeeId', 'date', 'status'];
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


const ConverterTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <ExcelToCsvConverter />
            <AttendanceExcelToCsvConverter />
            <RecruitmentExcelToCsvConverter />
        </div>
    );
}

export default ConverterTab;
