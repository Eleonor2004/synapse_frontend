'use client';
import { useTranslations } from 'next-intl';

export const ProfileTab = () => {
  const t = useTranslations('Dashboard.Profile');
  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
      <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      <form className="mt-8 max-w-lg space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">{t('nameLabel')}</label>
          <input type="text" id="name" defaultValue="Analyst User" className="w-full px-4 py-2 bg-input border border-border rounded-md" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">{t('emailLabel')}</label>
          <input type="email" id="email" defaultValue="analyst@synapse.app" className="w-full px-4 py-2 bg-input border border-border rounded-md" />
        </div>
        <button type="submit" className="bg-primary text-primary-foreground font-semibold py-2 px-6 rounded-md hover:bg-primary/90">
          {t('saveButton')}
        </button>
      </form>
    </div>
  );
};