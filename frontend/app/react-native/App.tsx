import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, Platform, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MateuAppProvider, useAppContext } from './src/context/AppContext';
import {
  fetchRegistryEntry,
  installedRendererVersion,
  readRegistryConfig,
  RegistryEntry,
  updateRequired,
} from './src/core/AppRegistry';
import { AppRenderer } from './src/renderer/AppRenderer';
import { MateuViewHost } from './src/renderer/MateuViewHost';

// ─── Backend resolution ──────────────────────────────────────────────────────
// PRODUCTION: the installable carries only a registry URL + app id (app.json `expo.extra`
// mateuRegistryUrl/mateuAppId, or EXPO_PUBLIC_MATEU_REGISTRY_URL/EXPO_PUBLIC_MATEU_APP_ID in
// dev) — the public registry maps the app id to the Mateu base URL, the launch parameters and
// the required renderer version (see src/core/AppRegistry.ts). No registry configured →
// DEV fallback: on a real device (Expo Go) "localhost" is the PHONE, so the backend host is
// derived from the Expo dev server the bundle was loaded from (hostUri).
const MATEU_BACKEND_PORT = 8594;
const devHost = Constants.expoConfig?.hostUri?.split(':')[0];
const DEV_CONFIG = {
  baseUrl: `http://${Platform.OS === 'web' || !devHost ? 'localhost' : devHost}:${MATEU_BACKEND_PORT}`,
  sessionId: 'native-session-1',
  appState: { tenantId: '1111', profile: 'dev' } as Record<string, unknown>,
};

function configFromEntry(entry: RegistryEntry) {
  return {
    baseUrl: entry.baseUrl.replace(/\/+$/, ''),
    sessionId: 'native-session-1',
    appState: { ...(entry.parameters ?? {}) },
  };
}
// ─────────────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  title: string | null;
  text: string;
  variant: 'info' | 'warning' | 'error';
  undo?: { label: string; onPress: () => void };
}

/** Non-blocking messages from the backend (toasts on the web) as stacked banners. Undoable
 *  messages (Message.undoActionId) show an Undo button and stay long enough to press it. */
