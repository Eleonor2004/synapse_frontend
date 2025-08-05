// src/services/workbenchService.ts

import apiClient from "../lib/apiClient";
import { ListingSet, GraphResponse } from "../types/api";

/**
 * Uploads a listing file to the backend to create a new ListingSet.
 */
export const importListingsFile = async ({ name, listings }: { name: string; listings: Record<string, unknown>[] }): Promise<{ message: string; listing_set: ListingSet }> => {
  const payload = { name, listings };
  const response = await apiClient.post('/workbench/listings/import', payload);
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
export const getGraphDataForSets = async (listing_set_ids: string[]): Promise<GraphResponse> => {
  // FIX: Reverted the request body to send the array directly.
  // The backend expects a simple array `["id1", "id2"]`, not an object `{"listing_set_ids": [...]}`.
  // This fixes the 422 Unprocessable Content error.
  const response = await apiClient.post('/workbench/visualize', listing_set_ids);
  return response.data;
};