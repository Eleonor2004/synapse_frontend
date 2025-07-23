// src/app/[locale]/page.tsx
import { useTranslations } from "next-intl";

// Generate static params for the supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold">
        {t("title")}
      </h1>
      <p className="mt-4 text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
        {t("description")}
      </p>
      <button className="mt-8 px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors">
        {t("ctaButton")}
      </button>
    </div>
  );
}