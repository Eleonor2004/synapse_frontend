// src/app/[locale]/workbench/page.tsx
"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { FileUploader } from "../../../components/workbench/FileUploader";
import { NetworkGraph } from "../../../components/workbench/NetworkGraph";
import { LocationGraph } from "../../../components/workbench/LocationGraph";
import { FilterPanel } from "../../../components/workbench/FilterPanel";
//import { IndividualInfo } from "@/components/workbench/IndividualInfo";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, Filter, Search, Upload, Users, MapPin, Activity } from "lucide-react";

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
  const [activeView, setActiveView] = useState<"network" | "location">("location");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    interactionType: "all",
    dateRange: { start: "", end: "" },
    individuals: [],
    minInteractions: 0
  });

  // Calculate statistics from data
  const dataStats = useMemo(() => {
    if (!excelData) return null;

    return {
      totalIndividuals: new Set([
        ...excelData.listings.map((l: any) => l.phoneNumber),
        ...excelData.listings.map((l: any) => l.correspondentNumber)
      ].filter(Boolean)).size,
      totalInteractions: excelData.listings.length,
      totalLocations: excelData.cellFrequency.length,
      dateRange: {
        start: excelData.listings.length > 0 ? 
          Math.min(...excelData.listings.map((l: any) => new Date(l.timestamp || Date.now()).getTime())) : null,
        end: excelData.listings.length > 0 ? 
          Math.max(...excelData.listings.map((l: any) => new Date(l.timestamp || Date.now()).getTime())) : null
      }
    };
  }, [excelData]);

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
                Workbench
              </h1>
              <p className="text-muted-foreground mt-1">
                Analyze communication networks and visualize interactions
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Data Stats */}
              {dataStats && (
                <div className="flex items-center gap-4 px-4 py-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium">{dataStats.totalIndividuals}</span>
                    <span className="text-muted-foreground">individuals</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span className="font-medium">{dataStats.totalInteractions}</span>
                    <span className="text-muted-foreground">interactions</span>
                  </div>
                  {activeView === "location" && (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="w-4 h-4 text-accent" />
                      <span className="font-medium">{dataStats.totalLocations}</span>
                      <span className="text-muted-foreground">locations</span>
                    </div>
                  )}
                </div>
              )}

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

              {/* Required Sheets Info */}
              <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
                <h3 className="font-medium text-foreground mb-2">Required Excel Sheets</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div>• Abonné</div>
                  <div>• Listing</div>
                  <div>• Fréquence par cellule</div>
                  <div>• Fréquence Correspondant</div>
                  <div>• Fréquence par Durée appel</div>
                  <div>• Fréquence par IMEI</div>
                  <div className="col-span-2">• Identification des abonnés</div>
                </div>
              </div>
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
              <div className="h-full rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                {activeView === "network" ? (
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
                )}
              </div>
            </div>
            
            {/* Individual Info Panel */}
            <div className="col-span-3">
              <div className="h-full rounded-lg border border-border bg-card shadow-sm overflow-hidden">
                {selectedIndividual ? (
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Individual Details</h3>
                        <p className="text-sm text-muted-foreground">Selected: {selectedIndividual.phoneNumber}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Phone Number</div>
                        <div className="font-medium text-foreground">{selectedIndividual.phoneNumber}</div>
                      </div>

                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="text-sm text-muted-foreground mb-1">Total Interactions</div>
                        <div className="font-medium text-foreground">{selectedIndividual.interactions}</div>
                      </div>

                      {selectedIndividual.imei && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">IMEI</div>
                          <div className="font-medium text-foreground font-mono text-sm">{selectedIndividual.imei}</div>
                        </div>
                      )}

                      {selectedIndividual.details && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-2">Activity Summary</div>
                          <div className="space-y-2 text-sm">
                            {selectedIndividual.details.locations && (
                              <div className="flex justify-between">
                                <span>Locations:</span>
                                <span className="font-medium">{selectedIndividual.details.locations}</span>
                              </div>
                            )}
                            {selectedIndividual.details.interactionTypes && (
                              <div className="flex justify-between">
                                <span>Types:</span>
                                <span className="font-medium">{selectedIndividual.details.interactionTypes.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-4">
                    <div className="text-center">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium text-foreground mb-1">No Selection</h3>
                      <p className="text-sm text-muted-foreground">
                        Click on a node or individual to view detailed information
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}