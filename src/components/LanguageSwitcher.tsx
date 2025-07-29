// src/components/LanguageSwitcher.tsx
"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Globe, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getLocalizedPath = (newLocale: string) => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700
                   transition-all duration-300 ease-in-out transform hover:scale-105
                   shadow-sm hover:shadow-md focus:outline-none focus:ring-2 
                   focus:ring-[#8e43ff] focus:ring-offset-2 focus:ring-offset-white 
                   dark:focus:ring-offset-gray-800"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 glass-morphism rounded-lg shadow-xl 
                        border border-white/20 dark:border-gray-700/50 overflow-hidden z-50
                        animate-in fade-in-0 zoom-in-95 duration-300">
          <div className="py-2">
            {languages.map((language) => (
              <Link
                key={language.code}
                href={getLocalizedPath(language.code)}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                  locale === language.code
                    ? 'bg-gradient-to-r from-[#1e0546]/10 to-[#8e43ff]/10 text-[#8e43ff] border-r-4 border-[#8e43ff]'
                    : 'hover:bg-gray-100/50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-[#8e43ff] dark:hover:text-[#8e43ff]'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex flex-col">
                  <span className="font-medium text-sm">{language.name}</span>
                  <span className="text-xs opacity-70">{language.code.toUpperCase()}</span>
                </div>
                {locale === language.code && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-[#8e43ff]" />
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}