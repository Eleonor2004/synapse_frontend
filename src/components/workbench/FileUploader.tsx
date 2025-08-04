// src/components/workbench/FileUploader.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File as FileIcon, X, CheckCircle, AlertCircle, FolderOpen, Archive, Info, AlertTriangle, ArrowRight, Edit3 } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";
import { ExcelData } from "@/app/[locale]/workbench/page"; // Import from the page

interface FileUploaderProps {
  onUpload: (data: ExcelData, name: string) => void;
  onError: (error: string) => void;
}

const REQUIRED_SHEETS = ["Abonné", "Listing", "Fréquence par cellule", "Fréquence Correspondant", "Fréquence par Durée appel", "Fréquence par IMEI", "Identification des abonnés"];
const SHEET_ALTERNATIVES: { [key: string]: string[] } = {
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
}

export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // NEW state for the improved upload flow
  const [parsedData, setParsedData] = useState<ExcelData | null>(null);
  const [analysisName, setAnalysisName] = useState("");


  const findSheetMatch = (sheetNames: string[], requiredSheet: string): string | null => {
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalizedRequired = normalize(requiredSheet);
    
    // Exact and normalized match
    const exactMatch = sheetNames.find(name => normalize(name) === normalizedRequired);
    if (exactMatch) return exactMatch;

    // Check alternatives
    const alternatives = SHEET_ALTERNATIVES[requiredSheet] || [];
    for (const alt of alternatives) {
      if (sheetNames.find(name => normalize(name) === normalize(alt))) {
        return sheetNames.find(name => normalize(name) === normalize(alt));
      }
    }
    return null;
  };

  const validateAndParseWorkbook = (workbook: XLSX.WorkBook): { data: ExcelData | null, validation: ValidationResult } => {
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

    const validation: ValidationResult = { isValid: missingSheets.length === 0, missingSheets };
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
        data[key as keyof ExcelData] = sheetData as any[];
    }
    
    return { data, validation };
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setValidationResult(null);
    setParsedData(null);
    setAnalysisName(`Analysis - ${file.name.split('.')[0]}`);

    try {
      const buffer = await file.arrayBuffer();
      let workbook: XLSX.WorkBook;

      if (file.name.toLowerCase().endsWith('.zip')) {
        const zip = await JSZip.loadAsync(buffer);
        const excelFile = Object.values(zip.files).find(f => !f.dir && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')));
        if (!excelFile) {
            throw new Error("No Excel file found in the ZIP archive.");
        }
        const excelBuffer = await excelFile.async('arraybuffer');
        workbook = XLSX.read(excelBuffer, { type: "array", cellDates: true });
      } else {
        workbook = XLSX.read(buffer, { type: "array", cellDates: true });
      }

      const { data, validation } = validateAndParseWorkbook(workbook);
      setValidationResult(validation);

      if (validation.isValid && data) {
        setParsedData(data);
      } else {
        onError(`File is missing required sheets: ${validation.missingSheets.join(', ')}`);
        resetState();
      }
    } catch (e: any) {
      onError(e.message || "An unknown error occurred during file processing.");
      resetState();
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFile(file);
    processFile(file);
  }, []);
  
  const handleStartAnalysis = () => {
    if (parsedData && analysisName.trim()) {
        onUpload(parsedData, analysisName.trim());
        // Do not reset here, the parent component will handle the view change
    }
  }

  const resetState = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setParsedData(null);
    setAnalysisName("");
    setIsProcessing(false);
  };
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip']
    },
    multiple: false,
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
                    <h3 className="text-lg font-semibold">{isProcessing ? "Processing..." : isDragActive ? "Drop the file here" : "Upload Your Data"}</h3>
                    <p className="text-muted-foreground">Drag & drop or click to select a .xlsx, .xls, or .zip file</p>
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
                    <p className="font-semibold text-foreground">{uploadedFile?.name}</p>
                    <p className="text-sm text-muted-foreground">Validation status:</p>
                </div>
                <button onClick={resetState} className="p-2 rounded-md hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>
             
            {validationResult.isValid ? (
                <div className="flex items-center gap-3 p-3 rounded-md bg-green-500/10 text-green-700 border border-green-500/20">
                    <CheckCircle className="w-5 h-5" />
                    <p className="font-medium">File validation successful! All required sheets are present.</p>
                </div>
            ) : (
                <div className="flex items-start gap-3 p-3 rounded-md bg-red-500/10 text-red-700 border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0" />
                    <div>
                        <p className="font-medium">Validation Failed</p>
                        <p className="text-sm">The following required sheets are missing: <span className="font-semibold">{validationResult.missingSheets.join(', ')}</span></p>
                    </div>
                </div>
            )}
            
            {parsedData && (
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
                        placeholder="e.g., Case File 101"
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