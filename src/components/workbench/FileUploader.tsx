// Enhanced FileUploader with improved validation and error handling
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle, FolderOpen, Archive, Info } from "lucide-react";
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

// Alternative sheet names that might be used
const SHEET_ALTERNATIVES = {
  "Abonné": ["Abonne", "Subscribers", "Abonnes"],
  "Listing": ["Listings", "Communications", "Calls"],
  "Fréquence par cellule": ["Frequence par cellule", "Cell Frequency", "Cellule"],
  "Fréquence Correspondant": ["Frequence Correspondant", "Correspondent Frequency"],
  "Fréquence par Durée appel": ["Frequence par Duree appel", "Call Duration Frequency", "Duree"],
  "Fréquence par IMEI": ["Frequence par IMEI", "IMEI Frequency"],
  "Identification des abonnés": ["Identification des abonnes", "Subscriber Identification", "Identification"]
};

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
    alternatives: { [key: string]: string };
  } | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [zipContents, setZipContents] = useState<string[] | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

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

  // Enhanced sheet name matching
  const findSheetMatch = (sheetNames: string[], requiredSheet: string): string | null => {
    // Exact match first
    if (sheetNames.includes(requiredSheet)) {
      return requiredSheet;
    }

    // Case-insensitive match
    const lowerSheetNames = sheetNames.map(name => name.toLowerCase());
    const lowerRequired = requiredSheet.toLowerCase();
    const caseInsensitiveMatch = sheetNames.find((_, index) => 
      lowerSheetNames[index] === lowerRequired
    );
    if (caseInsensitiveMatch) {
      return caseInsensitiveMatch;
    }

    // Alternative names
    const alternatives = SHEET_ALTERNATIVES[requiredSheet] || [];
    for (const alt of alternatives) {
      const altMatch = sheetNames.find(name => 
        name.toLowerCase() === alt.toLowerCase()
      );
      if (altMatch) {
        return altMatch;
      }
    }

    // Partial match (contains the required name)
    const partialMatch = sheetNames.find(name => 
      name.toLowerCase().includes(lowerRequired.toLowerCase()) ||
      lowerRequired.includes(name.toLowerCase())
    );
    
    return partialMatch || null;
  };

  const processExcelFile = async (file: File | ArrayBuffer, fileName: string = "file") => {
    try {
      updateProcessingStep('validate', 'processing');
      
      const arrayBuffer = file instanceof File ? await file.arrayBuffer() : file;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Enhanced sheet validation with alternatives
      const sheetNames = workbook.SheetNames;
      const foundSheets: string[] = [];
      const missingSheets: string[] = [];
      const alternatives: { [key: string]: string } = {};
      
      for (const requiredSheet of REQUIRED_SHEETS) {
        const match = findSheetMatch(sheetNames, requiredSheet);
        if (match) {
          foundSheets.push(requiredSheet);
          if (match !== requiredSheet) {
            alternatives[requiredSheet] = match;
          }
        } else {
          missingSheets.push(requiredSheet);
        }
      }
      
      setValidationResults({
        found: foundSheets,
        missing: missingSheets,
        alternatives
      });
      
      if (missingSheets.length > 0) {
        updateProcessingStep('validate', 'error', `Missing sheets: ${missingSheets.join(", ")}`);
        onError(`File "${fileName}" is missing required sheets: ${missingSheets.join(", ")}`);
        return false;
      }
      
      updateProcessingStep('validate', 'completed', 'All required sheets found');
      updateProcessingStep('process', 'processing');
      
      // Process each sheet with improved error handling
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
          // Use the actual sheet name (might be alternative)
          const actualSheetName = alternatives[sheetName] || sheetName;
          
          if (!workbook.Sheets[actualSheetName]) {
            throw new Error(`Sheet "${actualSheetName}" not found`);
          }
          
          const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[actualSheetName], {
            defval: "", // Default value for empty cells
            raw: false, // Don't use raw values, format them
            header: 1 // Include headers
          });
          
          // Skip empty rows and ensure we have data
          const filteredData = sheetData.filter((row: any) => 
            Array.isArray(row) ? row.some(cell => cell !== "") : Object.values(row).some(cell => cell !== "")
          );
          
          data[key] = filteredData;
          
          console.log(`Processed ${key} (${actualSheetName}):`, filteredData.length, 'rows');
          
        } catch (sheetError: any) {
          console.error(`Error processing sheet ${sheetName}:`, sheetError);
          updateProcessingStep('process', 'error', `Error processing sheet: ${sheetName}`);
          onError(`Error processing sheet "${sheetName}" in file "${fileName}": ${sheetError.message}`);
          return false;
        }
      }
      
      updateProcessingStep('process', 'completed', `Processed ${data.listings?.length || 0} records`);
      updateProcessingStep('complete', 'processing');
      
      // Enhanced data validation
      if (!data.listings || data.listings.length === 0) {
        updateProcessingStep('complete', 'error', 'No interaction data found');
        onError(`No interaction data found in the "Listing" sheet of "${fileName}"`);
        return false;
      }
      
      // Create preview data for display
      setPreviewData({
        totalRecords: data.listings.length,
        subscribers: data.subscribers?.length || 0,
        sheets: Object.keys(data).length,
        sampleRecord: data.listings[0] || null
      });
      
      updateProcessingStep('complete', 'completed', 'Data import completed successfully');
      onUpload(data);
      return true;
      
    } catch (error: any) {
      console.error("Error processing Excel file:", error);
      updateProcessingStep('process', 'error', 'Failed to process Excel file');
      onError(`Failed to process Excel file "${fileName}". Error: ${error.message}`);
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
      
    } catch (error: any) {
      console.error("Error processing ZIP file:", error);
      updateProcessingStep('extract', 'error', 'Failed to extract ZIP file');
      onError(`Failed to process ZIP file: ${error.message}`);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setValidationResults(null);
    setZipContents(null);
    setPreviewData(null);
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
    setPreviewData(null);
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
      {/* Drop Zone */}
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
              {isDragActive ? "Drop your file here" : "Upload your data file"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Drag and drop an Excel file (.xlsx) or ZIP archive, or click to browse
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <motion.div 
              className="flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              whileHover={{ scale: 1.05 }}
            >
              <File className="w-4 h-4 text-green-600" />
              <span>.xlsx</span>
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

      {/* Processing Steps */}
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
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">
                      {step.name.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.description}</p>
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
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                  {uploadedFile.name.endsWith('.zip') ? (
                    <Archive className="w-5 h-5 text-blue-600" />
                  ) : (
                    <File className="w-5 h-5 text-blue-600" />
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
                          ${fileName.endsWith('.xlsx') || fileName.endsWith('.xls')
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
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
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Sheet Validation:</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {REQUIRED_SHEETS.map(sheet => {
                    const isFound = validationResults.found.includes(sheet);
                    const alternativeName = validationResults.alternatives[sheet];
                    
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
              </div>
            )}

            {/* Preview Data */}
            {previewData && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Data Preview
                </h4>
                
                <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{previewData.totalRecords}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Total Records</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{previewData.subscribers}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Subscribers</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{previewData.sheets}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Data Sheets</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Requirements */}
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
            </motion.div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            <strong>💡 Tip:</strong> Your Excel file must contain all these sheets with the exact names shown above. 
            Alternative names are automatically detected. You can also upload a ZIP file containing the Excel file.
          </p>
        </div>
      </div>
    </div>
  );
}