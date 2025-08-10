// src/components/workbench/FileUploader.tsx

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, CheckCircle, AlertTriangle, ArrowRight, Edit3, FileText, Archive } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";
import { ExcelData } from "@/app/[locale]/workbench/page";

interface FileUploaderProps {
  onUpload: (data: ExcelData, name: string) => void;
  onError: (error: string) => void;
}

const REQUIRED_SHEETS = ["Abonné", "Listing", "Fréquence par cellule", "Fréquence Correspondant", "Fréquence par Durée appel", "Fréquence par IMEI", "Identification des abonnés"];
const SHEET_ALTERNATIVES: { [key: string]: string[] } = {
  // ... (This section remains unchanged)
  "Abonné": ["Abonne", "Abonnés", "Abonnes", "Subscribers", "Subscriber"],
  "Listing": ["Listings", "Communications", "Calls", "Call_List"],
  "Fréquence par cellule": ["Frequence par cellule", "Cell Frequency", "Cellule"],
  "Fréquence Correspondant": ["Frequence Correspondant", "Correspondent Frequency"],
  "Fréquence par Durée appel": ["Frequence par Duree appel", "Call Duration Frequency"],
  "Fréquence par IMEI": ["Frequence par IMEI", "IMEI Frequency"],
  "Identification des abonnés": ["Identification des abonnes", "Subscriber Identification"],
};

interface ValidationResult {
  isValid: boolean;
  missingSheets: string[];
  failedFiles: string[];
}

// FIX: Helper functions are kept outside the component
const findSheetMatch = (sheetNames: string[], requiredSheet: string): string | null => {
  // ... (This function remains unchanged)
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

const validateAndParseWorkbook = (workbook: XLSX.WorkBook): { data: ExcelData | null, validation: Omit<ValidationResult, 'failedFiles'> } => {
  // ... (This function's core logic remains unchanged, but simplified its return type)
  const sheetNames = workbook.SheetNames;
  const missingSheets: string[] = [];
  const alternativeSheets: { [key: string]: string } = {};

  for (const requiredSheet of REQUIRED_SHEETS) {
      const match = findSheetMatch(sheetNames, requiredSheet);
      if (match) {
          if (match !== requiredSheet) {
            alternativeSheets[requiredSheet] = match;
          }
      } else {
          missingSheets.push(requiredSheet);
      }
  }

  const validation = { isValid: missingSheets.length === 0, missingSheets };
  if (!validation.isValid) {
      return { data: null, validation };
  }

  const data: ExcelData = {};
  const sheetMapping: { [key in keyof ExcelData]: string } = {
      subscribers: "Abonné",
      listings: "Listing",
  };
  
  for (const [key, sheetName] of Object.entries(sheetMapping)) {
      const actualSheetName = alternativeSheets[sheetName] || sheetName;
      const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[actualSheetName], {
        defval: null, raw: false, blankrows: false
      });
      data[key as keyof ExcelData] = sheetData as Record<string, unknown>[];
  }
  
  return { data, validation };
};

// NEW: Helper to get all workbooks from a single file (could be a ZIP)
const getWorkbooksFromFile = async (file: File): Promise<{name: string; workbook: XLSX.WorkBook}[]> => {
    const buffer = await file.arrayBuffer();

    if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(buffer);
        const excelFilePromises: Promise<{name: string; workbook: XLSX.WorkBook}>[] = [];

        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && (zipEntry.name.endsWith('.xlsx') || zipEntry.name.endsWith('.xls'))) {
                const promise = zipEntry.async('arraybuffer').then(excelBuffer => {
                    const workbook = XLSX.read(excelBuffer, { type: "array", cellDates: true });
                    return { name: zipEntry.name, workbook };
                });
                excelFilePromises.push(promise);
            }
        });
        
        const results = await Promise.all(excelFilePromises);
        if (results.length === 0) {
            throw new Error(`No Excel files (.xlsx, .xls) found in the ZIP archive: ${file.name}`);
        }
        return results;
    } else {
        const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
        return [{ name: file.name, workbook }];
    }
};


