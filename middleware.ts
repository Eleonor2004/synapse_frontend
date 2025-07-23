// middleware.ts
import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  // Remove the root '/' from matcher since we want the middleware to handle it
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};