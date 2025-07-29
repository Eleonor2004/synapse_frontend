// src/components/ThemeSwitcher.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative">
        <button className="p-2 w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </button>
      </div>
    );
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-5 w-5" />;
    }
    return resolvedTheme === 'dark' ? 
      <Moon className="h-5 w-5" /> : 
      <Sun className="h-5 w-5" />;
  };

  const getTooltip = () => {
    if (theme === 'system') return 'System theme';
    return resolvedTheme === 'dark' ? 'Dark theme' : 'Light theme';
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className="relative p-2 rounded-lg border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                   transition-all duration-300 ease-in-out transform hover:scale-105
                   shadow-sm hover:shadow-md focus:outline-none focus:ring-2 
                   focus:ring-[#8e43ff] focus:ring-offset-2 focus:ring-offset-white 
                   dark:focus:ring-offset-gray-800"
        aria-label={getTooltip()}
        title={getTooltip()}
      >
        <div className="transition-all duration-300 ease-in-out text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]">
          {getIcon()}
        </div>
        
        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-lg bg-[#8e43ff] opacity-0 group-active:opacity-20 transition-opacity duration-150" />
      </button>
      
      {/* Tooltip */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
        {getTooltip()}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-gray-900 dark:border-b-gray-100" />
      </div>
    </div>
  );
}