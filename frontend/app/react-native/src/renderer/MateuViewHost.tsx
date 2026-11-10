import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from '../ui/Touchable';
import { Text } from '../ui/Text';
import { buttonA11y, headingA11y } from '../a11y/a11y';
import { loadFailureMessage } from '../core/uxRules';
import { MateuSession, NavTarget, OverlayOpenerContext } from '../core/MateuSession';
import { MateuViewController, RenderedView } from '../core/MateuViewController';
import { BarTitle, EmbeddedChrome, type EmbeddedChromeMode, FIT_CONTENT, InsideVerticalScroll, useFitsContent, ScreenHasBack } from './ScrollContext';
import { ComponentRenderer } from './ComponentRenderer';
import { firstComponentFragment } from '../core/chatStream';
import { theme, themed } from '../theme';
import { MateuButton } from '../ui/controls';
import { FAB } from 'react-native-paper';
import { FAB_MARGIN, FAB_SIZE, fabBottom } from '../core/uxRules';
import { materialIconOf } from '../ui/wireIcons';

/** The controller of the view a component belongs to — field editors write state through it,
 *  buttons dispatch actions, cruds register data handlers. */
const ViewControllerContext = createContext<MateuViewController | null>(null);

/** The controller context, for hooks that tolerate its absence (usePendingAction). */
export const ViewControllerContextForHooks = ViewControllerContext;

/** Renders a subtree against an EXISTING controller (an overlay's footer runs on its opener). */
export const ViewControllerProvider = ViewControllerContext.Provider;

export function useViewController(): MateuViewController {
  const ctx = useContext(ViewControllerContext);
  if (!ctx) throw new Error('useViewController must be used inside a MateuViewHost');
  return ctx;
}

/** Resolves a url the server sent (an image `src`, a link) against the view's backend (core/backendUrl). */
export function useBackendUrl(): (url: string | null | undefined) => string {
  const ctx = useContext(ViewControllerContext);
  return (url) => (ctx ? ctx.session.backendUrl(url) : url ?? '');
}

interface Props {
  session: MateuSession;
  /** Navigation target to load (mutually exclusive with serverSideNode). */
  target?: NavTarget;
  /** An inline ServerSide node to mount (embedded islands, overlay contents). */
  serverSideNode?: unknown;
  /** The whole content of a dialog or drawer: a bare layout scrolls and has margins, unlike an island inside a page. */
  overlaid?: boolean;
  /** Opener navigation context for overlay contents: seeds the controller's route/serverSideType
   *  so a ClientSide overlay (e.g. a conflict dialog) dispatches actions on the initiator. */
  overlayOpener?: OverlayOpenerContext;
  /** Detail navigations (row → detail/new/edit) push a new screen through this. */
  onOpenDetail?: (target: NavTarget) => void;
  /** Stack-aware navigation: back to a screen already on the stack, else push (or replace the top). */
  onStackNavigate?: (target: NavTarget, replaceTop: boolean) => void;
  /** An increment the shell already holds (the assistant's render-screen `__preview__` answer):
   *  its first component fragment is rendered here, against `route`. */
  preview?: { increment: unknown; route: string; consumedRoute: string; serverSideType?: string };
  /**
   * A view embedded in a page (an island, a micro frontend, a framed page): it lives in the host's
   * scroll, its load failure is a line of text, and it never names the window (the bar keeps the
   * host's title, and the embedded page keeps its own heading). Overlay contents are windowless too.
   */
  embedded?: boolean;
  /** An embedded micro frontend's declared chrome (NONE | COMPACT | PAGE). */
  chrome?: EmbeddedChromeMode;
  /** Hands the live controller to the host (dirty checks on back navigation). */
  onController?: (controller: MateuViewController) => void;
}

/**
 * Hosts ONE Mateu view: owns its [MateuViewController], loads the target, and re-renders on every
 * increment application. The controller is exposed through [useViewController] so every renderer
 * in the subtree shares the same live component state and action pipeline.
 */
/**
 * The live controller of each island NODE on screen. A host view re-rendered for its own reasons (a
 * state-only answer bumps its version, remounting its subtree) hands the island the SAME node: the
 * island keeps its controller — its state, its subscriptions — instead of starting again from its
 * initialData. (A listener island that had just heard an event went back to "heard 0" when its host
 * re-rendered in the same instant; the web's nested mateu-component keeps its state the same way.)
 * A new node (a fresh answer from the server) is a new island.
 */
const islands = new WeakMap<object, { controller: MateuViewController; mounted: boolean; release?: ReturnType<typeof setTimeout> }>();

