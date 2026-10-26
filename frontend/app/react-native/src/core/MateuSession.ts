import { MateuApiClient } from '../api/MateuApiClient.ts';
import type { TokenProvider } from './auth.ts';
import type { ConfirmationDialogTexts } from './actionConfirmation.ts';
import { RestSourceCatalogue, sharedRestSources } from './restFetch.ts';
import { ActionCatalogue, sharedActionCatalogue } from './shellFlows.ts';
import { headerValues as sharedHeaderValues, HeaderValuesStore } from './appShellExtras.ts';
import { ColumnPrefsStore, sharedColumnPrefs } from '../renderer/columnPrefs.ts';
import { SavedViewsStore, sharedSavedViews } from '../renderer/savedViews.ts';
import { DropZoneRegistry, sharedDropZones } from '../renderer/dragDrop.ts';
import { CredentialScope, appStateFor } from './credentialScope.ts';
import type { ChatNavigation, ChatPreviewTarget, ChatScreenSnapshot } from './chatStream.ts';
import { AgentPushState } from './agentPush.ts';
import { skewTexts, type SkewNotice } from './buildSkew.ts';
import { uiLocale } from './money.ts';
import type { StaticBundle } from './staticBundle.ts';

export type MessageVariant = 'info' | 'warning' | 'error';

/** Extra toast behaviour: an explicit display duration (ms) and/or an Undo affordance
 *  (Message.undoLabel/undoActionId on the wire) that runs the reverse action when pressed. */
export interface NotifyOptions {
  duration?: number;
  /** A button on the toast (an Undo, the version-skew Reload); pressing it dismisses the toast. */
  undo?: { label: string; onPress: () => void };
  /** Stays until dismissed, whatever the variant. */
  sticky?: boolean;
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
  /** Where this app's credentials may go: its own backend + the islands it names (an island
   *  shares its host's scope). */
  readonly credentials: CredentialScope;
  /** The @AppContext field names of the app (filled by its context selectors): kept from an
   *  untrusted island's app state. */
  readonly appContextKeys: Set<string>;

  // What the app registers as it runs. The hub runs several apps in one process, so a session
  // created with its OWN token provider (a hub UI session — even `null`, an unsecured backend) owns
  // these; a session without one (the single-backend app) uses the process-wide stores, as the
  // module-level functions do — the same split as `auth`. An island over another base url belongs
  // to the session that hosts it and shares ITS stores (see `islandSession`).
  /** The app's REST source catalogue + references + sample mode. */
  readonly sources: RestSourceCatalogue;
  /** The app's action catalogue (AppDto.actionCatalogue). */
  readonly actionCatalogue: ActionCatalogue;
  /** The app shell's live header values. */
  readonly headerValues: HeaderValuesStore;
  /** Listing personalisation: hidden columns and saved views (session-scoped). */
  readonly columnPrefs: ColumnPrefsStore;
  readonly savedViews: SavedViewsStore;
  /** The drop zones mounted on this app's screens. */
  readonly dropZones: DropZoneRegistry;
  /** The UI session (id + channel secret) the assistant chat and the live-push channel share, and
   *  the paired state the channel reports (core/agentPush.ts). One per running app. */
  readonly agent: AgentPushState;

  /** Host hook: show a non-blocking message (toast/snackbar). */
  notify: (title: string | null, text: string, variant: MessageVariant, options?: NotifyOptions) => void = () => {};

  /** Host hook: reload the app from scratch — the current screen re-runs its load (the Reload of
   *  the version-skew notices, core/buildSkew.ts). */
  reload: () => void = () => {};

  /** The session whose toast host / reload a derived session (island, navigation) uses. */
  private readonly noticeTarget: MateuSession;

  /** Host hook: open a route as a NEW screen (navigation push). */
  openView: (target: NavTarget) => void = () => {};

  /** Host hook: the app-level title (navigation header). */
  setTitle: (title: string) => void = () => {};

  /** Host hook: open an overlay (Drawer/Dialog fragment). `opener` is the navigation context of
   *  the view that produced the overlay, so a ClientSide overlay content (e.g. the optimistic-lock
   *  conflict dialog) dispatches its button actions against the INITIATOR component — the same
   *  target the web reaches by DOM bubbling. */
  openOverlay: (component: unknown, state: unknown, data: unknown, opener?: OverlayOpenerContext) => void = () => {};

