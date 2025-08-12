import apiClient from "../lib/apiClient";
import { User } from "../types/api"; // We can reuse our existing User type

// Define types for creating and updating users
export interface UserCreationData {
  username: string;
  full_name: string;
  password?: string; // Password is required for creation
  role: 'admin' | 'analyst';
  is_active: boolean;
}

export interface UserUpdateData {
  full_name?: string;
  role?: 'admin' | 'analyst';
  is_active?: boolean;
}

/**
 * (Admin only) Fetches a list of all users in the system.
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users/');
  return response.data;
};

/**
 * (Admin only) Creates a new user.
 */
export const createUser = async (userData: UserCreationData): Promise<User> => {
  const response = await apiClient.post<User>('/users/', userData);
  return response.data;
};

/**
 * (Admin only) Updates a user's details.
 */
export const updateUser = async ({ username, data }: { username: string; data: UserUpdateData }): Promise<User> => {
  const response = await apiClient.put<User>(`/users/${username}`, data);
  return response.data;
};

/**
 * (Admin only) Deletes a user.
 */
export const deleteUser = async (username: string): Promise<void> => {
  await apiClient.delete(`/users/${username}`);
};