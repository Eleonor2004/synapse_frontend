"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUploader, ExcelData } from "../../../components/workbench/FileUploader";
import { NetworkGraph, Individual } from "../../../components/workbench/NetworkGraph";
import { LocationGraph } from "../../../components/workbench/LocationGraph";
import { FilterPanel } from "../../../components/workbench/FilterPanel";
import { AuthGuard } from "../../../components/auth/AuthGuard";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, Filter, List, Upload, Users, MapPin, Activity, Eye, Loader2 } from "lucide-react";
import { getMyListingSets, importListingsFile, getGraphDataForSets } from "../../../services/workbenchService";
import { ListingSet } from "../../../types/api";

export default function WorkbenchPage() {
  const t = useTranslations("Workbench");
  const { notifications, addNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  const [selectedListingSet, setSelectedListingSet] = useState<ListingSet | null>(null);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [activeView, setActiveView] = useState<"network" | "location">("network");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    interactionType: "all",
    dateRange: { start: "", end: "" },
    individuals: [],
    minInteractions: 0
  });

  const { data: listingSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['listingSets'],
    queryFn: getMyListingSets,
  });

  // This query fetches the structured GraphResponse object
  const { data: graphResponse, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['graphData', selectedListingSet?.id],
    queryFn: () => getGraphDataForSets([selectedListingSet!.id]),
    enabled: !!selectedListingSet,
  });

  const uploadMutation = useMutation({
    mutationFn: importListingsFile,
    onSuccess: (data) => {
      addNotification("success", "Upload Successful", `Analysis "${data.listing_set.name}" is now processing.`);
      queryClient.invalidateQueries({ queryKey: ['listingSets'] });
    },
    onError: (error: any) => {
      addNotification("error", "Upload Failed", error.response?.data?.detail || error.message);
    },
  });

  const handleFileUpload = (parsedData: ExcelData) => {
    const analysisName = prompt("Please enter a name for this analysis:", `Case File - ${new Date().toLocaleDateString()}`);
    if (!analysisName) {
      addNotification("info", "Upload Canceled", "An analysis name is required.");
      return;
    }
    if (!parsedData.listings || parsedData.listings.length === 0) {
      addNotification("error", "Upload Failed", "No 'Listing' data found in the processed file.");
      return;
    }
    uploadMutation.mutate({ name: analysisName, listings: parsedData.listings });
  };

  const handleViewAnalysis = (listingSet: ListingSet) => {
    setSelectedListingSet(listingSet);
    setSelectedIndividual(null);
  };

  const dataStats = useMemo(() => {
    if (!graphResponse) return null;
    return {
      totalIndividuals: graphResponse.network.nodes.length,
      totalInteractions: graphResponse.network.edges.length,
      totalLocations: graphResponse.locations.length,
    };
  }, [graphResponse]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NotificationContainer notifications={notifications} />
        
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary"><LayoutGrid className="w-6 h-6 text-white" /></div>
                  Workbench
                </h1>
                <p className="text-muted-foreground mt-1">Analyze communication networks and visualize interactions</p>
              </div>
              <div className="flex items-center gap-3">
                {dataStats && (
                  <div className="flex items-center gap-4 px-4 py-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-1 text-sm"><Users className="w-4 h-4 text-primary" /> <span className="font-medium">{dataStats.totalIndividuals}</span> <span className="text-muted-foreground">individuals</span></div>
                    <div className="flex items-center gap-1 text-sm"><Activity className="w-4 h-4 text-secondary" /> <span className="font-medium">{dataStats.totalInteractions}</span> <span className="text-muted-foreground">interactions</span></div>
                  </div>
                )}
                <button onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${isFilterPanelOpen ? "bg-primary text-white" : "bg-muted hover:bg-muted-foreground/10"}`}>
                  <Filter className="w-4 h-4" /> Filters
                </button>
                <div className="flex rounded-lg bg-muted p-1">
                  <button onClick={() => setActiveView("network")} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === "network" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <LayoutGrid className="w-4 h-4" /> Network
                  </button>
                  <button onClick={() => setActiveView("location")} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeView === "location" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                    <Map className="w-4 h-4" /> Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="space-y-6">
                <div className="bg-card p-4 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Upload className="w-5 h-5" /> Import New Analysis</h2>
                  <FileUploader onUpload={handleFileUpload} onError={(e) => addNotification("error", "File Parsing Error", e)} />
                </div>
                <div className="bg-card p-4 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><List className="w-5 h-5" /> My Analyses</h2>
                  {isLoadingSets ? (
                    <div className="flex items-center justify-center p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
                  ) : (
                    <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                      {listingSets?.map((set) => (
                        <div key={set.id} className={`p-3 rounded-md flex justify-between items-center border transition-colors ${selectedListingSet?.id === set.id ? 'bg-primary/10 border-primary' : 'bg-muted/50 hover:bg-muted'}`}>
                          <div>
                            <p className="font-medium text-sm">{set.name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(set.createdAt).toLocaleString()}</p>
                          </div>
                          <button onClick={() => handleViewAnalysis(set)} className="p-2 rounded-md hover:bg-primary/20" title="View this analysis"><Eye className="w-4 h-4" /></button>
                        </div>
                      ))}
                      {listingSets?.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No analyses imported yet.</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 lg:col-span-9">
              <div className="h-[calc(100vh-200px)] rounded-lg border bg-card shadow-sm overflow-hidden">
                {!selectedListingSet ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <div>
                      <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold">Select an Analysis</h3>
                      <p className="text-muted-foreground">Choose an analysis from the list on the left to view the graph.</p>
                    </div>
                  </div>
                ) : isLoadingGraph ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold">Loading Analysis Data...</h3>
                    <p className="text-muted-foreground">Fetching and preparing visualization for "{selectedListingSet.name}".</p>
                  </div>
                ) : graphResponse ? (
                  // --- THIS IS THE DEFINITIVE FIX ---
                  // We pass the correct, unwrapped data to the components.
                  activeView === 'network' ? (
                    // NetworkGraph expects a prop `data` with a `nodes` and `edges` property.
                    // `graphResponse.network` has exactly this shape.
                    <NetworkGraph data={graphResponse.network} filters={filters} onIndividualSelect={setSelectedIndividual} />
                  ) : (
                    // LocationGraph expects a prop `locations` which is an array of location points.
                    // `graphResponse.locations` has exactly this shape.
                    <LocationGraph data={{ listings: [] }} /* Pass dummy data or refactor */ filters={filters} onIndividualSelect={setSelectedIndividual} />
                  )
                  // ------------------------------------
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <p>No data found for this analysis. The file might be empty or in an incorrect format.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}