import apiClient from "../lib/apiClient";
import { User } from "@/types/api";

/**
 * Fetches the profile of the currently authenticated user.
 * The auth token is automatically added by the apiClient interceptor.
 */
export const getMe = async (): Promise<User> => {
  // This makes a GET request to http://localhost:8000/api/v1/users/me
  const response = await apiClient.get<User>('/users/me');
  return response.data;
};

// In the future, you would add other user-related API functions here,
// for example:
//
// export const updateUserProfile = async (data) => { ... };
// export const changePassword = async (data) => { ... };