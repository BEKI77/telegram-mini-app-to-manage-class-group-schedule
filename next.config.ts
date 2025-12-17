import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/core/i18n/i18n.ts');

const nextConfig: NextConfig = {};

import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  workboxOptions: {
      disableDevLogs: false,
  },
});

export default withPWA(withNextIntl(nextConfig));
