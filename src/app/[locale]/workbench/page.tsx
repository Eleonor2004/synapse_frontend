"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUploader, ExcelData } from "../../../components/workbench/FileUploader";
import { NetworkGraph, Individual } from "../../../components/workbench/NetworkGraph";
import { LocationGraph } from "../../../components/workbench/LocationGraph";
import { AuthGuard } from "../../../components/auth/AuthGuard";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, List, Upload, Users, Activity, Eye, Loader2 } from "lucide-react";
import { getMyListingSets, importListingsFile, getGraphDataForSets } from "../../../services/workbenchService";
import { ListingSet } from "../../../types/api";

export default function WorkbenchPage() {
  const { addNotification, notifications } = useNotifications();
  const queryClient = useQueryClient();
  
  const [selectedListingSet, setSelectedListingSet] = useState<ListingSet | null>(null);
  const [selectedIndividual, setSelectedIndividual] = useState<Individual | null>(null);
  const [activeView, setActiveView] = useState<"network" | "location">("network");

  const { data: listingSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['listingSets'],
    queryFn: getMyListingSets,
  });

  // This query now fetches the RAW listings data array
  const { data: listingsData, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['listingsData', selectedListingSet?.id],
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
    if (!analysisName || !parsedData.listings) return;
    // We send the raw listings array to the backend
    uploadMutation.mutate({ name: analysisName, listings: parsedData.listings });
  };

  const handleViewAnalysis = (listingSet: ListingSet) => {
    setSelectedListingSet(listingSet);
    setSelectedIndividual(null);
  };

  // --- THIS IS THE FIX ---
  // Recreate the ExcelData structure that your components expect from the fetched data.
  const excelDataForGraphs: ExcelData | null = listingsData ? { listings: listingsData } : null;
  // -----------------------

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NotificationContainer notifications={notifications} />
        <div className="border-b border-border bg-card">
          {/* ... Your Header JSX ... */}
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
                      <p className="text-muted-foreground">Choose an analysis from the list to view.</p>
                    </div>
                  </div>
                ) : isLoadingGraph ? (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                    <h3 className="text-xl font-semibold">Loading Analysis Data...</h3>
                  </div>
                ) : excelDataForGraphs ? (
                  activeView === 'network' ? (
                    <LocationGraph data={excelDataForGraphs} filters={{}} onIndividualSelect={setSelectedIndividual} />
                  ) : (
                    
                    <NetworkGraph data={excelDataForGraphs} filters={{}} onIndividualSelect={setSelectedIndividual} />
                  )
                ) : (
                  <div className="h-full flex items-center justify-center text-center p-4">
                    <p>No data found for this analysis.</p>
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