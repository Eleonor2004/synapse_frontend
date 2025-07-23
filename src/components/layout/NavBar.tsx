// src/components/layout/NavBar.tsx
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function NavBar() {
  const t = useTranslations("NavBar");
  const locale = useLocale();

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href={`/${locale}`} className="font-bold text-xl">
          SYNAPSE
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href={`/${locale}`}>{t("home")}</Link>
          <Link href={`/${locale}/about`}>{t("about")}</Link>
          <Link href={`/${locale}/help`}>{t("help")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}