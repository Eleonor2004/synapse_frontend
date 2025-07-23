import { useTranslations } from 'next-intl';

export const Footer = () => {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          {t('copyright', { year: currentYear })}
        </p>
      </div>
    </footer>
  );
};