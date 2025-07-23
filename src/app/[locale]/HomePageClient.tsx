// src/app/[locale]/HomePageClient.tsx
"use client";

import Link from "next/link";

interface HomePageClientProps {
  translations: {
    title: string;
    description: string;
    ctaButton: string;
  };
  locale: string;
}

export default function HomePageClient({ translations, locale }: HomePageClientProps) {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold">
        {translations.title}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {translations.description}
      </p>
      <Link 
        href={`/${locale}/workbench`}
        className="inline-block mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
      >
        {translations.ctaButton}
      </Link>
    </div>
  );
}