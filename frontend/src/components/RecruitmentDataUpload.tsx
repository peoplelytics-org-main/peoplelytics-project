
import React, { useState, useCallback, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { useNotifications } from '../contexts/NotificationContext';
import type { JobPosition, RecruitmentFunnel } from '../types';
import Button from './ui/Button';
import { CheckCircle, AlertTriangle, UploadCloud, X, Edit, Trash2 } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';

interface RecruitmentDataUploadProps {
  onComplete: (data: { positions: JobPosition[], funnels: RecruitmentFunnel[] }) => void;
  // FIX: Added organizationId to props to associate uploaded data with an organization.
  organizationId: string;
}

type RowError = { rowIndex: number; errors: string[]; rowData: Record<string, any> };

const REQUIRED_FIELDS = ['id', 'title', 'department', 'status', 'openDate'];
const FUNNEL_FIELDS = ['shortlisted', 'interviewed', 'offersExtended', 'offersAccepted', 'joined'];
const ALL_FIELDS = [...REQUIRED_FIELDS, 'closeDate', 'hiredEmployeeId', 'onHoldDate', 'heldBy', 'positionType', 'budgetStatus', ...FUNNEL_FIELDS];
const VALID_STATUSES = new Set(['Open', 'Closed', 'On Hold']);

const RecruitmentDataUpload: React.FC<RecruitmentDataUploadProps> = ({ onComplete, organizationId }) => {
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState<'select' | 'validate' | 'complete'>('select');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorRows, setErrorRows] = useState<RowError[]>([]);
  const [validData, setValidData] = useState<{ positions: JobPosition[], funnels: RecruitmentFunnel[] }>({ positions: [], funnels: [] });
  const [uploadSummary, setUploadSummary] = useState<{ uploaded: number; skipped: number } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFixingManually, setIsFixingManually] = useState(false);
  const [rowsToFix, setRowsToFix] = useState<RowError[]>([]);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const idSet = new Set<string>();

  useEffect(() => {
    if (step === 'validate' || step === 'complete') {
        setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  }, [step]);

  const validateRecruitmentRow = (row: Record<string, any>): string[] => {
    const errors: string[] = [];
    for (const field of REQUIRED_FIELDS) {
        if (row[field] === undefined || row[field] === null || String(row[field]).trim() === '') {
            errors.push(`Required field '${field}' is missing.`);
        }
    }
    if (errors.length > 0) return errors; // Stop if required fields are missing

    if (idSet.has(row.id)) errors.push(`Duplicate Position ID '${row.id}' found.`);
    else idSet.add(row.id);
    if (!VALID_STATUSES.has(row.status)) errors.push(`Invalid status '${row.status}'.`);
    const checkDate = (fieldName: string) => {
        if (row[fieldName] && (isNaN(new Date(row[fieldName]).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(row[fieldName]))) {
            errors.push(`Invalid date format for '${fieldName}'. Use YYYY-MM-DD.`);
        }
    };
    checkDate('openDate'); checkDate('closeDate'); checkDate('onHoldDate');
    for (const field of FUNNEL_FIELDS) {
        const value = row[field];
        if (value !== undefined && value !== null && String(value).trim() !== '' && isNaN(Number(value))) {
            errors.push(`Field '${field}' must be a number if provided.`);
        }
    }
    return errors;
  };


  const resetState = useCallback(() => {
    setStep('select'); setFileName(null); setErrorRows([]); setValidData({ positions: [], funnels: [] });
    setUploadSummary(null); setIsFixingManually(false); setRowsToFix([]);
  }, []);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, any>>(file, {
      header: true, skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || REQUIRED_FIELDS.some(f => !results.meta.fields!.includes(f))) {
          setErrorRows([{ rowIndex: 0, rowData: {}, errors: [`CSV is missing required columns. Required: ${REQUIRED_FIELDS.join(', ')}.`] }]);
          setStep('validate'); return;
        }
        const errors: RowError[] = []; const valids = { positions: [] as JobPosition[], funnels: [] as RecruitmentFunnel[] };
        idSet.clear();

        results.data.forEach((row, index) => {
          const currentErrors = validateRecruitmentRow(row);
          if (currentErrors.length > 0) {
            errors.push({ rowIndex: index + 2, errors: currentErrors, rowData: row });
          } else {
            // FIX: Add missing organizationId to satisfy the JobPosition type.
            valids.positions.push({
              id: row.id, title: row.title, department: row.department, status: row.status, openDate: row.openDate,
              closeDate: row.closeDate || undefined, hiredEmployeeId: row.hiredEmployeeId || undefined,
              onHoldDate: row.onHoldDate || undefined, heldBy: row.heldBy || undefined,
              positionType: row.positionType || 'New', budgetStatus: row.budgetStatus || 'Budgeted',
              organizationId,
            });
            // FIX: Add missing organizationId to satisfy the RecruitmentFunnel type.
            valids.funnels.push({
              positionId: row.id, shortlisted: Number(row.shortlisted) || 0, interviewed: Number(row.interviewed) || 0,
              offersExtended: Number(row.offersExtended) || 0, offersAccepted: Number(row.offersAccepted) || 0,
              joined: Number(row.joined) || 0,
              organizationId,
            });
          }
        });
        setErrorRows(errors); setValidData(valids); setStep('validate');
      },
      error: (err: Error) => { setErrorRows([{ rowIndex: 0, rowData: {}, errors: [`Parsing error: ${err.message}`] }]); setStep('validate'); }
    });
  }, [organizationId]);

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

  const handleUpload = () => {
    onComplete(validData);
    setUploadSummary({ uploaded: validData.positions.length, skipped: errorRows.length });
    setStep('complete');
    addNotification({ title: 'Upload Successful', message: `Successfully loaded ${validData.positions.length} recruitment records.`, type: 'success' });
  };
  
  const handleManualFixChange = (rowIndex: number, field: string, value: string) => {
    setRowsToFix(prev => prev.map(row => row.rowIndex === rowIndex ? { ...row, rowData: { ...row.rowData, [field]: value } } : row));
  };

  const handleSkipRowInModal = (rowIndex: number) => {
    setRowsToFix(prev => prev.filter(row => row.rowIndex !== rowIndex));
  };

  const handleFinalizeManualFix = () => {
    const stillErrored: RowError[] = []; const newlyValid = { positions: [] as JobPosition[], funnels: [] as RecruitmentFunnel[] };
    idSet.clear();
    validData.positions.forEach(p => idSet.add(p.id));

    rowsToFix.forEach(row => {
        const validationErrors = validateRecruitmentRow(row.rowData);
        if (validationErrors.length > 0) {
            stillErrored.push({ ...row, errors: validationErrors });
        } else {
            // FIX: Add missing organizationId to satisfy the JobPosition type.
            newlyValid.positions.push({
                id: row.rowData.id, title: row.rowData.title, department: row.rowData.department, status: row.rowData.status, openDate: row.rowData.openDate,
                closeDate: row.rowData.closeDate || undefined, hiredEmployeeId: row.rowData.hiredEmployeeId || undefined, onHoldDate: row.rowData.onHoldDate || undefined,
                heldBy: row.rowData.heldBy || undefined, positionType: row.rowData.positionType || 'New', budgetStatus: row.rowData.budgetStatus || 'Budgeted',
                organizationId,
            });
            // FIX: Add missing organizationId to satisfy the RecruitmentFunnel type.
            newlyValid.funnels.push({
                positionId: row.rowData.id, shortlisted: Number(row.rowData.shortlisted) || 0, interviewed: Number(row.rowData.interviewed) || 0,
                offersExtended: Number(row.rowData.offersExtended) || 0, offersAccepted: Number(row.rowData.offersAccepted) || 0, joined: Number(row.rowData.joined) || 0,
                organizationId,
            });
        }
    });

    if (stillErrored.length > 0) {
        setRowsToFix(stillErrored);
        addNotification({ title: 'Validation Failed', message: `${stillErrored.length} rows still have errors.`, type: 'error' });
    } else {
        const finalData = {
            positions: [...validData.positions, ...newlyValid.positions],
            funnels: [...validData.funnels, ...newlyValid.funnels]
        };
        onComplete(finalData);
        setUploadSummary({ uploaded: finalData.positions.length, skipped: errorRows.length - newlyValid.positions.length });
        setStep('complete');
        setIsFixingManually(false);
        addNotification({ title: 'Upload Successful', message: `Loaded ${validData.positions.length} original and ${newlyValid.positions.length} fixed records.`, type: 'success' });
    }
  };

  if (isFixingManually) {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <CardHeader><CardTitle>Manual Fix: Recruitment Data</CardTitle></CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4">
                    {rowsToFix.map((errorRow) => {
                        const errorFields = new Set(errorRow.errors.map(e => e.split("'")[1]));
                        return (
                            <div key={errorRow.rowIndex} className="p-3 bg-background rounded-lg border border-border">
                                <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-bold text-text-primary">Row {errorRow.rowIndex}</h5>
                                    <Button size="sm" variant="ghost" onClick={() => handleSkipRowInModal(errorRow.rowIndex)} className="gap-1 text-red-400"><Trash2 className="h-3 w-3" /> Skip</Button>
                                </div>
                                <p className="text-xs text-yellow-400 mb-2">{errorRow.errors.join(' ')}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {ALL_FIELDS.map(header => (
                                        <div key={header}>
                                            <label className="block text-xs font-medium text-text-secondary mb-0.5">{header}</label>
                                            <input type="text" value={errorRow.rowData[header] || ''} onChange={(e) => handleManualFixChange(errorRow.rowIndex, header, e.target.value)} className={`w-full bg-card border rounded-md px-2 py-1 text-sm text-text-primary focus:ring-2 focus:ring-primary-500 focus:outline-none ${errorFields.has(header) ? 'border-red-500' : 'border-border'}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
                <div className="p-4 flex-shrink-0 border-t border-border flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setIsFixingManually(false)}>Cancel</Button>
                    <Button onClick={handleFinalizeManualFix}>Finish & Upload ({rowsToFix.length} left)</Button>
                </div>
            </Card>
        </div>
    );
  }

  if (step === 'select') return (
    <div ref={componentRef} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors ${isDragActive ? 'border-primary-500 bg-primary-900/20' : ''}`}>
        <UploadCloud className="mx-auto h-10 w-10 text-text-secondary" />
        <p className="mt-2 text-sm font-medium text-text-primary">Drag & drop CSV here or</p>
        <Button as="label" htmlFor="recruitment-upload-multi" variant="secondary" size="sm" className="mt-2 cursor-pointer">Select Recruitment CSV</Button>
        <input id="recruitment-upload-multi" type="file" className="sr-only" accept=".csv" onChange={handleFileChange} />
    </div>
  );

  if (step === 'validate') return (
    <div ref={componentRef} className="p-4 bg-background border border-border rounded-lg space-y-4">
        <h4 className="font-semibold text-text-primary">Validation for <span className="text-primary-400">{fileName}</span></h4>
        {errorRows.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 p-3 bg-yellow-900/50 rounded-md text-yellow-300">
              <AlertTriangle className="h-5 w-5" /><p className="text-sm font-semibold">Found {validData.positions.length} valid row(s) and {errorRows.length} row(s) with errors.</p>
            </div>
            <div className="mt-3 max-h-40 overflow-y-auto space-y-2 text-xs p-2 border border-border rounded-md">
              {errorRows.slice(0, 10).map((err, i) => (<div key={i}><p className="font-bold text-text-primary">Row {err.rowIndex}: <span className="text-text-secondary font-normal">{err.errors.join(', ')}</span></p></div>))}
              {errorRows.length > 10 && <p className="text-text-secondary mt-2">...and {errorRows.length - 10} more errors.</p>}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={handleUpload}>Upload Valid & Skip Errors</Button>
                <Button onClick={() => { setRowsToFix(errorRows); setIsFixingManually(true); }} variant="secondary" className="gap-2"><Edit className="h-4 w-4"/>Manual Fix</Button>
                <Button onClick={resetState} variant="ghost">Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 p-3 bg-green-900/50 rounded-md text-green-300">
              <CheckCircle className="h-5 w-5" /><p className="text-sm font-semibold">All {validData.positions.length} rows are valid.</p>
            </div>
            <div className="flex gap-2 mt-4"><Button onClick={handleUpload}>Upload Data</Button><Button onClick={resetState} variant="ghost">Cancel</Button></div>
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

export default RecruitmentDataUpload;