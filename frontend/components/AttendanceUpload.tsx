import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';
import type { AttendanceRecord } from '../types';
import Button from './ui/Button';
import { CheckCircle, AlertTriangle, UploadCloud, X, Edit, Trash2, Loader2 } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import { uploadApi } from '../services/api/uploadApi';

interface AttendanceUploadProps {
  onComplete: (data: AttendanceRecord[]) => void;
  organizationId: string;
}

type RowError = { rowIndex: number; errors: string[]; rowData: Record<string, any> };

const REQUIRED_FIELDS = ['employeeId', 'date', 'status'];
const VALID_STATUSES = ['Present', 'Unscheduled Absence', 'PTO', 'Sick Leave'];
const VALID_STATUSES_SET = new Set(VALID_STATUSES);

const smartParseDate = (dateInput: any): string | null => {
    if (dateInput === null || dateInput === undefined || String(dateInput).trim() === '') return null;

    if (dateInput instanceof Date) {
        if (isNaN(dateInput.getTime())) return null;
        return `${dateInput.getFullYear()}-${String(dateInput.getMonth() + 1).padStart(2, '0')}-${String(dateInput.getDate()).padStart(2, '0')}`;
    }

    if (typeof dateInput === 'string') {
        const trimmed = dateInput.trim();
        if (!trimmed) return null;

        let date: Date | null = null;
        let parts: string[];

        // YYYY-MM-DD or YYYY/MM/DD
        if (/^\d{4}[-\/]\d{2}[-\/]\d{2}/.test(trimmed)) {
            parts = trimmed.split(/[-\/]/);
            date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        }
        // DD-MM-YY or DD-MM-YYYY or DD/MM/YY or DD/MM/YYYY
        else if (/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2}|\d{4})$/.test(trimmed)) {
            parts = trimmed.split(/[-\/]/);
            const d = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            let y = parseInt(parts[2], 10);
            if (y < 100) {
                y += (y > 50 ? 1900 : 2000);
            }
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
    
    return null;
};


