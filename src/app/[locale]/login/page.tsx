"use client";
import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

// Correctly reference images from the `public` directory.
// Next.js serves them from the root URL.
const bg_light = "/images/login/login_image_light.jpg";
const bg_dark = "/images/login/login_image_dark.jpg";

function ModernLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Add your authentication logic here
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#8e43ff] to-[#1e0546] rounded-2xl flex items-center justify-center shadow-lg">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please sign in to your account
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#8e43ff] focus:border-transparent
                         transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-[#8e43ff] focus:border-transparent
                         transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#8e43ff] focus:ring-[#8e43ff] border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-[#8e43ff] hover:text-[#1e0546] dark:hover:text-[#a855f7] transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent 
                   text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#8e43ff] to-[#1e0546]
                   hover:from-[#7c3aed] hover:to-[#2e1065] focus:outline-none focus:ring-2 focus:ring-offset-2 
                   focus:ring-[#8e43ff] disabled:opacity-50 disabled:cursor-not-allowed
                   transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        

        
      </form>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-white dark:bg-gray-900">
        <ModernLoginForm />
      </div>
      
      {/* Right Panel - Background Image */}
      <div className="hidden lg:block relative bg-gradient-to-br from-[#1e0546] via-[#2d1b69] to-[#8e43ff]">
        {/* Light Theme Image: Visible by default, hidden in dark mode */}
        <Image
          src={bg_light}
          alt="Abstract network visualization for light theme"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="dark:hidden opacity-20" // Reduced opacity to let gradient show through
        />
        
        {/* Dark Theme Image: Hidden by default, visible in dark mode */}
        <Image
          src={bg_dark}
          alt="Abstract network visualization for dark theme"
          fill
          style={{ objectFit: 'cover' }}
          priority
          className="hidden dark:block opacity-30" // Reduced opacity to let gradient show through
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e0546]/80 via-[#2d1b69]/60 to-[#8e43ff]/80" />
        
        {/* Content overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center text-white space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Join our amazing platform
            </h1>
            <p className="text-xl text-gray-200">
              Discover new possibilities and connect with like-minded people in our vibrant community.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}