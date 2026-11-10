import React, { useEffect, useRef, useState } from 'react';
import { recordTiming } from '../core/timing';
import { ActivityIndicator, Modal, Platform, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { Text } from '../ui/Text';
import { toastLifetime } from '../core/toastLifetime';
import { askConfirm } from '../ui/ConfirmHost';
import { FitsContent } from '../renderer/ScrollContext';
import { useAppContext } from '../context/AppContext';
import { bootFailureOf, loadFailureMessage } from '../core/uxRules';
import { theme, themed } from '../theme';
import { IconButton, Snackbar, Surface, Text as PaperText } from 'react-native-paper';
import { MateuButton } from '../ui/controls';
import { AppRenderer } from '../renderer/AppRenderer';
import { MateuViewHost, ViewControllerProvider } from '../renderer/MateuViewHost';
import { ComponentRenderer } from '../renderer/ComponentRenderer';
import type { MateuViewController } from '../core/MateuViewController';
import { overlayContentWithData, overlayIdOf, upsertOverlay, withOverlayState } from '../renderer/patternGaps';
import { interpolate } from '../core/expressions';
import { buttonA11y, headingA11y, modalA11y } from '../a11y/a11y';
import { TaskHost } from '../renderer/TaskHost';
import { ConnectivityStrip } from './ConnectivityStrip';

/**
 * One running Mateu UI inside a MateuAppProvider: the root load (App shell or a single view) plus the
 * session-scoped hosts — overlays (Drawer/Dialog fragments), toasts and the dirty guard. Used by the
 * single-backend boot (App.tsx) and by every hub UI session (src/hub/UiSession.tsx); `visible=false`
 * keeps a backgrounded hub session mounted (its navigation stack and state survive a switch) while
 * its modal layers stay hidden.
 */
export function SessionContent({ initialRoute, visible = true }: { initialRoute: string; visible?: boolean }) {
  const { session } = useAppContext();
  session.onScreen = visible;
  return (
    <>
      <MateuRoot initialRoute={initialRoute} />
      <OverlayHost visible={visible} />
      <TaskHost visible={visible} />
      <ToastHost visible={visible} />
      <ConnectivityStrip visible={visible} />
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
  /** Every action of the message (Message.actions); drawn instead of `undo` when present. */
  actions?: { label: string; onPress: () => void; style?: string | null }[];
  /** A message with the same key replaces this one. */
  key?: string | null;
  /** ms; 0 = stays until dismissed (gets a ✕) */
  lifetime: number;
}

/** Non-blocking messages from the backend (toasts on the web) as stacked banners. Undoable
 *  messages (Message.undoActionId) show an Undo button and stay long enough to press it. */
function ToastHost({ visible = true }: { visible?: boolean }) {
  const { session } = useAppContext();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    session.notify = (title, text, variant, options) => {
      // undoable toasts default to 10s (like the web's SSEService) so the button can be pressed;
      // an error (or a sticky notice) stays until dismissed (toastLifetime)
      const duration = toastLifetime(variant, { ...options, undo: options?.undo ?? (options?.actions?.length ? true : undefined) });
      const toast: Toast = { id: nextId.current++, title, text, variant, undo: options?.undo, actions: options?.actions, key: options?.key, lifetime: duration };
      // the same key replaces the toast on screen instead of stacking a second one
      setToasts((t) => [...t.filter((x) => !(toast.key && x.key === toast.key)), toast]);
      if (duration > 0) setTimeout(() => setToasts((t) => t.filter((x) => x.id !== toast.id)), duration);
    };
  }, [session]);

  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));

  if (toasts.length === 0 || !visible) return null;
  return (
    // Material snackbars, stacked above the floating buttons; an undoable one carries its action,
    // a sticky one (an error, the "app updated — Reload" notice) a close icon
    <View style={styles.toastHost} pointerEvents="box-none">
      {toasts.map((t) => (
        <Snackbar
          key={t.id}
          visible
          onDismiss={() => {}}
          duration={Number.MAX_SAFE_INTEGER}
          wrapperStyle={styles.toastWrapper}
          style={[styles.toast, t.variant === 'error' && styles.toastError]}
          theme={t.variant === 'error' ? { colors: { inverseOnSurface: theme.onFill, inversePrimary: theme.onFill } } : undefined}
          action={
            t.actions && t.actions.length === 1
              ? { label: t.actions[0].label, onPress: () => { t.actions![0].onPress(); dismiss(t.id); } }
              : !t.actions?.length && t.undo
                ? { label: t.undo.label, onPress: () => { t.undo!.onPress(); dismiss(t.id); } }
                : undefined
          }
          onIconPress={t.lifetime === 0 ? () => dismiss(t.id) : undefined}
          iconAccessibilityLabel="Dismiss"
          accessibilityRole={t.variant === 'error' ? 'alert' : undefined}
        >
          {t.actions && t.actions.length > 1 ? (
            // several actions: Material's snackbar takes one — the rest go under the text
            <View style={styles.toastBody}>
              <PaperText style={styles.toastText}>{t.title ? `${t.title} — ${t.text}` : t.text}</PaperText>
              <View style={styles.toastActions}>
                {t.actions.map((a, i) => (
                  <TouchableOpacity key={i} {...buttonA11y({ label: a.label })} style={styles.toastAction} onPress={() => { a.onPress(); dismiss(t.id); }}>
                    <PaperText style={styles.toastActionText}>{a.label}</PaperText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : t.title ? `${t.title} — ${t.text}` : t.text}
        </Snackbar>
      ))}
    </View>
  );
}

/** Dirty guard (@ConfirmOnNavigationIfDirty): a Material dialog on iOS/Android, window.confirm on web. */
function DirtyGuardHost() {
  const { session } = useAppContext();
  useEffect(() => {
    session.confirmDiscard = () =>
      new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(window.confirm('There are unsaved changes. Discard them?'));
          return;
        }
        void askConfirm({ title: 'Unsaved changes', message: 'Discard your changes?', confirmLabel: 'Discard', cancelLabel: 'Keep editing', destructive: true }).then(resolve);
      });
    // @Action(confirmationRequired): the declared question, with the declared button labels natively
    session.confirmAction = (t) =>
      new Promise<boolean>((resolve) => {
        if (Platform.OS === 'web') {
          resolve(window.confirm(`${t.header}\n\n${t.message}`));
          return;
        }
        void askConfirm({ title: t.header, message: t.message, confirmLabel: t.confirmationText, cancelLabel: t.denialText, destructive: t.destructive }).then(resolve);
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
    {
      component: unknown;
      title: string;
      revision: number;
      opener?: import('../core/MateuSession').OverlayOpenerContext;
      /** the overlay's own state: its initialData, then the updates aimed at it (LongTask steps) */
      state: Record<string, unknown>;
    }[]
  >([]);
  // the latest stack, for the synchronous "is this update for an open overlay?" answer
  const overlaysRef = useRef(overlays);
  overlaysRef.current = overlays;

  useEffect(() => {
    session.openOverlay = (component, _state, _data, opener) => {
      const meta = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
      const title = (meta['headerTitle'] as string) ?? (meta['title'] as string) ?? '';
      const state = { ...((meta['initialData'] as Record<string, unknown>) ?? {}) };
      setOverlays((o) => upsertOverlay(o, { component, title, opener, revision: 0, state }));
    };
    session.updateOverlayState = (id, state) => {
      if (!withOverlayState(overlaysRef.current, id, state)) return false;
      setOverlays((o) => withOverlayState(o, id, state) ?? o);
      return true;
    };
    session.closeTopOverlay = () => setOverlays((o) => o.slice(0, -1));
  }, [session]);

  if (overlays.length === 0 || !visible) return null;
  // ONE modal holds every open overlay as a layer: the lower ones stay MOUNTED under the top one, so
  // a drawer under a nested dialog keeps what was typed in it (only the top was drawn: closing the
  // dialog remounted the drawer from its initialData — its next request sent an empty state)
  return (
    <Modal {...modalA11y(overlayTitleOf(overlays[overlays.length - 1]) || 'Dialog')} accessibilityViewIsModal animationType="fade" transparent statusBarTranslucent onRequestClose={() => session.closeTopOverlay()}>
      {overlays.map((entry, i) => (
        <OverlayLayer key={`${overlayIdOf(entry.component) || i}#${entry.revision}`} entry={entry} top={i === overlays.length - 1} fallbackSession={session} />
      ))}
    </Modal>
  );
}

type OverlayEntryState = {
  component: unknown;
  title: string;
  revision: number;
  opener?: import('../core/MateuSession').OverlayOpenerContext;
  state: Record<string, unknown>;
};

const overlayTitleOf = (entry: OverlayEntryState) => interpolate(entry.title, { state: entry.state });

const asNodes = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);

/** One open overlay: a Dialog / ConfirmDialog (Material's dialog) or a Drawer (a bottom sheet). */
function OverlayLayer({ entry, top, fallbackSession }: { entry: OverlayEntryState; top: boolean; fallbackSession: import('../core/MateuSession').MateuSession }) {
  const session = entry.opener?.session ?? fallbackSession;
  const opener = entry.opener?.controller as MateuViewController | undefined;
  const meta = ((entry.component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
  const type = meta['type'];
  const content = overlayContentWithData({ ...meta, initialData: entry.state });
  const title = overlayTitleOf(entry);
  const subtitle = interpolate(String(meta['subtitle'] ?? ''), { state: entry.state });
  const close = () => session.closeTopOverlay();

  /** What the overlay draws OUTSIDE its content (a footer, a header, a ConfirmDialog's body) runs on
   *  the view that opened it, with its state — the web's actions bubble to the opener. */
  const onOpener = (node: unknown) => {
    if (!node || typeof node !== 'object') return null;
    if (opener) {
      return (
        <ViewControllerProvider value={opener}>
          <ComponentRenderer component={node} state={opener.rendered.state ?? {}} data={opener.rendered.data} />
        </ViewControllerProvider>
      );
    }
    return <MateuViewHost session={session} serverSideNode={node} overlaid overlayOpener={entry.opener} />;
  };

  const host = (fit: boolean) =>
    content ? (
      <FitsContent.Provider value={fit}>
        <MateuViewHost session={session} serverSideNode={content} overlaid overlayOpener={entry.opener} />
      </FitsContent.Provider>
    ) : null;
  const closeButton = <IconButton icon="close" accessibilityLabel={title ? `Close ${title}` : 'Close'} onPress={close} />;
  // a lower layer stays drawn (dimmed by the one above) but takes no touches
  const layer = StyleSheet.absoluteFill;

  if (type === 'ConfirmDialog') {
    // its buttons close it, then run their action on the opener (vaadin-confirm-dialog closes on
    // any of its buttons; drawn in place it stayed until Cancel)
    const press = (actionId: unknown) => {
      close();
      if (typeof actionId === 'string' && actionId && opener) void opener.runAction(actionId);
    };
    const body = asNodes((entry.component as Record<string, unknown>)?.['children']);
    return (
      <View style={[layer, styles.dialogBackdrop]} pointerEvents={top ? 'auto' : 'none'}>
        <Surface elevation={3} style={styles.dialog}>
          <View style={styles.overlayHeader}>
            <PaperText variant="headlineSmall" {...headingA11y(2)} style={styles.overlayTitle} numberOfLines={3}>{interpolate(String(meta['header'] ?? ''), { state: entry.state })}</PaperText>
          </View>
          <View style={styles.dialogBody}>
            {body.map((node, i) => <React.Fragment key={i}>{onOpener(node)}</React.Fragment>)}
            {onOpener(meta['content'])}
          </View>
          <View style={styles.dialogFooter}>
            {!!meta['canCancel'] && <MateuButton label={String(meta['cancelText'] ?? 'Cancel')} buttonStyle="tertiary" onPress={() => press(meta['cancelActionId'])} />}
            {!!meta['canReject'] && <MateuButton label={String(meta['rejectText'] ?? 'No')} onPress={() => press(meta['rejectActionId'])} />}
            <MateuButton label={String(meta['confirmText'] ?? 'OK')} buttonStyle="primary" onPress={() => press(meta['confirmActionId'])} />
          </View>
        </Surface>
      </View>
    );
  }

  // A Dialog is Material's dialog, as tall as what it says: a two-line question used to take half the screen.
  if (type === 'Dialog') {
    return (
      <View style={[layer, styles.dialogBackdrop, meta['modeless'] === true && styles.clearBackdrop]} pointerEvents={top ? 'auto' : 'none'}>
        <Surface elevation={3} style={styles.dialog}>
          <View style={styles.overlayHeader}>
            <PaperText variant="headlineSmall" {...headingA11y(2)} style={styles.overlayTitle} numberOfLines={2}>{title}</PaperText>
            {closeButton}
          </View>
          {onOpener(meta['header'])}
          {host(true)}
          {!!meta['footer'] && <View style={styles.dialogFooter}>{onOpener(meta['footer'])}</View>}
        </Surface>
      </View>
    );
  }

  return (
    // a drawer: screen readers stop at its edge, and its ✕ is a named button (it was announced as
    // bare text, unreachable as a control)
    <View style={[layer, styles.overlayBackdrop, meta['modeless'] === true && styles.clearBackdrop]} pointerEvents={top ? 'auto' : 'none'}>
      {/* a Material bottom sheet: drag handle, title, close */}
      <View style={styles.overlaySheet}>
        <View style={styles.overlayHandle} />
        <View style={styles.overlayHeader}>
          <View style={styles.overlayTitle}>
            <PaperText variant="titleLarge" {...headingA11y(2)} numberOfLines={2}>{title}</PaperText>
            {!!subtitle && <PaperText variant="bodyMedium" style={styles.overlaySubtitle}>{subtitle}</PaperText>}
          </View>
          {closeButton}
        </View>
        {onOpener(meta['header'])}
        <View style={styles.sheetBody}>{host(false)}</View>
        {!!meta['footer'] && <View style={styles.sheetFooter}>{onOpener(meta['footer'])}</View>}
      </View>
    </View>
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
  const loadingRef = useRef(false);

  useEffect(() => {
    // A server speaking another wire major: say so once, visibly, instead of rendering oddly.
    api.onWireMismatch = (message) => session.notify('Version mismatch', message, 'warning', { duration: 12000 });
    setLoading(true);
    setError(null);
    // The backend returns a UIIncrementDto: pick the App fragment (or the first one).
    const rootOf = (result: unknown): unknown => {
      const res = result as Record<string, unknown>;
      const fragments = (res['fragments'] as any[]) ?? [];
      const frag =
        fragments.find((f) => f?.component?.metadata?.type === 'App') ??
        fragments.find((f) => f?.component?.children?.[0]?.metadata?.type === 'App') ??
        fragments[0];
      const comp = frag?.component ?? null;
      // Unwrap a ServerSide whose child is the App shell.
      const child = (comp?.children as any[])?.[0];
      return child?.metadata?.type === 'App' ? child : comp;
    };
    // The shell this UI answered last time, at once (a UI without sign-in): the fresh one replaces it.
    const snapshots = api.local ? null : session.snapshots;
    const snapshotKey = snapshots ? snapshots.keyOf(`shell:${initialRoute}`, '_empty', '') : '';
    let fromSnapshot = false;
    const started = Date.now();
    let alive = true;
    if (snapshots) {
      void snapshots.get(snapshotKey).then((snapshot) => {
        if (!alive || !snapshot || !loadingRef.current) return;
        fromSnapshot = true;
        setRootComponent(rootOf(snapshot));
        setLoading(false);
        recordTiming('shell', Date.now() - started, 'snapshot');
      });
    }
    loadingRef.current = true;
    api
      .initialLoad(initialRoute, appState)
      .then((result) => {
        if (!alive) return;
        recordTiming('shell', Date.now() - started, 'network');
        // Nothing to render: show WHY (the server's message) on the retry screen, not a blank one.
        const failure = bootFailureOf(result);
        if (failure) {
          if (!fromSnapshot) setError(failure);
          return;
        }
        setRootComponent(rootOf(result));
        if (snapshots) void snapshots.put(snapshotKey, result);
      })
      .catch((e: Error) => {
        // a shell already on screen from the snapshot stays (an offline copy)
        if (alive && !fromSnapshot) setError(e.message);
      })
      .finally(() => {
        loadingRef.current = false;
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} accessibilityLabel="Loading" />
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
        <MateuButton label="Try again" buttonStyle="primary" icon="refresh" onPress={() => setAttempt((a) => a + 1)} />
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
  return <MateuViewHost session={session} onController={(c) => { session.hasUnsavedChanges = () => (c.trackDirty && c.dirty) || session.anyUnsavedChanges(); }} target={{ label: '', route: initialRoute, consumedRoute: '_empty', serverSideType: '' }} />;
}

const styles = themed(() => StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: theme.background },
  errorTitle: { fontSize: 22, fontWeight: '600', color: theme.ink, textAlign: 'center', marginBottom: 8 },
  errorDetail: { fontSize: 16, color: theme.muted, textAlign: 'center', marginBottom: 24, maxWidth: 320 },
  errorTechnical: { fontSize: 12, color: theme.faint, textAlign: 'center', marginTop: 16 },
  toastHost: { position: 'absolute', bottom: 88, left: 0, right: 0, gap: 8 },
  toastWrapper: { position: 'relative' },
  toast: { borderRadius: 4 },
  toastError: { backgroundColor: theme.danger },
  toastBody: { gap: 4 },
  toastText: { color: theme.background },
  toastActions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 4 },
  toastAction: { minHeight: theme.minTouch, justifyContent: 'center', paddingHorizontal: 8 },
  toastActionText: { color: theme.primaryContainer, fontWeight: '600' },
  overlayBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' },
  dialogBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 560, maxHeight: '85%', borderRadius: theme.radiusLg, paddingTop: 12, paddingBottom: 8, overflow: 'hidden', backgroundColor: theme.surface },
  overlaySheet: { backgroundColor: theme.surface, borderTopLeftRadius: theme.radiusLg, borderTopRightRadius: theme.radiusLg, maxHeight: '88%', minHeight: '50%', overflow: 'hidden' },
  overlayHandle: { alignSelf: 'center', width: 32, height: 4, borderRadius: 2, backgroundColor: theme.border, marginTop: 10 },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 24, paddingRight: 8, paddingTop: 4, paddingBottom: 4 },
  overlayTitle: { flex: 1, color: theme.ink },
  overlaySubtitle: { color: theme.muted, marginTop: 2 },
  clearBackdrop: { backgroundColor: 'transparent' },
  dialogBody: { paddingHorizontal: 24, paddingVertical: 8, gap: 8 },
  dialogFooter: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 16, paddingTop: 8 },
  sheetBody: { flexShrink: 1, flexGrow: 1 },
  sheetFooter: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border, padding: 12 },
}));
