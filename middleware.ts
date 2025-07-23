// middleware.ts
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  // Add locale detection configuration
  localeDetection: true,
  // Ensure the middleware handles all paths correctly
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/help': '/help',
    '/workbench': '/workbench'
  }
});
 
export const config = {
  // Match only internationalized pathnames, excluding API routes and static files
  matcher: [
    // Enable a redirect to a matching locale at the root
    '/',
    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    '/(fr|en)/:path*',
    // Enable redirects that add missing locales
    // (e.g. `/pathnames` -> `/en/pathnames`)
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};