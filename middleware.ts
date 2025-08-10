// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// Define the routes that require authentication
const protectedRoutes = ['/workbench', '/dashboard'];

// Define your supported locales
const locales = ['en', 'fr'];
const defaultLocale = 'en';

export default function middleware(request: NextRequest) {
  // --- 1. Authentication Guard ---
  const pathname = request.nextUrl.pathname;

  // Check for the authentication token in cookies
  const authToken = request.cookies.get('authToken')?.value;

  // Determine the base path without the locale prefix
  const pathnameWithoutLocale = pathname.replace(new RegExp(`^/(${locales.join('|')})`), '') || '/';

  // Check if the requested path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathnameWithoutLocale.startsWith(route));

  if (isProtectedRoute && !authToken) {
    // If the route is protected and the user is not authenticated,
    // redirect them to the login page.
    
    // We need to ensure the redirect URL includes the current locale.
    const currentLocale = locales.find(locale => pathname.startsWith(`/${locale}`)) || defaultLocale;
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    
    // Optionally, you can add a query param to show a message on the login page.
    loginUrl.searchParams.set('from', pathname);
    
    return NextResponse.redirect(loginUrl);
  }

  // --- 2. Internationalization ---
  // If the authentication check passes, proceed with the i18n middleware.
  // We instantiate it with your original configuration.
  const handleI18nRouting = createIntlMiddleware({
    locales: locales,
    defaultLocale: defaultLocale,
    localeDetection: true,
    pathnames: {
      '/': '/',
      '/about': '/about',
      '/help': '/help',
      '/workbench': '/workbench'
    }
  });

  return handleI18nRouting(request);
}

export const config = {
  // This matcher is simplified and more robust. It ensures the middleware
  // runs on all page routes but correctly skips static files, images, and API routes.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images).*)']
};