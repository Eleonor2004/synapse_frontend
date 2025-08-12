import apiClient from "../lib/apiClient";
import { UserDashboardStats } from "../types/api"; // We'll create this type next

/**
 * Fetches the aggregated dashboard statistics for the currently authenticated user.
 */
export const getDashboardStats = async (): Promise<UserDashboardStats> => {
  const response = await apiClient.get<UserDashboardStats>('/dashboard/stats');
  return response.data;
};