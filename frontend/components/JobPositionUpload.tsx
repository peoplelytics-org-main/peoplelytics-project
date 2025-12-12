import React, { useState, useCallback, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import { useNotifications } from '../contexts/NotificationContext';
import type { JobPosition } from '../types';
import Button from './ui/Button';
import { CheckCircle, AlertTriangle, UploadCloud, X, Edit, Trash2, Loader2 } from 'lucide-react';
import Card, { CardContent, CardHeader, CardTitle } from './ui/Card';
import { jobPositionsApi } from '../services/api/jobPositionsApi';
import { mapFrontendJobPositionToBackend } from '../services/api/dataMappers';

interface JobPositionUploadProps {
  onComplete: (data: JobPosition[]) => void;
  organizationId: string;
}

type RowError = { rowIndex: number; errors: string[]; rowData: Record<string, any> };

const REQUIRED_FIELDS = ['id', 'title', 'department', 'status', 'openDate', 'positionType', 'budgetStatus'];
const VALID_STATUSES = new Set(['Open', 'Closed', 'On Hold']);
const VALID_POSITION_TYPES = new Set(['Replacement', 'New']);
const VALID_BUDGET_STATUSES = new Set(['Budgeted', 'Non-Budgeted']);

const JobPositionUpload: React.FC<JobPositionUploadProps> = ({ onComplete, organizationId }) => {
  const { addNotification } = useNotifications();
  
  const [step, setStep] = useState<'select' | 'validate' | 'complete'>('select');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorRows, setErrorRows] = useState<RowError[]>([]);
  const [validRows, setValidRows] = useState<JobPosition[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{ uploaded: number; skipped: number } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isFixingManually, setIsFixingManually] = useState(false);
  const [rowsToFix, setRowsToFix] = useState<RowError[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const idSet = new Set<string>();

  useEffect(() => {
    if (step === 'validate' || step === 'complete') {
        setTimeout(() => {
            componentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    }
  }, [step]);

  const validateJobPositionRow = (row: Record<string, any>): string[] => {
    const errors: string[] = [];
    
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        if (row[field] === undefined || row[field] === null || String(row[field]).trim() === '') {
            errors.push(`Required field '${field}' is missing.`);
        }
    }
    if (errors.length > 0) return errors; // Stop if required fields are missing

    // Check for duplicate IDs
    if (idSet.has(row.id)) {
      errors.push(`Duplicate Position ID '${row.id}' found.`);
    } else {
      idSet.add(row.id);
    }

    // Validate status
    if (!VALID_STATUSES.has(row.status)) {
      errors.push(`Invalid status '${row.status}'. Must be one of: ${Array.from(VALID_STATUSES).join(', ')}.`);
    }

    // Validate position type
    if (!VALID_POSITION_TYPES.has(row.positionType)) {
      errors.push(`Invalid positionType '${row.positionType}'. Must be one of: ${Array.from(VALID_POSITION_TYPES).join(', ')}.`);
    }

    // Validate budget status
    if (!VALID_BUDGET_STATUSES.has(row.budgetStatus)) {
      errors.push(`Invalid budgetStatus '${row.budgetStatus}'. Must be one of: ${Array.from(VALID_BUDGET_STATUSES).join(', ')}.`);
    }

    // Validate date formats
    const checkDate = (fieldName: string) => {
        if (row[fieldName] && (isNaN(new Date(row[fieldName]).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(row[fieldName]))) {
            errors.push(`Invalid date format for '${fieldName}'. Use YYYY-MM-DD.`);
        }
    };
    checkDate('openDate');
    if (row.closeDate) checkDate('closeDate');
    if (row.onHoldDate) checkDate('onHoldDate');

    return errors;
  };

  const resetState = useCallback(() => {
    setStep('select');
    setFileName(null);
    setErrorRows([]);
    setValidRows([]);
    setUploadSummary(null);
    setIsFixingManually(false);
    setRowsToFix([]);
    idSet.clear();
  }, []);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    Papa.parse<Record<string, any>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.meta.fields || REQUIRED_FIELDS.some(f => !results.meta.fields!.includes(f))) {
          setErrorRows([{
            rowIndex: 0,
            rowData: {},
            errors: [`CSV is missing required columns. Required: ${REQUIRED_FIELDS.join(', ')}.`]
          }]);
          setStep('validate');
          return;
        }

        const errors: RowError[] = [];
        const valids: JobPosition[] = [];
        idSet.clear();

        results.data.forEach((row, index) => {
          const currentErrors = validateJobPositionRow(row);
          if (currentErrors.length > 0) {
            errors.push({ rowIndex: index + 2, errors: currentErrors, rowData: row });
          } else {
            valids.push({
              id: String(row.id).trim(),
              title: String(row.title).trim(),
              department: String(row.department).trim(),
              status: row.status as 'Open' | 'Closed' | 'On Hold',
              openDate: String(row.openDate).trim(),
              closeDate: row.closeDate ? String(row.closeDate).trim() : undefined,
              hiredEmployeeId: row.hiredEmployeeId ? String(row.hiredEmployeeId).trim() : undefined,
              onHoldDate: row.onHoldDate ? String(row.onHoldDate).trim() : undefined,
              heldBy: row.heldBy ? String(row.heldBy).trim() : undefined,
              positionType: row.positionType as 'Replacement' | 'New',
              budgetStatus: row.budgetStatus as 'Budgeted' | 'Non-Budgeted',
              organizationId: organizationId,
            });
          }
        });

        setErrorRows(errors);
        setValidRows(valids);
        setStep('validate');
      },
      error: (error) => {
        addNotification({
          title: 'File Parse Error',
          message: `Failed to parse CSV file: ${error.message}`,
          type: 'error',
        });
      },
    });
  }, [organizationId, addNotification]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        addNotification({
          title: 'Invalid File Type',
          message: 'Please select a CSV file.',
          type: 'error',
        });
        return;
      }
      resetState();
      processFile(file);
    }
  }, [processFile, resetState, addNotification]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        addNotification({
          title: 'Invalid File Type',
          message: 'Please drop a CSV file.',
          type: 'error',
        });
        return;
      }
      resetState();
      processFile(file);
    }
  }, [processFile, resetState, addNotification]);

  const handleFixManually = useCallback(() => {
    setIsFixingManually(true);
    setRowsToFix([...errorRows]);
  }, [errorRows]);

  const handleFixRow = useCallback((rowIndex: number, field: string, value: string) => {
    setRowsToFix(prev => prev.map(row => {
      if (row.rowIndex === rowIndex) {
        return {
          ...row,
          rowData: { ...row.rowData, [field]: value },
          errors: row.errors.filter(e => !e.includes(field)),
        };
      }
      return row;
    }));
  }, []);

  const handleApplyFixes = useCallback(() => {
    const stillErrored: RowError[] = [];
    const newlyValid: JobPosition[] = [];
    idSet.clear();

    rowsToFix.forEach(row => {
      const currentErrors = validateJobPositionRow(row.rowData);
      if (currentErrors.length > 0) {
        stillErrored.push({ ...row, errors: currentErrors });
      } else {
        newlyValid.push({
          id: String(row.rowData.id).trim(),
          title: String(row.rowData.title).trim(),
          department: String(row.rowData.department).trim(),
          status: row.rowData.status as 'Open' | 'Closed' | 'On Hold',
          openDate: String(row.rowData.openDate).trim(),
          closeDate: row.rowData.closeDate ? String(row.rowData.closeDate).trim() : undefined,
          hiredEmployeeId: row.rowData.hiredEmployeeId ? String(row.rowData.hiredEmployeeId).trim() : undefined,
          onHoldDate: row.rowData.onHoldDate ? String(row.rowData.onHoldDate).trim() : undefined,
          heldBy: row.rowData.heldBy ? String(row.rowData.heldBy).trim() : undefined,
          positionType: row.rowData.positionType as 'Replacement' | 'New',
          budgetStatus: row.rowData.budgetStatus as 'Budgeted' | 'Non-Budgeted',
          organizationId: organizationId,
        });
      }
    });

    setErrorRows(stillErrored);
    setValidRows(prev => [...prev, ...newlyValid]);
    setIsFixingManually(false);
    setRowsToFix([]);
  }, [rowsToFix, organizationId]);

  const handleUpload = useCallback(async () => {
    if (validRows.length === 0) {
      addNotification({
        title: 'No Valid Data',
        message: 'Please fix all errors before uploading.',
        type: 'error',
      });
      return;
    }

    setIsUploading(true);
    let uploaded = 0;
    let skipped = 0;

    try {
      for (const position of validRows) {
        try {
          const backendData = mapFrontendJobPositionToBackend(position);
          const response = await jobPositionsApi.create(backendData);
          
          if (response.success) {
            uploaded++;
          } else {
            skipped++;
            console.error(`Failed to upload position ${position.id}:`, response.error);
          }
        } catch (error: any) {
          skipped++;
          console.error(`Error uploading position ${position.id}:`, error);
        }
      }

      setUploadSummary({ uploaded, skipped });
      setStep('complete');
      
      if (uploaded > 0) {
        addNotification({
          title: 'Upload Complete',
          message: `Successfully uploaded ${uploaded} job position(s). ${skipped > 0 ? `${skipped} skipped.` : ''}`,
          type: 'success',
        });
        onComplete(validRows);
      } else {
        addNotification({
          title: 'Upload Failed',
          message: 'No job positions were uploaded. Please check the errors and try again.',
          type: 'error',
        });
      }
    } catch (error: any) {
      addNotification({
        title: 'Upload Error',
        message: `Failed to upload job positions: ${error.message}`,
        type: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  }, [validRows, onComplete, addNotification]);

  if (step === 'select') {
    return (
      <Card ref={componentRef}>
        <CardHeader>
          <CardTitle>Upload Job Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragActive ? 'border-primary-500 bg-primary-50' : 'border-border'
            }`}
          >
            <UploadCloud className="mx-auto h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary mb-4">
              Drag and drop a CSV file here, or click to select
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="job-position-upload"
            />
            <label htmlFor="job-position-upload">
              <Button as="span">Select CSV File</Button>
            </label>
            <p className="text-sm text-text-tertiary mt-4">
              Required columns: {REQUIRED_FIELDS.join(', ')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'validate') {
    return (
      <Card ref={componentRef}>
        <CardHeader>
          <CardTitle>Validate Job Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errorRows.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">
                      {errorRows.length} row(s) with errors
                    </span>
                  </div>
                  {!isFixingManually && (
                    <Button onClick={handleFixManually} variant="outline" size="sm">
                      Fix Manually
                    </Button>
                  )}
                </div>
                {!isFixingManually ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {errorRows.map((row) => (
                      <div key={row.rowIndex} className="text-sm text-red-700">
                        <strong>Row {row.rowIndex}:</strong> {row.errors.join(' ')}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rowsToFix.map((row) => (
                      <div key={row.rowIndex} className="border border-red-200 rounded p-3">
                        <div className="font-semibold mb-2">Row {row.rowIndex}</div>
                        <div className="space-y-2">
                          {Object.keys(row.rowData).map((field) => (
                            <div key={field}>
                              <label className="block text-sm font-medium mb-1">{field}</label>
                              <input
                                type="text"
                                value={row.rowData[field] || ''}
                                onChange={(e) => handleFixRow(row.rowIndex, field, e.target.value)}
                                className="w-full border rounded px-2 py-1 text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        {row.errors.length > 0 && (
                          <div className="text-sm text-red-600 mt-2">
                            {row.errors.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button onClick={handleApplyFixes} size="sm">Apply Fixes</Button>
                      <Button onClick={() => setIsFixingManually(false)} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {validRows.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    {validRows.length} valid row(s)
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={validRows.length === 0 || isUploading}
                isLoading={isUploading}
              >
                {isUploading ? 'Uploading...' : `Upload ${validRows.length} Position(s)`}
              </Button>
              <Button onClick={resetState} variant="outline">
                Start Over
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (step === 'complete') {
    return (
      <Card ref={componentRef}>
        <CardHeader>
          <CardTitle>Upload Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Upload Summary</span>
              </div>
              <div className="text-sm text-green-700">
                <p>Uploaded: {uploadSummary?.uploaded || 0}</p>
                {uploadSummary && uploadSummary.skipped > 0 && (
                  <p>Skipped: {uploadSummary.skipped}</p>
                )}
              </div>
            </div>
            <Button onClick={resetState}>Upload Another File</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default JobPositionUpload;

