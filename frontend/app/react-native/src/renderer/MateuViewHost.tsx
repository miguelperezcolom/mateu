import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { loadFailureMessage } from '../core/uxRules';
import { MateuSession, NavTarget, OverlayOpenerContext } from '../core/MateuSession';
import { MateuViewController, RenderedView } from '../core/MateuViewController';
import { ComponentRenderer } from './ComponentRenderer';
import { theme } from '../theme';

/** The controller of the view a component belongs to — field editors write state through it,
 *  buttons dispatch actions, cruds register data handlers. */
const ViewControllerContext = createContext<MateuViewController | null>(null);

export function useViewController(): MateuViewController {
  const ctx = useContext(ViewControllerContext);
  if (!ctx) throw new Error('useViewController must be used inside a MateuViewHost');
  return ctx;
}

interface Props {
  session: MateuSession;
  /** Navigation target to load (mutually exclusive with serverSideNode). */
  target?: NavTarget;
  /** An inline ServerSide node to mount (embedded islands, overlay contents). */
  serverSideNode?: unknown;
  /** Opener navigation context for overlay contents: seeds the controller's route/serverSideType
   *  so a ClientSide overlay (e.g. a conflict dialog) dispatches actions on the initiator. */
  overlayOpener?: OverlayOpenerContext;
  /** Detail navigations (row → detail/new/edit) push a new screen through this. */
  onOpenDetail?: (target: NavTarget) => void;
  /** Errors shown as inline text instead of toasts (embedded islands). */
  silent?: boolean;
  /** Hands the live controller to the host (dirty checks on back navigation). */
  onController?: (controller: MateuViewController) => void;
}

/**
 * Hosts ONE Mateu view: owns its [MateuViewController], loads the target, and re-renders on every
 * increment application. The controller is exposed through [useViewController] so every renderer
 * in the subtree shares the same live component state and action pipeline.
 */
export function MateuViewHost({ session, target, serverSideNode, overlayOpener, onOpenDetail, silent, onController }: Props) {
  const controller = useMemo(() => new MateuViewController(session), [session]);
  const [view, setView] = useState<RenderedView>(controller.rendered);

  useEffect(() => {
    controller.onRender = (v) => setView({ ...v });
    controller.silentErrors = !!silent;
    controller.detailOpener = onOpenDetail ?? null;
    controller.confirmDiscard = () => session.confirmDiscard();
    onController?.(controller);
    if (serverSideNode) {
      if (overlayOpener) {
        // seed the opener's navigation context: a ClientSide overlay content carries no
        // route/serverSideType of its own, and mountServerSide keeps these as fallbacks
        controller.currentRoute = overlayOpener.route;
        controller.currentConsumedRoute = overlayOpener.consumedRoute;
        controller.currentServerSideType = overlayOpener.serverSideType;
      }
      controller.mountServerSide(serverSideNode);
    } else if (target) {
      void controller.navigate(target.route, target.consumedRoute, target.serverSideType);
    }
    return () => {
      controller.onRender = () => {};
      controller.session.unsubscribeAll(controller);
      controller.dispose(); // pending periodic refreshes die with the screen
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller]);

  if (view.loading && !view.component) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }
  if (view.error && !view.component) {
    // RN-05: a load that failed before anything was shown used to leave the raw transport text
    // ("Failed to fetch") on an otherwise blank screen, with no way to try again — the user had to
    // kill the app. Now: what happened in plain words, and a Retry that repeats the same load.
    const message = loadFailureMessage(view.error);
    const retry = () => {
      if (serverSideNode) controller.mountServerSide(serverSideNode);
      else if (target) void controller.navigate(target.route, target.consumedRoute, target.serverSideType);
    };
    if (silent) return <Text style={styles.error}>{message.title}</Text>;
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.failureTitle} {...headingA11y(2)}>{message.title}</Text>
        <Text style={styles.failureDetail}>{message.detail}</Text>
        <TouchableOpacity {...buttonA11y({ label: 'Try again' })} style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
  if (!view.component) return <View style={styles.centered} />;

  // Routed views whose root is a bare layout (e.g. a wizard's VerticalLayout) don't scroll by
  // themselves — Page/Form/Crud roots bring their own ScrollView/list, everything else gets one.
  // Embedded islands (serverSideNode) stay unwrapped: they live inside the host view's scroll.
  const rootType =
    ((view.component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>)?.[
      'type'
    ] as string | undefined;
  const selfScrolling = rootType === 'Page' || rootType === 'Form' || rootType === 'Crud';
  const content = (
    <ComponentRenderer component={view.component} state={view.state} data={view.data} />
  );

  const body = (
    <View style={styles.host} key={view.version}>
      {view.loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.primary} accessibilityLabel="Loading" />
        </View>
      )}
      {serverSideNode || selfScrolling ? (
        content
      ) : (
        <ScrollView style={styles.host} contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      )}
    </View>
  );

  return (
    <ViewControllerContext.Provider value={controller}>
      {serverSideNode ? (
        body
      ) : (
        // RN-19: on iOS the software keyboard is laid OVER the screen — without this the bottom
        // button bar (Save / Next) and the last fields of a form sat hidden behind it. Android
        // resizes the window itself (adjustResize), so it needs nothing. Islands live inside a host
        // that already avoids the keyboard.
        <KeyboardAvoidingView style={styles.host} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      )}
    </ViewControllerContext.Provider>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  // a bare-layout root (e.g. a wizard) gets the same 16pt gutter as Page/Form roots — it was flush
  // against the screen edges (RN-17)
  scrollBody: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: theme.danger, padding: 16, fontSize: 14 },
  failureTitle: { fontSize: 18, fontWeight: '700', color: theme.ink, textAlign: 'center', marginBottom: 8 },
  failureDetail: { fontSize: 14, color: theme.muted, textAlign: 'center', marginBottom: 20, maxWidth: 320 },
  retryButton: { backgroundColor: theme.primary, paddingHorizontal: 24, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  retryText: { color: theme.onPrimary, fontWeight: '600', fontSize: 15 },
  loadingOverlay: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
});
