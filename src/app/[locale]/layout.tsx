// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ThemeProvider } from "../../providers/ThemeProvider";
import { NotificationProvider } from "../../providers/NotificationProvider";
import { AppProviders } from "../../providers/AppProviders";

import { NavBar } from "../../components/layout/NavBar";
import { notFound } from "next/navigation";
import "../globals.css"; // Import global styles

const locales = ['en', 'fr'];

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
  
  // Validate that the incoming locale is valid
  if (!locales.includes(locale)) {
    notFound();
  }
  
  // Get messages for the specific locale
  let messages;
  try {
    messages = await getMessages({ locale });
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    // Fallback to English messages
    messages = await getMessages({ locale: 'en' });
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="SYNAPSE - Advanced Network Analysis Platform" />
        <title>SYNAPSE - Visualize Complex Data</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="antialiased">
        <NextIntlClientProvider messages={messages} locale={locale}>
           <NotificationProvider>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="synapse-theme"
            themes={['light', 'dark', 'system']}
          >
            <AppProviders>
            <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
              <NavBar />
              <main className="relative">
                {/* Page Transition Container */}
                <div className="fade-in">
                  {children}
                </div>
              </main>
              
              {/* Background Pattern */}
              <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-[#8e43ff]/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-[#1e0546]/5 to-transparent rounded-full blur-3xl" />
              </div>
            </div>
          
          </AppProviders>
          </ThemeProvider>
          </NotificationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}