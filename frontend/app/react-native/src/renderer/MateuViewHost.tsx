import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MateuSession, NavTarget, OverlayOpenerContext } from '../core/MateuSession';
import { MateuViewController, RenderedView } from '../core/MateuViewController';
import { ComponentRenderer } from './ComponentRenderer';

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controller]);

  if (view.loading && !view.component) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0070f3" />
      </View>
    );
  }
  if (view.error && !view.component) {
    return <Text style={styles.error}>{view.error}</Text>;
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

  return (
    <ViewControllerContext.Provider value={controller}>
      <View style={styles.host} key={view.version}>
        {view.loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color="#0070f3" />
          </View>
        )}
        {serverSideNode || selfScrolling ? (
          content
        ) : (
          <ScrollView style={styles.host} contentContainerStyle={styles.scrollBody}>
            {content}
          </ScrollView>
        )}
      </View>
    </ViewControllerContext.Provider>
  );
}

const styles = StyleSheet.create({
  host: { flex: 1 },
  scrollBody: { paddingBottom: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  error: { color: '#cc0000', padding: 16, fontSize: 14 },
  loadingOverlay: { position: 'absolute', top: 8, right: 8, zIndex: 10 },
});
