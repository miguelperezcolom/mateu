import type { ScreenSnapshots } from './screenSnapshots';
import { MateuApiClient } from '../api/MateuApiClient.ts';
import type { TokenProvider } from './auth.ts';
import type { ConfirmationDialogTexts } from './actionConfirmation.ts';
import { RestSourceCatalogue, sharedRestSources } from './restFetch.ts';
import { againstBase } from './backendUrl.ts';
import { ActionCatalogue, sharedActionCatalogue } from './shellFlows.ts';
import { headerValues as sharedHeaderValues, HeaderValuesStore } from './appShellExtras.ts';
import { ColumnPrefsStore, sharedColumnPrefs } from '../renderer/columnPrefs.ts';
import { SavedViewsStore, sharedSavedViews } from '../renderer/savedViews.ts';
import { DropZoneRegistry, sharedDropZones } from '../renderer/dragDrop.ts';
import { KeyShortcutRegistry, sharedKeyShortcuts } from './keyShortcuts.ts';
import { CredentialScope, appStateFor } from './credentialScope.ts';
import type { ChatNavigation, ChatPreviewTarget, ChatScreenSnapshot } from './chatStream.ts';
import { AgentPushState } from './agentPush.ts';
import { TaskCenter } from './taskCenter.ts';
import { InboxStore, inboxChangeOf } from './inbox.ts';
import { TaskReattach, type ReattachHost } from './taskReattach.ts';
import { toastOf } from './componentContext.ts';
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
  /** Every action of the message (Message.actions); when set, `undo` is not drawn twice. */
  actions?: { label: string; onPress: () => void; style?: string | null }[];
  /** A message with the same key replaces the one on screen. */
  key?: string | null;
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
  /** The session the opener runs in (a remote island's): the overlay's actions go to its backend. */
  session?: MateuSession;
  /** The view that opened it: what the overlay draws OUTSIDE its own content (a footer, a
   *  ConfirmDialog's buttons) runs on it, with its state — the web's bubbling to the opener. */
  controller?: unknown;
}

/**
 * App-wide shared services/state (one per running app) — the RN counterpart of the JavaFX
 * AppShell / IntelliJ AppSession. Holds the HTTP client, the mutable appState bag, the in-app
 * event bus (@SubscribeTo / UICommand.dispatchEvent / closeModal(eventName)) and the host hooks
 * the React shell wires (toasts, navigation pushes, overlays, window title).
 */
/**
 * The way back of a screen with others pushed over its section's first one: `back` steps one screen
 * back (the arrow), `toStart` returns to the section's first screen at once (a long press on it).
 */
/** What a screen reader says about that arrow. */
export const BACK_HINT = 'Long press to go back to the start of this section';

export interface ScreenBack {
  back: () => void;
  toStart: () => void;
}

export class MateuSession {
  readonly api: MateuApiClient;
  readonly appState: Record<string, unknown>;
  /** What the server put in the app's data (`UIIncrementDto.appData`): `${appData.x}` reads it. */
  readonly appData: Record<string, unknown> = {};
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
  /** The hardware-keyboard shortcuts on this app's screens (core/keyShortcuts.ts). */
  readonly keyShortcuts: KeyShortcutRegistry;
  /** The UI session (id + channel secret) the assistant chat and the live-push channel share, and
   *  the paired state the channel reports (core/agentPush.ts). One per running app. */
  readonly agent: AgentPushState;
  /** The long-running tasks this UI started (Progress commands), running and recently finished. */
  readonly tasks: TaskCenter;
  /** The notification inbox: the server's list + this session's own entries. */
  readonly inbox: InboxStore;
  /** The tasks this UI's streams reported, to resume them when a stream breaks (core/taskReattach.ts). */
  readonly reattach: TaskReattach;
  private ownOsNotifications = false;
  /** The app opted in to OS-level notifications (App.osNotifications; core/osNotifications.ts). */
  get osNotifications(): boolean {
    return this.storesFromSession ? this.storesFromSession.osNotifications : this.ownOsNotifications;
  }
  set osNotifications(value: boolean) {
    if (this.storesFromSession) this.storesFromSession.osNotifications = value;
    else this.ownOsNotifications = value;
  }

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
  hasUnsavedChanges: () => boolean = () => this.anyUnsavedChanges();

