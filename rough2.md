
ThinkingThoughts
(experimental)
Auto
Expand to view model thoughts

chevron_right
Excellent. You've provided the complete picture of your frontend, and it's a very impressive and well-structured setup. The components are well-defined, and the UI is sophisticated.
I have meticulously reviewed the code for WorkbenchPage, FileUploader, NetworkGraph, and LocationGraph. Here is the critical analysis and the detailed plan of action to connect this to your backend.
Critical Analysis: The Core Architectural Shift
The most important thing to understand is that your application is currently architected to be 100% client-side.
The FileUploader parses a complex Excel file in the browser.
The WorkbenchPage holds the entire parsed dataset in a useState variable (excelData). This data is lost on a page refresh.
The NetworkGraph and LocationGraph components perform all the heavy data processing and transformation (calculating nodes, edges, locations) in the browser every time they render.
Our goal is to shift this architecture to a client-server model, which is far more scalable, persistent, and powerful.
The New Flow:
User uploads a file.
The frontend sends this file to the backend along with a name for the analysis.
The backend processes the file, creates a persistent ListingSet, and stores the structured graph data in the Neo4j database.
The Workbench page fetches the list of saved analyses from the backend.
When a user clicks an analysis, the frontend fetches the pre-processed graph data (nodes and edges) from the backend.
The NetworkGraph and LocationGraph components become "dumber"—their only job is to render the graph data they receive, not to process it from scratch.
This is the professional and maintainable way to build this application.
The Detailed Plan of Action
We will proceed in phases, modifying your components to adopt this new server-centric flow.
Phase 1: Create the Frontend Services
We need dedicated functions for communicating with our new workbench endpoints.
Create a new file: services/workbenchService.ts.
Add the following code.
services/workbenchService.ts
Generated typescript
import apiClient from "@/lib/apiClient";
import { ListingSet, GraphData } from "@/types/api";

/**
 * Uploads a listing file to the backend to create a new ListingSet.
 * @param name - The name for the new analysis/ListingSet.
 * @param file - The file to be uploaded (must be CSV format).
 */
export const importListingsFile = async ({ name, file }: { name: string; file: File }): Promise<{ message: string; listing_set: ListingSet }> => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('file', file);

  const response = await apiClient.post('/workbench/listings/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Fetches all ListingSets owned by the current user.
 */
export const getMyListingSets = async (): Promise<ListingSet[]> => {
  const response = await apiClient.get('/workbench/listings');
  return response.data;
};

/**
 * Fetches the processed graph data for a given set of ListingSet IDs.
 * @param listing_set_ids - An array of ListingSet IDs to visualize.
 */
export const getGraphDataForSets = async (listing_set_ids: string[]): Promise<GraphData> => {
  const response = await apiClient.post('/workbench/visualize', listing_set_ids);
  return response.data;
};
Use code with caution.
TypeScript
Phase 2: Modify the FileUploader and WorkbenchPage
This is the most significant change. We will change the FileUploader's onUpload prop and the WorkbenchPage's state management.
Helper function to convert JSON to CSV:
Since your FileUploader produces a JSON object but our backend expects a CSV, we'll do this conversion on the fly. Create a new file lib/csvHelper.ts.
lib/csvHelper.ts
Generated typescript
// A simple utility to convert an array of objects to a CSV string
export const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) {
    return "";
  }
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => JSON.stringify(row[header], (_, value) => value ?? '')).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
};
Use code with caution.
TypeScript
Update the WorkbenchPage:
This component will now be the orchestrator. It will manage which analysis is selected and trigger the API calls.
app/[locale]/workbench/page.tsx (Updated)
Generated typescript
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileUploader } from "../../../components/workbench/FileUploader";
import { NetworkGraph } from "../../../components/workbench/NetworkGraph";
import { LocationGraph } from "../../../components/workbench/LocationGraph";
import { AuthGuard } from "../../../components/auth/AuthGuard";
import { useNotifications, NotificationContainer } from "../../../components/ui/Notification";
import { LayoutGrid, Map, Users, Activity, List, Eye } from "lucide-react";
import { getMyListingSets, importListingsFile, getGraphDataForSets } from "@/services/workbenchService";
import { convertToCSV } from "@/lib/csvHelper";
import { ListingSet } from "@/types/api";

// This is the data structure your FileUploader produces
export interface ParsedExcelData {
  listings: any[];
  // ... other sheets
}

