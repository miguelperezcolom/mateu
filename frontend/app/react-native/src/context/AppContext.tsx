import React, { createContext, useContext, useRef } from 'react';
import { fetch as expoFetch } from 'expo/fetch';
import { MateuApiClient, setStreamingFetch } from '../api/MateuApiClient';

// LongTask progress is read as a stream: React Native's own fetch buffers the whole body.
setStreamingFetch(expoFetch as unknown as typeof fetch);
// OS-level notifications (App.osNotifications): expo-notifications, local only (core/osNotifications.ts)
import { setLocalNotifier } from '../core/osNotifications';
import { platformNotifier } from '../ui/localNotifications';
setLocalNotifier(platformNotifier());
import { MateuSession } from '../core/MateuSession';
import { randomUuid } from '../core/sessionId';
import type { TokenProvider } from '../core/auth';
import type { StaticBundle } from '../core/staticBundle';
import type { ScreenSnapshots } from '../core/screenSnapshots';
import type { KeyValueStore } from '../core/sessionId';
import { persistListingPrefs, type ListingPrefsSnapshot } from '../core/listingPrefs';

export interface MateuConfig {
  baseUrl: string;
  sessionId?: string;
  appState?: Record<string, unknown>;
  /** Hub UI sessions: this UI's own token provider (null = an open UI). Absent = the global one. */
  auth?: TokenProvider | null;
  /** Called once with the session, before the first render (hub hooks). */
  onSession?: (session: MateuSession) => void;
  /** The base URL serves a static bundle (no Mateu server): the app runs from it. */
  bundle?: StaticBundle | null;
  /** The last screens of this UI, shown at once on the next open (only for a UI without sign-in). */
  snapshots?: ScreenSnapshots | null;
  /** The listings' saved views and column choices kept on the device for this UI (`scope`), already
   *  read (`initial`): restored before the first screen and written back on every change. */
  listingPrefs?: { store: KeyValueStore; scope: string; initial: ListingPrefsSnapshot } | null;
}

interface AppContextValue {
  session: MateuSession;
  /** Convenience accessors (context selectors, root loading). */
  api: MateuApiClient;
  appState: Record<string, unknown>;
}

const AppCtx = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useAppContext must be used inside MateuAppProvider');
  return ctx;
}

interface Props {
  config: MateuConfig;
  children: React.ReactNode;
}

export function MateuAppProvider({ config, children }: Props) {
  const ref = useRef<MateuSession | null>(null);
  if (!ref.current) {
    ref.current = new MateuSession(config.baseUrl, config.sessionId ?? randomUuid(), config.appState ?? {}, config.auth);
    if (config.bundle) ref.current.openStaticBundle(config.bundle);
    if (config.snapshots) ref.current.snapshots = config.snapshots;
    if (config.listingPrefs) {
      const { store, scope, initial } = config.listingPrefs;
      persistListingPrefs(ref.current.columnPrefs, ref.current.savedViews, store, scope, initial);
    }
    config.onSession?.(ref.current);
  }
  const session = ref.current;

  const value: AppContextValue = {
    session,
    api: session.api,
    appState: session.appState,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
