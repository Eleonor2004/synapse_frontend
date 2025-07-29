// src/app/[locale]/workbench/page.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileUploader } from "../../../components/workbench/FileUploader";
import { NetworkGraph } from "../../../components/workbench/NetworkGraph";
//import { LocationGraph } from "@/components/workbench/LocationGraph";
import { FilterPanel } from "../../../components/workbench/FilterPanel";
//import { IndividualInfo } from "@/components/workbench/IndividualInfo";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, Filter, Search, Upload } from "lucide-react";

export interface ExcelData {
  subscribers: any[];
  listings: any[];
  cellFrequency: any[];
  correspondentFrequency: any[];
  callDurationFrequency: any[];
  imeiFrequency: any[];
  subscriberIdentification: any[];
}

export interface Individual {
  id: string;
  phoneNumber: string;
  imei?: string;
  interactions: number;
  details: any;
}

export default function WorkbenchPage() {
  const t = useTranslations("Workbench");
  const { notifications, addNotification } = useNotifications();
  
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [activeView, setActiveView] = useState<"network" | "location">("network");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    interactionType: "all",
    dateRange: { start: "", end: "" },
    individuals: [],
    minInteractions: 0
  });

  const handleFileUpload = (data: ExcelData) => {
    setExcelData(data);
    addNotification(
      "success",
      "File Uploaded Successfully",
      "Excel file has been processed and data is ready for visualization."
    );
  };

  const handleUploadError = (error: string) => {
    addNotification(
      "error",
      "Upload Failed",
      error
    );
  };

  const handleIndividualSelect = (individual: Individual) => {
    setSelectedIndividual(individual);
  };

  const toggleView = (view: "network" | "location") => {
    setActiveView(view);
  };

  return (
    <div className="min-h-screen bg-background">
      <NotificationContainer notifications={notifications} />
      
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
                  <LayoutGrid className="w-6 h-6 text-white" />
                </div>
                SYNAPSE Workbench
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze communication networks and visualize interactions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                  ${isFilterPanelOpen 
                    ? "bg-primary text-white" 
                    : "bg-muted hover:bg-muted-foreground/10"
                  }
                `}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <div className="flex rounded-lg bg-muted p-1">
                <button
                  onClick={() => toggleView("network")}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${activeView === "network"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Network
                </button>
                <button
                  onClick={() => toggleView("location")}
                  className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all
                    ${activeView === "location"
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                >
                  <Map className="w-4 h-4" />
                  Location
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {!excelData ? (
          /* Upload Section */
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl">
    
              
              <FileUploader 
                onUpload={handleFileUpload}
                onError={handleUploadError}
              />
            </div>
          </div>
        ) : (
          /* Main Content */
          <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Filter Panel */}
            {isFilterPanelOpen && (
              <div className="col-span-3">
                <FilterPanel 
                  filters={filters}
                  onFiltersChange={setFilters}
                  data={excelData}
                />
              </div>
            )}
            
            {/* Main Graph Area */}
            <div className={`${isFilterPanelOpen ? "col-span-6" : "col-span-9"}`}>
              <div className="h-full rounded-lg border border-border bg-card shadow-sm">
                <NetworkGraph 
                    data={excelData}
                    filters={filters}
                    onIndividualSelect={handleIndividualSelect}
                  />
                {/*{activeView === "network" ? (
                  <NetworkGraph 
                    data={excelData}
                    filters={filters}
                    onIndividualSelect={handleIndividualSelect}
                  />
                ) : (
                  <LocationGraph 
                    data={excelData}
                    filters={filters}
                    onIndividualSelect={handleIndividualSelect}
                  />
                )}*/}
              </div>
            </div>
            
            {/* Individual Info Panel 
            <div className="col-span-3">
              <IndividualInfo 
                individual={selectedIndividual}
                data={excelData}
              />
            </div>
            */}
          </div>
        )}
      </div>
    </div>
  );
}