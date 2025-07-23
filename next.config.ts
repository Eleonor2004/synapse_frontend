import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

// Tell next-intl where to find your i18n configuration
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  /* config options here */
};

export default withNextIntl(nextConfig);