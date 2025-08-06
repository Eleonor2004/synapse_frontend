// src/app/[locale]/workbench/page.tsx

"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from 'next/dynamic';

import { FilterPanel } from "../../../components/workbench/FilterPanel";
import { IndividualInfo } from "../../../components/workbench/IndividualInfo";
import { AuthGuard } from "../../../components/auth/AuthGuard";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, List, Eye, Loader2, PanelLeftClose, PanelRightClose, PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { getMyListingSets, importListingsFile, getGraphDataForSets } from "../../../services/workbenchService";
import { GraphResponse, ListingSet, LocationPoint } from "../../../types/api";

const NetworkGraph = dynamic(() => 
  import("../../../components/workbench/NetworkGraph").then(mod => mod.NetworkGraph), 
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div> }
);

const LocationGraph = dynamic(() => 
  import("../../../components/workbench/LocationGraph").then(mod => mod.LocationGraph),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin"/></div> }
);

import { FileUploader } from "../../../components/workbench/FileUploader";

type DynamicRow = Record<string, unknown>;

export interface ExcelData {
  listings?: DynamicRow[];
  subscribers?: DynamicRow[];
  locations?: LocationPoint[]; 
  [key: string]: DynamicRow[] | LocationPoint[] | undefined;
}

export interface IndividualDetails {
  type?: string;
  size?: number;
  location?: string | null;
  locations?: number;
  lastSeen?: number;
}

export interface Individual {
  id: string;
  phoneNumber: string;
  imei?: string;
  location?: string;
  interactions: number;
  details: IndividualDetails;
}

interface Filters {
  interactionType: "all" | "calls" | "sms";
  dateRange: { start: string; end: string };
  individuals: string[];
  minInteractions: number;
}