export default function WorkbenchPage() {
  const { addNotification, notifications } = useNotifications();
  const queryClient = useQueryClient();

  // --- NEW STATE MANAGEMENT ---
  // This state tracks which saved analysis the user wants to view
  const [selectedListingSet, setSelectedListingSet] = useState<ListingSet | null>(null);

  // --- DATA FETCHING WITH TanStack Query ---

  // 1. Fetch the list of all saved analyses
  const { data: listingSets, isLoading: isLoadingSets } = useQuery({
    queryKey: ['listingSets'],
    queryFn: getMyListingSets,
  });

  // 2. Fetch the graph data for the *selected* analysis
  const { data: graphData, isLoading: isLoadingGraph } = useQuery({
    queryKey: ['graphData', selectedListingSet?.id],
    queryFn: () => getGraphDataForSets([selectedListingSet!.id]),
    enabled: !!selectedListingSet, // Only run this query when a listing set is selected
  });

  // --- DATA MUTATION (UPLOAD) WITH TanStack Query ---
  const uploadMutation = useMutation({
    mutationFn: importListingsFile,
    onSuccess: (data) => {
      addNotification("success", "Upload Successful", `Analysis "${data.listing_set.name}" is now processing.`);
      // When upload is successful, automatically refetch the list of analyses
      queryClient.invalidateQueries({ queryKey: ['listingSets'] });
    },
    onError: (error: any) => {
      addNotification("error", "Upload Failed", error.response?.data?.detail || error.message);
    },
  });

  // --- EVENT HANDLERS ---

  const handleFileUpload = (parsedData: ParsedExcelData) => {
    const analysisName = prompt("Please enter a name for this analysis:", "New Case File");
    if (!analysisName || !parsedData.listings) {
      addNotification("error", "Upload Canceled", "An analysis name is required.");
      return;
    }

    // Convert the 'listings' sheet to a CSV string
    const csvData = convertToCSV(parsedData.listings);
    const csvFile = new File([csvData], "upload.csv", { type: "text/csv" });

    // Trigger the upload mutation
    uploadMutation.mutate({ name: analysisName, file: csvFile });
  };

  const handleViewAnalysis = (listingSet: ListingSet) => {
    setSelectedListingSet(listingSet);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <NotificationContainer notifications={notifications} />
        
        {/* ... (Your Header is fine, no changes needed) ... */}

        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-12 gap-6">
            
            {/* --- LEFT PANEL: UPLOAD & LIST OF ANALYSES --- */}
            <div className="col-span-12 md:col-span-4 lg:col-span-3">
              <div className="space-y-6">
                {/* File Uploader */}
                <div className="bg-card p-4 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4">Import New Analysis</h2>
                  <FileUploader onUpload={handleFileUpload} onError={(e) => addNotification("error", "File Error", e)} />
                </div>

                {/* List of Saved Analyses */}
                <div className="bg-card p-4 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4">My Analyses</h2>
                  {isLoadingSets && <p>Loading analyses...</p>}
                  <div className="space-y-2">
                    {listingSets?.map((set) => (
                      <div
                        key={set.id}
                        className={`p-3 rounded-md flex justify-between items-center border ${
                          selectedListingSet?.id === set.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{set.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(set.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleViewAnalysis(set)}
                          className="p-2 rounded-md hover:bg-primary/20"
                          title="View this analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT PANEL: VISUALIZATION AREA --- */}
            <div className="col-span-12 md:col-span-8 lg:col-span-9">
              <div className="h-[calc(100vh-200px)] rounded-lg border bg-card shadow-sm overflow-hidden">
                {selectedListingSet ? (
                  isLoadingGraph ? (
                    <p>Loading graph data...</p>
                  ) : graphData ? (
                    // We will pass the fetched graphData to our components
                    // For now, let's just show a placeholder
                    <div>
                      <h2 className="text-xl p-4">Viewing: {selectedListingSet.name}</h2>
                      <pre className="p-4 bg-muted text-xs">
                        {JSON.stringify(graphData, null, 2)}
                      </pre>
                      {/* 
                        IN THE NEXT STEP, WE WILL REFACTOR NetworkGraph AND LocationGraph
                        TO ACCEPT `graphData` INSTEAD OF `excelData`.
                        <NetworkGraph data={graphData} ... /> 
                      */}
                    </div>
                  ) : (
                    <p>No graph data found for this analysis.</p>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <List className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold">Select an Analysis</h3>
                      <p className="text-muted-foreground">
                        Choose an analysis from the list on the left to view the graph.
                      </p>
                    </div>
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
