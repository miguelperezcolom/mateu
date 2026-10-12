import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { toastLifetime } from '../core/toastLifetime';
import { useAppContext } from '../context/AppContext';
import { loadFailureMessage } from '../core/uxRules';
import { theme } from '../theme';
import { AppRenderer } from '../renderer/AppRenderer';
import { MateuViewHost } from '../renderer/MateuViewHost';
import { overlayContentWithData, overlayIdOf, upsertOverlay } from '../renderer/patternGaps';

/**
 * One running Mateu UI inside a MateuAppProvider: the root load (App shell or a single view) plus the
 * session-scoped hosts — overlays (Drawer/Dialog fragments), toasts and the dirty guard. Used by the
 * single-backend boot (App.tsx) and by every hub UI session (src/hub/UiSession.tsx); `visible=false`
 * keeps a backgrounded hub session mounted (its navigation stack and state survive a switch) while
 * its modal layers stay hidden.
 */
export function SessionContent({ initialRoute, visible = true }: { initialRoute: string; visible?: boolean }) {
  return (
    <>
      <MateuRoot initialRoute={initialRoute} />
      <OverlayHost visible={visible} />
      <ToastHost visible={visible} />
      <DirtyGuardHost />
    </>
  );
}

interface Toast {
  id: number;
  title: string | null;
  text: string;
  variant: 'info' | 'warning' | 'error';
  undo?: { label: string; onPress: () => void };
}

/** Non-blocking messages from the backend (toasts on the web) as stacked banners. Undoable
 *  messages (Message.undoActionId) show an Undo button and stay long enough to press it. */
function ToastHost({ visible = true }: { visible?: boolean }) {
  const { session } = useAppContext();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    session.notify = (title, text, variant, options) => {
      const toast: Toast = { id: nextId.current++, title, text, variant, undo: options?.undo };
      setToasts((t) => [...t, toast]);
      // undoable toasts default to 10s (like the web's SSEService) so the button can be pressed;
      // an error stays until dismissed (toastLifetime)
      const duration = toastLifetime(variant, options);
      if (duration > 0) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), duration);
    };
  }, [session]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  if (toasts.length === 0 || !visible) return null;
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
            {toastLifetime(t.variant) === 0 && (
              <TouchableOpacity
                style={styles.toastUndo}
                accessibilityRole="button"
                accessibilityLabel="Dismiss"
                onPress={() => dismiss(t.id)}
              >
                <Text style={styles.toastUndoText}>✕</Text>
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
 *  closes them with UICommand.closeModal (its named event reaches @SubscribeTo hosts). An Add whose
 *  overlay id matches an OPEN overlay refreshes that one in place (the "same Drawer.id" contract —
 *  crud "Save and next", the drawer error banner) instead of stacking a duplicate. */
function OverlayHost({ visible = true }: { visible?: boolean }) {
  const { session } = useAppContext();
  const [overlays, setOverlays] = useState<
    { component: unknown; title: string; revision: number; opener?: import('../core/MateuSession').OverlayOpenerContext }[]
  >([]);

  useEffect(() => {
    session.openOverlay = (component, _state, _data, opener) => {
      const meta = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
      const title = (meta['headerTitle'] as string) ?? (meta['title'] as string) ?? '';
      setOverlays((o) => upsertOverlay(o, { component, title, opener, revision: 0 }));
    };
    session.closeTopOverlay = () => setOverlays((o) => o.slice(0, -1));
  }, [session]);

  if (overlays.length === 0 || !visible) return null;
  const top = overlays[overlays.length - 1];
  const meta = ((top.component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
  const content = overlayContentWithData(meta);

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
          {content ? (
            <MateuViewHost
              key={`${overlayIdOf(top.component)}#${top.revision}#${overlays.length}`}
              session={session}
              serverSideNode={content}
              overlayOpener={top.opener}
            />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function MateuRoot({ initialRoute }: { initialRoute: string }) {
  const { api, appState } = useAppContext();
  const { session } = useAppContext();
  const [rootComponent, setRootComponent] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // bumped by "Try again" on the connection-failure screen to repeat the boot load
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // A server speaking another wire major: say so once, visibly, instead of rendering oddly.
    api.onWireMismatch = (message) => session.notify('Version mismatch', message, 'warning', { duration: 12000 });
    setLoading(true);
    setError(null);
    api
      .initialLoad(initialRoute, appState)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (error) {
    // RN-05: the first screen of the app must not be a dead end. It used to show "Could not
    // connect to Mateu backend" + the raw transport text and nothing to press — the user's only
    // way out was killing the app. Plain words, the technical detail kept small for support, and
    // a Try again that repeats the boot load (Nielsen #9; NN/g error-message guidelines).
    const message = loadFailureMessage(error);
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.errorTitle} accessibilityRole="header">{message.title}</Text>
        <Text style={styles.errorDetail}>{message.detail}</Text>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Try again"
          style={styles.retryButton}
          onPress={() => setAttempt((a) => a + 1)}
        >
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
        {message.detail !== error && <Text style={styles.errorTechnical}>{error}</Text>}
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
  return <MateuViewHost session={session} target={{ label: '', route: initialRoute, consumedRoute: '_empty', serverSideType: '' }} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14, color: '#666' },
  errorTitle: { fontSize: 18, fontWeight: '700', color: theme.ink, textAlign: 'center', marginBottom: 8 },
  errorDetail: { fontSize: 14, color: theme.muted, textAlign: 'center', marginBottom: 20, maxWidth: 320 },
  errorTechnical: { fontSize: 12, color: theme.faint, textAlign: 'center', marginTop: 16 },
  retryButton: { backgroundColor: theme.primary, paddingHorizontal: 24, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  retryText: { color: theme.onPrimary, fontWeight: '600', fontSize: 15 },
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
  updateButton: { backgroundColor: theme.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, marginTop: 4 },
  updateButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  updateFallback: { marginTop: 16, alignItems: 'center' },
  updateRecheck: { marginTop: 20, padding: 8 },
  signInError: { marginTop: 12 },
  updateRecheckText: { color: theme.primary, fontSize: 13, fontWeight: '600' },
});