function ToastHost() {
  const { session } = useAppContext();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    session.notify = (title, text, variant, options) => {
      const toast: Toast = { id: nextId.current++, title, text, variant, undo: options?.undo };
      setToasts((t) => [...t, toast]);
      // undoable toasts default to 10s (like the web's SSEService) so the button can be pressed
      const duration = options?.duration && options.duration > 0 ? options.duration : options?.undo ? 10000 : 4000;
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), duration);
    };
  }, [session]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  if (toasts.length === 0) return null;
  return (
    <View style={styles.toastHost} pointerEvents="box-none">
      {toasts.map((t) => (
        <View key={t.id} style={[styles.toast, styles[`toast_${t.variant}`]]}>
          {!!t.title && <Text style={styles.toastTitle}>{t.title}</Text>}
          <View style={styles.toastBody}>
            <Text style={[styles.toastText, styles.toastTextGrow]}>{t.text}</Text>
            {!!t.undo && (
              <TouchableOpacity
                style={styles.toastUndo}
                onPress={() => {
                  t.undo!.onPress();
                  dismiss(t.id);
                }}
              >
                <Text style={styles.toastUndoText}>{t.undo.label}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Dirty guard (@ConfirmOnNavigationIfDirty): native Alert on iOS/Android, window.confirm on web. */
function DirtyGuardHost() {
  const { session } = useAppContext();
  useEffect(() => {
    session.confirmDiscard = () =>
      new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(window.confirm('There are unsaved changes. Discard them?'));
          return;
        }
        Alert.alert('Unsaved changes', 'Discard your changes?', [
          { text: 'Keep editing', style: 'cancel', onPress: () => resolve(false) },
          { text: 'Discard', style: 'destructive', onPress: () => resolve(true) },
        ]);
      });
  }, [session]);
  return null;
}

/** Drawer/Dialog fragments (action=Add overlays): shown as a native modal sheet; the server
 *  closes them with UICommand.closeModal (its named event reaches @SubscribeTo hosts). */
function OverlayHost() {
  const { session } = useAppContext();
  const [overlays, setOverlays] = useState<
    { component: unknown; title: string; opener?: import('./src/core/MateuSession').OverlayOpenerContext }[]
  >([]);

  useEffect(() => {
    session.openOverlay = (component, _state, _data, opener) => {
      const meta = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
      const title = (meta['headerTitle'] as string) ?? (meta['title'] as string) ?? '';
      setOverlays((o) => [...o, { component, title, opener }]);
    };
    session.closeTopOverlay = () => setOverlays((o) => o.slice(0, -1));
  }, [session]);

  if (overlays.length === 0) return null;
  const top = overlays[overlays.length - 1];
  const meta = ((top.component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
  const content = meta['content'];

  return (
    <Modal animationType="slide" transparent onRequestClose={() => session.closeTopOverlay()}>
      <View style={styles.overlayBackdrop}>
        <View style={styles.overlaySheet}>
          <View style={styles.overlayHeader}>
            <Text style={styles.overlayTitle}>{top.title}</Text>
            <TouchableOpacity onPress={() => session.closeTopOverlay()}>
              <Text style={styles.overlayClose}>✕</Text>
            </TouchableOpacity>
          </View>
          {content ? <MateuViewHost session={session} serverSideNode={content} overlayOpener={top.opener} /> : null}
        </View>
      </View>
    </Modal>
  );
}

function MateuRoot() {
  const { api, appState } = useAppContext();
  const { session } = useAppContext();
  const [rootComponent, setRootComponent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .initialLoad('', appState)
      .then((result) => {
        // The backend returns a UIIncrementDto: pick the App fragment (or the first one).
        const res = result as Record<string, unknown>;
        const fragments = (res['fragments'] as any[]) ?? [];
        const frag =
          fragments.find((f) => f?.component?.metadata?.type === 'App') ??
          fragments.find((f) => f?.component?.children?.[0]?.metadata?.type === 'App') ??
          fragments[0];
        const comp = frag?.component ?? null;
        // Unwrap a ServerSide whose child is the App shell.
        const child = (comp?.children as any[])?.[0];
        setRootComponent(child?.metadata?.type === 'App' ? child : comp);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0070f3" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not connect to Mateu backend</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!rootComponent) return null;

  const comp = rootComponent as Record<string, unknown>;
  const metadata = (comp['metadata'] as Record<string, unknown>) ?? {};
  const metaType = (metadata['type'] as string) ?? '';

  if (metaType === 'App') {
    return <AppRenderer component={comp} appMeta={metadata as any} />;
  }

  // No app shell: the root route IS a single view — host it directly.
  return <MateuViewHost session={session} target={{ label: '', route: '', consumedRoute: '_empty', serverSideType: '' }} />;
}

/** Blocking screen shown when the registry demands a newer renderer. "Update now" first tries
 *  an over-the-air update (expo-updates, real for EAS-built installables), then falls back to
 *  the platform store link from the registry entry. */
function UpdateRequiredScreen({ entry, onRecheck }: { entry: RegistryEntry; onRecheck: () => void }) {
  const [updating, setUpdating] = useState(false);
  const [otaUnavailable, setOtaUnavailable] = useState(false);
  const storeUrl = Platform.OS === 'ios' ? entry.storeUrl?.ios : entry.storeUrl?.android;

  const update = async () => {
    setUpdating(true);
    try {
      if (Updates.isEnabled) {
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync(); // relaunches on the new bundle — never returns
          return;
        }
      }
      setOtaUnavailable(true);
    } catch {
      setOtaUnavailable(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.centered}>
      <Text style={styles.updateTitle}>Update required</Text>
      <Text style={styles.updateDetail}>
        This app needs renderer version {entry.requiredRendererVersion} — you have {installedRendererVersion()}.
      </Text>
      {updating ? (
        <ActivityIndicator size="large" color="#0070f3" style={styles.updateSpinner} />
      ) : (
        <TouchableOpacity style={styles.updateButton} onPress={update}>
          <Text style={styles.updateButtonText}>Update now</Text>
        </TouchableOpacity>
      )}
      {otaUnavailable && (
        <View style={styles.updateFallback}>
          <Text style={styles.updateDetail}>No over-the-air update is available.</Text>
          {storeUrl ? (
            <TouchableOpacity style={styles.updateButton} onPress={() => Linking.openURL(storeUrl)}>
              <Text style={styles.updateButtonText}>Open the store</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.updateDetail}>Please install the latest version from your app store.</Text>
          )}
        </View>
      )}
      <TouchableOpacity onPress={onRecheck} style={styles.updateRecheck}>
        <Text style={styles.updateRecheckText}>Check again</Text>
      </TouchableOpacity>
    </View>
  );
}

/** Boot gate: no registry configured → dev config straight away; otherwise resolve the registry
 *  entry (baseUrl + parameters), enforce the required renderer version, then boot as usual. */
function RegistryBoot() {
  const [regConfig] = useState(readRegistryConfig);
  const [phase, setPhase] = useState<'loading' | 'error' | 'update' | 'ready'>(regConfig ? 'loading' : 'ready');
  const [entry, setEntry] = useState<RegistryEntry | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!regConfig) return;
    setPhase('loading');
    try {
      const e = await fetchRegistryEntry(regConfig);
      setEntry(e);
      setPhase(updateRequired(e) ? 'update' : 'ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase('error');
    }
  }, [regConfig]);

  useEffect(() => {
    void load();
  }, [load]);

  if (phase === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0070f3" />
        <Text style={styles.loadingText}>Contacting app registry…</Text>
      </View>
    );
  }
  if (phase === 'error') {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not reach the app registry</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        <TouchableOpacity style={styles.updateButton} onPress={() => void load()}>
          <Text style={styles.updateButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (phase === 'update' && entry) {
    return <UpdateRequiredScreen entry={entry} onRecheck={() => void load()} />;
  }

  const config = entry ? configFromEntry(entry) : DEV_CONFIG;
  return (
    <MateuAppProvider config={config}>
      <MateuRoot />
      <OverlayHost />
      <ToastHost />
      <DirtyGuardHost />
    </MateuAppProvider>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <RegistryBoot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorTitle: { fontSize: 16, fontWeight: '600', color: '#cc0000', textAlign: 'center', marginBottom: 8 },
  errorDetail: { fontSize: 13, color: '#666', textAlign: 'center' },
  toastHost: { position: 'absolute', top: 40, left: 16, right: 16, gap: 8 },
  toast: { borderRadius: 8, padding: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  toast_info: { backgroundColor: '#e8f0fe' },
  toast_warning: { backgroundColor: '#fdf6e3' },
  toast_error: { backgroundColor: '#fbe9e7' },
  toastTitle: { fontWeight: '700', fontSize: 13, color: '#1a1a1a', marginBottom: 2 },
  toastText: { fontSize: 13, color: '#1a1a1a' },
  toastBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toastTextGrow: { flex: 1 },
  toastUndo: { borderWidth: 1, borderColor: '#1a1a1a', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 3 },
  toastUndoText: { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  overlaySheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%', minHeight: '50%' },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  overlayTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  overlayClose: { fontSize: 18, color: '#666', paddingHorizontal: 8 },
  updateTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  updateDetail: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 12 },
  updateSpinner: { marginVertical: 8 },
  updateButton: { backgroundColor: '#0070f3', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 4 },
  updateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  updateFallback: { marginTop: 16, alignItems: 'center' },
  updateRecheck: { marginTop: 20, padding: 8 },
  updateRecheckText: { color: '#0070f3', fontSize: 13, fontWeight: '600' },
});