const AttendanceUpload: React.FC<AttendanceUploadProps> = ({ onComplete, organizationId }) => {
  const { employeeData } = useData();
  const { addNotification } = useNotifications();

  const [step, setStep] = useState<'select' | 'validate' | 'complete'>('select');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorRows, setErrorRows] = useState<RowError[]>([]);
  const [validRows, setValidRows] = useState<AttendanceRecord[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{ uploaded: number; skipped: number } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFixingManually, setIsFixingManually] = useState(false);
  const [rowsToFix, setRowsToFix] = useState<RowError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const employeeIdSet = useMemo(() => new Set(employeeData.map(e => e.id)), [employeeData]);

  useEffect(() => {
    if (step === 'validate' || step === 'complete') {
        setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  }, [step]);

  const validateAttendanceRow = useCallback((row: Record<string, any>): string[] => {
    const errors: string[] = [];
    if (!row.employeeId) errors.push("'employeeId' is missing.");
    else if (!employeeIdSet.has(String(row.employeeId))) errors.push(`Employee ID '${row.employeeId}' does not exist.`);
    
    if (!row.date) {
        errors.push("'date' is missing.");
    } else if (smartParseDate(row.date) === null) {
        errors.push(`'date' format '${row.date}' is invalid or unrecognized.`);
    }

    if (!row.status) errors.push("'status' is missing.");
    else if (!VALID_STATUSES_SET.has(row.status)) errors.push(`'status' '${row.status}' is invalid.`);
    return errors;
  }, [employeeIdSet]);

  const resetState = useCallback(() => {
    setStep('select'); setFileName(null); setErrorRows([]); setValidRows([]);
    setUploadSummary(null); setIsFixingManually(false); setRowsToFix([]);
  }, []);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setUploadedFile(file);
    Papa.parse<Record<string, any>>(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || REQUIRED_FIELDS.some(f => !results.meta.fields!.includes(f))) {
          setErrorRows([{ rowIndex: 0, rowData: {}, errors: [`CSV is missing required columns. Required: ${REQUIRED_FIELDS.join(', ')}.`] }]);
          setStep('validate'); return;
        }
        const errors: RowError[] = []; const valids: AttendanceRecord[] = [];
        results.data.forEach((row, index) => {
          const currentErrors = validateAttendanceRow(row);
          if (currentErrors.length > 0) {
            errors.push({ rowIndex: index + 2, errors: currentErrors, rowData: row });
          } else {
            const formattedDate = smartParseDate(row.date);
            valids.push({ 
                employeeId: String(row.employeeId), 
                date: formattedDate!, 
                status: row.status as any,
                organizationId,
            });
          }
        });
        setErrorRows(errors); setValidRows(valids); setStep('validate');
      },
      error: (err: Error) => { setErrorRows([{ rowIndex: 0, rowData: {}, errors: [`Parsing error: ${err.message}`] }]); setStep('validate'); }
    });
  }, [validateAttendanceRow, organizationId]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    resetState(); const file = event.target.files?.[0]; if (file) processFile(file); event.target.value = '';
  }, [processFile, resetState]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragActive(false); resetState();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]);
  }, [processFile, resetState]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
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
      const response = await uploadApi.uploadAttendance(uploadedFile);
      if (response.success && response.data) {
        const { created, failed } = response.data;
        setUploadSummary({ uploaded: created, skipped: failed });
        setStep('complete');
        addNotification({
          title: 'Upload Successful',
          message: `Successfully uploaded ${created} attendance records. ${failed > 0 ? `${failed} failed.` : ''}`,
          type: 'success',
        });
        window.location.reload();
      } else {
        addNotification({
          title: 'Upload Failed',
          message: response.error || 'Failed to upload attendance',
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
    setRowsToFix(prev => prev.map(row => row.rowIndex === rowIndex ? { ...row, rowData: { ...row.rowData, [field]: value } } : row));
  };

  const handleSkipRowInModal = (rowIndex: number) => {
    setRowsToFix(prev => prev.filter(row => row.rowIndex !== rowIndex));
  };

  const handleFinalizeManualFix = async () => {
    const stillErrored: RowError[] = []; const newlyValid: AttendanceRecord[] = [];
    rowsToFix.forEach(row => {
        const validationErrors = validateAttendanceRow(row.rowData);
        if (validationErrors.length > 0) {
            stillErrored.push({ ...row, errors: validationErrors });
        } else {
            const formattedDate = smartParseDate(row.rowData.date);
            newlyValid.push({ 
                employeeId: String(row.rowData.employeeId), 
                date: formattedDate!, 
                status: row.rowData.status as any,
                organizationId,
            });
        }
    });
    if (stillErrored.length > 0) {
        setRowsToFix(stillErrored);
        addNotification({ title: 'Validation Failed', message: `${stillErrored.length} rows still have errors.`, type: 'error' });
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
          employeeId: row.employeeId,
          date: row.date,
          status: row.status,
        })));
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const newFile = new File([blob], uploadedFile.name, { type: 'text/csv' });

        setIsUploading(true);
        try {
          const response = await uploadApi.uploadAttendance(newFile);
          if (response.success && response.data) {
            const { created, failed } = response.data;
            setUploadSummary({ uploaded: created, skipped: errorRows.length - newlyValid.length });
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
              message: response.error || 'Failed to upload attendance',
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


  if (employeeData.length === 0) return <div className="p-4 bg-background border-2 border-dashed border-border rounded-lg text-center text-sm text-text-secondary">Please load employee data first.</div>;

  if (isFixingManually) {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <CardHeader><CardTitle>Manual Fix: Attendance</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4">
                    {rowsToFix.map((errorRow) => (
                        <div key={errorRow.rowIndex} className="p-3 bg-background rounded-lg border border-border">
                            <div className="flex justify-between items-center mb-2">
                                <h5 className="font-bold text-text-primary">Row {errorRow.rowIndex}</h5>
                                <Button size="sm" variant="ghost" onClick={() => handleSkipRowInModal(errorRow.rowIndex)} className="gap-1 text-red-400"><Trash2 className="h-3 w-3" /> Skip</Button>
                            </div>
                            <p className="text-xs text-yellow-400 mb-2">{errorRow.errors.join(' ')}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {REQUIRED_FIELDS.map(header => {
                                    const hasError = errorRow.errors.some(e => e.toLowerCase().includes(header.toLowerCase()));
                                    if (header === 'status') {
                                        return (
                                            <div key={header}>
                                                <label className="block text-xs font-medium text-text-secondary mb-0.5">{header}</label>
                                                <select value={errorRow.rowData[header] || ''} onChange={(e) => handleManualFixChange(errorRow.rowIndex, header, e.target.value)} className={`w-full bg-card border rounded-md px-2 py-1 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none ${hasError ? 'border-red-500' : 'border-border'}`}>
                                                    <option value="" disabled>Select status</option>
                                                    {VALID_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                        );
                                    }
                                    return (
                                        <div key={header}>
                                            <label className="block text-xs font-medium text-text-secondary mb-0.5">{header}</label>
                                            <input type={header === 'date' ? 'date' : 'text'} value={errorRow.rowData[header] || ''} onChange={(e) => handleManualFixChange(errorRow.rowIndex, header, e.target.value)} className={`w-full bg-card border rounded-md px-2 py-1 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none ${hasError ? 'border-red-500' : 'border-border'}`}/>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
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
                        `Finish & Upload (${rowsToFix.length} left)`
                      )}
                    </Button>
                </div>
            </Card>
        </div>
    );
  }

  if (step === 'select') return (
    <div ref={componentRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${isDragActive ? 'border-primary-500 bg-primary-900/20' : ''}`}>
        <UploadCloud className="mx-auto h-10 w-10 text-text-secondary" />
        <p className="mt-2 text-sm font-medium text-text-primary">Drag & drop CSV here or</p>
        <Button as="label" htmlFor="attendance-upload-multi" variant="secondary" size="sm" className="mt-2 cursor-pointer">Select Attendance CSV</Button>
        <input id="attendance-upload-multi" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
    </div>
  );

  if (step === 'validate') return (
    <div ref={componentRef} className="p-4 bg-background border border-border rounded-lg space-y-4">
        <h4 className="font-semibold text-text-primary">Validation for <span className="text-primary-400">{fileName}</span></h4>
        {errorRows.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 p-3 bg-yellow-900/50 rounded-md text-yellow-300">
              <AlertTriangle className="h-5 w-5" /><p className="text-sm font-semibold">Found {validRows.length} valid row(s) and {errorRows.length} row(s) with errors.</p>
            </div>
            <div className="mt-3 max-h-40 overflow-y-auto space-y-2 text-xs p-2 border border-border rounded-md">
              {errorRows.slice(0, 10).map((err, i) => (<div key={i}><p className="font-bold text-text-primary">Row {err.rowIndex}: <span className="text-text-secondary font-normal">{err.errors.join(', ')}</span></p></div>))}
              {errorRows.length > 10 && <p className="text-text-secondary mt-2">...and {errorRows.length - 10} more errors.</p>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={handleUpload} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Valid & Skip Errors'
                  )}
                </Button>
                <Button onClick={() => { setRowsToFix(errorRows); setIsFixingManually(true); }} variant="secondary" className="gap-2" disabled={isUploading}>
                  <Edit className="h-4 w-4"/>Manual Fix
                </Button>
                <Button onClick={resetState} variant="ghost">Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 p-3 bg-green-900/50 rounded-md text-green-300">
              <CheckCircle className="h-5 w-5" /><p className="text-sm font-semibold">All {validRows.length} rows are valid.</p>
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
              <Button onClick={resetState} variant="ghost" disabled={isUploading}>Cancel</Button>
            </div>
          </div>
        )}
    </div>
  );

  if (step === 'complete' && uploadSummary) return (
    <div ref={componentRef} className="p-4 bg-background border border-border rounded-lg space-y-3">
      <div className="flex items-center gap-2 p-3 bg-green-900/50 rounded-md text-green-300">
        <CheckCircle className="h-5 w-5" /><p className="text-sm font-semibold">Upload Complete!</p>
      </div>
      <ul className="text-sm text-text-secondary list-disc pl-5">
        <li>{uploadSummary.uploaded} records were successfully loaded.</li>
        {uploadSummary.skipped > 0 && <li className="text-yellow-400">{uploadSummary.skipped} rows with errors were skipped.</li>}
      </ul>
      <Button onClick={resetState} variant="secondary">Upload Another File</Button>
    </div>
  );

  return null;
};

export default AttendanceUpload;