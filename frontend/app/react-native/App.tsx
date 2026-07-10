import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MateuAppProvider, useAppContext } from './src/context/AppContext';
import { AppRenderer } from './src/renderer/AppRenderer';
import { MateuViewHost } from './src/renderer/MateuViewHost';

// ─── Configure your Mateu backend here ───────────────────────────────────────
const MATEU_CONFIG = {
  // iOS simulator / web reach the host at localhost; on a real device use the machine's LAN IP.
  baseUrl: 'http://localhost:8592',
  sessionId: 'native-session-1',
  appState: { tenantId: '1111', profile: 'dev' },
};
// ─────────────────────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  title: string | null;
  text: string;
  variant: 'info' | 'warning' | 'error';
}

/** Non-blocking messages from the backend (toasts on the web) as stacked banners. */
function ToastHost() {
  const { session } = useAppContext();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    session.notify = (title, text, variant) => {
      const toast: Toast = { id: nextId.current++, title, text, variant };
      setToasts((t) => [...t, toast]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), 4000);
    };
  }, [session]);

  if (toasts.length === 0) return null;
  return (
    <View style={styles.toastHost} pointerEvents="box-none">
      {toasts.map((t) => (
        <View key={t.id} style={[styles.toast, styles[`toast_${t.variant}`]]}>
          {!!t.title && <Text style={styles.toastTitle}>{t.title}</Text>}
          <Text style={styles.toastText}>{t.text}</Text>
        </View>
      ))}
    </View>
  );
}

/** Drawer/Dialog fragments (action=Add overlays): shown as a native modal sheet; the server
 *  closes them with UICommand.closeModal (its named event reaches @SubscribeTo hosts). */
function OverlayHost() {
  const { session } = useAppContext();
  const [overlays, setOverlays] = useState<{ component: unknown; title: string }[]>([]);

  useEffect(() => {
    session.openOverlay = (component) => {
      const meta = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
      const title = (meta['headerTitle'] as string) ?? (meta['title'] as string) ?? '';
      setOverlays((o) => [...o, { component, title }]);
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
          {content ? <MateuViewHost session={session} serverSideNode={content} /> : null}
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

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <MateuAppProvider config={MATEU_CONFIG}>
        <MateuRoot />
        <OverlayHost />
        <ToastHost />
      </MateuAppProvider>
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
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  overlaySheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '85%', minHeight: '50%' },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  overlayTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  overlayClose: { fontSize: 18, color: '#666', paddingHorizontal: 8 },
});
