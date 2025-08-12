import apiClient from "../lib/apiClient";
import { Profile } from "@/types/api"; // Assuming Profile type is in api.ts

/**
 * Fetches the complete profile of the currently authenticated user.
 */
export const getMyProfile = async (): Promise<Profile> => {
  const response = await apiClient.get<Profile>('/profile/me');
  return response.data;
};

/**
 * Updates the profile of the currently authenticated user.
 * @param profileData - The data to update (e.g., { full_name: "New Name" }).
 */
export const updateMyProfile = async (profileData: { full_name?: string }): Promise<Profile> => {
  const response = await apiClient.put<Profile>('/profile/me', profileData);
  return response.data;
};