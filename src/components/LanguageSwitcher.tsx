// src/components/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (nextLocale: string) => {
    // Handle root path specially
    if (pathname === `/${locale}`) {
      router.replace(`/${nextLocale}`);
    } else {
      // Replace the locale part of the path
      const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.replace(newPath);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale("en")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'en' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("fr")}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          locale === 'fr' 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        FR
      </button>
    </div>
  );
}