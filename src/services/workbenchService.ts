import apiClient from "../lib/apiClient";
import { ListingSet, GraphData } from "../types/api";

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