// components/layout/NavBar.tsx
//import { useTranslations } from "next-intl";
import Link from "next/link";
import { ThemeSwitcher } from "../ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher";

export function NavBar() {
  //const t = useTranslations("NavBar");

  return (
    <header className="border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link href="/" className="font-bold text-xl">
          SYNAPSE
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/">{("home")}</Link>
          <Link href="/about">{("about")}</Link>
          <Link href="/help">{("help")}</Link>
        </nav>
        <div className="flex items-center gap-4">
          
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}