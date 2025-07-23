// src/i18n.ts
import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => ({
  // The path './messages/...' is relative to this file, which is now inside 'src'.
  messages: (await import(`./messages/${locale}.json`)).default
}));