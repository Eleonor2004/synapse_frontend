'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // 1. Import the useRouter hook
import { useTranslations } from 'next-intl';
import { UsernameInput } from './UsernameInput';
import { PasswordInput } from './PasswordInput';
import { SubmitButton } from './SubmitButton';
import { ErrorMessage } from '../ui/ErrorMessage';

export const LoginForm = () => {
  const t = useTranslations('LoginForm');
  const router = useRouter(); // 2. Get the router instance
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- MOCK AUTHENTICATION LOGIC ---
    // In a real application, this would be an API call.
    // The router.push would be in the .then() block of a successful promise.
    if (username === 'admin' && password === 'password') {
      // 3. Redirect on successful login
      // The user will be sent to the root of the current locale (e.g., /en or /fr)
      router.push('/'); 
    } else {
      setError(t('errors.invalidCredentials'));
    }
    // --- END MOCK ---
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
        <SubmitButton />
      </form>
      <ErrorMessage message={error} />
    </div>
  );
};