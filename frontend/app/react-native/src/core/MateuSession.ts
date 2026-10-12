import { MateuApiClient } from '../api/MateuApiClient';
import type { TokenProvider } from './auth';

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
 * App-wide shared services/state (one per running app) — the RN counterpart of the JavaFX
 * AppShell / IntelliJ AppSession. Holds the HTTP client, the mutable appState bag, the in-app
 * event bus (@SubscribeTo / UICommand.dispatchEvent / closeModal(eventName)) and the host hooks
 * the React shell wires (toasts, navigation pushes, overlays, window title).
 */
export class MateuSession {
  readonly api: MateuApiClient;
  readonly appState: Record<string, unknown>;

  /** Host hook: show a non-blocking message (toast/snackbar). */
  notify: (title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => void = () => {};

  /** Host hook: open a route as a NEW screen (navigation push). */
  openView: (target: NavTarget) => void = () => {};

  /** Host hook: the app-level title (navigation header). */
  setTitle: (title: string) => void = () => {};

  /** Host hook: open an overlay (Drawer/Dialog fragment). `opener` is the navigation context of
   *  the view that produced the overlay, so a ClientSide overlay content (e.g. the optimistic-lock
   *  conflict dialog) dispatches its button actions against the INITIATOR component — the same
   *  target the web reaches by DOM bubbling. */
  openOverlay: (component: unknown, state: unknown, data: unknown, opener?: OverlayOpenerContext) => void = () => {};

  /** Host hook: close the topmost overlay. */
  closeTopOverlay: () => void = () => {};

  /** Host hook: dirty-guard confirmation — resolve true to discard unsaved changes and leave. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  /** Host hook (hub sessions): sign out of THIS UI only. Absent → the global provider's sign-out. */
  signOut?: () => Promise<void>;

  /** Host hook (hub sessions): the shell offers "My UIs" / "Switch UI" entries when set. */
  hub?: { goHome: () => void; openSwitcher: () => void; uiName: string };

  private subscriptions: { owner: unknown; eventName: string; handler: (payload: unknown) => void }[] = [];

  constructor(baseUrl: string, sessionId: string, appState: Record<string, unknown> = {}, auth?: TokenProvider | null) {
    this.api = new MateuApiClient(baseUrl, sessionId, auth);
    this.appState = appState;
    // Another wire MAJOR: say so plainly (once) instead of leaving a half-rendered screen to explain
    // itself. Rendering goes on — unknown fields and types are still tolerated.
    this.api.onWireMismatch = (message) => this.notify(null, message, 'error', { duration: 30000 });
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
