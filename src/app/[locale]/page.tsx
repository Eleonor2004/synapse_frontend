import { NavBar } from '../../components/layout/NavBar';
import { HeroSection } from '../../components/home/HeroSection';
import { FeatureList } from '../../components/home/FeatureList';
import { NewsletterSection } from '../../components/home/NewsletterSection';
import { Footer } from '../../components/layout/Footer';
export default function HomePage() {
return (
<div className="flex flex-col min-h-screen bg-background">
<NavBar />
<main className="flex-grow">
<HeroSection />
<FeatureList />
{/* You can add the StatisticsSection back here if you wish */}
<NewsletterSection />
</main>
<Footer />
</div>
);
}