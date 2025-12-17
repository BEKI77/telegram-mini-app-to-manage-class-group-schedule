import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

import { Root } from '@/components/Root/Root';
import { I18nProvider } from '@/core/i18n/provider';

import './globals.css';
import { BottomTabs } from '@/components/BottomTabs';

export const metadata: Metadata = {
  title: 'Schedule App',
  description: 'Manage your class schedule',
};

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" async />
      </head>
      <body className='antialiased min-h-screen pb-20 select-none'>
        <I18nProvider>
          <Root>
            <main className="p-4">
              {children}
            </main>
            <BottomTabs />
          </Root>
        </I18nProvider>
      </body>
    </html>
  );
}
