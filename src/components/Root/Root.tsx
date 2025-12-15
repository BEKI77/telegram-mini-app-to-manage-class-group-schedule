'use client';

import { type PropsWithChildren, useEffect } from 'react';
import {
  init,
  initData,
  useSignal,
} from '@tma.js/sdk-react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorPage } from '@/components/ErrorPage';
import { useDidMount } from '@/hooks/useDidMount';
import { setLocale } from '@/core/i18n/locale';

// Initialize the SDK
if (typeof window !== 'undefined') {
  try {
    init();
    console.log('[SDK] Telegram SDK initialized successfully');
  } catch (e) {
    console.error('[SDK] Failed to initialize Telegram SDK:', e);
  }
}

function RootInner({ children }: PropsWithChildren) {
  const initDataUser = useSignal(initData.user);

  // Set the user locale.
  useEffect(() => {
    initDataUser && setLocale(initDataUser.language_code);
  }, [initDataUser]);

  return <>{children}</>;
}

export function Root(props: PropsWithChildren) {
  // Unfortunately, Telegram Mini Apps does not allow us to use all features of
  // the Server Side Rendering. That's why we are showing loader on the server
  // side.
  const didMount = useDidMount();

  return didMount ? (
    <ErrorBoundary fallback={ErrorPage}>
      <RootInner {...props} />
    </ErrorBoundary>
  ) : (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50 text-muted-foreground font-medium">Loading</div>
  );
}
