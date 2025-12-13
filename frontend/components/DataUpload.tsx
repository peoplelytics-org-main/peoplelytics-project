import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import type { Employee, Skill, SkillLevel } from '../types';
import Button from './ui/Button';
import { useNotifications } from '../contexts/NotificationContext';
import { CheckCircle, AlertTriangle, UploadCloud, X, Edit, Trash2, Loader2 } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import { useData } from '../contexts/DataContext';
import { uploadApi } from '../services/api/uploadApi';

interface DataUploadProps {
  onComplete: (data: Employee[]) => void;
  organizationId: string;
  existingEmployeeIds?: Set<string>;
}

type RowError = { field: string; message: string };
type ErrorRow = { rowIndex: number; errors: RowError[]; rowData: Record<string, any> };

const REQUIRED_FIELDS = ['id', 'name', 'department', 'jobTitle', 'hireDate', 'salary', 'gender', 'performanceRating', 'engagementScore'];

const validateRow = (row: Record<string, any>, index: number, allIds: Set<string>,existingIds?: Set<string>): RowError[] => {
    const errors: RowError[] = [];
    
    REQUIRED_FIELDS.forEach(field => {
        if (!row[field] || String(row[field]).trim() === '') {
            errors.push({ field, message: 'Required field is missing or empty.' });
        }
    });

    if (row.id) {
        const id = String(row.id).trim();
        if (allIds.has(id)) {
            errors.push({ field: 'id', message: 'Duplicate ID detected. Each ID must be unique in the file.' });
        }
        allIds.add(id);
    } else {
        // ID is already marked as missing by the required field check, no need for another error.
    }
    
    // Add more specific validations
    if (row.salary && isNaN(Number(row.salary))) {
        errors.push({ field: 'salary', message: 'Must be a valid number.' });
    }
    if (row.performanceRating && (isNaN(Number(row.performanceRating)) || Number(row.performanceRating) < 1 || Number(row.performanceRating) > 5)) {
        errors.push({ field: 'performanceRating', message: 'Must be a number between 1 and 5.' });
    }
    if (row.hireDate && isNaN(new Date(row.hireDate).getTime())) {
        errors.push({ field: 'hireDate', message: 'Invalid date format.' });
    }

    return errors;
};

