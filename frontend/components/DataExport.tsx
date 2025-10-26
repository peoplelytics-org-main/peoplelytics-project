import React from 'react';
import * as XLSX from 'xlsx';
import { useData } from '../contexts/DataContext';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { FileDown } from 'lucide-react';
import { calculateFlightRiskScore, calculateImpactScore } from '../services/hrCalculations';
import { MOCK_JOB_POSITIONS, MOCK_RECRUITMENT_FUNNEL_DATA } from '../constants';

const DataExport: React.FC = () => {
    const { employeeData, attendanceData } = useData();

    // --- Data Preparation for Excel Export ---
    const employeeSheetData = employeeData.map(emp => ({
        id: emp.id,
        name: emp.name,
        gender: emp.gender,
        department: emp.department,
        jobTitle: emp.jobTitle,
        location: emp.location,
        hireDate: emp.hireDate,
        terminationDate: emp.terminationDate || '',
        terminationReason: emp.terminationReason || '',
        managerId: emp.managerId || '',
        successionStatus: emp.successionStatus,
    }));

    const salarySheetData = employeeData.map(emp => ({
        id: emp.id,
        name: emp.name,
        salary: emp.salary,
        bonus: emp.bonus || '',
        lastRaiseAmount: emp.lastRaiseAmount || '',
        compensationSatisfaction: emp.compensationSatisfaction || '',
        benefitsSatisfaction: emp.benefitsSatisfaction || '',
    }));
    
    const performanceSheetData = employeeData.map(emp => ({
        id: emp.id,
        name: emp.name,
        performanceRating: emp.performanceRating,
        potentialRating: emp.potentialRating,
        engagementScore: emp.engagementScore,
        flightRiskScore: calculateFlightRiskScore(emp).toFixed(2),
        impactScore: calculateImpactScore(emp).toFixed(2),
        managementSatisfaction: emp.managementSatisfaction || '',
        trainingSatisfaction: emp.trainingSatisfaction || '',
        trainingCompleted: emp.trainingCompleted,
        trainingTotal: emp.trainingTotal,
        weeklyHours: emp.weeklyHours || '',
        hasGrievance: emp.hasGrievance || false,
    }));

    const skillsSheetData = employeeData.flatMap(emp => 
        emp.skills && emp.skills.length > 0
            ? emp.skills.map(skill => ({
                employeeId: emp.id,
                employeeName: emp.name,
                skillName: skill.name,
                skillLevel: skill.level,
            }))
            : []
    );

    const attendanceSheetData = attendanceData.map(att => ({
        employeeId: att.employeeId,
        date: att.date,
        status: att.status,
    }));
    
    const handleDownloadExcel = () => {
        const wb = XLSX.utils.book_new();

        // Sheet 1: Instructions
        const instructions = [
            ["Sheet Name", "Description"],
            ["Employee Data", "Core demographic and employment information for each employee."],
            ["Salary & Compensation", "Sensitive salary and compensation satisfaction data."],
            ["Performance & Engagement", "Performance ratings, engagement scores, and training data."],
            ["Skills Data", "A detailed breakdown of each employee's skills and proficiency levels."],
            ["Attendance Log", "Daily attendance records for all employees."],
            ["Job Positions", "Information about open, closed, and on-hold job requisitions."],
            ["Recruitment Funnel", "Funnel metrics for each open job position."],
            [],
            ["Column Headers", "Description", "Example / Allowed Values"],
            ["id / employeeId", "Unique identifier for the employee. MUST be present on all sheets to link data.", "E1001"],
            ["name / employeeName", "Full name of the employee.", "Jane Doe"],
            ["gender", "Allowed values: 'Male', 'Female', 'Other'", "Female"],
            ["hireDate", "Date in YYYY-MM-DD format.", "2022-08-15"],
            ["terminationDate", "Date in YYYY-MM-DD format. Leave blank for active employees.", "2023-12-31"],
            ["skillName (on Skills Data sheet)", "The name of the skill.", "Project Management"],
            ["skillLevel (on Skills Data sheet)", "Allowed: 'Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'", "Proficient"],
            ["performanceRating", "A number from 1 to 5.", "4"],
            ["potentialRating", "A number from 1 to 3.", "2"],
            ["engagementScore", "A number from 1 to 100.", "88"],
            ["flightRiskScore", "Calculated score (1-10) indicating turnover risk.", "7.5"],
            ["impactScore", "Calculated score (1-10) indicating impact of departure.", "8.2"],
            ["salary", "Annual salary, numeric value only.", "85000"],
            ["bonus", "Annual bonus, numeric value only.", "5000"],
            ["status (Attendance)", "Allowed values: 'Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'", "Unscheduled Absence"],
            ["positionId", "Links the funnel data to a specific job in the 'Job Positions' sheet.", "POS001"],
            ["status (Job Positions)", "Allowed values: 'Open', 'Closed', 'On Hold'", "Open"],
            ["positionType (Job Positions)", "Allowed values: 'Replacement', 'New'", "New"],
        ];
        const ws_instructions = XLSX.utils.aoa_to_sheet(instructions);
        XLSX.utils.book_append_sheet(wb, ws_instructions, "Instructions");

        // Append data sheets
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(employeeSheetData), "Employee Data");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salarySheetData), "Salary & Compensation");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(performanceSheetData), "Performance & Engagement");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(skillsSheetData), "Skills Data");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceSheetData), "Attendance Log");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(MOCK_JOB_POSITIONS), "Job Positions");
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(MOCK_RECRUITMENT_FUNNEL_DATA), "Recruitment Funnel");


        XLSX.writeFile(wb, "peoplelytics_data_export_all.xlsx");
    };

    const downloadCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        const ws = XLSX.utils.json_to_sheet(data);
        const csvString = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileDown className="h-5 w-5 text-primary-400"/>Data Export</CardTitle>
                <CardDescription>Download your data in various formats for analysis or record-keeping.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="font-semibold text-text-primary mb-2">Complete Workbook (Excel)</h4>
                    <p className="text-xs text-text-secondary mb-3">Download all data segments in a single, multi-sheet Excel file. This is recommended for a complete backup or for use as an import template.</p>
                    <Button onClick={handleDownloadExcel} disabled={employeeData.length === 0}>
                        Download All (.xlsx)
                    </Button>
                </div>

                <div className="border-t border-border pt-4">
                    <h4 className="font-semibold text-text-primary mb-2">Individual Files (CSV)</h4>
                    <p className="text-xs text-text-secondary mb-3">Download specific data segments as plain-text CSV files, ideal for use in other applications.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(employeeSheetData, 'employee_data.csv')} disabled={employeeData.length === 0}>Employee Data</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(salarySheetData, 'salary_data.csv')} disabled={employeeData.length === 0}>Salary & Comp</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(performanceSheetData, 'performance_data.csv')} disabled={employeeData.length === 0}>Performance</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(skillsSheetData, 'skills_data.csv')} disabled={employeeData.length === 0}>Skills Data</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(attendanceSheetData, 'attendance_data.csv')} disabled={attendanceData.length === 0}>Attendance</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(MOCK_JOB_POSITIONS, 'job_positions.csv')}>Job Positions</Button>
                        <Button variant="secondary" size="sm" onClick={() => downloadCSV(MOCK_RECRUITMENT_FUNNEL_DATA, 'recruitment_funnel.csv')}>Recruitment Funnel</Button>
                    </div>
                </div>

                {employeeData.length === 0 && <p className="text-xs text-text-secondary mt-4">Load or add data to enable export.</p>}
            </CardContent>
        </Card>
    );
};

export default DataExport;