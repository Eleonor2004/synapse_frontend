'use client';

import { useTranslations } from 'next-intl';
import { Network, Waypoints, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Network, key: 'feature1' },
  { icon: Waypoints, key: 'feature2' },
  { icon: BarChart3, key: 'feature3' },
];

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
};

export const FeatureList = () => {
  const t = useTranslations('FeatureList');

  return (
    <section className="py-20 md:py-28 bg-secondary/50 border-y">
      <div className="container mx-auto max-w-7xl px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-center mb-16"
        >
          {t('title')}
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.key}
              variants={cardVariants}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-card p-8 rounded-xl border shadow-sm hover:shadow-primary/20 hover:-translate-y-2 transition-all duration-300"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-6">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t(`${feature.key}_title`)}</h3>
              <p className="text-muted-foreground">{t(`${feature.key}_description`)}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};