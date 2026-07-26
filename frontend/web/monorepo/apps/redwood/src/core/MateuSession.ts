import { MateuApiClient } from './MateuApiClient';

export type MessageVariant = 'info' | 'warning' | 'error';

/** Extra toast behaviour: an explicit display duration (ms) and/or an Undo affordance
 *  (Message.undoLabel/undoActionId on the wire) that runs the reverse action when pressed. */
export interface NotifyOptions {
  duration?: number;
  undo?: { label: string; onPress: () => void };
}

export interface NavTarget {
  label: string;
  route: string;
  consumedRoute: string;
  serverSideType: string;
}

/** Navigation context of the view that opened an overlay (see MateuSession.openOverlay). */
export interface OverlayOpenerContext {
  route: string;
  consumedRoute: string;
  serverSideType: string;
}

/**
 * App-wide shared services/state (one per running app) — ported from the React Native renderer.
 * Holds the HTTP client, the mutable appState bag, the in-app event bus (@SubscribeTo /
 * UICommand.dispatchEvent / closeModal(eventName)) and the host hooks the OJET shell wires
 * (toasts, navigation pushes, overlays, window title).
 */
export class MateuSession {
  readonly api: MateuApiClient;
  readonly appState: Record<string, unknown>;

  /** Host hook: show a non-blocking message (toast). */
  notify: (title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => void = () => {};

  /** Host hook: open a route as a NEW screen (navigation push). */
  openView: (target: NavTarget) => void = () => {};

  /** Host hook: the app-level title (window / navigation header). */
  setTitle: (title: string) => void = () => {};

  /** Host hook: open an overlay (Drawer/Dialog fragment). `opener` is the navigation context of the
   *  view that produced the overlay, so a ClientSide overlay content dispatches its button actions
   *  against the INITIATOR component — the same target the web reaches by DOM bubbling. */
  openOverlay: (component: unknown, state: unknown, data: unknown, opener?: OverlayOpenerContext) => void = () => {};

  /** Host hook: close the topmost overlay. */
  closeTopOverlay: () => void = () => {};

  /** Host hook: dirty-guard confirmation — resolve true to discard unsaved changes and leave. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  private subscriptions: { owner: unknown; eventName: string; handler: (payload: unknown) => void }[] = [];

  constructor(baseUrl: string, sessionId: string, appState: Record<string, unknown> = {}) {
    this.api = new MateuApiClient(baseUrl, sessionId);
    this.appState = appState;
  }

  subscribe(owner: unknown, eventName: string, handler: (payload: unknown) => void): void {
    this.subscriptions.push({ owner, eventName, handler });
  }

  unsubscribeAll(owner: unknown): void {
    this.subscriptions = this.subscriptions.filter((s) => s.owner !== owner);
  }

  dispatchEvent(eventName: string, payload: unknown): void {
    for (const s of [...this.subscriptions]) {
      if (s.eventName === eventName) s.handler(payload);
    }
  }
}
