'use client';

import { useTranslations } from 'next-intl';

export const NewsletterSection = () => {
  const t = useTranslations('NewsletterSection');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription logic here
    console.log('Subscribed!');
  };

  return (
    <section className="py-20 md:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{t('title')}</h2>
        <p className="text-muted-foreground mb-8">{t('description')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
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
      </div>
    </section>
  );
};