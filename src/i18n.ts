// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // Add debug logging to see what locale we're getting
  console.log('Locale received in i18n config:', locale);
  
  // Fallback to 'en' if locale is undefined
  const validLocale = locale || 'en';
  
  return {
    locale: validLocale, // This is crucial - we need to return the locale
    messages: (await import(`./messages/${validLocale}.json`)).default
  };
});