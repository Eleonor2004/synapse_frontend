// Enhanced FileUploader with improved validation and error handling
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
// CORRECTED: Renamed the 'File' icon import to 'FileIcon' to avoid conflict with the native File API.
import { Upload, File as FileIcon, X, CheckCircle, AlertCircle, FolderOpen, Archive, Info, AlertTriangle } from "lucide-react";
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

// Enhanced sheet alternatives with more variations
const SHEET_ALTERNATIVES = {
  "Abonné": ["Abonne", "Abonnés", "Abonnes", "Subscribers", "Subscriber", "Abonné(s)", "ABONNE", "ABONNÉ"],
  "Listing": ["Listings", "Communications", "Calls", "Call_List", "Communication_Log", "LISTING"],
  "Fréquence par cellule": ["Frequence par cellule", "Cell Frequency", "Cellule", "Cell_Frequency", "Freq_Cellule", "FREQUENCE PAR CELLULE"],
  "Fréquence Correspondant": ["Frequence Correspondant", "Correspondent Frequency", "Correspondant", "FREQUENCE CORRESPONDANT"],
  "Fréquence par Durée appel": ["Frequence par Duree appel", "Call Duration Frequency", "Duree", "Duration", "Call_Duration", "FREQUENCE PAR DUREE APPEL"],
  "Fréquence par IMEI": ["Frequence par IMEI", "IMEI Frequency", "IMEI_Frequency", "Freq_IMEI", "FREQUENCE PAR IMEI"],
  "Identification des abonnés": ["Identification des abonnes", "Subscriber Identification", "Identification", "ID_Abonnes", "IDENTIFICATION DES ABONNES"]
};

interface ProcessingStep {
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  description: string;
  progress?: number;
}

interface ValidationResult {
  isValid: boolean;
  foundSheets: string[];
  missingSheets: string[];
  alternativeSheets: { [key: string]: string };
  suggestions: string[];
  dataPreview?: any;
}

