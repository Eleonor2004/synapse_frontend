// components/LanguageSwitcher.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const switchLocale = (nextLocale: string) => {
    // Replace the locale part of the path
    const newPath = pathname.replace(`/${locale}`, `/${nextLocale}`);
    router.replace(newPath);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale("en")}
        className={`p-2 rounded-md text-sm font-medium ${locale === 'en' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        EN
      </button>
      <button
        onClick={() => switchLocale("fr")}
        className={`p-2 rounded-md text-sm font-medium ${locale === 'fr' ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
      >
        FR
      </button>
    </div>
  );
}