  /** The views on screen with unsaved changes (@ConfirmOnNavigationIfDirty) — an island's included:
   *  an edited form embedded in a page let a menu navigation leave without asking. */
  private readonly dirtyViews = new Set<unknown>();

  /** A view says whether it has unsaved changes now (a derived session tells the app's). */
  noteDirty(view: unknown, dirty: boolean): void {
    if (this.storesFromSession) return this.storesFromSession.noteDirty(view, dirty);
    if (dirty) this.dirtyViews.add(view);
    else this.dirtyViews.delete(view);
  }

  /** Whether any view of this app on screen has unsaved changes. */
  anyUnsavedChanges(): boolean {
    return this.storesFromSession ? this.storesFromSession.anyUnsavedChanges() : this.dirtyViews.size > 0;
  }
  /** A hub keeps every opened UI mounted: only the one on screen answers Android's Back, polls, or opens a browser. */
  private ownOnScreen = true;
  private readonly storesFromSession?: MateuSession;
  get onScreen(): boolean {
    return this.storesFromSession ? this.storesFromSession.onScreen : this.ownOnScreen;
  }
  set onScreen(value: boolean) {
    this.ownOnScreen = value;
  }

  /** Host hook: an @Action(confirmationRequired) question — resolve true to run the action. */
  confirmAction: (texts: ConfirmationDialogTexts) => Promise<boolean> = async () => true;

  /** Host hook (hub sessions): sign out of THIS UI only. Absent → the global provider's sign-out. */
  signOut?: () => Promise<void>;