export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [zipContents, setZipContents] = useState<string[] | null>(null);

  const updateProcessingStep = (stepName: string, status: ProcessingStep['status'], description?: string, progress?: number) => {
    setProcessingSteps(prev => prev.map(step => 
      step.name === stepName 
        ? { ...step, status, description: description || step.description, progress }
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

  // Enhanced fuzzy matching for sheet names
  const findSheetMatch = (sheetNames: string[], requiredSheet: string): string | null => {
    // Normalize function for better matching
    const normalize = (str: string) => str.toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ç]/g, 'c')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[^a-z0-9]/g, '');

    const normalizedRequired = normalize(requiredSheet);
    
    // 1. Exact match (case-insensitive)
    const exactMatch = sheetNames.find(name => 
      normalize(name) === normalizedRequired
    );
    if (exactMatch) return exactMatch;

    // 2. Check alternatives
    const alternatives = SHEET_ALTERNATIVES[requiredSheet] || [];
    for (const alt of alternatives) {
      const altMatch = sheetNames.find(name => 
        normalize(name) === normalize(alt)
      );
      if (altMatch) return altMatch;
    }

    // 3. Partial match (contains key words)
    const keyWords = normalizedRequired.split(/\s+/).filter(word => word.length > 2);
    const partialMatch = sheetNames.find(sheetName => {
      const normalizedSheet = normalize(sheetName);
      return keyWords.some(word => normalizedSheet.includes(word)) ||
             keyWords.length > 1 && keyWords.every(word => normalizedSheet.includes(word));
    });
    
    return partialMatch || null;
  };

  const validateSheetStructure = (workbook: XLSX.WorkBook, fileName: string): ValidationResult => {
    const sheetNames = workbook.SheetNames;
    const foundSheets: string[] = [];
    const missingSheets: string[] = [];
    const alternativeSheets: { [key: string]: string } = {};
    const suggestions: string[] = [];
    
    console.log(`Validating sheets in "${fileName}":`, sheetNames);
    
    for (const requiredSheet of REQUIRED_SHEETS) {
      const match = findSheetMatch(sheetNames, requiredSheet);
      if (match) {
        foundSheets.push(requiredSheet);
        if (match !== requiredSheet) {
          alternativeSheets[requiredSheet] = match;
        }
      } else {
        missingSheets.push(requiredSheet);
        
        // Generate suggestions for missing sheets
        const similar = sheetNames.filter(name => {
          const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, '');
          const requiredNormalized = requiredSheet.toLowerCase().replace(/[^a-z0-9]/g, '');
          return normalized.includes(requiredNormalized.substring(0, 4)) || 
                 requiredNormalized.includes(normalized.substring(0, 4));
        });
        
        if (similar.length > 0) {
          suggestions.push(`"${requiredSheet}" might be: ${similar.join(", ")}`);
        }
      }
    }

    // Quick data preview for validation
    let dataPreview = null;
    if (foundSheets.includes("Listing")) {
      try {
        const listingSheetName = alternativeSheets["Listing"] || "Listing";
        const listingSheet = workbook.Sheets[listingSheetName];
        if (listingSheet) {
          const sampleData = XLSX.utils.sheet_to_json(listingSheet, { header: 1, range: 0 });
          dataPreview = {
            headers: sampleData[0] || [],
            sampleRows: sampleData.slice(1, 4),
            totalRows: sampleData.length - 1
          };
        }
      } catch (error) {
        console.warn("Could not generate data preview:", error);
      }
    }
    
    return {
      isValid: missingSheets.length === 0,
      foundSheets,
      missingSheets,
      alternativeSheets,
      suggestions,
      dataPreview
    };
  };

  const processExcelFile = async (file: File | ArrayBuffer, fileName: string = "file") => {
    try {
      updateProcessingStep('validate', 'processing', 'Reading file structure...');
      
      // NO CHANGE NEEDED HERE: 'File' now correctly refers to the native browser File API.
      const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
      const workbook = XLSX.read(arrayBuffer, { 
        type: "array",
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      // Enhanced validation
      const validation = validateSheetStructure(workbook, fileName);
      setValidationResult(validation);
      
      if (!validation.isValid) {
        updateProcessingStep('validate', 'error', `Missing ${validation.missingSheets.length} required sheets`);
        
        let errorMessage = `File "${fileName}" is missing required sheets:\n${validation.missingSheets.join("\n• ")}`;
        if (validation.suggestions.length > 0) {
          errorMessage += `\n\nSuggestions:\n• ${validation.suggestions.join("\n• ")}`;
        }
        errorMessage += `\n\nFound sheets: ${workbook.SheetNames.join(", ")}`;
        
        onError(errorMessage);
        return false;
      }
      
      updateProcessingStep('validate', 'completed', `All ${validation.foundSheets.length} required sheets found`);
      updateProcessingStep('process', 'processing', 'Processing sheet data...');
      
      // Enhanced data processing with better error handling
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
      
      let totalProcessed = 0;
      const totalSheets = Object.keys(sheetMapping).length;
      
      for (const [key, sheetName] of Object.entries(sheetMapping)) {
        try {
          // Use the actual sheet name (might be alternative)
          const actualSheetName = validation.alternativeSheets[sheetName] || sheetName;
          
          updateProcessingStep('process', 'processing', `Processing "${actualSheetName}"...`, (totalProcessed / totalSheets) * 100);
          
          if (!workbook.Sheets[actualSheetName]) {
            throw new Error(`Sheet "${actualSheetName}" not found`);
          }
          
          // Enhanced sheet parsing with better options
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[actualSheetName], {
            defval: null, // Use null for empty cells
            raw: false, // Format values
            header: 1, // Use first row as headers
            blankrows: false // Skip blank rows
          });
          
          // Data cleaning and validation
          const cleanedData = sheetData
            .filter((row: any) => {
              // Filter out completely empty rows
              if (!Array.isArray(row)) return Object.values(row).some(cell => cell != null && cell !== "");
              return row.some(cell => cell != null && cell !== "");
            })
            .map((row: any, index: number) => {
              // Add row index for debugging
              if (typeof row === 'object' && !Array.isArray(row)) {
                return { ...row, _rowIndex: index + 1 };
              }
              return row;
            });
          
          data[key] = cleanedData;
          totalProcessed++;
          
          console.log(`✓ Processed ${key} (${actualSheetName}): ${cleanedData.length} rows`);
          
        } catch (sheetError: any) {
          console.error(`Error processing sheet ${sheetName}:`, sheetError);
          updateProcessingStep('process', 'error', `Error in "${sheetName}": ${sheetError.message}`);
          onError(`Error processing sheet "${sheetName}" in file "${fileName}": ${sheetError.message}`);
          return false;
        }
      }
      
      updateProcessingStep('process', 'completed', `Successfully processed ${totalProcessed} sheets`);
      updateProcessingStep('complete', 'processing', 'Finalizing data structure...');
      
      // Enhanced data validation with specific checks
      if (!data.listings || data.listings.length === 0) {
        updateProcessingStep('complete', 'error', 'No interaction data found in Listing sheet');
        onError(`No interaction data found in the "Listing" sheet of "${fileName}". Please check if the sheet contains data.`);
        return false;
      }

      // Check for required columns in Listing sheet
      const listingHeaders = data.listings[0] ? Object.keys(data.listings[0]) : [];
      const requiredColumns = ['Numéro A', 'Numéro B', 'Date', 'Type'];
      const missingColumns = requiredColumns.filter(col => 
        !listingHeaders.some(header => header.toLowerCase().includes(col.toLowerCase().replace('é', 'e')))
      );
      
      if (missingColumns.length > 0) {
        console.warn(`Missing expected columns in Listing sheet: ${missingColumns.join(", ")}`);
        console.log("Available columns:", listingHeaders);
      }
      
      // Add metadata to the processed data
      data._metadata = {
        fileName,
        processedAt: new Date().toISOString(),
        totalRecords: data.listings.length,
        sheetsProcessed: totalProcessed,
        alternativeSheets: validation.alternativeSheets,
        headers: {
          listings: listingHeaders
        }
      };
      
      updateProcessingStep('complete', 'completed', `Ready! ${data.listings.length} interactions loaded`);
      onUpload(data);
      return true;
      
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      updateProcessingStep('process', 'error', `Processing failed: ${error.message}`);
      onError(`Failed to process Excel file "${fileName}". Please check if the file is not corrupted and contains the expected data structure. Error: ${error.message}`);
      return false;
    }
  };

  const processZipFile = async (file: File) => {
    try {
      initializeProcessingSteps(true);
      updateProcessingStep('extract', 'processing', 'Extracting ZIP archive...');
      
      const zip = new JSZip();
      const zipData = await zip.loadAsync(file);
      
      // Enhanced file discovery in ZIP
      const excelFiles: Array<{ name: string; data: ArrayBuffer }> = [];
      const fileNames: string[] = [];
      
      for (const [fileName, zipEntry] of Object.entries(zipData.files)) {
        if (!zipEntry.dir) {
          fileNames.push(fileName);
          // Support both .xlsx and .xls files
          if (fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')) {
            try {
              const arrayBuffer = await zipEntry.async('arraybuffer');
              excelFiles.push({ name: fileName, data: arrayBuffer });
            } catch (extractError) {
              console.error(`Error extracting ${fileName}:`, extractError);
            }
          }
        }
      }
      
      setZipContents(fileNames);
      updateProcessingStep('extract', 'completed', `Extracted ${fileNames.length} files from archive`);
      updateProcessingStep('locate', 'processing', 'Searching for Excel files...');
      
      if (excelFiles.length === 0) {
        updateProcessingStep('locate', 'error', 'No Excel files found in archive');
        onError(`No Excel files (.xlsx or .xls) found in the ZIP archive "${file.name}". Found files: ${fileNames.join(", ")}`);
        return;
      }
      
      updateProcessingStep('locate', 'completed', `Found ${excelFiles.length} Excel file(s)`);
      
      // Try to process each Excel file until we find one with valid structure
      let processed = false;
      const errors: string[] = [];
      
      for (const excelFile of excelFiles) {
        try {
          const success = await processExcelFile(excelFile.data, excelFile.name);
          if (success) {
            processed = true;
            break;
          }
        } catch (error: any) {
          errors.push(`${excelFile.name}: ${error.message}`);
        }
      }
      
      if (!processed) {
        const errorMessage = `None of the Excel files in the ZIP archive contain the required sheet structure.\n\nFiles checked:\n• ${excelFiles.map(f => f.name).join("\n• ")}\n\nErrors encountered:\n• ${errors.join("\n• ")}`;
        onError(errorMessage);
      }
      
    } catch (error: any) {
      console.error("Error processing ZIP file:", error);
      updateProcessingStep('extract', 'error', `ZIP extraction failed: ${error.message}`);
      onError(`Failed to process ZIP file "${file.name}": ${error.message}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setValidationResult(null);
    setZipContents(null);
    setIsProcessing(true);

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      initializeProcessingSteps(false);
      processExcelFile(file, file.name).finally(() => setIsProcessing(false));
    } else if (fileName.endsWith('.zip')) {
      processZipFile(file).finally(() => setIsProcessing(false));
    } else {
      onError(`Unsupported file type: "${file.name}". Please upload an Excel file (.xlsx, .xls) or ZIP archive (.zip) containing Excel files.`);
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
    multiple: false,
    maxSize: 100 * 1024 * 1024, // 100MB limit
  });

  const removeFile = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setZipContents(null);
    setProcessingSteps([]);
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Drop Zone */}
      <motion.div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragActive 
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950 scale-105 shadow-lg shadow-blue-500/20" 
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
          }
          ${isProcessing ? "pointer-events-none opacity-50" : ""}
        `}
        whileHover={{ scale: isDragActive ? 1.05 : 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input {...getInputProps()} />
        
        <div className="relative space-y-4">
          <motion.div 
            className={`
              inline-flex items-center justify-center w-16 h-16 rounded-full
              transition-all duration-300
              ${isDragActive 
                ? "bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/30" 
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              }
            `}
            animate={isDragActive ? { rotate: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isDragActive ? Infinity : 0 }}
          >
            <Upload className="w-8 h-8" />
          </motion.div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {isDragActive ? "Drop your file here" : "Upload Communication Data"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop an Excel file (.xlsx, .xls) or ZIP archive, or click to browse
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <motion.div 
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              {/* CORRECTED: Use the renamed 'FileIcon' component */}
              <FileIcon className="w-4 h-4 text-green-600" />
              <span>.xlsx / .xls</span>
            </motion.div>
            <motion.div 
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <Archive className="w-4 h-4 text-blue-600" />
              <span>.zip</span>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Processing Steps */}
      <AnimatePresence>
        {processingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
          >
            <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Processing Status
            </h4>
            
            <div className="space-y-2">
              {processingSteps.map((step, index) => (
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-2 rounded-md bg-gray-50 dark:bg-gray-700"
                >
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {step.name.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      {step.progress !== undefined && (
                        <span className="text-xs text-gray-500">{Math.round(step.progress)}%</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
                    {step.progress !== undefined && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced File Info and Validation Results */}
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            {/* File Info Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  {uploadedFile.name.endsWith('.zip') ? (
                    <Archive className="w-5 h-5 text-blue-600" />
                  ) : (
                    // CORRECTED: Use the renamed 'FileIcon' component
                    <FileIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
              >
                <X className="w-4 h-4 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
            
            {/* ZIP Contents */}
            {zipContents && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Archive Contents ({zipContents.length} files)
                </h4>
                <div className="max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {zipContents.map((fileName, index) => (
                      <div
                        key={index}
                        className={`
                          text-xs p-2 rounded-md flex items-center gap-2
                          ${fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls')
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }
                        `}
                      >
                        {/* CORRECTED: Use the renamed 'FileIcon' component */}
                        <FileIcon className="w-3 h-3" />
                        {fileName}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Enhanced Validation Results */}
            {validationResult && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Sheet Validation Results
                </h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {REQUIRED_SHEETS.map(sheet => {
                    const isFound = validationResult.foundSheets.includes(sheet);
                    const alternativeName = validationResult.alternativeSheets[sheet];
                    
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
                        <div className="flex-1">
                          <span>{sheet}</span>
                          {alternativeName && (
                            <div className="text-xs opacity-75 mt-1">
                              → Found as "{alternativeName}"
                            </div>
                          )}
                        </div>
                        <span className="ml-auto text-xs font-medium">
                          {isFound ? "✓ Found" : "✗ Missing"}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Suggestions for missing sheets */}
                {validationResult.suggestions.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <h5 className="font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      Suggestions
                    </h5>
                    <div className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                      {validationResult.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500 mt-0.5">•</span>
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Data Preview */}
                {validationResult.dataPreview && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <h5 className="font-medium text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4" />
                      Data Preview
                    </h5>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-blue-700 dark:text-blue-300">Total Records:</span>
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          {validationResult.dataPreview.totalRows}
                        </span>
                      </div>
                      {validationResult.dataPreview.headers.length > 0 && (
                        <div>
                          <p className="text-blue-700 dark:text-blue-300 mb-1">Detected Columns:</p>
                          <div className="flex flex-wrap gap-1">
                            {validationResult.dataPreview.headers.slice(0, 6).map((header: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                              >
                                {header}
                              </span>
                            ))}
                            {validationResult.dataPreview.headers.length > 6 && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-md">
                                +{validationResult.dataPreview.headers.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Requirements Section */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Required Excel Sheets
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
          {REQUIRED_SHEETS.map((sheet, index) => (
            <motion.div 
              key={sheet} 
              className="flex items-center gap-2 p-2 rounded-md hover:bg-white/50 dark:hover:bg-gray-600/30 transition-colors"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="font-medium">{sheet}</span>
              {SHEET_ALTERNATIVES[sheet] && (
                <div className="text-xs text-gray-500">
                  (or {SHEET_ALTERNATIVES[sheet].slice(0, 2).join(", ")})
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>💡 Smart Validation:</strong> Our system automatically detects alternative sheet names, 
              handles accented characters, and provides suggestions for missing sheets. 
              Both .xlsx and .xls formats are supported, including ZIP archives.
            </p>
          </div>
          
          <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <strong>📊 Expected Data:</strong> The "Listing" sheet should contain communication records with 
              columns like "Numéro A", "Numéro B", "Date", and "Type" for proper network analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}