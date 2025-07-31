'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '../../lib/apiClient';
import { TokenResponse } from '../../types/api';
import { useAuthStore } from '../../app/store/authStore';
import { getMe } from '../../services/userService'; // Import the service function

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore(); // Get the login action from our global store
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      // Step 1: Get the authentication token from the backend
      const tokenResponse = await apiClient.post<TokenResponse>('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const token = tokenResponse.data.access_token;

      // Step 2: IMPORTANT - Store the token in localStorage immediately.
      // This ensures that the next API call (getMe) will be authenticated.
      localStorage.setItem('authToken', token);

      // Step 3: Fetch the authenticated user's profile information
      const userProfile = await getMe();

      // Step 4: Call the global 'login' action with both the token and user profile
      login(token, userProfile);

      // Step 5: Redirect the user to their main workbench page
      router.push('/workbench');

    } catch (err: any) {
      console.error('❌ Login Failed:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'An unexpected error occurred.');
      // Make sure to clean up a potentially stored token if login fails
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to SYNAPSE</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your credentials to access your workbench.
        </p>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 border rounded bg-transparent" // Basic styling
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded bg-transparent" // Basic styling
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400" // Basic styling
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}