  /** Host hook: a state update aimed at an OPEN overlay (by its id) — true when one took it. */
  updateOverlayState: (id: string, state: Record<string, unknown>) => boolean = () => false;

  /** Host hook: close the topmost overlay. */
  closeTopOverlay: () => void = () => {};

  /** Host hook: dirty-guard confirmation — resolve true to discard unsaved changes and leave. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  /** Host hook: whether the screen on show has unsaved changes (its controller tracks them). */
  hasUnsavedChanges: () => boolean = () => false;

  /** Host hook: an @Action(confirmationRequired) question — resolve true to run the action. */
  confirmAction: (texts: ConfirmationDialogTexts) => Promise<boolean> = async () => true;

  /** Host hook (hub sessions): sign out of THIS UI only. Absent → the global provider's sign-out. */
  signOut?: () => Promise<void>;

  /** Host hook (hub sessions): the shell offers "My UIs" / "Switch UI" entries when set. */
  hub?: { goHome: () => void; openSwitcher: () => void; uiName: string };

  // ── the assistant chat (App.sseUrl / the Chat component): what the shell lets it do ──

  /** Host hook: navigate exactly like a menu click carrying these fields (navigation-requested). */
  navigateTo: (nav: ChatNavigation) => void = (nav) =>
    this.openView({ label: '', route: nav.route, consumedRoute: nav.consumedRoute, serverSideType: nav.serverSideType ?? '' });

  /** Host hook: show a `__preview__` increment the shell rendered (render-screen with no
   *  subscriber) — in the content area, transiently, or in a drawer/dialog. */
  showPreview: (increment: unknown, target: ChatPreviewTarget, title?: string) => void = () => {};

  /** Host hook: what the user is looking at (route, title, state, the rendered tree). */
  currentScreen: () => ChatScreenSnapshot | null = () => null;

  /** Host hook: hide the assistant (it stays mounted) — what a pushed navigation / screen does,
   *  exactly like the same event from the chat. */
  closeAssistant: () => void = () => {};

  /** The app shell's chat settings: its menu (menuContext), the MCP and upload endpoints. */
  chatApp: { menu?: unknown; mcpUrl?: string | null; uploadUrl?: string | null } = {};

  /** Event handlers answer whether they TOOK the event (false: filtered out); nothing = took it. */
  private subscriptions: { owner: unknown; eventName: string; handler: (payload: unknown) => boolean | void }[] = [];

  /** `storesFrom`: share that session's stores instead of choosing by `auth` (an island). */
  constructor(
    baseUrl: string,
    sessionId: string,
    appState: Record<string, unknown> = {},
    auth?: TokenProvider | null,
    storesFrom?: MateuSession,
  ) {
    this.credentials = storesFrom?.credentials ?? new CredentialScope(baseUrl);
    this.appContextKeys = storesFrom?.appContextKeys ?? new Set<string>();
    this.api = new MateuApiClient(baseUrl, sessionId, auth, (url) => this.credentials.mayCarryCredentials(url));
    this.appState = appState;
    const own = auth !== undefined;
    this.sources = storesFrom?.sources ?? (own ? new RestSourceCatalogue() : sharedRestSources);
    this.actionCatalogue = storesFrom?.actionCatalogue ?? (own ? new ActionCatalogue() : sharedActionCatalogue);
    this.headerValues = storesFrom?.headerValues ?? (own ? new HeaderValuesStore() : sharedHeaderValues);
    this.columnPrefs = storesFrom?.columnPrefs ?? (own ? new ColumnPrefsStore() : sharedColumnPrefs);
    this.savedViews = storesFrom?.savedViews ?? (own ? new SavedViewsStore() : sharedSavedViews);
    this.dropZones = storesFrom?.dropZones ?? (own ? new DropZoneRegistry() : sharedDropZones);
    // per app instance, never process-wide: two hub UIs are two UI sessions
    this.agent = storesFrom?.agent ?? new AgentPushState();
    // Another wire MAJOR: say so plainly (once) instead of leaving a half-rendered screen to explain
    // itself. Rendering goes on — unknown fields and types are still tolerated.
    this.api.onWireMismatch = (message) => this.notify(null, message, 'error', { duration: 30000 });
    // A redeployed backend / a screen built by an older deployment: one sticky notice with Reload.
    this.noticeTarget = storesFrom?.noticeTarget ?? this;
    this.api.onBuildNotice = (kind) => this.noticeTarget.showBuildNotice(kind);
  }

