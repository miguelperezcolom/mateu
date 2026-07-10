import React, { createContext, useContext, useRef } from 'react';
import { MateuApiClient } from '../api/MateuApiClient';
import { MateuSession } from '../core/MateuSession';

export interface MateuConfig {
  baseUrl: string;
  sessionId?: string;
  appState?: Record<string, unknown>;
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
  const session = useRef(
    new MateuSession(config.baseUrl, config.sessionId ?? 'native-session', config.appState ?? {}),
  ).current;

  const value: AppContextValue = {
    session,
    api: session.api,
    appState: session.appState,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
