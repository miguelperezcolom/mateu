import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { MateuApiClient } from '../api/MateuApiClient';

export interface MateuConfig {
  baseUrl: string;
  sessionId?: string;
  appState?: Record<string, unknown>;
}

interface AppContextValue {
  api: MateuApiClient;
  appState: Record<string, unknown>;
  currentRoute: string;
  currentConsumedRoute: string;
  currentServerSideType: string;
  currentComponentId: string;
  navigate: (route: string, consumedRoute: string, serverSideType: string, actionId?: string) => Promise<unknown>;
  runAction: (actionId: string, componentState?: Record<string, unknown>) => Promise<unknown>;
  loadServerSideComponent: (component: unknown) => Promise<unknown>;
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
  const api = useRef(
    new MateuApiClient(config.baseUrl, config.sessionId ?? 'native-session'),
  ).current;

  const [appState] = useState<Record<string, unknown>>(config.appState ?? {});
  const routeRef = useRef({ route: '', consumedRoute: '_empty', serverSideType: '', componentId: 'ux_main' });

  const navigate = useCallback(
    async (route: string, consumedRoute: string, serverSideType: string, _actionId?: string) => {
      routeRef.current = { route, consumedRoute, serverSideType, componentId: 'ux_main' };
      return api.navigate(route, consumedRoute, serverSideType, appState);
    },
    [api, appState],
  );

  const runAction = useCallback(
    async (actionId: string, componentState?: Record<string, unknown>) => {
      const { route, consumedRoute, serverSideType, componentId } = routeRef.current;
      return api.runFormAction(route, consumedRoute, actionId, serverSideType, componentId, componentState ?? {}, appState);
    },
    [api, appState],
  );

  const loadServerSideComponent = useCallback(
    async (component: unknown) => {
      const comp = component as Record<string, unknown>;
      const route = (comp['route'] as string) ?? '';
      const consumedRoute = (comp['consumedRoute'] as string) ?? '_empty';
      const serverSideType = (comp['serverSideType'] as string) ?? '';
      routeRef.current = { route, consumedRoute, serverSideType, componentId: 'ux_main' };
      return api.navigate(route, consumedRoute, serverSideType, appState);
    },
    [api, appState],
  );

  const value: AppContextValue = {
    api,
    appState,
    currentRoute: routeRef.current.route,
    currentConsumedRoute: routeRef.current.consumedRoute,
    currentServerSideType: routeRef.current.serverSideType,
    currentComponentId: routeRef.current.componentId,
    navigate,
    runAction,
    loadServerSideComponent,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
