import { useTranslations } from 'next-intl';
import { Network, Waypoints, BarChart3 } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export const FeatureList = () => {
  const t = useTranslations('FeatureList');

  const features = [
    {
      icon: Network,
      title: t('feature1_title'),
      description: t('feature1_description'),
    },
    {
      icon: Waypoints,
      title: t('feature2_title'),
      description: t('feature2_description'),
    },
    {
      icon: BarChart3,
      title: t('feature3_title'),
      description: t('feature3_description'),
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          {t('title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};