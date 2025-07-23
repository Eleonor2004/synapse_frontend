// src/components/LanguageSwitcher.tsx (Alternative approach)
"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();

  const getLocalizedPath = (newLocale: string) => {
    // Remove current locale and add new locale
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    return `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={getLocalizedPath("en")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'en' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        EN
      </Link>
      <Link
        href={getLocalizedPath("fr")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'fr' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        FR
      </Link>
    </div>
  );
}