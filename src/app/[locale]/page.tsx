// src/app/[locale]/page.tsx
import { useLocale } from "next-intl";

// Generate static params for the supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

// Define translations directly in the component
const translations = {
  en: {
    title: "Welcome to SYNAPSE",
    description: "The modern platform for visualizing and analyzing complex communication networks.",
    ctaButton: "Go to Workbench"
  },
  fr: {
    title: "Bienvenue sur SYNAPSE",
    description: "La plateforme moderne pour visualiser et analyser les réseaux de communication complexes.",
    ctaButton: "Aller à l'Atelier"
  }
} as const;

export default function HomePage() {
  const locale = useLocale();
  
  // Get translations for current locale with fallback to English
  const t = translations[locale as keyof typeof translations] || translations.en;

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold">
        {t.title}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {t.description}
      </p>
      <button className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
        {t.ctaButton}
      </button>
    </div>
  );
}