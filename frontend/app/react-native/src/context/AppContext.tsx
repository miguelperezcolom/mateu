import React, { createContext, useContext, useRef } from 'react';
import { MateuApiClient } from '../api/MateuApiClient';
import { MateuSession } from '../core/MateuSession';
import { randomUuid } from '../core/sessionId';
import type { TokenProvider } from '../core/auth';

export interface MateuConfig {
  baseUrl: string;
  sessionId?: string;
  appState?: Record<string, unknown>;
  /** Hub UI sessions: this UI's own token provider (null = an open UI). Absent = the global one. */
  auth?: TokenProvider | null;
  /** Called once with the session, before the first render (hub hooks). */
  onSession?: (session: MateuSession) => void;
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
