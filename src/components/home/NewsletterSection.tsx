'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export const NewsletterSection = () => {
  const t = useTranslations('NewsletterSection');

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-dot-pattern [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]"></div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container relative mx-auto max-w-2xl px-4 text-center"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('title')}</h2>
        <p className="text-muted-foreground mb-8">{t('description')}</p>
        <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder={t('placeholder')}
            className="flex-grow px-4 py-3 bg-input border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
            required
          />
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            {t('cta')}
          </button>
        </form>
      </motion.div>
    </section>
  );
};