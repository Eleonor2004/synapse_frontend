// src/components/workbench/FileUploader.tsx
"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

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

export function FileUploader({ onUpload, onError }: FileUploaderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResults, setValidationResults] = useState<{
    found: string[];
    missing: string[];
  } | null>(null);

  const processExcelFile = async (file: File) => {
    try {
      setIsProcessing(true);
      
      const arrayBuffer = await file.arrayBuffer();
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
        onError(`Missing required sheets: ${missingSheets.join(", ")}`);
        setIsProcessing(false);
        return;
      }
      
      // Process each sheet
      const data = {
        subscribers: XLSX.utils.sheet_to_json(workbook.Sheets["Abonné"]),
        listings: XLSX.utils.sheet_to_json(workbook.Sheets["Listing"]),
        cellFrequency: XLSX.utils.sheet_to_json(workbook.Sheets["Fréquence par cellule"]),
        correspondentFrequency: XLSX.utils.sheet_to_json(workbook.Sheets["Fréquence Correspondant"]),
        callDurationFrequency: XLSX.utils.sheet_to_json(workbook.Sheets["Fréquence par Durée appel"]),
        imeiFrequency: XLSX.utils.sheet_to_json(workbook.Sheets["Fréquence par IMEI"]),
        subscriberIdentification: XLSX.utils.sheet_to_json(workbook.Sheets["Identification des abonnés"])
      };
      
      onUpload(data);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing Excel file:", error);
      onError("Failed to process Excel file. Please check the file format.");
      setIsProcessing(false);
    }
  };

  const processZipFile = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // For ZIP files, we'll need to use JSZip library
      // For now, we'll show an error that ZIP support needs implementation
      onError("ZIP file support is coming soon. Please upload an Excel file directly.");
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing ZIP file:", error);
      onError("Failed to process ZIP file.");
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setValidationResults(null);

    if (file.name.endsWith('.xlsx')) {
      processExcelFile(file);
    } else if (file.name.endsWith('.zip')) {
      processZipFile(file);
    } else {
      onError("Please upload an Excel file (.xlsx) or ZIP archive (.zip)");
    }
  }, [onUpload, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/zip': ['.zip']
    },
    multiple: false
  });

  const removeFile = () => {
    setUploadedFile(null);
    setValidationResults(null);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-300 hover:border-secondary
          ${isDragActive 
            ? "border-secondary bg-secondary/5 scale-105" 
            : "border-border hover:bg-muted/50"
          }
          ${isProcessing ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className={`
            inline-flex items-center justify-center w-16 h-16 rounded-full
            transition-all duration-300
            ${isDragActive 
              ? "bg-secondary text-white scale-110" 
              : "bg-muted text-muted-foreground"
            }
          `}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? "Drop your file here" : "Upload your data file"}
            </h3>
            <p className="text-muted-foreground">
              Drag and drop an Excel file (.xlsx) or ZIP archive, or click to browse
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <File className="w-4 h-4" />
              .xlsx
            </span>
            <span className="flex items-center gap-1">
              <File className="w-4 h-4" />
              .zip
            </span>
          </div>
        </div>
        
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
              <span className="text-foreground font-medium">Processing file...</span>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded File Info */}
      {uploadedFile && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <File className="w-5 h-5 text-secondary" />
              <div>
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Validation Results */}
          {validationResults && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Sheet Validation:</h4>
              
              <div className="grid grid-cols-1 gap-2">
                {REQUIRED_SHEETS.map(sheet => {
                  const isFound = validationResults.found.includes(sheet);
                  return (
                    <div
                      key={sheet}
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
                      <span className="ml-auto text-xs">
                        {isFound ? "Found" : "Missing"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Requirements */}
      <div className="bg-muted/30 rounded-lg p-4">
        <h4 className="font-medium text-foreground mb-3">Required Excel Sheets:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
          {REQUIRED_SHEETS.map(sheet => (
            <div key={sheet} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              {sheet}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}