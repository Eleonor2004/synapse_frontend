// src/components/auth/LoginForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios'; // Import AxiosError for type safety
import apiClient from '../../lib/apiClient';
import { TokenResponse, User } from '../../types/api';
import { useAuthStore } from '../../app/store/authStore';
import { getMe } from '../../services/userService';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
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
      const tokenResponse = await apiClient.post<TokenResponse>('/auth/token', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      const token = tokenResponse.data.access_token;

      localStorage.setItem('authToken', token);

      const userProfile = await getMe();

      login(token, userProfile);

      router.push('/en/workbench');

    } catch (err) {
      // Type the caught error correctly
      const axiosError = err as AxiosError<{ detail: string }>;
      console.error('❌ Login Failed:', axiosError.response?.data || axiosError.message);
      setError(axiosError.response?.data?.detail || 'An unexpected error occurred.');
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
            className="w-full p-2 border rounded bg-transparent"
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
            className="w-full p-2 border rounded bg-transparent"
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}