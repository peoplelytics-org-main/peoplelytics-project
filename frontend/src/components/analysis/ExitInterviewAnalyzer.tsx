import React, { useState } from 'react';
import { Type } from '@google/genai';
import { getAIPrediction } from '../../services/geminiService';
import type { ExitInterviewAnalysis } from '../../types';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import { Bot, UploadCloud, FileText, Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { useAnalysis } from '../../contexts/AnalysisContext';
import { useNotifications } from '../../contexts/NotificationContext';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    primaryReasonForLeaving: { type: Type.STRING, description: 'The single main reason the employee is leaving. If an error occurs, this will be "Error".' },
    secondaryReasonForLeaving: { type: Type.STRING, description: 'A secondary contributing factor for the departure, if mentioned.' },
    management: {
      type: Type.OBJECT,
      properties: {
        sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
        quote: { type: Type.STRING, description: "A direct quote that best represents the sentiment about their manager or leadership." },
        summary: { type: Type.STRING, description: "A 1-2 sentence summary of the employee's feedback on management." }
      },
      required: ['sentiment', 'quote', 'summary']
    },
    compensation: {
        type: Type.OBJECT,
        properties: {
          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
          quote: { type: Type.STRING, description: "A direct quote that best represents the sentiment about their pay and benefits." },
          summary: { type: Type.STRING, description: "A 1-2 sentence summary of the employee's feedback on compensation." }
        },
        required: ['sentiment', 'quote', 'summary']
    },
    culture: {
        type: Type.OBJECT,
        properties: {
          sentiment: { type: Type.STRING, enum: ['Positive', 'Neutral', 'Negative'] },
          quote: { type: Type.STRING, description: "A direct quote that best represents the sentiment about the work environment and culture." },
          summary: { type: Type.STRING, description: "A 1-2 sentence summary of the employee's feedback on company culture." }
        },
        required: ['sentiment', 'quote', 'summary']
    },
    error: { type: Type.STRING, description: "If the document is unreadable or not an exit interview, provide an error message here." },
  },
  required: ['primaryReasonForLeaving', 'management', 'compensation', 'culture']
};

interface StoredFile {
    name: string;
    type: string;
    size: number;
    content: string; // base64 for binary, raw text for plain text
    isText: boolean;
}

type AnalysisStatus = 'pending' | 'analyzing' | 'done' | 'error';

interface AnalysisProgress {
    file: StoredFile;
    status: AnalysisStatus;
    error?: string;
}

