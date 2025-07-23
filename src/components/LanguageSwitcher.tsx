// src/components/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const switchLanguage = (newLocale: string) => {
    if (newLocale === locale) return;
    
    startTransition(() => {
      // Remove current locale from path and add new locale
      const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '';
      const newPath = `/${newLocale}${pathWithoutLocale}`;
      router.push(newPath);
    });
  };

  return (
    <div className="flex items-center gap-1 border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
      <button
        onClick={() => switchLanguage("en")}
        disabled={isPending}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          locale === 'en' 
            ? 'bg-blue-600 text-white' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => switchLanguage("fr")}
        disabled={isPending}
        className={`px-3 py-1 text-sm font-medium transition-colors ${
          locale === 'fr' 
            ? 'bg-blue-600 text-white' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
        } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        FR
      </button>
    </div>
  );
}