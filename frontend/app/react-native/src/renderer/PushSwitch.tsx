import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Switch, Text as PaperText } from 'react-native-paper';
import { useAppContext } from '../context/AppContext';
import type { MateuApiClient } from '../api/MateuApiClient';
import { theme, themed } from '../theme';
import { uiLocale } from '../core/money';
import { disablePush, enablePush, pushPort, pushTexts, refreshPush, type PushHost } from '../core/pushNotifications';
import { pushRegistrations } from '../ui/pushPort';

interface PushAppMeta {
  rootRoute?: string;
  homeRoute?: string;
  serverSideType?: string;
}

/**
 * Where this UI's app-level push actions go: ITS OWN API client (its base URL, its credentials — the
 * token is never handed to another backend) and its app shell's route and class.
 */
export function pushHostOf(api: MateuApiClient, appMeta: PushAppMeta, appState: Record<string, unknown> = {}): PushHost {
  const route = appMeta.rootRoute ?? appMeta.homeRoute ?? '';
  const serverSideType = appMeta.serverSideType ?? null;
  return {
    baseUrl: api.baseUrl,
    route,
    serverSideType,
    run: (actionId, parameters) =>
      api.runAction({
        route,
        consumedRoute: route || '_empty',
        actionId,
        serverSideType,
        initiatorComponentId: 'push-notifications',
        componentState: {},
        appState,
        parameters,
      }),
  };
}

/** A UI the user turned on is registered again at every start (the token may rotate); never asks. */
export function usePushRefresh(appMeta: PushAppMeta & { pushNotifications?: boolean }): void {
  const { api, appState } = useAppContext();
  const offered = appMeta.pushNotifications === true;
  useEffect(() => {
    if (!offered || api.local) return;
    void refreshPush(pushHostOf(api, appMeta, appState), pushRegistrations).catch(() => undefined);
    // once per app shell: the host's identity is the api + shell route
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offered, api, appMeta.rootRoute, appMeta.homeRoute, appMeta.serverSideType]);
}

/**
 * "Notifications on this phone" (the drawer of a UI that offers push): the ONLY place the app asks
 * the OS for permission and reads the device's push token — from the user's tap.
 */
export function PushSwitch({ appMeta }: { appMeta: PushAppMeta }) {
  const { api, appState, session } = useAppContext();
  const texts = pushTexts(uiLocale());
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    const read = () => void pushRegistrations.forBaseUrl(api.baseUrl).then((r) => alive && setOn(!!r));
    read();
    const off = pushRegistrations.subscribe(read);
    return () => {
      alive = false;
      off();
    };
  }, [api.baseUrl]);

  // a phone (or build) with no push at all shows no switch
  if (!pushPort().platform || api.local) return null;

  const toggle = async (next: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      const host = pushHostOf(api, appMeta, appState);
      if (next) {
        const outcome = await enablePush(host, pushRegistrations);
        session.notify(null, texts[outcome], outcome === 'enabled' ? 'info' : 'warning');
      } else {
        await disablePush(api.baseUrl, pushRegistrations, host);
        session.notify(null, texts.disabled, 'info');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.row}>
      <PaperText variant="labelLarge" style={styles.label}>{texts.label}</PaperText>
      <Switch value={on} disabled={busy} onValueChange={(v) => void toggle(v)} accessibilityLabel={texts.label} />
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, minHeight: theme.minTouch },
  label: { flex: 1, color: theme.ink, marginRight: 12 },
}));