const ExitInterviewAnalyzer: React.FC = () => {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { addAnalysis } = useAnalysis();
    const { addNotification } = useNotifications();

    const fileToStoredFile = (file: File): Promise<StoredFile> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const isText = file.type === 'text/plain';

            reader.onload = () => {
                const content = reader.result as string;
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    content: isText ? content : content.split(',')[1],
                    isText: isText,
                });
            };
            reader.onerror = reject;

            if (isText) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
            }
        });
    };

    const handleFiles = async (newFiles: FileList | null) => {
        if (!newFiles) return;
        const acceptedFiles = Array.from(newFiles).filter(
            (file) => (
                file.type === 'text/plain' ||
                file.type === 'application/pdf' ||
                file.type === 'application/msword' ||
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ) && file.size < 2000000 // 2MB limit
        );

        const uniqueNewFiles = acceptedFiles.filter(f => !files.some(existing => existing.name === f.name));
        
        if (uniqueNewFiles.length > 0) {
            try {
                const storedFiles = await Promise.all(uniqueNewFiles.map(fileToStoredFile));
                setFiles((prev) => [...prev, ...storedFiles]);
            } catch (error) {
                console.error("Error reading one or more files:", error);
                addNotification({
                    title: 'File Read Error',
                    message: 'Could not read one or more of the selected files.',
                    type: 'error',
                });
            }
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
        e.target.value = '';
    };
    
    const handleRemoveFile = (fileToRemove: StoredFile) => {
        setFiles(files.filter(file => file.name !== fileToRemove.name));
    };

    const handleClear = () => {
        setFiles([]);
        setAnalysisProgress([]);
        setIsProcessing(false);
    };

    const handleAnalyze = async () => {
        setIsProcessing(true);
        const initialProgress: AnalysisProgress[] = files.map(file => ({ file, status: 'pending' }));
        setAnalysisProgress(initialProgress);

        let successCount = 0;

        for (let i = 0; i < initialProgress.length; i++) {
            const currentItem = initialProgress[i];
            
            setAnalysisProgress(prev => prev.map(item => item.file.name === currentItem.file.name ? { ...item, status: 'analyzing' } : item));

            try {
                const file = currentItem.file;
                let result: { error: string } | ExitInterviewAnalysis;

                const basePrompt = `
                    Analyze the following exit interview transcript. Identify the primary and secondary reasons for leaving. 
                    For each key topic (management, compensation, culture), determine the sentiment (Positive, Neutral, or Negative), 
                    extract a key quote, and provide a brief summary. Adhere strictly to the provided JSON schema.
                    If the content is not an exit interview or is unreadable, populate the 'error' field with a descriptive message.
                `;

                if (file.isText) {
                    const transcript = file.content;
                    const fullPrompt = `${basePrompt}\n\nTranscript:\n---\n${transcript}\n---`;
                    result = await getAIPrediction<ExitInterviewAnalysis>(fullPrompt, analysisSchema);
                } else {
                    const base64Data = file.content;
                    const filePart = { inlineData: { mimeType: file.type, data: base64Data } };
                    const textPart = { text: `The attached document is an exit interview transcript. Please extract the text and then perform the analysis based on the following instructions:\n\n${basePrompt}` };
                    
                    const contents = { parts: [filePart, textPart] };
                    result = await getAIPrediction<ExitInterviewAnalysis>(contents, analysisSchema);
                }

                if ('error' in result) { // API error
                    throw new Error(result.error);
                }
                if (result.error) { // Content error from Gemini
                    throw new Error(result.error);
                }
                
                addAnalysis(result);
                successCount++;
                setAnalysisProgress(prev => prev.map(item => item.file.name === currentItem.file.name ? { ...item, status: 'done' } : item));

            } catch (err) {
                const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                setAnalysisProgress(prev => prev.map(item => item.file.name === currentItem.file.name ? { ...item, status: 'error', error: errorMsg } : item));
            }
        }

        addNotification({
            title: 'Analysis Complete',
            message: `${successCount} of ${files.length} interviews analyzed and saved to the hub.`,
            type: successCount === files.length ? 'success' : 'warning',
        });
        setIsProcessing(false);
    };
    
    const StatusIcon = ({ status }: { status: AnalysisStatus }) => {
        if (status === 'analyzing') return <Loader2 className="h-5 w-5 text-primary-400 animate-spin" />;
        if (status === 'done') return <CheckCircle className="h-5 w-5 text-green-400" />;
        if (status === 'error') return <XCircle className="h-5 w-5 text-red-400" />;
        return <FileText className="h-5 w-5 text-text-secondary" />;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary-400" /> Transcript Analyzer</CardTitle>
                <CardDescription>Drag and drop multiple transcript files (.txt, .pdf, .docx) to analyze exit interviews in bulk.</CardDescription>
            </CardHeader>
            <CardContent>
                {!isProcessing && analysisProgress.length === 0 && (
                    <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                         className={`border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors ${isDragActive ? 'border-primary-500 bg-primary-900/20' : ''}`}>
                        <UploadCloud className="mx-auto h-12 w-12 text-text-secondary" />
                        <h3 className="mt-2 text-sm font-medium text-text-primary">Drag & drop files here</h3>
                        <p className="text-xs text-text-secondary">.txt, .pdf, .doc, .docx accepted</p>
                        <Button as="label" htmlFor="file-upload-analyzer" variant="secondary" size="sm" className="mt-2 cursor-pointer">
                            Select Files
                        </Button>
                        <input id="file-upload-analyzer" type="file" className="sr-only" multiple accept=".txt,.pdf,.doc,.docx,text/plain,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileSelect} />
                    </div>
                )}

                {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-text-primary text-sm">
                            {analysisProgress.length > 0 ? 'Analysis Progress' : `Files to Analyze (${files.length})`}
                        </h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto bg-background p-2 rounded-md border border-border">
                            {(analysisProgress.length > 0 ? analysisProgress : files.map((file): AnalysisProgress => ({ file, status: 'pending' }))).map(({ file, status, error }, index) => (
                                <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 rounded-md bg-card">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <StatusIcon status={status} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-text-primary truncate" title={file.name}>{file.name}</p>
                                            {error && <p className="text-xs text-red-400">{error}</p>}
                                        </div>
                                    </div>
                                    {!isProcessing && analysisProgress.length === 0 && (
                                        <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file)} className="p-1 h-auto flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-text-secondary hover:text-red-400" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(files.length > 0 || analysisProgress.length > 0) && (
                    <div className="mt-4 flex gap-2">
                        <Button onClick={handleAnalyze} isLoading={isProcessing} disabled={files.length === 0 || isProcessing}>
                            {isProcessing ? 'Analyzing...' : `Analyze ${files.length} File(s)`}
                        </Button>
                        <Button onClick={handleClear} variant="secondary" disabled={isProcessing}>Clear</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ExitInterviewAnalyzer;
