import { MateuApiClient } from '../api/MateuApiClient';

export type MessageVariant = 'info' | 'warning' | 'error';

export interface NavTarget {
  label: string;
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
  notify: (title: string | null, text: string, variant: MessageVariant) => void = () => {};

  /** Host hook: open a route as a NEW screen (navigation push). */
  openView: (target: NavTarget) => void = () => {};

  /** Host hook: the app-level title (navigation header). */
  setTitle: (title: string) => void = () => {};

  /** Host hook: open an overlay (Drawer/Dialog fragment); returns a close function. */
  openOverlay: (component: unknown, state: unknown, data: unknown) => void = () => {};

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
