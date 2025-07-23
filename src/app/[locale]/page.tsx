// src/app/[locale]/page.tsx
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { NavBar } from '@/components/layout/NavBar';
import { HeroSection } from '@/components/home/HeroSection';
import { FeatureList } from '@/components/home/FeatureList';
import { StatisticsSection } from '@/components/home/StatisticsSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { Footer } from '@/components/layout/Footer';


// Generate static params for the supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("HomePage");

  return (
    <div className="flex flex-col min-h-screen">
      
      <main className="flex-grow">
        <HeroSection />
        <FeatureList />
        <StatisticsSection />
        <NewsletterSection />
      </main>
     
    </div>
  );
}