  /** Host hook (hub sessions): the shell offers "My UIs" / "Switch UI" entries when set. */
  /** The Mateu hub app around this UI. `claimBar(true)`: the app's own top bar hosts the hub's
   *  actions (switch UI), so the hub hides its bar — one bar, not two stacked. */
  hub?: {
    goHome: () => void;
    openSwitcher: () => void;
    uiName: string;
    claimBar?: (claimed: boolean) => void;
    /** A shell that keeps the hub's bar (tabs, no menu) hands it the way back of the screen on view. */
    hostBack?: (back: ScreenBack | null) => void;
  };

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
  /** The last screens of this UI (a hub UI without sign-in): a load shows its copy at once. */
  snapshots: ScreenSnapshots | null = null;

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
    this.storesFromSession = storesFrom;
    this.credentials = storesFrom?.credentials ?? new CredentialScope(baseUrl);
    this.appContextKeys = storesFrom?.appContextKeys ?? new Set<string>();
    this.api = new MateuApiClient(baseUrl, sessionId, auth, (url) => this.credentials.mayCarryCredentials(url));
    this.api.mayPrompt = () => this.onScreen;
    this.appState = appState;
    const own = auth !== undefined;
    this.sources = storesFrom?.sources ?? (own ? new RestSourceCatalogue() : sharedRestSources);
    this.actionCatalogue = storesFrom?.actionCatalogue ?? (own ? new ActionCatalogue() : sharedActionCatalogue);
    this.headerValues = storesFrom?.headerValues ?? (own ? new HeaderValuesStore() : sharedHeaderValues);
    this.columnPrefs = storesFrom?.columnPrefs ?? (own ? new ColumnPrefsStore() : sharedColumnPrefs);
    this.savedViews = storesFrom?.savedViews ?? (own ? new SavedViewsStore() : sharedSavedViews);
    this.dropZones = storesFrom?.dropZones ?? (own ? new DropZoneRegistry() : sharedDropZones);
    this.keyShortcuts = storesFrom?.keyShortcuts ?? (own ? new KeyShortcutRegistry() : sharedKeyShortcuts);
    // per app instance, never process-wide: two hub UIs are two UI sessions
    this.agent = storesFrom?.agent ?? new AgentPushState();
    // per UI too: an island's task (its LongTask) shows in the app's task center
    this.tasks = storesFrom?.tasks ?? new TaskCenter();
    this.inbox = storesFrom?.inbox ?? new InboxStore();
    this.reattach = storesFrom?.reattach ?? new TaskReattach();
    // Another wire MAJOR: say so plainly (once) instead of leaving a half-rendered screen to explain
    // itself. Rendering goes on — unknown fields and types are still tolerated.
    this.api.onWireMismatch = (message) => this.notify(null, message, 'error', { duration: 30000 });
    // A redeployed backend / a screen built by an older deployment: one sticky notice with Reload.
    this.noticeTarget = storesFrom?.noticeTarget ?? this;
    this.api.onBuildNotice = (kind) => this.noticeTarget.showBuildNotice(kind);
    // A live app's relative source urls (`/explorer-api/planets`) are relative to its backend — the
    // web's page is served by it; a native app has none (they went to the Expo dev server). A static
    // bundle re-points this at the bundle (openStaticBundle).
    if (!storesFrom && this.sources.relativeBase === undefined) this.sources.relativeBase = baseUrl;
    if (storesFrom) {
      // A derived session (a remote island, a navigation to another backend) has no hosts of its
      // own: its toasts, questions and overlays are the app's. Delegated at call time — the hosts
      // wire these hooks in effects, after the derived session may already exist. An overlay keeps
      // the session that opened it (its opener), so its actions still go to the island's backend.
      this.notify = (...a) => storesFrom.notify(...a);
      this.confirmAction = (t) => storesFrom.confirmAction(t);
      this.confirmDiscard = () => storesFrom.confirmDiscard();
      this.openOverlay = (c, s, d, opener) => storesFrom.openOverlay(c, s, d, opener ? { ...opener, session: opener.session ?? this } : { route: '', consumedRoute: '', serverSideType: '', session: this });
      this.updateOverlayState = (id, state) => storesFrom.updateOverlayState(id, state);
      this.closeTopOverlay = () => storesFrom.closeTopOverlay();
      this.openView = (target) => storesFrom.openView(target);
    }
  }

  /** `url` (an image, a link, a micro frontend's base) resolved against this session's backend. */
  backendUrl(url: string | null | undefined): string {
    return againstBase(url, this.api.baseUrl);
  }

  /**
   * What a reattached task's stream may do here: its messages are toasts (an `inbox` one also an
   * entry of the session's inbox), an inbox change lands in the bell, a route action navigates.
   * The screen that started the task may be gone, so nothing else of the increment applies.
   */
  reattachHost(): ReattachHost {
    const owner = this.storesFromSession ?? this;
    return {
      tasks: this.tasks,
      appState: this.appState,
      navigate: (route) => owner.openView({ label: '', route, consumedRoute: '', serverSideType: '' }),
      applyPageLevel: (increment) => {
        for (const msg of Array.isArray(increment['messages']) ? increment['messages'] : []) {
          const toast = msg && typeof msg === 'object' ? toastOf(msg as Record<string, unknown>) : null;
          if (!toast) continue;
          const actions = toast.actions
            .filter((a) => !!a.route)
            .map((a) => ({ label: a.label, style: a.style, onPress: () => owner.openView({ label: '', route: a.route!, consumedRoute: '', serverSideType: '' }) }));
          owner.notify(toast.title, toast.text, toast.variant, {
            duration: toast.duration,
            actions,
            sticky: toast.persistence === 'sticky' ? true : undefined,
            key: toast.key,
          });
          if (toast.persistence === 'inbox') {
            this.inbox.addSession({
              id: toast.key ?? `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              title: toast.title || toast.text,
              text: toast.title ? toast.text : null,
              unread: true,
              variant: toast.variant,
              actions: toast.actions.filter((a) => !!a.route),
            });
          }
        }
        for (const cmd of Array.isArray(increment['commands']) ? increment['commands'] : []) {
          if (cmd && typeof cmd === 'object' && (cmd as Record<string, unknown>)['type'] === 'NotificationsChanged') {
            this.inbox.apply(inboxChangeOf((cmd as Record<string, unknown>)['data']));
          }
        }
      },
    };
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
  // a root-relative base (`/apps/rooms`: an app mounted on the same server) is the HOST backend's,
  // as on the web, where it is relative to the page that server served
  baseUrl = againstBase(baseUrl, host.api.baseUrl);
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
  baseUrl = againstBase(baseUrl, host.api.baseUrl);
  if (!baseUrl || baseUrl === host.api.baseUrl) return host;
  const session = sessionOver(host, baseUrl);
  // a SCREEN opened against another backend still names the shell's bar (RN-22) — an island does not
  session.setTitle = (title) => host.setTitle(title);
  return session;
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
