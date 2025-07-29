// src/components/workbench/FileUploader.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, FolderOpen, Archive } from "lucide-react";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onUpload: (data: any) => void;
  onError: (error: string) => void;
}

const REQUIRED_SHEETS = [
  "Abonné",
  "Listing", 
  "Fréquence par cellule",
  "Fréquence Correspondant",
  "Fréquence par Durée appel",
  "Fréquence par IMEI",
  "Identification des abonnés"
];

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
}

export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<{
    found: string[];
    missing: string[];
  } | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [zipContents, setZipContents] = useState<string[] | null>(null);

  const updateProcessingStep = (stepName: string, status: ProcessingStep['status'], description?: string) => {
    setProcessingSteps(prev => prev.map(step => 
      step.name === stepName 
        ? { ...step, status, description: description || step.description }
        : step
    ));
  };

  const initializeProcessingSteps = (isZip: boolean = false) => {
    const steps: ProcessingStep[] = [
      { name: 'upload', status: 'completed', description: 'File uploaded successfully' },
    ];
    
    if (isZip) {
      steps.push(
        { name: 'extract', status: 'pending', description: 'Extracting ZIP archive' },
        { name: 'locate', status: 'pending', description: 'Locating Excel files' }
      );
    }
    
    steps.push(
      { name: 'validate', status: 'pending', description: 'Validating sheet structure' },
      { name: 'process', status: 'pending', description: 'Processing data' },
      { name: 'complete', status: 'pending', description: 'Finalizing import' }
    );
    
    setProcessingSteps(steps);
  };

  const processExcelFile = async (file: File | ArrayBuffer, fileName: string = "file") => {
    try {
      updateProcessingStep('validate', 'processing');
      
      const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Validate required sheets
      const sheetNames = workbook.SheetNames;
      const foundSheets = REQUIRED_SHEETS.filter(sheet => sheetNames.includes(sheet));
      const missingSheets = REQUIRED_SHEETS.filter(sheet => !sheetNames.includes(sheet));
      
      setValidationResults({
        found: foundSheets,
        missing: missingSheets
      });
      
      if (missingSheets.length > 0) {
        updateProcessingStep('validate', 'error', `Missing sheets: ${missingSheets.join(", ")}`);
        onError(`File "${fileName}" is missing required sheets: ${missingSheets.join(", ")}`);
        return false;
      }
      
      updateProcessingStep('validate', 'completed', 'All required sheets found');
      updateProcessingStep('process', 'processing');
      
      // Process each sheet with better error handling
      const data: any = {};
      const sheetMapping = {
        subscribers: "Abonné",
        listings: "Listing",
        cellFrequency: "Fréquence par cellule",
        correspondentFrequency: "Fréquence Correspondant",
        callDurationFrequency: "Fréquence par Durée appel",
        imeiFrequency: "Fréquence par IMEI",
        subscriberIdentification: "Identification des abonnés"
      };
      
      for (const [key, sheetName] of Object.entries(sheetMapping)) {
        try {
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            defval: "", // Default value for empty cells
            raw: false // Don't use raw values, format them
          });
          data[key] = sheetData;
        } catch (sheetError) {
          console.error(`Error processing sheet ${sheetName}:`, sheetError);
          updateProcessingStep('process', 'error', `Error processing sheet: ${sheetName}`);
          onError(`Error processing sheet "${sheetName}" in file "${fileName}"`);
          return false;
        }
      }
      
      updateProcessingStep('process', 'completed', `Processed ${data.listings?.length || 0} records`);
      updateProcessingStep('complete', 'processing');
      
      // Validate data integrity
      if (!data.listings || data.listings.length === 0) {
        updateProcessingStep('complete', 'error', 'No interaction data found');
        onError(`No interaction data found in the "Listing" sheet of "${fileName}"`);
        return false;
      }
      
      updateProcessingStep('complete', 'completed', 'Data import completed successfully');
      onUpload(data);
      return true;
      
    } catch (error) {
      console.error("Error processing Excel file:", error);
      updateProcessingStep('process', 'error', 'Failed to process Excel file');
      onError(`Failed to process Excel file "${fileName}". Please check the file format.`);
      return false;
    }
  };

  const processZipFile = async (file: File) => {
    try {
      initializeProcessingSteps(true);
      updateProcessingStep('extract', 'processing');
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      // Find Excel files in the ZIP
      const excelFiles: Array<{ name: string; data: ArrayBuffer }> = [];
      const fileNames: string[] = [];
      
      for (const [fileName, zipEntry] of Object.entries(zipData.files)) {
        fileNames.push(fileName);
        if (!zipEntry.dir && (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))) {
          try {
            const arrayBuffer = await zipEntry.async('arraybuffer');
            excelFiles.push({ name: fileName, data: arrayBuffer });
          } catch (extractError) {
            console.error(`Error extracting ${fileName}:`, extractError);
          }
        }
      }
      
      setZipContents(fileNames);
      updateProcessingStep('extract', 'completed', `Extracted ${fileNames.length} files`);
      updateProcessingStep('locate', 'processing');
      
      if (excelFiles.length === 0) {
        updateProcessingStep('locate', 'error', 'No Excel files found');
        onError("No Excel files (.xlsx) found in the ZIP archive. Please ensure your ZIP contains the required Excel file.");
        return;
      }
      
      updateProcessingStep('locate', 'completed', `Found ${excelFiles.length} Excel file(s)`);
      
      // Try to process each Excel file until we find one with valid data
      let processed = false;
      for (const excelFile of excelFiles) {
        const success = await processExcelFile(excelFile.data, excelFile.name);
        if (success) {
          processed = true;
          break;
        }
      }
      
      if (!processed) {
        onError(`None of the Excel files in the ZIP archive contain the required sheet structure. Please check the files: ${excelFiles.map(f => f.name).join(", ")}`);
      }
      
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      updateProcessingStep('extract', 'error', 'Failed to extract ZIP file');
      onError("Failed to process ZIP file. Please ensure it's a valid ZIP archive.");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setValidationResults(null);
    setZipContents(null);
    setIsProcessing(true);

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      initializeProcessingSteps(false);
      processExcelFile(file, file.name).finally(() => setIsProcessing(false));
    } else if (file.name.endsWith('.zip')) {
      processZipFile(file).finally(() => setIsProcessing(false));
    } else {
      onError("Please upload an Excel file (.xlsx) or ZIP archive (.zip)");
      setIsProcessing(false);
    }
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setValidationResults(null);
    setZipContents(null);
    setProcessingSteps([]);
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragActive 
            ? "border-secondary bg-secondary/5 scale-105 shadow-lg shadow-secondary/20" 
            : "border-border hover:border-secondary/50 hover:bg-muted/30"
          }
          ${isProcessing ? "pointer-events-none" : ""}
        `}
        whileHover={{ scale: isDragActive ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        {/* Animated background gradient */}
        <div className={`
          absolute inset-0 opacity-0 transition-opacity duration-300
          ${isDragActive ? "opacity-10" : ""}
          gradient-primary-animated
        `} />
        
        <div className="relative space-y-4">
          <motion.div 
            className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full
              transition-all duration-300
              ${isDragActive 
                ? "bg-secondary text-white scale-110 shadow-lg shadow-secondary/30" 
                : "bg-muted text-muted-foreground"
              }
            `}
            animate={isDragActive ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
          >
            <Upload className="w-8 h-8" />
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? "Drop your file here" : "Upload your data file"}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop an Excel file (.xlsx) or ZIP archive, or click to browse
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <motion.div 
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              whileHover={{ scale: 1.05 }}
            >
              <File className="w-4 h-4 text-green-600" />
              <span>.xlsx</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
              whileHover={{ scale: 1.05 }}
            >
              <Archive className="w-4 h-4 text-blue-600" />
              <span>.zip</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Processing Steps */}
      <AnimatePresence>
        {processingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-lg p-4 space-y-3"
          >
            <h4 className="font-medium text-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              Processing Status
            </h4>
            
            <div className="space-y-2">
              {processingSteps.map((step, index) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                >
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground capitalize">
                      {step.name.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded File Info */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/10">
                  {uploadedFile.name.endsWith('.zip') ? (
                    <Archive className="w-5 h-5 text-secondary" />
                  ) : (
                    <File className="w-5 h-5 text-secondary" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 rounded-md hover:bg-muted transition-colors group"
              >
                <X className="w-4 h-4 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
            
            {/* ZIP Contents */}
            {zipContents && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Archive Contents ({zipContents.length} files)
                </h4>
                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                  <div className="space-y-1">
                    {zipContents.map((fileName, index) => (
                      <div
                        key={index}
                        className={`
                          text-xs p-2 rounded-md flex items-center gap-2
                          ${fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-muted/50 text-muted-foreground"
                          }
                        `}
                      >
                        <File className="w-3 h-3" />
                        {fileName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Validation Results */}
            {validationResults && (
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">Sheet Validation:</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {REQUIRED_SHEETS.map(sheet => {
                    const isFound = validationResults.found.includes(sheet);
                    return (
                      <motion.div
                        key={sheet}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-md text-sm
                          ${isFound 
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" 
                            : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                          }
                        `}
                      >
                        {isFound ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span>{sheet}</span>
                        <span className="ml-auto text-xs font-medium">
                          {isFound ? "✓ Found" : "✗ Missing"}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Requirements */}
      <div className="bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg p-4 border border-border/50">
        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary" />
          Required Excel Sheets
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {REQUIRED_SHEETS.map((sheet, index) => (
            <motion.div 
              key={sheet} 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/30 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="font-medium">{sheet}</span>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-secondary/5 rounded-lg border border-secondary/20">
          <p className="text-xs text-muted-foreground">
            <strong>💡 Tip:</strong> Your Excel file must contain all these sheets with the exact names shown above. 
            You can also upload a ZIP file containing the Excel file.
          </p>
        </div>
      </div>
    </div>
  );
}