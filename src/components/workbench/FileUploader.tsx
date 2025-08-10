// src/components/workbench/FileUploader.tsx

"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, CheckCircle, AlertTriangle, ArrowRight, Edit3, FileText, Archive, PlusCircle, ChevronDown, ChevronRight, Check, XCircle } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";
import { ExcelData } from "@/app/[locale]/workbench/page";

interface FileUploaderProps {
  onUpload: (data: ExcelData, name: string) => void;
  onError: (error: string) => void;
}

// Represents the detailed status of a single processed workbook
interface FileStatus {
  id: string; // Unique ID for mapping
  fileName: string;
  status: 'success' | 'failure';
  sheetsFound: string[];
  sheetsMissing: string[];
  error?: string; // For file-level errors (e.g., failed to read zip)
}

const REQUIRED_SHEETS = ["Abonné", "Listing", "Fréquence par cellule", "Fréquence Correspondant", "Fréquence par Durée appel", "Fréquence par IMEI", "Identification des abonnés"];
// ... SHEET_ALTERNATIVES remains unchanged

// Helper functions (validateAndParseWorkbook, findSheetMatch) are unchanged
// For brevity, they are assumed to be here as in the previous version.

const findSheetMatch = (sheetNames: string[], requiredSheet: string): string | null => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedRequired = normalize(requiredSheet);
    const exactMatch = sheetNames.find(name => normalize(name) === normalizedRequired);
    if (exactMatch) return exactMatch;
    const alternatives = SHEET_ALTERNATIVES[requiredSheet] || [];
    for (const alt of alternatives) {
        const foundAlt = sheetNames.find(name => normalize(name) === normalize(alt));
        if (foundAlt) return foundAlt;
    }
    return null;
};

const validateAndParseWorkbook = (workbook: XLSX.WorkBook): { data: ExcelData | null; missingSheets: string[] } => {
    const sheetNames = workbook.SheetNames;
    const missingSheets: string[] = [];
    const alternativeSheets: { [key: string]: string } = {};

    for (const requiredSheet of REQUIRED_SHEETS) {
        const match = findSheetMatch(sheetNames, requiredSheet);
        if (match) {
            if (match !== requiredSheet) alternativeSheets[requiredSheet] = match;
        } else {
            missingSheets.push(requiredSheet);
        }
    }

    if (missingSheets.length > 0) {
        return { data: null, missingSheets };
    }

    const data: ExcelData = {};
    const sheetMapping: { [key in keyof ExcelData]: string } = {
        subscribers: "Abonné",
        listings: "Listing",
    };
    
    for (const [key, sheetName] of Object.entries(sheetMapping)) {
        const actualSheetName = alternativeSheets[sheetName] || sheetName;
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[actualSheetName], { defval: null, raw: false, blankrows: false });
        data[key as keyof ExcelData] = sheetData as Record<string, unknown>[];
    }
    
    return { data, missingSheets: [] };
};

const getWorkbooksFromFile = async (file: File): Promise<{name: string; workbook: XLSX.WorkBook; allSheetNames: string[]}[]> => {
    const buffer = await file.arrayBuffer();
    if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(buffer);
        const excelFilePromises: Promise<{name: string; workbook: XLSX.WorkBook; allSheetNames: string[]}>[] = [];
        zip.forEach((_, zipEntry) => {
            if (!zipEntry.dir && (zipEntry.name.endsWith('.xlsx') || zipEntry.name.endsWith('.xls'))) {
                const promise = zipEntry.async('arraybuffer').then(excelBuffer => {
                    const workbook = XLSX.read(excelBuffer, { type: "array", cellDates: true });
                    return { name: `${file.name} -> ${zipEntry.name}`, workbook, allSheetNames: workbook.SheetNames };
                });
                excelFilePromises.push(promise);
            }
        });
        const results = await Promise.all(excelFilePromises);
        if (results.length === 0) throw new Error(`No Excel files found in ZIP: ${file.name}`);
        return results;
    } else {
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        return [{ name: file.name, workbook, allSheetNames: workbook.SheetNames }];
    }
};