export function MateuViewHost({ session, target, serverSideNode, overlaid, overlayOpener, preview, onOpenDetail, onStackNavigate, embedded, chrome, onController }: Props) {
  const islandKey = serverSideNode && typeof serverSideNode === 'object' ? (serverSideNode as object) : null;
  const controller = useMemo(() => {
    const kept = islandKey ? islands.get(islandKey) : undefined;
    if (kept && kept.controller.session === session) return kept.controller;
    const created = new MateuViewController(session);
    if (islandKey) islands.set(islandKey, { controller: created, mounted: false });
    return created;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);
  const fits = useFitsContent();
  const [view, setView] = useState<RenderedView>(controller.rendered);

  useEffect(() => {
    const kept = islandKey ? islands.get(islandKey) : undefined;
    if (kept?.release) {
      // the same island, remounted in the same commit: it stays alive
      clearTimeout(kept.release);
      kept.release = undefined;
    }
    controller.onRender = (v) => setView({ ...v });
    controller.windowless = !!embedded || !!serverSideNode;
    controller.embeddedChrome = chrome;
    controller.detailOpener = onOpenDetail ?? null;
    controller.stackNavigator = onStackNavigate ?? null;
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
      if (kept?.controller === controller && kept.mounted) setView({ ...controller.rendered });
      else {
        controller.mountServerSide(serverSideNode);
        if (kept) kept.mounted = true;
      }
    } else if (preview) {
      controller.currentRoute = preview.route;
      controller.currentConsumedRoute = preview.consumedRoute;
      if (preview.serverSideType) controller.currentServerSideType = preview.serverSideType;
      const fragment = firstComponentFragment(preview.increment);
      const increment = (preview.increment as Record<string, unknown> | null) ?? {};
      controller.applyIncrement({ ...increment, fragments: fragment ? [fragment] : [] });
    } else if (target) {
      void controller.navigate(target.route, target.consumedRoute, target.serverSideType);
    }
    return () => {
      controller.onRender = () => {};
      const release = () => {
        controller.session.unsubscribeAll(controller);
        controller.dispose(); // pending periodic refreshes die with the screen
      };
      const island = islandKey ? islands.get(islandKey) : undefined;
      if (island) {
        // released only if the island does not come straight back (see `islands`)
        island.release = setTimeout(() => {
          islands.delete(islandKey!);
          release();
        }, 0);
        return;
      }
      release();
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
    if (embedded) return <Text style={styles.error}>{message.title}</Text>;
    return (
      <View style={styles.centered} accessibilityRole="alert">
        <Text style={styles.failureTitle} {...headingA11y(2)}>{message.title}</Text>
        <Text style={styles.failureDetail}>{message.detail}</Text>
        <MateuButton label="Try again" buttonStyle="primary" icon="refresh" onPress={retry} />
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
  const windowlessView = !!embedded || !!serverSideNode;
  const content = (
    <ComponentRenderer component={view.component} state={view.state} data={view.data} />
  );

  const body = (
    <View style={fits ? FIT_CONTENT : styles.host} key={view.version}>
      {view.loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={theme.primary} accessibilityLabel="Loading" />
        </View>
      )}
      {((serverSideNode || embedded) && !overlaid) || selfScrolling ? (
        content
      ) : (
        <ScrollView style={fits ? FIT_CONTENT : styles.host} contentContainerStyle={styles.scrollBody} keyboardShouldPersistTaps="handled">
          <InsideVerticalScroll.Provider value>
          {content}
          </InsideVerticalScroll.Provider>
        </ScrollView>
      )}
      {!windowlessView && <AppFabs controller={controller} pageFabs={pageFabCount(view.component)} />}
    </View>
  );

  const windowless = !!embedded || !!serverSideNode;
  return (
    <ViewControllerContext.Provider value={controller}>
      {windowless ? (
        // nothing in an embedded view repeats the app bar's title (it is not its title), and only a
        // micro frontend's own page is under its declared chrome
        <BarTitle.Provider value={null}><EmbeddedChrome.Provider value={chrome}>
        {/* an island (an embedded crud, an overlay's content) is not the pushed screen: ITS «Back to
            list» goes back inside the island, which the screen's arrow does not — it keeps it (RN-26) */}
        <ScreenHasBack.Provider value={false}>{body}</ScreenHasBack.Provider>
        </EmbeddedChrome.Provider></BarTitle.Provider>
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

/** How many FABs the page itself floats (the app's go above them). */
function pageFabCount(component: unknown): number {
  const meta = ((component as Record<string, unknown>)?.['metadata'] as Record<string, unknown>) ?? {};
  return Array.isArray(meta['fabs']) ? (meta['fabs'] as unknown[]).length : 0;
}

/**
 * The @Fab buttons of an App shell this screen was opened through (an app inside another shell):
 * stacked above the page's own FABs, run against the app class that declared them.
 */
function AppFabs({ controller, pageFabs }: { controller: MateuViewController; pageFabs: number }) {
  const app = controller.appFabs;
  if (!app) return null;
  return (
    <View style={[styles.appFabs, { bottom: fabBottom(false) + pageFabs * (FAB_SIZE + 12) }]} pointerEvents="box-none">
      {app.fabs.map((fab, i) => {
        const f = fab as { id?: string; label?: string; actionId?: string; icon?: string };
        const actionId = f.actionId ?? f.id ?? '';
        const icon = materialIconOf(f.icon);
        return f.label ? (
          <FAB key={i} label={f.label} icon={icon} accessibilityLabel={f.label} onPress={() => void controller.runAppFab(actionId)} />
        ) : (
          <FAB key={i} icon={icon ?? 'plus'} accessibilityLabel={actionId || 'Action'} onPress={() => void controller.runAppFab(actionId)} />
        );
      })}
    </View>
  );
}

const styles = themed(() => StyleSheet.create({
  appFabs: { position: 'absolute', right: FAB_MARGIN, gap: 12, alignItems: 'flex-end', zIndex: 40 },
  host: { flex: 1 },
  // a bare-layout root (e.g. a wizard) gets the same 16pt gutter as Page/Form roots — it was flush
  // against the screen edges (RN-17)
  scrollBody: { padding: 16, paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: theme.danger, padding: 16, fontSize: 14 },
  failureTitle: { fontSize: 16, fontWeight: '700', color: theme.ink, textAlign: 'center', marginBottom: 8 },
  failureDetail: { fontSize: 14, color: theme.muted, textAlign: 'center', marginBottom: 20, maxWidth: 320 },
  retryButton: { backgroundColor: theme.primary, paddingHorizontal: 24, minHeight: theme.minTouch, justifyContent: 'center', borderRadius: theme.radiusSm },
  retryText: { color: theme.onPrimary, fontWeight: '600', fontSize: 16 },
  loadingOverlay: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
}));
