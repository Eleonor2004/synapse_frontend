import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

interface NavBarProps {
  variant?: 'public' | 'workbench';
}

export const NavBar = ({ variant = 'public' }: NavBarProps) => {
  const t = useTranslations('NavBar');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="text-2xl font-bold text-primary">
          SYNAPSE
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {variant === 'public' ? (
            <>
              <Link href="/login" className="text-muted-foreground transition-colors hover:text-primary">{t('login')}</Link>
              <Link href="/help" className="text-muted-foreground transition-colors hover:text-primary">{t('help')}</Link>
              <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">{t('about')}</Link>
            </>
          ) : (
            <>
              <Link href="/dashboard" className="text-muted-foreground transition-colors hover:text-primary">{t('dashboard')}</Link>
              <Link href="/" className="text-muted-foreground transition-colors hover:text-primary">{t('logout')}</Link>
            </>
          )}
        </nav>
        <div className="flex items-center space-x-2">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};