const StatusItem: React.FC<{ status: FileStatus }> = ({ status }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSuccess = status.status === 'success';
    return (
        <div className={`text-sm rounded-md border ${isSuccess ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-2 text-left">
                <div className="flex items-center gap-2">
                    {isSuccess ? <Check className="w-4 h-4 text-green-600"/> : <XCircle className="w-4 h-4 text-red-600"/>}
                    <span className="font-medium text-foreground">{status.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isSuccess ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {isSuccess ? 'Success' : 'Failed'}
                    </span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground"/> : <ChevronRight className="w-4 h-4 text-muted-foreground"/>}
                </div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-3 pt-1 border-t border-current/20">
                            <p className="font-semibold text-xs text-muted-foreground">Sheets Found:</p>
                            <p className="text-muted-foreground/80 text-xs break-all">{status.sheetsFound.join(', ') || 'None'}</p>
                            {!isSuccess && status.sheetsMissing.length > 0 && (
                                <>
                                    <p className="font-semibold text-xs text-red-600 mt-2">Required Sheets Missing:</p>
                                    <p className="text-red-600/90 text-xs break-all">{status.sheetsMissing.join(', ')}</p>
                                </>
                            )}
                            {status.error && (
                                 <p className="font-semibold text-xs text-red-600 mt-2">Error: {status.error}</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
};


export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [fileStatuses, setFileStatuses] = useState<FileStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelData | null>(null);
  const [analysisName, setAnalysisName] = useState("");

  const resetState = useCallback(() => {
    setUploadedFiles([]);
    setFileStatuses([]);
    setParsedData(null);
    setAnalysisName("");
    setIsProcessing(false);
  }, []);

  const processFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessing(true);

    const combinedData: ExcelData = { subscribers: [], listings: [] };
    const newStatuses: FileStatus[] = [];

    for (const file of files) {
        try {
            const workbooks = await getWorkbooksFromFile(file);
            for (const { name, workbook, allSheetNames } of workbooks) {
                const { data, missingSheets } = validateAndParseWorkbook(workbook);
                if (data) {
                    newStatuses.push({ id: name, fileName: name, status: 'success', sheetsFound: allSheetNames, sheetsMissing: [] });
                    if (data.subscribers) combinedData.subscribers = [...(combinedData.subscribers || []), ...data.subscribers];
                    if (data.listings) combinedData.listings = [...(combinedData.listings || []), ...data.listings];
                } else {
                    newStatuses.push({ id: name, fileName: name, status: 'failure', sheetsFound: allSheetNames, sheetsMissing });
                }
            }
        } catch (e) {
            const error = e instanceof Error ? e.message : "An unknown error occurred.";
            newStatuses.push({ id: file.name, fileName: file.name, status: 'failure', sheetsFound: [], sheetsMissing: [], error });
        }
    }

    setFileStatuses(newStatuses);
    if ((combinedData.listings?.length || 0) > 0) {
        setParsedData(combinedData);
        if (!analysisName) setAnalysisName(`Analysis - ${new Date().toLocaleString()}`);
    } else {
        setParsedData(null);
        onError("No valid data could be extracted from the uploaded files. Please check the file structures.");
    }

    setIsProcessing(false);
  }, [analysisName, onError]);

  useEffect(() => {
      processFiles(uploadedFiles);
  }, [uploadedFiles, processFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    // Append new files to the existing list
    setUploadedFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);
  
  const handleStartAnalysis = () => {
    if (parsedData && analysisName.trim()) {
        onUpload(parsedData, analysisName.trim());
    }
  }
  
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip']
    },
    multiple: true,
    noClick: uploadedFiles.length > 0, // Disable click if files are already staged
    noKeyboard: true,
  });

  const renderWelcomeView = () => (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><Upload className="w-8 h-8" /></div>
            <div>
                <h3 className="text-lg font-semibold">{isDragActive ? "Drop the files here" : "Upload Your Data"}</h3>
                <p className="text-muted-foreground">Drag & drop or click to select .xlsx, .xls, or .zip files</p>
            </div>
        </div>
    </div>
  );

  const renderStagingView = () => (
    <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
        <div className="flex items-start justify-between">
            <h3 className="text-lg font-semibold">Analysis Staging Area</h3>
            <button onClick={resetState} className="p-2 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto p-1">
            {fileStatuses.map((status) => <StatusItem key={status.id} status={status} />)}
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-border">
            <button onClick={open} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md border border-dashed bg-background hover:border-primary hover:text-primary transition-colors">
                <PlusCircle className="w-4 h-4" /> Add More Files
            </button>
        </div>

        {parsedData && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-3 pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground"><Edit3 className="w-4 h-4 inline mr-2" /> Name this Analysis</label>
                <input type="text" value={analysisName} onChange={(e) => setAnalysisName(e.target.value)} placeholder="e.g., Multi-Case Analysis" className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"/>
                <button onClick={handleStartAnalysis} disabled={!analysisName.trim() || isProcessing} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed">
                   {isProcessing ? 'Processing...' : 'Start Analysis'} <ArrowRight className="w-4 h-4" />
                </button>
            </motion.div>
        )}
    </div>
  );

  return (
    <div className="space-y-4">
        <AnimatePresence mode="wait">
            <motion.div key={uploadedFiles.length > 0 ? 'staging' : 'welcome'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {isProcessing && uploadedFiles.length === 0 ? (
                    <div className="flex justify-center items-center h-48"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
                ) : uploadedFiles.length > 0 ? (
                    renderStagingView()
                ) : (
                    renderWelcomeView()
                )}
            </motion.div>
        </AnimatePresence>
    </div>
  );
}