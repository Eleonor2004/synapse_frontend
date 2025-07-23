'use client';

import { useTranslations } from 'next-intl';

export const SubmitButton = () => {
  const t = useTranslations('LoginForm');

  return (
    <button
      type="submit"
      className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
    >
      {t('submitButton')}
    </button>
  );
};