const parseSkills = (skillsString: string): Skill[] => {
    if (!skillsString || typeof skillsString !== 'string') return [];
    const validLevels: SkillLevel[] = ['Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];
    return skillsString.split(',').map(s => {
        const part = s.trim(); if (!part) return null;
        const parts = part.split(':'); const name = parts[0].trim(); if (!name) return null;
        const levelInput = parts.length > 1 ? parts[1].trim() : 'Competent';
        const capitalizedLevel = levelInput.charAt(0).toUpperCase() + levelInput.slice(1).toLowerCase();
        const level = validLevels.includes(capitalizedLevel as SkillLevel) ? capitalizedLevel as SkillLevel : 'Competent';
        return { name, level };
    }).filter((skill): skill is Skill => skill !== null);
};

const DataUpload: React.FC<DataUploadProps> = ({ onComplete, organizationId }) => {
    const { addNotification } = useNotifications();
    const { currentOrgHeadcount, currentOrgHeadcountLimit } = useData();
    const [step, setStep] = useState<'select' | 'validate' | 'complete'>('select');
    const [fileName, setFileName] = useState<string | null>(null);
    const [errorRows, setErrorRows] = useState<ErrorRow[]>([]);
    const [validRows, setValidRows] = useState<Employee[]>([]);
    const [uploadSummary, setUploadSummary] = useState<{ uploaded: number; skipped: number; fixed: number } | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const [isFixingManually, setIsFixingManually] = useState(false);
    const [rowsToFix, setRowsToFix] = useState<ErrorRow[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    
    const allFileHeaders = useMemo(() => {
        if(errorRows.length > 0) return Object.keys(errorRows[0].rowData);
        if(validRows.length > 0) return Object.keys(validRows[0]);
        return REQUIRED_FIELDS;
    }, [errorRows, validRows]);

    useEffect(() => {
        if (step === 'validate' || step === 'complete') {
            setTimeout(() => {
                componentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [step]);

    const cleanRow = (row: Record<string, any>): Employee => {
        const id = String(row.id || `generated_${Date.now()}`).trim();
        
        let hireDate = row.hireDate;
        if (!hireDate || isNaN(new Date(hireDate).getTime())) hireDate = new Date().toISOString().split('T')[0];
        else hireDate = new Date(hireDate).toISOString().split('T')[0];
        
        let terminationDate: string | undefined = undefined;
        if (row.terminationDate && String(row.terminationDate).trim() && !isNaN(new Date(row.terminationDate).getTime())) {
            terminationDate = new Date(row.terminationDate).toISOString().split('T')[0];
        }
        
        let terminationReason: Employee['terminationReason'] | undefined = undefined;
        if (row.terminationReason && ['Voluntary', 'Involuntary'].includes(String(row.terminationReason).trim())) {
            terminationReason = String(row.terminationReason).trim() as Employee['terminationReason'];
        }
    
        const parseOptionalNumber = (value: any): number | undefined => {
            if (value === null || value === undefined || String(value).trim() === '') return undefined;
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num;
        };
    
        const parseAndClamp = (value: any, min: number, max: number, defaultValue: number): number => {
            let num = parseInt(String(value), 10);
            if (isNaN(num)) return defaultValue;
            return Math.max(min, Math.min(max, num));
        };
    
        const parseAndClampOptional = (value: any, min: number, max: number): number | undefined => {
            if (value === null || value === undefined || String(value).trim() === '') return undefined;
            let num = parseInt(String(value), 10);
            if (isNaN(num)) return undefined;
            return Math.max(min, Math.min(max, num));
        };
    
        return {
            id,
            name: String(row.name || `Employee #${id}`).trim(),
            department: String(row.department || 'Unassigned').trim(),
            jobTitle: String(row.jobTitle || 'Unassigned').trim(),
            location: String(row.location || 'N/A').trim(),
            hireDate,
            terminationDate,
            terminationReason,
            salary: Number(row.salary) || 0,
            gender: ['Male', 'Female', 'Other'].includes(row.gender) ? row.gender : 'Other',
            performanceRating: parseAndClamp(row.performanceRating, 1, 5, 3),
            potentialRating: parseAndClamp(row.potentialRating, 1, 3, 1),
            engagementScore: parseAndClamp(row.engagementScore, 1, 100, 75),
            skills: parseSkills(row.skills),
            compensationSatisfaction: parseAndClampOptional(row.compensationSatisfaction, 1, 100),
            benefitsSatisfaction: parseAndClampOptional(row.benefitsSatisfaction, 1, 100),
            managementSatisfaction: parseAndClampOptional(row.managementSatisfaction, 1, 100),
            trainingSatisfaction: parseAndClampOptional(row.trainingSatisfaction, 1, 100),
            managerId: row.managerId && String(row.managerId).trim() ? String(row.managerId).trim() : undefined,
            trainingCompleted: parseInt(row.trainingCompleted, 10) || 0,
            trainingTotal: parseInt(row.trainingTotal, 10) || 8,
            successionStatus: ['Ready Now', 'Ready in 1-2 Years', 'Future Potential', 'Not Assessed'].includes(row.successionStatus) ? row.successionStatus : 'Not Assessed',
            bonus: parseOptionalNumber(row.bonus),
            lastRaiseAmount: parseOptionalNumber(row.lastRaiseAmount),
            hasGrievance: String(row.hasGrievance).toLowerCase() === 'true',
            weeklyHours: parseOptionalNumber(row.weeklyHours),
            organizationId,
        };
    };

    const resetState = useCallback(() => {
        setStep('select');
        setFileName(null);
        setErrorRows([]);
        setValidRows([]);
        setUploadSummary(null);
        setIsDragActive(false);
        setIsFixingManually(false);
        setRowsToFix([]);
    }, []);

    const processFile = useCallback((file: File) => {
        setFileName(file.name);
        setUploadedFile(file);
        Papa.parse<Record<string, any>>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const newRecordsCount = results.data.length;
                if (currentOrgHeadcount + newRecordsCount > currentOrgHeadcountLimit) {
                    const errorMessage = `Headcount limit exceeded. Your plan allows for ${currentOrgHeadcountLimit} employees. You currently have ${currentOrgHeadcount}, and this upload would add ${newRecordsCount}, for a total of ${currentOrgHeadcount + newRecordsCount}. Please upgrade your plan or reduce the number of records.`;
                    setErrorRows([{ rowIndex: 0, rowData: {}, errors: [{ field: 'File', message: errorMessage }] }]);
                    setStep('validate');
                    return;
                }

                if (!results.meta.fields || REQUIRED_FIELDS.some(f => !results.meta.fields!.includes(f))) {
                    setErrorRows([{
                        rowIndex: 0,
                        rowData: {},
                        errors: [{ field: 'File', message: `CSV is missing required columns. Required: ${REQUIRED_FIELDS.join(', ')}.` }]
                    }]);
                    setStep('validate');
                    return;
                }

                const errors: ErrorRow[] = [];
                const valids: Employee[] = [];
                const allIdsInFile = new Set<string>();

                results.data.forEach((row, index) => {
                    const validationErrors = validateRow(row, index, allIdsInFile);
                    if (validationErrors.length > 0) {
                        errors.push({ rowIndex: index + 2, errors: validationErrors, rowData: row });
                    } else {
                        valids.push(cleanRow(row));
                    }
                });
                
                setErrorRows(errors);
                setValidRows(valids);
                setStep('validate');
            },
            error: (err: Error) => {
                setErrorRows([{
                    rowIndex: 0,
                    rowData: {},
                    errors: [{ field: 'File', message: `Parsing error: ${err.message}` }]
                }]);
                setStep('validate');
            }
        });
    }, [organizationId, currentOrgHeadcount, currentOrgHeadcountLimit]);
    
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            processFile(file);
        }
        event.target.value = '';
    }, [processFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    }, []);
    
    const handleUpload = async () => {
        if (!uploadedFile) {
            addNotification({
                title: 'Error',
                message: 'No file to upload',
                type: 'error',
            });
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadApi.uploadEmployees(uploadedFile);
            if (response.success && response.data) {
                const { created, failed, errors } = response.data;
                setUploadSummary({ uploaded: created, skipped: failed, fixed: 0 });
                setStep('complete');
                addNotification({
                    title: 'Upload Successful',
                    message: `Successfully uploaded ${created} employee records. ${failed > 0 ? `${failed} failed.` : ''}`,
                    type: 'success',
                });
                // Refresh employee data
                if (onComplete) {
                    // Trigger data refresh
                    window.location.reload();
                }
            } else {
                addNotification({
                    title: 'Upload Failed',
                    message: response.error || 'Failed to upload employees',
                    type: 'error',
                });
            }
        } catch (error: any) {
            addNotification({
                title: 'Upload Error',
                message: error.message || 'An error occurred during upload',
                type: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleAutoFixAndUpload = async () => {
        // For auto-fix, we still need to upload the file
        // The backend will handle validation
        if (!uploadedFile) {
            addNotification({
                title: 'Error',
                message: 'No file to upload',
                type: 'error',
            });
            return;
        }

        setIsUploading(true);
        try {
            const response = await uploadApi.uploadEmployees(uploadedFile);
            if (response.success && response.data) {
                const { created, failed, errors } = response.data;
                setUploadSummary({ uploaded: created, skipped: failed, fixed: errorRows.length });
                setStep('complete');
                addNotification({
                    title: 'Upload Successful',
                    message: `Uploaded ${created} records. ${failed > 0 ? `${failed} failed.` : ''}`,
                    type: 'success',
                });
                window.location.reload();
            } else {
                addNotification({
                    title: 'Upload Failed',
                    message: response.error || 'Failed to upload employees',
                    type: 'error',
                });
            }
        } catch (error: any) {
            addNotification({
                title: 'Upload Error',
                message: error.message || 'An error occurred during upload',
                type: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleSkipAndUpload = async () => {
        // Upload only valid rows - create a new CSV with only valid data
        if (!uploadedFile || validRows.length === 0) {
            addNotification({
                title: 'Error',
                message: 'No valid data to upload',
                type: 'error',
            });
            return;
        }

        // Create a new CSV with only valid rows
        const csvContent = Papa.unparse(validRows.map(row => ({
            employeeId: row.id,
            name: row.name,
            department: row.department,
            jobTitle: row.jobTitle,
            location: row.location,
            hireDate: row.hireDate,
            gender: row.gender,
        })));
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const newFile = new File([blob], uploadedFile.name, { type: 'text/csv' });

        setIsUploading(true);
        try {
            const response = await uploadApi.uploadEmployees(newFile);
            if (response.success && response.data) {
                const { created, failed } = response.data;
                const skippedCount = errorRows.length;
                setUploadSummary({ uploaded: created, skipped: skippedCount, fixed: 0 });
                setStep('complete');
                addNotification({
                    title: 'Upload Partially Successful',
                    message: `Uploaded ${created} valid records. ${skippedCount} rows with errors were skipped.`,
                    type: 'warning',
                });
                window.location.reload();
            } else {
                addNotification({
                    title: 'Upload Failed',
                    message: response.error || 'Failed to upload employees',
                    type: 'error',
                });
            }
        } catch (error: any) {
            addNotification({
                title: 'Upload Error',
                message: error.message || 'An error occurred during upload',
                type: 'error',
            });
        } finally {
            setIsUploading(false);
        }
    };
    
    const handleManualFixChange = (rowIndex: number, field: string, value: string) => {
        setRowsToFix(prev => prev.map(row => 
            row.rowIndex === rowIndex
                ? { ...row, rowData: { ...row.rowData, [field]: value } }
                : row
        ));
    };

    const handleSkipRowInModal = (rowIndex: number) => {
        setRowsToFix(prev => prev.filter(row => row.rowIndex !== rowIndex));
    };

    const handleFinalizeManualFix = async () => {
        const stillErrored: ErrorRow[] = [];
        const newlyValid: Employee[] = [];
        const allIds: Set<string> = new Set(validRows.map(r => r.id));

        rowsToFix.forEach(row => {
            const validationErrors = validateRow(row.rowData, row.rowIndex - 2, allIds);
            if (validationErrors.length > 0) {
                stillErrored.push({ ...row, errors: validationErrors });
            } else {
                newlyValid.push(cleanRow(row.rowData));
            }
        });

        if (stillErrored.length > 0) {
            setRowsToFix(stillErrored);
            addNotification({
                title: 'Validation Failed',
                message: `${stillErrored.length} rows still have errors. Please correct them before uploading.`,
                type: 'error',
            });
        } else {
            // Upload to backend
            const finalData = [...validRows, ...newlyValid];
            if (!uploadedFile) {
                addNotification({
                    title: 'Error',
                    message: 'No file to upload',
                    type: 'error',
                });
                return;
            }

            // Create CSV with final data
            const csvContent = Papa.unparse(finalData.map(row => ({
                employeeId: row.id,
                name: row.name,
                department: row.department,
                jobTitle: row.jobTitle,
                location: row.location,
                hireDate: row.hireDate,
                gender: row.gender,
            })));
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const newFile = new File([blob], uploadedFile.name, { type: 'text/csv' });

            setIsUploading(true);
            try {
                const response = await uploadApi.uploadEmployees(newFile);
                if (response.success && response.data) {
                    const { created, failed } = response.data;
                    setUploadSummary({ uploaded: created, skipped: errorRows.length - newlyValid.length, fixed: newlyValid.length });
                    setStep('complete');
                    setIsFixingManually(false);
                    addNotification({
                        title: 'Upload Successful',
                        message: `Uploaded ${created} records (${validRows.length} original + ${newlyValid.length} fixed).`,
                        type: 'success',
                    });
                    window.location.reload();
                } else {
                    addNotification({
                        title: 'Upload Failed',
                        message: response.error || 'Failed to upload employees',
                        type: 'error',
                    });
                }
            } catch (error: any) {
                addNotification({
                    title: 'Upload Error',
                    message: error.message || 'An error occurred during upload',
                    type: 'error',
                });
            } finally {
                setIsUploading(false);
            }
        }
    };


    if (isFixingManually) {
        return (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <CardHeader className="flex-shrink-0">
                        <CardTitle>Manual Fix Required</CardTitle>
                        <p className="text-sm text-text-secondary">Correct the errors below or skip rows. Fields with errors are highlighted.</p>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-4">
                        {rowsToFix.map((errorRow) => {
                            const errorFields = new Set(errorRow.errors.map(e => e.field));
                            return (
                                <div key={errorRow.rowIndex} className="p-3 bg-background rounded-lg border border-border">
                                    <div className="flex justify-between items-center mb-2">
                                        <h5 className="font-bold text-text-primary">Row {errorRow.rowIndex}</h5>
                                        <Button size="sm" variant="ghost" onClick={() => handleSkipRowInModal(errorRow.rowIndex)} className="gap-1 text-red-400"><Trash2 className="h-3 w-3" /> Skip Row</Button>
                                    </div>
                                    <p className="text-xs text-yellow-400 mb-2">{errorRow.errors.map(e => e.message).join(' ')}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                        {allFileHeaders.map(header => (
                                            <div key={header}>
                                                <label className="block text-xs font-medium text-text-secondary mb-0.5">{header}</label>
                                                <input
                                                    type="text"
                                                    value={errorRow.rowData[header] || ''}
                                                    onChange={(e) => handleManualFixChange(errorRow.rowIndex, header, e.target.value)}
                                                    className={`w-full bg-card border rounded-md px-2 py-1 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none ${errorFields.has(header) ? 'border-red-500' : 'border-border'}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </CardContent>
                    <div className="p-4 flex-shrink-0 border-t border-border flex justify-end gap-2">
                         <Button variant="secondary" onClick={() => setIsFixingManually(false)}>Cancel</Button>
                         <Button onClick={handleFinalizeManualFix} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                `Finish & Upload (${rowsToFix.length} remaining)`
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }
    
    if (step === 'select') {
        return (
            <div ref={componentRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                 className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${isDragActive ? 'border-primary-500 bg-primary-900/20' : ''}`}>
                <UploadCloud className="mx-auto h-10 w-10 text-text-secondary" />
                <p className="mt-2 text-sm font-medium text-text-primary">Drag & drop CSV here or</p>
                <Button as="label" htmlFor="employee-upload-multi" variant="secondary" size="sm" className="mt-2 cursor-pointer">
                    Select Employee Data
                </Button>
                <input id="employee-upload-multi" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
            </div>
        );
    }
    
    if (step === 'validate') {
        return (
            <div ref={componentRef} className="p-4 bg-background border border-border rounded-lg space-y-4">
                <h4 className="font-semibold text-text-primary">Validation Results for <span className="text-primary-400">{fileName}</span></h4>
                {errorRows.length > 0 ? (
                    <div>
                        <div className="flex items-center gap-2 p-3 bg-yellow-900/50 rounded-md text-yellow-300">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="text-sm font-semibold">Found {validRows.length} valid row(s) and {errorRows.length} row(s) with errors.</p>
                        </div>
                        <div className="mt-3 max-h-40 overflow-y-auto space-y-2 text-xs p-2 border border-border rounded-md">
                            {errorRows.slice(0, 10).map((err, i) => (
                                <div key={i}>
                                    <p className="font-bold text-text-primary">Row {err.rowIndex}:</p>
                                    <ul className="list-disc pl-5 text-text-secondary">
                                        {err.errors.map((e, j) => <li key={j}><strong>{e.field}:</strong> {e.message}</li>)}
                                    </ul>
                                </div>
                            ))}
                             {errorRows.length > 10 && <p className="text-text-secondary mt-2">...and {errorRows.length - 10} more errors.</p>}
                        </div>
                        <p className="text-xs text-text-secondary mt-3">You can attempt to auto-fix these issues, fix them manually, skip the rows with errors, or cancel and upload a corrected file.</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                            <Button onClick={handleAutoFixAndUpload} disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Auto-Fix & Upload'
                                )}
                            </Button>
                            <Button onClick={() => { setRowsToFix(errorRows); setIsFixingManually(true); }} variant="secondary" className="gap-2" disabled={isUploading}>
                                <Edit className="h-4 w-4"/>Manual Fix
                            </Button>
                            <Button onClick={handleSkipAndUpload} variant="secondary" disabled={isUploading}>
                                {isUploading ? 'Uploading...' : 'Skip Errors & Upload Valid'}
                            </Button>
                            <Button onClick={resetState} variant="ghost">Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2 p-3 bg-green-900/50 rounded-md text-green-300">
                            <CheckCircle className="h-5 w-5" />
                            <p className="text-sm font-semibold">All {validRows.length} rows are valid and ready to be uploaded.</p>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleUpload} disabled={isUploading}>
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload Data'
                                )}
                            </Button>
                            <Button onClick={resetState} variant="ghost">Cancel</Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
    
    if (step === 'complete' && uploadSummary) {
        return (
            <div ref={componentRef} className="p-4 bg-background border border-border rounded-lg space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-900/50 rounded-md text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <p className="text-sm font-semibold">Upload Complete!</p>
                </div>
                <ul className="text-sm text-text-secondary list-disc pl-5">
                    <li>{uploadSummary.uploaded} records were successfully loaded.</li>
                    {uploadSummary.fixed > 0 && <li>{uploadSummary.fixed} records were manually fixed.</li>}
                    {uploadSummary.skipped > 0 && <li className="text-yellow-400">{uploadSummary.skipped} rows with errors were skipped.</li>}
                </ul>
                <Button onClick={resetState} variant="secondary">Upload Another File</Button>
            </div>
        );
    }

    return null;
};

export default DataUpload;