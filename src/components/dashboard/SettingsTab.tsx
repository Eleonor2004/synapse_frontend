'use client';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Laptop } from 'lucide-react';

export const SettingsTab = () => {
  const t = useTranslations('Dashboard.Settings');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = e.target.value;
    // This regex replaces the current locale in the path with the new one
    const newPath = pathname.replace(/^\/(en|fr)/, `/${newLocale}`);
    router.replace(newPath);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-foreground">{t('title')}</h2>
      <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
      <div className="mt-8 max-w-lg space-y-8">
        <div>
          <h3 className="text-lg font-medium">{t('themeTitle')}</h3>
          <div className="mt-4 flex space-x-2">
            <button onClick={() => setTheme('light')} className={`p-3 rounded-md border ${theme === 'light' ? 'border-primary bg-primary/10' : 'bg-card'}`}><Sun size={20} /></button>
            <button onClick={() => setTheme('dark')} className={`p-3 rounded-md border ${theme === 'dark' ? 'border-primary bg-primary/10' : 'bg-card'}`}><Moon size={20} /></button>
            <button onClick={() => setTheme('system')} className={`p-3 rounded-md border ${theme === 'system' ? 'border-primary bg-primary/10' : 'bg-card'}`}><Laptop size={20} /></button>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium">{t('languageTitle')}</h3>
          <select onChange={handleLanguageChange} defaultValue={pathname.split('/')[1]} className="mt-4 w-full max-w-xs px-3 py-2 bg-input border border-border rounded-md">
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
      </div>
    </div>
  );
};