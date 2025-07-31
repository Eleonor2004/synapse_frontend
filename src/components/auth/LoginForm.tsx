'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Your custom components
import { UsernameInput } from './UsernameInput';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';
import { ErrorMessage } from '../ui/ErrorMessage';

// Import our tools
import apiClient from '../../lib/apiClient';
import { useAuthStore } from '../../app/store/authStore';
import { TokenResponse } from '../../types/api';

export const LoginForm = () => {
  const t = useTranslations('LoginForm');
  const router = useRouter();
  
  // 1. Get the login action from our global store
  const login = useAuthStore((state) => state.login);

  // 2. Add loading state for better user feedback
  const [isLoading, setIsLoading] = useState(false);
  
  // Your existing state hooks
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 3. Make the handler function asynchronous to await the API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Prepare the form data for the API request.
    // Our backend's token endpoint expects 'application/x-www-form-urlencoded'.
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    try {
      // --- REAL AUTHENTICATION LOGIC ---
      const response = await apiClient.post<TokenResponse>('/auth/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // 4. On success, call the login action from our global store
      login(response.data.access_token);
      console.log('✅ Login Successful:', response.data);

      // 5. Redirect to the main page
      router.push('/en');

    } catch (err: any) {
      // --- REAL ERROR HANDLING ---
      console.error('❌ Login Failed:', err.response?.data || err.message);
      // Use the specific error from the API, or a generic one
      const errorMessage = err.response?.data?.detail || t('errors.generic');
      setError(errorMessage);
    } finally {
      // 6. Always stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <UsernameInput value={username} onChange={(e) => setUsername(e.target.value)} />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} />
        {/* 7. Pass the loading state to the submit button */}
        <SubmitButton isLoading={isLoading} />
      </form>
      <ErrorMessage message={error} />
    </div>
  );
};