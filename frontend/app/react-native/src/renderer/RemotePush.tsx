import { useEffect } from 'react';
import { AppState } from 'react-native';
import { MateuApiClient } from '../api/MateuApiClient';
import type { MateuSession } from '../core/MateuSession';
import { localNotifier } from '../core/osNotifications';
import { pushDeviceId, pushTokenSource, syncPushRegistration, unregisterPush, type PushRegistration } from '../core/remotePush';
import { randomUuid } from '../core/sessionId';
import { metaStore } from '../hub/storage';

/** An app-level action of a UI (dispatched with the app's class, like the bell's). */
function appLevel(api: MateuApiClient, route: string, serverSideType: string | null, appState: Record<string, unknown>) {
  return (actionId: string, parameters: Record<string, unknown>): Promise<unknown> =>
    api.runAction({
      route,
      consumedRoute: route || '_empty',
      actionId,
      serverSideType,
      initiatorComponentId: 'remote-push',
      componentState: {},
      appState,
      parameters,
    });
}

/**
 * Remote push of one running UI (core/remotePush.ts): registers this phone's push token while the
 * app opted in, the server sends pushes and the user granted the permission — at start and each
 * time the app comes back to the front (a permission turned off in the OS settings unregisters it
 * then) — and gives the session the way to unregister (sign-out).
 */
export function useRemotePush(
  session: MateuSession,
  appMeta: { osNotifications?: boolean; pushNotifications?: boolean; rootRoute?: string; homeRoute?: string; serverSideType?: string },
  appState: Record<string, unknown>,
): void {
  const enabled = appMeta.osNotifications === true && appMeta.pushNotifications === true;
  const route = appMeta.rootRoute ?? appMeta.homeRoute ?? '';
  const serverSideType = appMeta.serverSideType ?? null;
  useEffect(() => {
    const api = session.api;
    const baseUrl = api.baseUrl;
    if (!baseUrl || api.local) return;
    const run = appLevel(api, route, serverSideType, appState);
    const sync = () =>
      void syncPushRegistration({
        baseUrl,
        enabled,
        permission: () => localNotifier().permission(),
        token: () => pushTokenSource().token(),
        deviceId: () => pushDeviceId(metaStore, () => randomUuid()),
        run,
        store: metaStore,
        dispatch: { route, serverSideType },
      });
    sync();
    session.pushSync = sync;
    session.pushUnregister = async () => {
      await unregisterPush(metaStore, baseUrl, (actionId, parameters) => run(actionId, parameters));
    };
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') sync();
    });
    return () => sub.remove();
    // appState is read when an action runs; a new object each render must not re-register
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, enabled, route, serverSideType]);
}

/**
 * The UI is gone from the hub and may not be open: ask its server to forget this phone's token
 * with the dispatch recorded at registration (an unregister needs no sign-in). Never throws.
 */
export function unregisterRemovedUi(baseUrl: string): Promise<boolean> {
  return unregisterPush(metaStore, baseUrl, (actionId, parameters, dispatch: PushRegistration) =>
    appLevel(new MateuApiClient(baseUrl, randomUuid()), dispatch.route, dispatch.serverSideType, {})(actionId, parameters),
  );
}
