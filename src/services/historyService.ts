import apiClient from "../lib/apiClient";
import { ListingSet, AuditEvent } from "../types/api"; // We'll create AuditEvent type next

/**
 * Fetches all analyses (ListingSets) owned by the current user.
 */
export const getMyAnalyses = async (): Promise<ListingSet[]> => {
  const response = await apiClient.get<ListingSet[]>('/analyses/');
  return response.data;
};

/**
 * Updates the name/description of a specific analysis.
 */
export const updateAnalysis = async ({ id, name }: { id: string; name: string }): Promise<ListingSet> => {
  const response = await apiClient.put<ListingSet>(`/analyses/${id}`, { name });
  return response.data;
};

/**
 * Deletes a specific analysis and all its data.
 */
export const deleteAnalysis = async (id: string): Promise<void> => {
  await apiClient.delete(`/analyses/${id}`);
};

/**
 * Fetches the audit trail (activity history) for the current user.
 */
export const getActivityHistory = async (): Promise<AuditEvent[]> => {
  const response = await apiClient.get<AuditEvent[]>('/history/actions');
  return response.data;
};