export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  // MODIFIED: State to handle multiple files
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelData | null>(null);
  const [analysisName, setAnalysisName] = useState("");

  const resetState = useCallback(() => {
    // MODIFIED: Reset multiple files state
    setUploadedFiles([]);
    setValidationResult(null);
    setParsedData(null);
    setAnalysisName("");
    setIsProcessing(false);
  }, []);
  
  // NEW: Processes an array of files, replacing processFile
  const processFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    setValidationResult(null);
    setParsedData(null);
    setAnalysisName(`Analysis - ${new Date().toLocaleString()}`);

    // This will hold the concatenated data from all valid files
    const combinedData: ExcelData = { subscribers: [], listings: [] };
    const allMissingSheets = new Set<string>();
    const failedFiles = new Set<string>();

    try {
      // Process each dropped file
      for (const file of files) {
          try {
              const workbooksWithNames = await getWorkbooksFromFile(file);

              // Process each Excel workbook found (multiple in a ZIP)
              for (const { name: workbookName, workbook } of workbooksWithNames) {
                  const { data, validation } = validateAndParseWorkbook(workbook);
                  if (validation.isValid && data) {
                      // Concatenate data from the valid workbook
                      if(data.subscribers) {
                        combinedData.subscribers = [...(combinedData.subscribers || []), ...data.subscribers];
                      }
                      if(data.listings) {
                        combinedData.listings = [...(combinedData.listings || []), ...data.listings];
                      }
                  } else {
                      // If any workbook is invalid, track the errors
                      failedFiles.add(file.name === workbookName ? file.name : `${file.name} -> ${workbookName}`);
                      validation.missingSheets.forEach(sheet => allMissingSheets.add(sheet));
                  }
              }
          } catch (e) {
              const errorMessage = e instanceof Error ? e.message : `An error occurred with ${file.name}`;
              failedFiles.add(`${file.name} (Processing Error)`);
              allMissingSheets.add(errorMessage);
          }
      }

      const finalValidation: ValidationResult = {
          isValid: failedFiles.size === 0,
          missingSheets: Array.from(allMissingSheets),
          failedFiles: Array.from(failedFiles),
      };

      setValidationResult(finalValidation);

      if (finalValidation.isValid) {
        setParsedData(combinedData);
      } else {
        onError(`One or more files failed validation. Missing sheets or errors: ${finalValidation.missingSheets.join(', ')}`);
        setParsedData(null); // Ensure no analysis can be started
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unknown error occurred during file processing.";
      onError(message);
      resetState();
    } finally {
      setIsProcessing(false);
    }
  }, [onError, resetState]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // MODIFIED: Handle array of files
    if (acceptedFiles.length === 0) return;
    setUploadedFiles(acceptedFiles);
    processFiles(acceptedFiles);
  }, [processFiles]);
  
  const handleStartAnalysis = () => {
    if (parsedData && analysisName.trim()) {
        onUpload(parsedData, analysisName.trim());
    }
  }
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip']
    },
    // MODIFIED: Allow multiple files
    multiple: true,
    maxSize: 100 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      {!parsedData && (
         <motion.div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
              ${isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}
              ${isProcessing ? "opacity-50 pointer-events-none" : ""}
            `}
         >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className={`p-4 rounded-full transition-colors ${isDragActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <Upload className="w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{isProcessing ? "Processing Files..." : isDragActive ? "Drop the files here" : "Upload Your Data"}</h3>
                    {/* MODIFIED: Updated prompt text */}
                    <p className="text-muted-foreground">Drag & drop or click to select .xlsx, .xls, or .zip files</p>
                </div>
            </div>
         </motion.div>
      )}

      <AnimatePresence>
        {validationResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-muted/50 border border-border rounded-lg p-4 space-y-4"
          >
             <div className="flex items-start justify-between">
                <div>
                    {/* MODIFIED: Display list of uploaded files */}
                    <p className="font-semibold text-foreground">Uploaded Files:</p>
                    <ul className="text-sm text-muted-foreground list-disc pl-5">
                      {uploadedFiles.map(file => (
                        <li key={file.name} className="flex items-center gap-2">
                          {file.name.endsWith('.zip') ? <Archive className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                          {file.name}
                        </li>
                      ))}
                    </ul>
                </div>
                <button onClick={resetState} className="p-2 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
             
            {validationResult.isValid ? (
                <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 text-green-700 border border-green-500/20">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-medium">All files validated successfully! Data has been combined.</p>
                </div>
            ) : (
                <div className="flex items-start gap-3 p-3 rounded-md bg-red-500/10 text-red-700 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Validation Failed</p>
                        {/* MODIFIED: Improved error reporting */}
                        <p className="text-sm">The following issues were found:</p>
                        <ul className="list-disc pl-5 mt-1 text-xs">
                          {validationResult.failedFiles.length > 0 && <li><strong>Failed Files:</strong> {validationResult.failedFiles.join(', ')}</li>}
                          {validationResult.missingSheets.length > 0 && <li><strong>Missing Sheets/Errors:</strong> {validationResult.missingSheets.join(', ')}</li>}
                        </ul>
                    </div>
                </div>
            )}
            
            {/* This part only shows on overall success */}
            {parsedData && validationResult?.isValid && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3 pt-4 border-t border-border"
                >
                    <label className="block text-sm font-medium text-foreground">
                        <Edit3 className="w-4 h-4 inline mr-2" />
                        Name this Analysis
                    </label>
                     <input
                        type="text"
                        value={analysisName}
                        onChange={(e) => setAnalysisName(e.target.value)}
                        placeholder="e.g., Q3 Multi-Case Analysis"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button 
                        onClick={handleStartAnalysis} 
                        disabled={!analysisName.trim()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                    >
                       Start Analysis <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}