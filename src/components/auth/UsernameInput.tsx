'use client';

import { useTranslations } from 'next-intl';

interface UsernameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UsernameInput = ({ value, onChange }: UsernameInputProps) => {
  const t = useTranslations('LoginForm');

  return (
    <div>
      <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
        {t('usernameLabel')}
      </label>
      <input
        type="text"
        id="username"
        name="username"
        value={value}
        onChange={onChange}
        placeholder={t('usernamePlaceholder')}
        className="w-full px-4 py-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary transition-shadow duration-200"
        required
      />
    </div>
  );
};