  /** The version-skew notice (en/es by the UI's locale), sticky, with a Reload button. */
  showBuildNotice(kind: Exclude<SkewNotice, 'none'>): void {
    const texts = skewTexts(uiLocale());
    this.notify(null, kind === 'stale' ? texts.stale : texts.updated, kind === 'stale' ? 'error' : 'warning', {
      sticky: true,
      undo: { label: texts.reload, onPress: () => this.reload() },
    });
  }

  subscribe(owner: unknown, eventName: string, handler: (payload: unknown) => boolean | void): void {
    this.subscriptions.push({ owner, eventName, handler });
  }

  unsubscribeAll(owner: unknown): void {
    this.subscriptions = this.subscriptions.filter((s) => s.owner !== owner);
  }

  /**
   * Runs this app from a STATIC BUNDLE (core/staticBundle.ts) instead of a Mateu server: route loads
   * are answered on the device, the bundle's source catalogue (samples included in a mock build)
   * and action catalogue are this app's, and relative source urls resolve against the bundle's base.
   */
  openStaticBundle(bundle: StaticBundle): void {
    this.api.local = bundle;
    this.sources.register(bundle.sources);
    this.sources.relativeBase = bundle.baseUrl;
    if (bundle.mockSources) this.sources.setSampleMode(true);
    this.actionCatalogue.register(bundle.actions);
  }

  /** Delivers an event to its subscribers; true when one of them took it. */
  dispatchEvent(eventName: string, payload: unknown): boolean {
    let taken = false;
    for (const s of [...this.subscriptions]) {
      if (s.eventName === eventName && s.handler(payload) !== false) taken = true;
    }
    return taken;
  }
}

/**
 * The session a federated island (MicroFrontend) runs in: the host's own when it names no other
 * base url; otherwise a session for that origin — carrying the user's credentials and @AppContext
 * values only when the app's own backend named it (core/credentialScope.ts) — that keeps the HOST's stores — what the island
 * registers (catalogue, references, sample mode, drop zones…) stays in the hub UI it is part of
 * instead of reaching the process-wide stores every other UI could read.
 */
export function islandSession(host: MateuSession, baseUrl: string): MateuSession {
  if (!baseUrl || baseUrl === host.api.baseUrl) return host;
  // the island's base url came in an ANSWER: trusted only when the app's own backend named it
  host.credentials.declare(host.api.baseUrl, [baseUrl]);
  return sessionOver(host, baseUrl);
}

/**
 * The session a NAVIGATION to another backend runs in (a menu entry of a federated app, the
 * assistant's `navigation-requested`). Unlike an island, the base url does not come from a screen
 * the backend answered: a navigation names it, and an agent's navigation is whatever the agent
 * wrote. So it DECLARES nothing — it carries the user's credentials only when the origin is
 * already trusted (the app's own backend, or a remote its menu names: {@link declareMenuRemotes}),
 * and is anonymous otherwise.
 */
export function navigationSession(host: MateuSession, baseUrl: string): MateuSession {
  if (!baseUrl || baseUrl === host.api.baseUrl) return host;
  return sessionOver(host, baseUrl);
}

/** The remotes an app's menu names (its federated entries), declared from the session's backend. */
export function declareMenuRemotes(session: MateuSession, menu: unknown): void {
  const remotes: string[] = [];
  const walk = (items: unknown) => {
    if (!Array.isArray(items)) return;
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const entry = item as { baseUrl?: unknown; submenus?: unknown };
      if (typeof entry.baseUrl === 'string' && entry.baseUrl) remotes.push(entry.baseUrl);
      walk(entry.submenus);
    }
  };
  walk(menu);
  if (remotes.length) session.credentials.declare(session.api.baseUrl, remotes);
}

function sessionOver(host: MateuSession, baseUrl: string): MateuSession {
  const trusted = host.credentials.mayCarryCredentials(baseUrl);
  return new MateuSession(baseUrl, host.api.sessionId, appStateFor(host.appState, host.appContextKeys, trusted), undefined, host);
}
