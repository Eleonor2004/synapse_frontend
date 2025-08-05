import { NavBar } from '../../components/layout/NavBar';
import { HeroSection } from '../../components/home/HeroSection';
import { FeatureList } from '../../components/home/FeatureList';
import { NewsletterSection } from '../../components/home/NewsletterSection';
import { Footer } from '../../components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navigation is handled by the layout, so we don't need it here */}
      
      <main className="flex-grow relative">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Feature List Section */}
        <FeatureList />
        
        {/* Newsletter Section */}
        <NewsletterSection />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* Global background elements that work with both themes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-2]">
        {/* Subtle background patterns */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/[0.02] to-transparent dark:from-primary/[0.08] dark:to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-primary-dark/[0.015] to-transparent dark:from-primary-dark/[0.06] dark:to-transparent rounded-full blur-3xl" />
        
        {/* Center focal point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/[0.008] to-primary-dark/[0.008] dark:from-primary/[0.03] dark:to-primary-dark/[0.03] rounded-full blur-3xl" />
      </div>
    </div>
  );
}