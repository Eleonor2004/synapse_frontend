// src/app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NavBar } from "@/components/layout/NavBar";

// Generate static params for the supported locales
export function generateStaticParams() {
  return [
    { locale: 'en' },
    { locale: 'fr' }
  ];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await the params to get the locale
  const { locale } = await params;
  
  // Let next-intl handle the locale automatically
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          <NavBar />
          <main>{children}</main>
        </div>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}