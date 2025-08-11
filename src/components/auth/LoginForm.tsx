// src/components/auth/LoginForm.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Eye, EyeOff, User as UserIcon, Lock, Zap, Globe } from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { TokenResponse, User } from '../../types/api';
import { useAuthStore } from '../../app/store/authStore';
import { getMe } from '../../services/userService';

// Language type
type Language = 'en' | 'fr';

// Translations
const translations = {
  en: {
    title: 'Welcome to SYNAPSE',
    subtitle: 'Enter your credentials to access your workbench.',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    signIn: 'Sign In',
    signingIn: 'Signing In...',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    switchToFrench: 'Français',
    unexpectedError: 'An unexpected error occurred.',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?'
  },
  fr: {
    title: 'Bienvenue sur SYNAPSE',
    subtitle: 'Entrez vos identifiants pour accéder à votre espace de travail.',
    username: 'Nom d\'utilisateur',
    usernamePlaceholder: 'Entrez votre nom d\'utilisateur',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    showPassword: 'Afficher le mot de passe',
    hidePassword: 'Masquer le mot de passe',
    switchToEnglish: 'English',
    unexpectedError: 'Une erreur inattendue s\'est produite.',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié ?'
  }
};

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [rememberMe, setRememberMe] = useState(false);

  const t = translations[language];

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
      const axiosError = err as AxiosError<{ detail: string }>;
      console.error('❌ Login Failed:', axiosError.response?.data || axiosError.message);
      setError(axiosError.response?.data?.detail || t.unexpectedError);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header with Language Toggle */}
      <div className="relative">
        <button
          onClick={toggleLanguage}
          className="absolute -top-2 right-0 flex items-center space-x-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 
                   hover:text-[#8e43ff] dark:hover:text-[#8e43ff] transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Globe className="w-4 h-4" />
          <span>{language === 'en' ? t.switchToFrench : t.switchToEnglish}</span>
        </button>

        {/* Logo and Title */}
        <div className="text-center space-y-4 pt-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#8e43ff] to-[#1e0546] rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white bg-gradient-to-r from-[#1e0546] to-[#8e43ff] bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="mt-3 text-foreground dark:text-gray-400 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-5">
          {/* Username Field */}
          <div className="space-y-2">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-foreground dark:text-gray-300"
            >
              {t.username}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder={t.usernamePlaceholder}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#8e43ff] focus:border-transparent
                         transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500
                         shadow-sm hover:shadow-md focus:shadow-lg"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-foreground dark:text-gray-300"
            >
              {t.password}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t.passwordPlaceholder}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#8e43ff] focus:border-transparent
                         transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500
                         shadow-sm hover:shadow-md focus:shadow-lg"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-[#8e43ff] focus:ring-[#8e43ff] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-foreground dark:text-gray-300">
              {t.rememberMe}
            </label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-[#8e43ff] hover:text-[#1e0546] dark:hover:text-[#a855f7] transition-colors"
            >
              {t.forgotPassword}
            </a>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-start">
              <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent 
                   text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#8e43ff] to-[#1e0546]
                   hover:from-[#7c3aed] hover:to-[#2e1065] focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-[#8e43ff] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100
                   shadow-md"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {t.signingIn}
            </>
          ) : (
            <>
              {t.signIn}
              <svg 
                className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              SYNAPSE by ANTIC © 2025
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}