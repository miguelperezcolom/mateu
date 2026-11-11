import React, { createContext, useContext, useRef } from 'react';
import { fetch as expoFetch } from 'expo/fetch';
import { MateuApiClient, setStreamingFetch } from '../api/MateuApiClient';

// LongTask progress is read as a stream: React Native's own fetch buffers the whole body.
setStreamingFetch(expoFetch as unknown as typeof fetch);
// OS-level notifications (App.osNotifications): expo-notifications, local only (core/osNotifications.ts)
import { setLocalNotifier } from '../core/osNotifications';
import { platformNotifier, platformPushTokens } from '../ui/localNotifications';
import { setPushTokenSource } from '../core/remotePush';
setLocalNotifier(platformNotifier());
// saved listing views and column choices survive a restart: the device's app storage (per UI)
import { setListingPrefsStorage } from '../renderer/persistedScopes';
import { metaStore } from '../hub/storage';
setListingPrefsStorage(metaStore);
// …and REMOTE push, for a UI whose server sends pushes (core/remotePush.ts)
setPushTokenSource(platformPushTokens());
import { MateuSession } from '../core/MateuSession';
import { randomUuid } from '../core/sessionId';
import type { TokenProvider } from '../core/auth';
import type { StaticBundle } from '../core/staticBundle';
import type { ScreenSnapshots } from '../core/screenSnapshots';

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

/**
 * The same context for ANOTHER session (an embedded app's own: a micro frontend served by another
 * backend), so the app-level pieces it draws — context selectors, the inbox — talk to that app.
 */
export function SessionContextProvider({ session, children }: { session: MateuSession; children: React.ReactNode }) {
  const value = React.useMemo<AppContextValue>(() => ({ session, api: session.api, appState: session.appState }), [session]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