export default function WorkbenchPage() {
  const { addNotification, notifications, removeNotification } = useNotifications();
  const queryClient = useQueryClient();

  const [selectedListingSet, setSelectedListingSet] = useState<ListingSet | null>(null);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [clientSideData, setClientSideData] = useState<ExcelData | null>(null);
  const [activeView, setActiveView] = useState<"network" | "location">("network");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isIndividualPanelOpen, setIsIndividualPanelOpen] = useState(true);
  
  const [filters, setFilters] = useState<Filters>({
    interactionType: "all",
    dateRange: { start: "", end: "" },
    individuals: [],
    minInteractions: 0
  });

  // Check if we are on the client-side
  const isClient = typeof window !== 'undefined';

  const { data: listingSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['listingSets'],
    queryFn: getMyListingSets,
    // FIX: Only enable this query when running in the browser.
    enabled: isClient,
  });
  
  const { data: remoteGraphData, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['graphData', selectedListingSet?.id],
    queryFn: (): Promise<GraphResponse> => getGraphDataForSets([selectedListingSet!.id]),
    // FIX: Only enable this query if a set is selected AND we are in the browser.
    enabled: !!selectedListingSet && isClient,
  });

  const uploadMutation = useMutation({
    mutationFn: importListingsFile,
    onSuccess: (data) => {
      addNotification("success", "Analysis Saved", `Analysis "${data.listing_set.name}" has been saved to your account.`);
      queryClient.invalidateQueries({ queryKey: ['listingSets'] });
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      addNotification("error", "Save Failed", error.response?.data?.detail || "Could not save the analysis to the server.");
    },
  });

  const handleFileUpload = (parsedData: ExcelData, analysisName: string) => {
    if (!analysisName || !parsedData.listings) return;
    
    addNotification("info", "Visualizing Data", "Your graph is being rendered instantly.");
    setClientSideData(parsedData);
    setSelectedListingSet(null);
    setSelectedIndividual(null);
    setActiveView('network');

    uploadMutation.mutate({ name: analysisName, listings: parsedData.listings as Record<string, unknown>[] });
  };

  const handleViewAnalysis = (listingSet: ListingSet) => {
    setSelectedListingSet(listingSet);
    setClientSideData(null); 
    setSelectedIndividual(null);
    setActiveView('network');
  };
  
  const handleBackToUpload = () => {
    setSelectedListingSet(null);
    setClientSideData(null);
    setSelectedIndividual(null);
  }
  
  const activeData: ExcelData | null = useMemo(() => {
    if (clientSideData) {
      return clientSideData;
    }
    
    if (remoteGraphData && remoteGraphData.network && remoteGraphData.network.nodes) {
      const transformedListings = remoteGraphData.network.nodes.map(node => ({
          id: node.id,
          label: node.label,
          ...node.properties
      }));

      return { 
        listings: transformedListings, 
        locations: remoteGraphData.locations
      };
    }
    
    return null;
  }, [clientSideData, remoteGraphData]);

  const isAnalysisView = !!activeData;
  
  // The rest of your component remains the same...
  const renderWelcomeView = () => (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] p-6">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl"
        >
            <div className="bg-card p-6 sm:p-8 rounded-xl border border-border shadow-sm">
                <h1 className="text-2xl font-bold text-center mb-2 text-foreground">Start Your Analysis</h1>
                <p className="text-center text-muted-foreground mb-8">Upload a new data file to begin, or select a previous analysis below.</p>
                <FileUploader 
                    onUpload={handleFileUpload} 
                    onError={(e) => addNotification("error", "File Parsing Error", e)} 
                />
            </div>
            <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 justify-center"><List className="w-5 h-5" /> My Past Analyses</h2>
                {isLoadingSets ? (
                    <div className="flex items-center justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                ) : (listingSets && listingSets.length > 0) ? (
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                    {listingSets?.map((set, index) => (
                        <motion.div 
                            key={set.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="p-4 rounded-lg flex justify-between items-center border bg-card hover:bg-muted/50 transition-colors"
                        >
                            <div>
                                <p className="font-semibold text-foreground">{set.name}</p>
                                <p className="text-sm text-muted-foreground">{new Date(set.createdAt).toLocaleString()}</p>
                            </div>
                            <button onClick={() => handleViewAnalysis(set)} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" title="View this analysis">
                                <Eye className="w-4 h-4" /> View
                            </button>
                        </motion.div>
                    ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p>No past analyses found.</p>
                    </div>
                )}
            </div>
        </motion.div>
    </div>
  );
  
  const renderAnalysisView = () => (
     <div className="flex h-[calc(100vh-100px)] p-4 gap-4">
        <AnimatePresence>
            {isFilterPanelOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0, x: -50 }} animate={{ width: 350, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: -50 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex-shrink-0" >
                    <FilterPanel filters={filters} onFiltersChange={setFilters} data={activeData!} />
                </motion.div>
            )}
        </AnimatePresence>
        <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-shrink-0 bg-card border border-border rounded-lg p-2 mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={handleBackToUpload} className="px-3 py-2 text-sm rounded-md hover:bg-muted">← Back</button>
                        <div className="h-6 w-px bg-border"></div>
                        <h2 className="font-semibold text-lg">{selectedListingSet?.name || "New Analysis"}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className="p-2 rounded-md hover:bg-muted" title={isFilterPanelOpen ? "Collapse Filters" : "Expand Filters"}>{isFilterPanelOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}</button>
                        <div className="flex items-center bg-muted p-1 rounded-lg">
                            <button onClick={() => setActiveView('network')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${activeView === 'network' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}><LayoutGrid className="w-4 h-4" /> Network</button>
                            <button onClick={() => setActiveView('location')} className={`px-3 py-1 text-sm rounded-md flex items-center gap-2 ${activeView === 'location' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}><Map className="w-4 h-4" /> Location</button>
                        </div>
                        <button onClick={() => setIsIndividualPanelOpen(!isIndividualPanelOpen)} className="p-2 rounded-md hover:bg-muted" title={isIndividualPanelOpen ? "Collapse Details" : "Expand Details"}>{isIndividualPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}</button>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 min-h-0">
                {isLoadingGraph ? (
                     <div className="h-full flex items-center justify-center text-center p-4 bg-card rounded-lg border">
                        <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                        <h3 className="text-xl font-semibold">Loading Analysis Data...</h3>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div key={activeView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="w-full h-full" >
                            {activeView === 'network' ? (
                                <NetworkGraph data={activeData} filters={filters} onIndividualSelect={setSelectedIndividual} />
                            ) : (
                                <LocationGraph data={activeData} filters={filters} onIndividualSelect={setSelectedIndividual} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
        <AnimatePresence>
            {isIndividualPanelOpen && (
                <motion.div
                    initial={{ width: 0, opacity: 0, x: 50 }} animate={{ width: 400, opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 50 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="flex-shrink-0" >
                    <IndividualInfo individual={selectedIndividual} data={activeData!} />
                </motion.div>
            )}
        </AnimatePresence>
     </div>
  );

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background text-foreground">
        <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
        <header className="h-[60px] border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6">
            <h1 className="text-xl font-bold">Analysis Workbench</h1>
        </header>
        <main>
           <AnimatePresence mode="wait">
              <motion.div key={isAnalysisView ? 'analysis' : 'welcome'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} >
                {isAnalysisView ? renderAnalysisView() : renderWelcomeView()}
              </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </AuthGuard>
  );
}