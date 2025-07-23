// src/app/[locale]/layout.tsx

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { NavBar } from "@/components/layout/NavBar";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // This line was causing the error, but we will make it work now.
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