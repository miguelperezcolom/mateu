import { recordTiming, timed } from './timing.ts';
import { embeddedAppExtrasOf, type EmbeddedAppExtras } from './embeddedAppExtras.ts';
import { evaluateExpression, interpolate, interpolateUrl } from './expressions.ts';
import { applyClientRules, ruleRequiredErrorsOf } from './clientRules.ts';
import { isStaleScreenError } from './buildSkew.ts';
import { isLeaveAction } from './leaveActions.ts';
import { actionFlagsOf, actionTargetOf, appHomeOf, buttonActionClaimed, floatingIntentOf, notificationToastOf, valueChangeActionsOf, type ValueChangeTrigger, fieldErrorsOf, namedEventOf, orchestratorOf, ownsAction, seedSearchDefaults, seedSearchFromRoute, subscriptionParameters, toastOf, triggerPlanOf } from './componentContext.ts';
import { evalCondition } from './legacyCondition.ts';
import { asArray, detailLabel, errorText, getByPath, isErrorAnswer, str, trimSlashes } from './viewWire.ts';
import { MateuSession, type NavTarget } from './MateuSession.ts';
import { setAppLocale, uiLocale } from './money.ts';
import { externalAuthHeaders, jsonBodyOf } from './restFetch.ts';
import { declaresJson, jsonSafeContext } from './jsonTemplate.ts';
import { resolvedPageTitle } from './windowTitle.ts';
import { announce, announceLive } from '../a11y/a11y.ts';
import { presentDocument } from './documentEffects.ts';
import type { FileDownloadData } from './documents.ts';
import { isTimedOnLoad, PollingScheduler } from './polling.ts';
import { isFormRoute, mediatorMove, serverSideState } from './uxRules.ts';
import { isDev } from '../api/MateuApiClient.ts';
import { isClientRunnable, resolveAction, resolveFlowCommand, type ShellAction } from './shellFlows.ts';
import type { ConfirmationDialogTexts } from './actionConfirmation.ts';
import { finishedAnnouncement, progressOf, type TaskAction, type TaskEvent } from './taskCenter.ts';
import { inboxChangeOf } from './inbox.ts';
import { classifyFailure, describeFailure, HttpStatusError, isIdempotentAction } from './requestPolicy.ts';
import { connectivity } from './connectivity.ts';
import { actionShortcutsOf } from './keyShortcuts.ts';
import { ANONYMOUS_OWNER, newIdempotencyKey, OUTBOX_TEXTS, outboxRecoveryTexts, shouldQueue, type QueuedRequest } from './offlineQueue.ts';
import type { ToastAction } from './componentContext.ts';

/** The action whose answer an increment is (a streamed task's Retry runs it again). */
export interface IncrementOrigin {
  actionId: string;
  parameters: Json;
  /** The tasks this stream reported (to fail the ones it left running). */
  taskIds?: Set<string>;
}

/** Diagnostics only in development builds (a release build must not log user data). */
const devLog = (...args: unknown[]): void => {
  if (isDev()) console.log(...args);
};

type Json = Record<string, any>;

export interface PageBanner {
  theme?: string;
  title?: string;
  description?: string;
  hasCloseButton?: boolean;
  timeoutSeconds?: number;
}

export interface RenderedView {
  /** The root component to render (null while loading). */
  component: unknown | null;
  /** The state the component tree renders against (fragment state / initialData). */
  state: Json;
  data: unknown;
  loading: boolean;
  error: string | null;
  /** Bumped on every (re)render so React hosts can key remounts. */
  version: number;
}

/** Crud-mediator submits (validationRequired on the mediator — see CrudActionsBuilder). */
const BUBBLED_SUBMIT_ACTIONS = new Set(['create', 'create-and-stay', 'save', 'update']);

/**
 * Per-view session/navigation state and the UIIncrement applier — the React Native port of the
 * proven AppContext (JavaFX / IntelliJ plugin): navigate/runAction → applyIncrement → fragments
 * (component / data-only / state-only navigation) + messages + commands + appState. Pure
 * TypeScript, no React imports — a thin React host subscribes through [onRender]/[onData].
 */
export class MateuViewController {
  readonly session: MateuSession;

  currentRoute = '';
  currentConsumedRoute = '';
  currentServerSideType = '';
  currentComponentId = 'ux_main';
  /** Live component state: field editors write here; actions send it. */
  currentComponentState: Json = {};

  /** The mediator's inner route currently rendered (stay-in-place detection). */
  /** The crud mediator's inner route this screen's own load seeded (`null`: its load carried none). */
  private currentInnerRoute: string | null = null;
  /** The sst this view was NAVIGATED with (crud orchestrator) — bubbling fallback. */
  private navigationServerSideType = '';
  private orchestratorServerSideType = '';
  /** Guards the bare-App-shell unwrap against a misresolving backend bouncing us forever. */
  private appShellHops = 0;
  private orchestratorComponentRoute = '';

  // Action metadata of the currently-loaded server-side component.
  private currentComponentActions: string[] = [];
  /** The full wire actions of the current component (owner of an id, before the catalogue). */
  private currentActionDefs: ShellAction[] = [];
  private offShortcuts: (() => void) | undefined;
  /** Nesting of flows applied client-side, bounded so a flow running itself cannot loop. */
  private flowDepth = 0;
  private actionValidationRequired: Record<string, boolean> = {};
  private actionRowsSelectedRequired: Record<string, boolean> = {};
  private actionConfirmation: Record<string, ConfirmationDialogTexts> = {};
  /**
   * What an action sends as its state: the view's own, over what its mediator's host seeded (an
   * island's `stayId`) — the server rebuilds the mediator from it, and without it answered as if no
   * stay were open (the passport scan then belonged to nobody). Edits always win.
   */
  private actionState(): Json {
    return this.mediatorConsumed !== undefined && Object.keys(this.mediatorSeed).length
      ? { ...this.mediatorSeed, ...this.currentComponentState }
      : this.currentComponentState;
  }

  /** The state a mediator's host seeded it with, sent on loads of the mediator's own routes. */
  private mediatorSeed: Json = {};
  private mediatorConsumed: string | undefined = undefined;
  /** Streamed actions the mediator this view came through declared (see the MEDIATOR hop). */
  private inheritedSse: Record<string, boolean> = {};
  /** Actions answered as a STREAM of increments (`ActionDto.sse` — a LongTask). */
  private actionSse: Record<string, boolean> = {};
  private actionBubble: Record<string, boolean> = {};
  /** @RestAction/@RestData: actions whose descriptor makes the client fetch an external REST
   *  endpoint instead of dispatching to the Mateu server (keyed by action id). */
  private actionRestData: Record<string, Json> = {};
  private actionTimeout: Record<string, number> = {};
  private actionIdempotent: Record<string, boolean> = {};
  private actionJs: Record<string, string> = {};
  private actionOffline: Record<string, boolean> = {};
  /** The actions in flight on this view (a second press of the same one is ignored until it answers). */
  private pending = new Set<string>();
  private pendingListeners = new Set<() => void>();

  /** The @Fab buttons of the App shell this view was opened through (see renderComponentFragment). */
  appFabs: { fabs: Json[]; route: string; consumedRoute: string; serverSideType: string } | null = null;

  /**
   * The shell extras of an App this view was opened through (an embedded app: a MicroFrontend or an
   * island answering an App) — its context selectors, header actions and bell, drawn by the host in
   * a compact bar above the content (an embedded app has no drawer). See core/embeddedAppExtras.
   */
  appExtras: EmbeddedAppExtras | null = null;

  /**
   * Runs an APP-LEVEL action (a header action of an embedded app) against the app class, on its
   * root route — the rail the web's header actions use; its answer (messages, commands, a drawer)
   * applies to this view.
   */
  async runAppExtrasAction(actionId: string): Promise<void> {
    const app = this.appExtras;
    if (!app || !actionId) return;
    const route = app.rootRoute ?? app.homeRoute ?? '';
    try {
      const increment = await this.session.api.runAction({
        route,
        consumedRoute: route || '_empty',
        actionId,
        serverSideType: app.serverSideType || null,
        initiatorComponentId: 'ux_main',
        embeddedChrome: this.embeddedChrome,
        componentState: {},
        appState: this.session.appState,
        parameters: {},
      });
      this.applyIncrement(increment as Json);
    } catch (e) {
      this.session.notify(null, describeFailure(e, connectivity.isOnline), 'error');
    }
  }

  /** Runs an app-level @Fab action against the app class that declared it; its answer applies here. */
  async runAppFab(actionId: string): Promise<void> {
    const app = this.appFabs;
    if (!app || !actionId) return;
    try {
      const increment = await this.session.api.runAction({
        route: app.route,
        consumedRoute: app.consumedRoute,
        actionId,
        serverSideType: app.serverSideType || null,
        initiatorComponentId: 'ux_main',
        embeddedChrome: this.embeddedChrome,
        componentState: {},
        appState: this.session.appState,
        parameters: {},
      });
      this.applyIncrement({ ...(increment as Json), fragments: [] });
    } catch (e) {
      this.session.notify(null, describeFailure(e, connectivity.isOnline), 'error');
    }
  }

  /** Whether `actionId` is waiting for its answer (its control shows busy). */
  isPending(actionId: string): boolean {
    return this.pending.has(actionId);
  }

  /** Listens to the in-flight set (usePendingAction); returns the unsubscribe. */
  subscribePending(listener: () => void): () => void {
    this.pendingListeners.add(listener);
    return () => {
      this.pendingListeners.delete(listener);
    };
  }

  private setPending(actionId: string, on: boolean): void {
    if (on) this.pending.add(actionId);
    else this.pending.delete(actionId);
    for (const l of [...this.pendingListeners]) l();
  }
  private currentValidations: Json[] = [];
  /** Client-side rules of the current component (RuleMapper wire shape). */
  private currentRules: Json[] = [];

  /** Rule-driven field attribute overrides (SetAttributeValue): fieldId → {hidden, disabled, …}. */
  fieldAttributes: Record<string, Json> = {};

  /** @Emits name stamped as __source on dispatched events. */
  private emitsName = '';
  /** OnValueChange triggers of the current component. */
  private valueChanges: ValueChangeTrigger[] = [];
  /** @AutoSave: debounced action fired after edits. */
  private autoSave: { actionId: string; debounceMillis: number } | null = null;
  private autoSaveTimer: ReturnType<typeof setTimeout> | undefined;

  /** Action-returned banners (UIIncrementDto.banners) — cleared on navigation. */
  actionBanners: PageBanner[] = [];

  /** How each field on screen takes the focus (its input registers it), and the field a rejected
   *  save asked to focus — the first invalid one — once it is drawn. */
  private fieldFocus: Record<string, () => void> = {};
  private focusRequest: string | null = null;

  registerFieldFocus(fieldId: string, focus: () => void): void {
    if (!fieldId) return;
    this.fieldFocus[fieldId] = focus;
    if (this.focusRequest === fieldId) {
      this.focusRequest = null;
      setTimeout(focus, 50);
    }
  }

  /** Inline field validation errors (fieldId → message), consumed by the field renderers. */
  fieldErrors: Record<string, string> = {};

  /** Unsaved-changes tracking (@ConfirmOnNavigationIfDirty). */
  trackDirty = false;
  dirty = false;
  onDirtyChanged: (dirty: boolean) => void = () => {};

  /** Host rendering listener. */
  onRender: (view: RenderedView) => void = () => {};
  /** Detail navigations (row → detail/new/edit) open as a NEW screen through this; unset → in place. */
  detailOpener: ((target: NavTarget) => void) | null = null;
  /** Host hook: go to `target` on the native stack — back to it when it is already there, else
   *  pushed (or taking the top's place when `replaceTop`). */
  stackNavigator: ((target: NavTarget, replaceTop: boolean) => void) | null = null;
  /**
   * A view that does not own the window: an island inside a page, an overlay's content, an embedded
   * micro frontend. Its SetWindowTitle / its page title never reach the app bar (the web's
   * embeddedChrome rule) — it used to rename the bar after the first embedded page and keep it.
   */
  windowless = false;
  /** An embedded micro frontend's chrome (MicroFrontend.chrome): sent on every request, so the
   *  remote's server leaves the window commands out (RunActionRqDto.embeddedChrome). */
  embeddedChrome: string | undefined = undefined;

  private dataHandlers: Record<string, (data: unknown) => void> = {};
  /** Field-scoped data (lookup `search-<field>` results arrive as `{ <fieldId>: page }`). */
  private fieldDataHandlers: Record<string, (data: unknown) => void> = {};
  private view: RenderedView = { component: null, state: {}, data: null, loading: false, error: null, version: 0 };

  /** Periodic refresh: timed OnLoad + OnSuccess triggers, tied to the screen (generation). */
  private readonly polling = new PollingScheduler(
    (actionId) => {
      if (!this.session.onScreen) return; // a UI the hub keeps hidden: it refreshes when it is back
      if (actionId === 'search') this.seedSearchState();
      // Like every trigger, silent: a failure logs, never a toast — and a BACKGROUND refresh: the
      // "waiting for the server" bar does not show for it (core/serverActivity.ts)
      void this.runAction(actionId, undefined, true, true);
    },
    undefined,
    (condition) => this.evalValidationCondition(condition),
  );
  /** Set by navigations/mounts: the next ServerSide render is a NEW screen even if it looks the same. */
  private freshScreen = true;

  constructor(session: MateuSession) {
    this.session = session;
  }

  /** The host unmounted this view: pending timed triggers must not fire. */
  dispose(): void {
    this.session.noteDirty(this, false);
    this.offShortcuts?.();
    this.offShortcuts = undefined;
    this.polling.stop();
    if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
  }

  get rendered(): RenderedView {
    return this.view;
  }

  registerDataHandler(id: string, handler: (data: unknown) => void): void {
    if (id) this.dataHandlers[id] = handler;
  }

  registerFieldDataHandler(fieldId: string, handler: (data: unknown) => void): void {
    if (fieldId) this.fieldDataHandlers[fieldId] = handler;
  }

  unregisterFieldDataHandler(fieldId: string): void {
    delete this.fieldDataHandlers[fieldId];
  }

  // ── navigation / actions ────────────────────────────────────────────────────────────

  async initialLoad(route: string): Promise<void> {
    this.publish({ ...this.view, loading: true, error: null });
    const snapshotKey = this.snapshotKeyOf(route ?? '', '_empty', '');
    let fromSnapshot = false;
    try {
      // the screen this load answered last time, at once — the fresh answer replaces it
      const snapshot = snapshotKey ? await this.session.snapshots!.get(snapshotKey) : null;
      if (snapshot) {
        this.currentRoute = route ?? '';
        this.applySnapshot(snapshot);
        fromSnapshot = true;
        recordTiming('first screen', Date.now() - this.loadStarted, 'snapshot');
      }
      const increment = await timed(`load ${route || '/'}`, () => this.session.api.initialLoad(route, this.session.appState));
      this.currentRoute = route ?? '';
      this.freshScreen = true;
      this.applyIncrement(increment as Json);
      if (!fromSnapshot) recordTiming('first screen', Date.now() - this.loadStarted, 'network');
      if (snapshotKey) void this.session.snapshots!.put(snapshotKey, increment);
    } catch (e) {
      // a snapshot on screen stays there when the network fails (as an offline copy)
      if (!fromSnapshot) this.publish({ ...this.view, loading: false, error: errorText(e) });
      else if (this.view.loading) this.publish({ ...this.view, loading: false });
    }
  }

  async navigate(route: string, consumedRoute: string, serverSideType: string): Promise<void> {
    this.publish({ ...this.view, loading: true, error: null });
    const snapshotKey = this.snapshotKeyOf(route ?? '', consumedRoute ?? '', serverSideType ?? '');
    let fromSnapshot = false;
    const enter = () => {
      this.currentRoute = route ?? '';
      this.currentConsumedRoute = consumedRoute ?? '';
      this.currentServerSideType = serverSideType ?? '';
      this.navigationServerSideType = serverSideType ?? '';
      this.currentComponentState = {};
      this.actionBanners = []; // action banners don't survive page navigations
    };
    try {
      const snapshot = snapshotKey ? await this.session.snapshots!.get(snapshotKey) : null;
      if (snapshot) {
        enter();
        this.applySnapshot(snapshot);
        fromSnapshot = true;
      }
      const increment = await timed(`load ${route || '/'}`, () =>
        this.session.api.navigate(route, consumedRoute, serverSideType, this.session.appState,
          (consumedRoute ?? '') === this.mediatorConsumed ? { ...this.mediatorSeed } : {}, this.embeddedChrome));
      enter();
      this.freshScreen = true;
      this.applyIncrement(increment as Json);
      if (this.view.loading) this.publish({ ...this.view, loading: false });
      if (snapshotKey) void this.session.snapshots!.put(snapshotKey, increment);
    } catch (e) {
      if (!fromSnapshot) this.publish({ ...this.view, loading: false, error: errorText(e) });
      else if (this.view.loading) this.publish({ ...this.view, loading: false });
    }
  }

  private applyingSnapshot = false;

  /** Paints a snapshot: no OnLoad trigger, no polling — the fresh answer that follows does that. */
  private applySnapshot(snapshot: Json): void {
    this.applyingSnapshot = true;
    try {
      this.applyIncrement(snapshot);
    } finally {
      this.applyingSnapshot = false;
    }
  }

  /** When this controller was created: the clock of its first screen. */
  private readonly loadStarted = Date.now();

  /** A load's snapshot key — none for a static bundle (answered on the device anyway) or a UI that
   *  signs in (the host passes no snapshots then). */
  private snapshotKeyOf(route: string, consumedRoute: string, serverSideType: string): string | null {
    const snapshots = this.session.snapshots;
    if (!snapshots || this.session.api.local) return null;
    return snapshots.keyOf(route, consumedRoute, serverSideType);
  }

  /** Runs an action; resolves whether it went through (a kanban move puts its card back otherwise). */
  async runAction(actionId: string, parameters?: Json, silent = false, background = false): Promise<boolean> {
    // No double submit: a second press of an action still in flight is dropped (a slow Save sent
    // twice saved twice). Triggers (silent) and reads (a type-ahead search) are never held back.
    const exclusive = !silent && !isIdempotentAction(actionId, this.actionIdempotent[actionId]);
    if (exclusive && this.pending.has(actionId)) return false;
    if (!exclusive) return this.runActionNow(actionId, parameters, silent, background);
    this.setPending(actionId, true);
    try {
      return await this.runActionNow(actionId, parameters, silent, background);
    } finally {
      this.setPending(actionId, false);
    }
  }

  private async runActionNow(actionId: string, parameters: Json | undefined, silent: boolean, background = false): Promise<boolean> {
    // Dirty guard on discarding actions (Cancel on an edit form).
    // The host may confirm asynchronously; a synchronous confirm hook keeps it simple here.
    if (this.trackDirty && this.dirty && isLeaveAction(actionId, this.currentComponentActions)) {
      const proceed = await this.confirmDiscard();
      if (!proceed) return false;
      this.setDirty(false);
    }

    // Bulk actions (@Action(rowsSelectedRequired)): don't dispatch on an empty selection —
    // same client-side guard (and message) as the web's mateu-component.
    if (this.actionRowsSelectedRequired[actionId] === true) {
      const selection = this.currentComponentState['crud_selected_items'];
      if (!Array.isArray(selection) || selection.length === 0) {
        this.session.notify(null, 'You first need to select some rows', 'warning');
        return false;
      }
    }

    // Client-side validation: flagged actions and bubbled crud submits (the mediator's flags are
    // invisible to us — its validating set is stable framework knowledge).
    const requiresValidation =
      this.actionValidationRequired[actionId] === true ||
      (!this.ownsAction(actionId) && BUBBLED_SUBMIT_ACTIONS.has(actionId));
    if (requiresValidation) {
      const errors = this.collectFieldErrors();
      const hadErrors = Object.keys(this.fieldErrors).length > 0;
      this.fieldErrors = {};
      // fixed since the last attempt: the old messages go (they stayed under a now-valid field)
      if (hadErrors && Object.keys(errors).length === 0) {
        this.publish({ ...this.view, state: { ...this.currentComponentState }, version: this.view.version + 1 });
      }
      if (Object.keys(errors).length > 0) {
        this.fieldErrors = errors;
        // the focus goes to the first rejected field (the web's focusFirstInvalidField), drawn anew
        // by the publish below
        this.focusRequest = Object.keys(errors)[0] ?? null;
        // the version bump remounts the field tree — render against the EDITED state
        this.publish({ ...this.view, state: { ...this.currentComponentState }, version: this.view.version + 1 });
        // the message is under each field, by its label: a summary here could only name the fields
        // by their ids (`missionId: Cannot be empty`), which mean nothing to whoever is filling it in
        const summary = 'Check the marked fields.';
        this.session.notify('There are validation errors', summary, 'warning');
        // A toast is a visual affordance: a screen-reader user gets no indication that the save
        // was refused. Speak it (each field's name carries its error, src/a11y).
        announce(`There are validation errors. ${summary}`);
        return false;
      }
    }

    // @Action(confirmationRequired): ask first, with the declared texts — same order as the web's
    // mateu-component (selection guard, validation, then the question).
    const confirmation = this.actionConfirmation[actionId];
    if (confirmation && !(await this.session.confirmAction(confirmation))) return false;

    // @Action(js = …) runs in the CLIENT and never reaches the server method. The web runs it only
    // where the page opted in (RunJS is off by default); a native app has no page to run it in, so it
    // is always off here — said once on the console, as the web says it, and nothing is sent.
    if (this.actionJs[actionId] !== undefined) {
      console.warn(`[mateu] RunJS is off: the client-side script of "${actionId}" was not run (the mobile app runs no page scripts).`);
      return false;
    }

    // @RestAction/@RestData: call the external REST endpoint CLIENT-SIDE instead of dispatching to
    // the Mateu server — fetch + merge the response into the state + toast (fires on click for a
    // @RestAction button, and on mount for @RestData via its OnLoad trigger's __restdata__ action).
    const rest = this.actionRestData[actionId];
    if (rest) {
      return this.handleRestAction(rest, actionId, parameters);
    }

    // A declared FLOW (the page's own `actions:` lowered to commands) or, for an id the page does
    // NOT declare, the app's ACTION catalogue — owner first. Either runs here with no round-trip; a
    // RunAction inside the flow comes back through this method and resolves the same way.
    const resolved = resolveAction(actionId, this.currentActionDefs, this.session.actionCatalogue.get());
    if (isClientRunnable(resolved) && this.flowDepth < 8) {
      if (resolved!.commands && resolved!.commands.length) {
        this.flowDepth++;
        try {
          // a NavigateTo of the flow lands on the record it names (`orders/${state.id}`), like on the web
          const flowContext = { state: this.currentComponentState, parameters, data: this.view.data, appState: this.session.appState };
          for (const cmd of resolved!.commands) this.handleCommand(resolveFlowCommand(cmd as Json, flowContext));
        } finally {
          this.flowDepth--;
        }
        return true;
      }
      if (resolved!.restAction) {
        return this.handleRestAction(resolved!.restAction as Json, actionId, parameters);
      }
    }

    const generation = this.polling.currentGeneration;
    let queueable: { request: QueuedRequest; key: string } | null = null;
    try {
      if (this.actionSse[actionId]) {
        // a LongTask: each progress increment is applied as it arrives — its Progress commands feed
        // the session's task center, which outlives this screen
        const origin: IncrementOrigin = { actionId, parameters: parameters ?? {}, taskIds: new Set() };
        try {
          await this.session.api.runActionStream(
          {
            route: this.currentRoute,
            consumedRoute: this.currentConsumedRoute,
            actionId,
            serverSideType: this.resolveActionTarget(actionId) || null,
            initiatorComponentId: this.currentComponentId,
            embeddedChrome: this.embeddedChrome,
            componentState: this.actionState(),
            appState: this.session.appState,
            parameters: parameters ?? {},
          },
          (increment) => this.applyIncrement(increment as Json, origin),
          );
        } finally {
          // a stream that ended without saying how its tasks ended (the connection dropped): the
          // server keeps them running for a while — resumed if it still has them, else failed
          for (const id of origin.taskIds!) this.session.reattach.streamEnded(id);
          if ([...origin.taskIds!].some((id) => this.session.tasks.get(id)?.state === 'running')) {
            await this.session.reattach.reattach(this.session.reattachHost());
          }
        }
        this.polling.actionSucceeded(generation, actionId);
        return true;
      }
      const request: QueuedRequest = {
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        actionId,
        serverSideType: this.resolveActionTarget(actionId) || null,
        initiatorComponentId: this.currentComponentId,
        embeddedChrome: this.embeddedChrome,
        componentState: this.actionState(),
        appState: this.session.appState,
        parameters: parameters ?? {},
        timeoutMillis: this.actionTimeout[actionId],
      };
      // @Action(offline = QUEUE): the very first attempt already carries the key the queue would
      // send again — if its answer is lost, the retry must not apply the change twice
      queueable = this.actionOffline[actionId] === true && !!this.session.outbox && !this.session.api.local
        ? { request, key: newIdempotencyKey() }
        : null;
      const increment = await this.session.api.runAction({
        ...request,
        idempotent: this.actionIdempotent[actionId],
        idempotencyKey: queueable?.key,
        background,
      });
      this.applyIncrement(increment as Json);
      // The server answers a handler that threw with an error message (its error boundary), not an
      // HTTP error: that action FAILED, like on the web — its caller (a Kanban move puts the card
      // back) hears false, and no OnSuccess runs.
      if (isErrorAnswer(increment)) return false;
      // OnSuccess triggers (the polling loop) — only if we are still on the screen that dispatched it
      this.polling.actionSucceeded(generation, actionId);
      return true;
    } catch (e) {
      // a stale-screen refusal already showed its own notice (with Reload) — not a second toast
      if (silent || isStaleScreenError(e)) devLog('[Mateu] action failed:', actionId, errorText(e));
      else if (queueable && shouldQueue(true, classifyFailure(e, connectivity.isOnline))) {
        // no connection: kept in the UI's send queue, sent with the same key when it is back
        const label = [this.windowTitle, this.actionLabelOf(actionId)].filter(Boolean).join(' · ');
        const outbox = this.session.outbox!;
        // filed only in the queue of who is signed in NOW: after an in-session sign-in as somebody
        // else the session's queue is still the previous person's
        const currentOwner = () => (this.session.outboxOwner ? this.session.outboxOwner() : ANONYMOUS_OWNER);
        const kept = await outbox.enqueue(queueable.request, queueable.key, label, undefined, currentOwner);
        devLog('[Mateu] action queued:', actionId, kept);
        const notKept = outbox.status === 'damaged'
          ? outboxRecoveryTexts(uiLocale()).notKeptDamaged
          : (await outbox.isOwnedBy(currentOwner)) ? OUTBOX_TEXTS.full : OUTBOX_TEXTS.notYours;
        this.session.notify(null, kept ? OUTBOX_TEXTS.queued : notKept, kept ? 'warning' : 'error');
        if (kept) announce(OUTBOX_TEXTS.queued);
      } else {
        // in plain words, with a Retry when sending it again could work (the web's mateu-api-caller)
        const failure = classifyFailure(e, connectivity.isOnline);
        devLog('[Mateu] action failed:', actionId, errorText(e));
        this.session.notify(null, failure.message, 'error', failure.retryable
          ? { actions: [{ label: 'Retry', onPress: () => void this.runAction(actionId, parameters) }] }
          : undefined);
      }
      return false;
    }
  }

  /** The label of an action, for the send queue's list (its id when it has none). */
  private actionLabelOf(actionId: string): string {
    const def = this.currentActionDefs.find((a) => a.id === actionId) as unknown as Json | undefined;
    const label = def && typeof def['label'] === 'string' ? def['label'] : '';
    return label || actionId;
  }

  /** Host hook: asked before a discarding action throws away unsaved changes. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  /**
   * Runs a @RestAction/@RestData descriptor: fetch the external endpoint CLIENT-SIDE (url/headers/
   * body interpolated from the live state), then merge the object at resultPath into the form state
   * (so bound fields refresh) and show a success toast; an error shows a failure toast. No server
   * round-trip — the RN analogue of the web's mateu-component.handleRestAction.
   */
  private async handleRestAction(rest: Json, actionId?: string, parameters?: Json): Promise<boolean> {
    // the call's own parameters (a kanban move's _cardId/_toColumnId and the moved card's item) sit
    // over the state its templates read — the proxied leg merges them the same way on the server
    const ctx = {
      state: { ...this.currentComponentState, ...(parameters ?? {}) },
      data: this.view.data,
      appState: this.session.appState,
      appData: {},
      component: this.view.component,
    };
    const source = (rest['source'] as Json) ?? {};
    // A surface naming its source by `ref` carries only the name: the url, method, headers and body
    // (like `proxy`) are read off the RESOLVED source — the app's catalogue, then the entries the
    // responses named — or a by-ref call would fetch an empty url.
    const target = this.session.sources.resolve(source);
    const resolve = (t: unknown): string => interpolate(str(t), ctx);
    try {
      let json: unknown;
      // SAMPLE mode: a sampled source is neither fetched nor proxied — a read answers with a copy of
      // the sample, a write succeeds with null (nothing persisted, nothing to merge).
      const sampled = this.session.sources.sampledResponse(source, str(target['method']) || 'GET');
      const kind = actionId === '__restdata__' ? 'data' : 'action';
      if (sampled !== undefined) {
        json = sampled;
      } else if (rest['forEachSelectedRow']) {
        // Bulk: the call once per checked row (crud_selected_items), as on the web. A PROXY source
        // loops server-side (one __restfetch__ with _forEachSelectedRow — the secret stays there);
        // a direct one loops here, each call resolved against the state with the row merged in.
        const rows = (this.currentComponentState['crud_selected_items'] as Json[] | undefined) ?? [];
        if (!rows.length) {
          this.session.notify(null, 'You first need to select some rows', 'warning');
          return false;
        }
        if (this.session.sources.viaProxy(source)) {
          json = await this.fetchViaProxy(kind, actionId ?? '', { _forEachSelectedRow: true });
        } else {
          // one call per row, counted as ONE wait (the indicator does not restart between rows)
          const endWait = this.session.activity.begin();
          try {
            for (const row of rows) {
              const rowCtx = { ...ctx, state: { ...ctx.state, ...row } };
              const url = this.session.sources.absolute(interpolateUrl(str(target['url']), rowCtx));
              const method = (str(target['method']) || 'GET').toUpperCase();
              const headers: Record<string, string> = {};
              for (const [k, v] of Object.entries((target['headers'] as Json) ?? {})) headers[k] = interpolate(str(v), rowCtx);
              Object.assign(headers, await externalAuthHeaders({ url, method }));
              const init: RequestInit = { method, headers };
              if (method !== 'GET' && method !== 'HEAD' && target['body']) init.body = bodyOf(target, headers, rowCtx);
              const res = await fetch(url, init);
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
            }
          } finally {
            endWait();
          }
          json = null;
        }
      } else if (this.session.sources.viaProxy(source)) {
        // Proxy mode: route through the Mateu server (no CORS, secrets injected server-side) via
        // the reserved __restfetch__ action. The __restdata__ (screen-load) id resolves the class
        // @RestData source; any other id is a @RestAction method — hence the source kind.
        json = await this.fetchViaProxy(kind, actionId ?? '', { ...(parameters ?? {}) });
      } else {
        const url = this.session.sources.absolute(interpolateUrl(str(target['url']), ctx));
        const method = (str(target['method']) || 'GET').toUpperCase();
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries((target['headers'] as Json) ?? {})) headers[k] = resolve(v);
        // A registered client-side auth provider supplies dynamic headers (merged last, so it wins).
        Object.assign(headers, await externalAuthHeaders({ url, method }));
        const init: RequestInit = { method, headers };
        if (method !== 'GET' && method !== 'HEAD' && target['body']) init.body = bodyOf(target, headers, ctx);
        // counted by the "waiting for the server" indicator until the body is read
        json = await this.session.activity.track(async () => {
          const res = await fetch(url, init);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          // a 204 (a DELETE) is a success with nothing to merge, never a parse error
          return jsonBodyOf(res);
        });
      }
      // resultPath: a string (possibly empty = whole response) merges into the state; null/absent
      // (a @RestAction fire-and-toast) merges nothing.
      const resultPath = rest['resultPath'];
      if (typeof resultPath === 'string') {
        const merged = getByPath(json, resultPath);
        if (merged && typeof merged === 'object') {
          Object.assign(this.currentComponentState, merged as Json);
          this.publish({
            ...this.view,
            state: { ...this.currentComponentState },
            loading: false,
            version: this.view.version + 1,
          });
        }
      }
      // after the result merged into the state, the call's parameters still over it
      const after = { ...ctx, state: { ...this.currentComponentState, ...(parameters ?? {}) } };
      const message = interpolate(str(rest['successMessage']), after);
      if (message) this.session.notify(null, message, 'info', { duration: 3000 });
      // successRoute: where a 2xx lands, interpolated against the state the result merged into
      // (the web's rule)
      const successRoute = interpolate(str(rest['successRoute']), after);
      if (successRoute && !successRoute.includes('${')) this.handleCommand({ type: 'NavigateTo', data: successRoute });
      return true;
    } catch (e) {
      // a screen-load fetch (@RestData) fails like a load: logged; a pressed action says so
      if (actionId === '__restdata__') devLog('[Mateu] rest data failed:', errorText(e));
      else this.session.notify(null, describeFailure(e, connectivity.isOnline), 'error');
      return false;
    }
  }

  /**
   * Proxy-mode external fetch: route a DECLARED REST source through the Mateu server via the
   * reserved __restfetch__ action (the server resolves the source, injects ${secret.X} and fetches
   * server-side — no CORS, secrets off the client). Returns the raw JSON the server fetched
   * (appData._restfetch); a failure THROWS — the transport's, or the endpoint's the server reports
   * in appData._restfetchError (the web's handleProxyResult). It used to answer {} instead, so a
   * write that failed still showed its success message ("Deleted" while nothing was deleted).
   * Shared by the options/rows/action/data proxy paths (all of which catch).
   */
  async fetchViaProxy(sourceKind: string, sourceId: string, extra: Json = {}): Promise<unknown> {
    const increment = (await this.session.api.runAction({
      route: this.currentRoute,
      consumedRoute: this.currentConsumedRoute,
      actionId: '__restfetch__',
      serverSideType: this.currentServerSideType || null,
      initiatorComponentId: this.currentComponentId,
      embeddedChrome: this.embeddedChrome,
      componentState: this.actionState(),
      appState: this.session.appState,
      parameters: { _sourceKind: sourceKind, _sourceId: sourceId, ...extra },
    })) as Json;
    const appData = (increment?.['appData'] as Json) ?? {};
    const failure = appData['_restfetchError'] as Json | undefined;
    if (failure) {
      if (typeof failure['status'] === 'number' && failure['status'] > 0) throw new HttpStatusError(failure['status'], '');
      throw new Error('The request failed');
    }
    return appData['_restfetch'] ?? {};
  }

  // ── field state ─────────────────────────────────────────────────────────────────────

  putState(fieldId: string, value: unknown): void {
    const changed = !sameValue(this.currentComponentState[fieldId], value);
    this.currentComponentState[fieldId] = value;
    this.markUserEdit();
    // Rules react to edits (observed fields, conditional visibility/disabling); without a rule change
    // the tree still re-renders against the edited state — a `${state.x}` title, label or button
    // label follows what is typed (it was evaluated once). Same version: nothing is remounted.
    if (!this.applyRulesAndRepublish()) this.publish({ ...this.view, state: { ...this.currentComponentState } });
    // OnValueChange: the edited field's triggers run their actions (Total recomputes, the City
    // options follow the Country) — like every trigger, silent on failure and never held back
    if (changed) {
      for (const actionId of valueChangeActionsOf(this.valueChanges, fieldId, (c) => this.evalValidationCondition(c))) {
        void this.runAction(actionId, undefined, true);
      }
    }
    // @AutoSave: fire the configured action once the user has been idle for the debounce window.
    if (this.autoSave) {
      if (this.autoSaveTimer) clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = setTimeout(() => void this.runAction(this.autoSave!.actionId, undefined, true), this.autoSave.debounceMillis);
    }
  }

  markUserEdit(): void {
    if (this.trackDirty) this.setDirty(true);
  }

  private setDirty(value: boolean): void {
    // the session knows every view with unsaved changes: a navigation away asks about ALL of them
    this.session.noteDirty(this, value && this.trackDirty);
    if (this.dirty === value) return;
    this.dirty = value;
    this.onDirtyChanged(value);
  }

  // ── action bubbling / validation ────────────────────────────────────────────────────

  private captureComponentContext(sscNode: Json): void {
    const flags = actionFlagsOf(sscNode['actions']);
    this.currentComponentActions = flags.ids;
    this.currentActionDefs = asArray(sscNode['actions']) as ShellAction[];
    // @Action(shortcut): the screen's keys, in the session's registry while this view shows them
    this.offShortcuts?.();
    this.offShortcuts = this.session.keyShortcuts?.register(...actionShortcutsOf(sscNode['actions'])
      .map(({ actionId, shortcut }) => ({ shortcut, scope: 'screen' as const, run: () => void this.runAction(actionId) })));
    this.actionValidationRequired = flags.validationRequired;
    this.actionRowsSelectedRequired = flags.rowsSelectedRequired;
    this.actionConfirmation = flags.confirmation;
    this.actionSse = { ...this.inheritedSse, ...flags.sse };
    this.actionBubble = flags.bubble;
    this.actionRestData = flags.restData;
    this.actionTimeout = flags.timeoutMillis;
    this.actionIdempotent = flags.idempotent;
    this.actionJs = flags.js;
    this.actionOffline = flags.offline;
    this.currentValidations = asArray(sscNode['validations']);
    this.currentRules = asArray(sscNode['rules']);
    this.fieldAttributes = {};

    const orchestrator = orchestratorOf(sscNode);
    if (orchestrator) {
      this.orchestratorServerSideType = orchestrator.serverSideType;
      this.orchestratorComponentRoute = orchestrator.componentRoute;
    }

    // A freshly-(re)loaded component starts clean; the wire flag says whether to track edits.
    this.trackDirty = sscNode['confirmOnNavigationIfDirty'] === true;
    this.setDirty(false);

    // @Emits: the logical name stamped as __source on events this component dispatches.
    this.emitsName = str(sscNode['emitsName']) || str(sscNode['serverSideType']);

    // Triggers: @SubscribeTo / OnCustomEvent → the session event bus (COMPONENT scope filters by
    // the emitter's __source); @AutoSave → debounced save on every edit.
    const plan = triggerPlanOf(sscNode['triggers']);
    this.autoSave = plan.autoSave;
    this.valueChanges = plan.valueChanges;
    this.session.unsubscribeAll(this);
    for (const sub of plan.subscriptions) {
      this.session.subscribe(this, sub.eventName, (payload) => {
        const params = subscriptionParameters(sub, payload);
        if (!params) return false; // a COMPONENT-scoped subscription that listens to another emitter
        void this.runAction(sub.actionId, params, true);
        return true;
      });
    }
  }

  // ── client-side rules (RuleMapper wire: filter → action on fields/state) ─────────────

  /** Evaluates the component's rules against the live state. Returns true when something the
   *  renderers read (state values / field attributes) changed and a re-render is due. */
  applyRules(): boolean {
    if (this.currentRules.length === 0) return false;
    const ctx = {
      state: this.currentComponentState,
      data: this.view.data,
      appState: this.session.appState,
      appData: {},
      component: this.view.component,
    };
    return applyClientRules(this.currentRules, ctx, this.currentComponentState, this.fieldAttributes, (actionId) => {
      void this.runAction(actionId, undefined, true);
    });
  }

  private applyRulesAndRepublish(): boolean {
    if (this.applyRules()) {
      this.publish({ ...this.view, state: { ...this.currentComponentState }, version: this.view.version + 1 });
      return true;
    }
    return false;
  }

  private ownsAction(actionId: string): boolean {
    return ownsAction(this.currentComponentActions, actionId);
  }

  /** Whether the view on show advertises `actionId` (what the web's mateu-component claims). */
  advertises(actionId: string): boolean {
    return this.ownsAction(actionId);
  }

  /** Whether a pressed button's action goes anywhere (see buttonActionClaimed): an id nobody
   *  claims is inert, as on the web, instead of a request the server refuses with 403. */
  claimsButtonAction(actionId: string): boolean {
    return buttonActionClaimed({
      actionId,
      owned: this.currentComponentActions,
      currentServerSideType: this.currentServerSideType,
      target: this.resolveActionTarget(actionId),
      clientRunnable: isClientRunnable(resolveAction(actionId, this.currentActionDefs, this.session.actionCatalogue.get())),
    });
  }

  private resolveActionTarget(actionId: string): string {
    // Unowned action on an inner view (e.g. "edit" on a crud detail): bubble to the crud
    // orchestrator, else to the sst the view was navigated with.
    return actionTargetOf({
      bubbles: !this.ownsAction(actionId) || this.actionBubble[actionId] === true,
      currentServerSideType: this.currentServerSideType,
      currentRoute: this.currentRoute,
      orchestratorServerSideType: this.orchestratorServerSideType,
      orchestratorComponentRoute: this.orchestratorComponentRoute,
      navigationServerSideType: this.navigationServerSideType,
    });
  }

  private collectFieldErrors(): Record<string, string> {
    return {
      // a field a client-side rule makes required (SetDataValue <field>.required) is checked too
      ...ruleRequiredErrorsOf(this.fieldAttributes, this.currentComponentState),
      ...fieldErrorsOf(this.currentValidations, (condition) => this.evalValidationCondition(condition)),
    };
  }

  private evalValidationCondition(condition: string): boolean {
    try {
      return Boolean(
        evaluateExpression(condition, {
          state: this.currentComponentState,
          data: this.view.data,
          appState: this.session.appState,
        }),
      );
    } catch {
      // legacy regex matcher as the safety net for syntax the parser doesn't cover
      return evalCondition(condition, this.currentComponentState);
    }
  }

  // ── increment application ───────────────────────────────────────────────────────────

  applyIncrement(increment: Json, origin?: IncrementOrigin): void {
    // first: the components about to render may fetch from the sources they name
    this.session.sources.addReferenced(increment['restSources']);
    // an answer that opens an overlay names the OVERLAY's content (a crud drawer's record): the
    // window under it keeps its title
    const opensOverlay = asArray(increment['fragments']).some(
      (f) => floatingIntentOf(str(f['action']) || 'Replace', f['component'] as Json | null, !!this.view.component) === 'overlay',
    );
    for (const fragment of asArray(increment['fragments'])) this.applyFragment(fragment);

    for (const msg of asArray(increment['messages'])) {
      const toast = toastOf(msg);
      if (!toast) continue;
      // The message's actions (an Undo among them) run on THIS controller — the initiator whose
      // action produced the message; a route navigates.
      const actions = toast.actions.map((a) => ({ label: a.label, style: a.style, onPress: () => this.runToastAction(a) }));
      const undo = toast.undo;
      this.session.notify(toast.title, toast.text, toast.variant, {
        duration: toast.duration,
        undo: undo ? { label: undo.label, onPress: () => void this.runAction(undo.actionId, undo.parameters) } : undefined,
        actions,
        sticky: toast.persistence === 'sticky' ? true : undefined,
        key: toast.key,
      });
      // an inbox message is also an entry of this session's inbox (deduplicated by its key)
      if (toast.persistence === 'inbox') {
        this.session.inbox.addSession({
          id: toast.key ?? `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: toast.title || toast.text,
          text: toast.title ? toast.text : null,
          unread: true,
          variant: toast.variant,
          actions: toast.actions,
          local: true,
          run: (a) => this.runToastAction(a as ToastAction),
        });
      }
    }

    for (const cmd of asArray(increment['commands'])) {
      if (opensOverlay && str(cmd['type']) === 'SetWindowTitle') continue;
      this.handleCommand(cmd, origin);
    }

    // Action-returned banners (PageBanner/PageBanners): bare returns replace, .append accumulates.
    const banners = asArray(increment['banners']) as PageBanner[];
    if (banners.length > 0) {
      this.actionBanners = increment['appendBanners'] === true ? [...this.actionBanners, ...banners] : banners;
      this.publish({ ...this.view, version: this.view.version + 1 });
    }

    // app state / app data an answer carries: `${appState.x}` / `${appData.x}` on screen follow it
    const newAppState = increment['appState'];
    const newAppData = increment['appData'];
    let appChanged = false;
    if (newAppState && typeof newAppState === 'object' && Object.keys(newAppState).length) {
      Object.assign(this.session.appState, newAppState);
      appChanged = true;
    }
    if (newAppData && typeof newAppData === 'object') {
      const visible = Object.fromEntries(Object.entries(newAppData as Json).filter(([k]) => !k.startsWith('_')));
      if (Object.keys(visible).length) {
        Object.assign(this.session.appData, visible);
        appChanged = true;
      }
    }
    if (appChanged && this.view.component) this.publish({ ...this.view });
  }

  private applyFragment(fragment: Json): void {
    const targetId = str(fragment['targetComponentId']);
    const action = str(fragment['action']) || 'Replace';
    const component = fragment['component'] as Json | null;
    const state = (fragment['state'] as Json) ?? null;
    const data = fragment['data'];

    // Overlay fragments (action Add + Drawer/Dialog) stack over the page. The opener context
    // lets a ClientSide overlay content dispatch its actions against THIS view's component.
    const floating = floatingIntentOf(action, component, !!this.view.component);
    if (floating === 'toast') {
      const toast = notificationToastOf((component!['metadata'] as Json) ?? {});
      this.session.notify(toast.title, toast.text, toast.variant, { duration: toast.duration });
      return;
    }
    if (floating === 'overlay') {
      this.session.openOverlay(component, state, data, {
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        // an overlay re-sent from inside an overlay (a drawer's «Save and next») keeps the ORIGINAL
        // opener as the place its unowned actions bubble to
        serverSideType: this.openerServerSideType || this.currentServerSideType,
        session: this.session,
        controller: this,
      });
      return;
    }

    // A state update aimed at an open overlay (a LongTask's progress dialog) belongs to it.
    if (!component && state && typeof state === 'object' && targetId && this.session.updateOverlayState(targetId, state)) {
      return;
    }

    if (!component) {
      // Data-only fragment — push to a registered data handler (e.g. Crud search results).
      if (data !== null && data !== undefined) {
        // Field-scoped first: lookup responses are keyed by fieldId and must not hit the crud fallback.
        if (typeof data === 'object' && !Array.isArray(data)) {
          let consumed = false;
          for (const key of Object.keys(data as Json)) {
            const fieldHandler = this.fieldDataHandlers[key];
            if (fieldHandler) {
              fieldHandler((data as Json)[key]);
              consumed = true;
            }
          }
          if (consumed) return;
        }
        const handler = this.dataHandlers[targetId || 'ux_main'] ?? this.dataHandlers['crud'];
        if (handler) handler(data);
        else if (typeof data === 'object' && !Array.isArray(data)) {
          // data for the view itself: `${data.lastUpdate}` reads it (it was dropped)
          const merged = { ...((this.view.data && typeof this.view.data === 'object' && !Array.isArray(this.view.data)) ? this.view.data as Json : {}), ...(data as Json) };
          this.publish({ ...this.view, data: merged, loading: false });
        }
        return;
      }
      if (!state || typeof state !== 'object') return;
      // State-only navigation fragment from a CRUD orchestrator (view/new/save).
      if ('_route' in state && '_componentRoute' in state) {
        const stateComp = str(state['_componentRoute']);
        const base = stateComp || this.currentConsumedRoute;
        const routeSuffix = str(state['_route']);
        const move = mediatorMove(routeSuffix, this.currentInnerRoute, !!this.detailOpener);
        if (move === 'stay') {
          // Same inner route (the listing answers to "" and "list"): stay put — a RunAction command
          // in the same increment refreshes the data.
          Object.assign(this.currentComponentState, state);
          return;
        }
        if (move === 'backToList' && this.stackNavigator) {
          // A record screen sent to the list (Back to list, Cancel, a delete from the record): back
          // to the listing it was opened from, not a second listing stacked on top of it.
          this.stackNavigator({ label: '', route: base, consumedRoute: base, serverSideType: this.navigationServerSideType || this.currentServerSideType }, false);
          return;
        }
        const fullRoute = base + routeSuffix;
        const sst =
          this.orchestratorServerSideType && this.orchestratorComponentRoute === stateComp
            ? this.orchestratorServerSideType
            : this.navigationServerSideType || this.currentServerSideType;
        if (this.detailOpener && move === 'detail') {
          const target = { label: detailLabel(routeSuffix), route: fullRoute, consumedRoute: base, serverSideType: sst };
          // a saved create/edit form gives its place to the record (Back must not return to it)
          if (this.stackNavigator) this.stackNavigator(target, isFormRoute(this.currentRoute) && !isFormRoute(fullRoute));
          else this.detailOpener(target);
        } else {
          this.currentInnerRoute = trimSlashes(routeSuffix);
          void this.navigate(fullRoute, base, sst);
        }
        return;
      }
      // State-only update with NO navigation route: merge + re-render (a @Toolbar method that
      // mutated its model).
      if (Object.keys(state).length > 0) {
        Object.assign(this.currentComponentState, state);
        this.publish({
          ...this.view,
          state: { ...this.view.state, ...state },
          loading: false,
          version: this.view.version + 1,
        });
      }
      return;
    }

    // A content fragment carrying the mediator's `_route` seeds the inner route baseline.
    if (state && typeof state === 'object' && '_route' in state) {
      this.currentInnerRoute = trimSlashes(str(state['_route']));
    }

    this.renderComponentFragment(component, state ?? {}, data);
  }

  /** Mounts an inline ServerSide node (embedded island / overlay content) into this view. */
  /** The opener's type of an overlay's content (see mountServerSide). */
  private openerServerSideType = '';

  mountServerSide(component: unknown): void {
    const node = component as Json;
    // an overlay's content was seeded with its OPENER's type: what the content does not own (a crud
    // drawer's Save, owned by the crud, not by the entity form inside) bubbles to the opener — sent
    // as the entity form's type it answered 403
    const opener = this.currentServerSideType;
    this.currentRoute = str(node['route']) || this.currentRoute;
    this.currentServerSideType = str(node['serverSideType']) || this.currentServerSideType;
    this.navigationServerSideType = opener || this.currentServerSideType;
    if (opener) this.openerServerSideType = opener;
    this.freshScreen = true;
    this.renderComponentFragment(node, (node['initialData'] as Json) ?? {}, null);
  }

  /** Renders a component fragment: ServerSide wrappers unwrap here (mediator App → follow-up
   *  navigation; inline children → captured + rendered; no children → background load). */
  private renderComponentFragment(component: Json, state: Json, data: unknown): void {
    // A bare App shell answering a MENU navigation (route resolved through the app class):
    // don't render the chrome — follow its home route to the actual content.
    const meta = (component['metadata'] as Json) ?? {};
    // The app shell carries the REST source catalogue (AppDto.restSources); register it so a surface
    // that references a source by `ref` can resolve it — before the home-route hop below returns.
    if (meta['type'] === 'App' && meta['restSources'] !== undefined) this.session.sources.register(meta['restSources']);
    if (meta['type'] === 'App' && meta['actionCatalogue'] !== undefined) this.session.actionCatalogue.register(meta['actionCatalogue']);
    // the app's locale (AppDto.locale — the server's Translator) writes its amounts of money
    if (meta['type'] === 'App' && typeof meta['locale'] === 'string') setAppLocale(meta['locale']);
    // Sample mode is only ever switched ON by the app (the server opted in with mateu.sources.mock).
    if (meta['type'] === 'App' && meta['mockSources'] === true) this.session.sources.setSampleMode(true);
    if (component['type'] !== 'ServerSide' && meta['type'] === 'App') {
      const { route: homeRoute, consumedRoute: homeConsumed, serverSideType: homeSst } = appHomeOf(meta);
      const same = homeRoute === this.currentRoute && homeSst === this.currentServerSideType;
      if ((homeRoute || homeSst) && !same && this.appShellHops < 2) {
        this.appShellHops++;
        // the app's own @Fab buttons float over its screens (they belong to the app class, so they
        // run against it): an app opened inside another shell kept its content and lost them
        const fabs = asArray(meta['fabs']);
        // …and so do its context selectors, header actions and bell, when it is embedded in a page
        this.appExtras = embeddedAppExtrasOf(meta) ?? this.appExtras;
        this.appFabs = fabs.length
          ? { fabs, route: homeRoute, consumedRoute: homeConsumed, serverSideType: str(meta['serverSideType']) }
          : null;
        void this.navigate(homeRoute, homeConsumed, homeSst);
        return;
      }
    }
    this.appShellHops = 0;
    if (component['type'] === 'ServerSide') {
      const id = str(component['id']);
      const route = str(component['route']);
      const sst = str(component['serverSideType']);
      const children = asArray(component['children']);

      if (children.length > 0) {
        const first = children[0] as Json;
        const firstMeta = (first['metadata'] as Json) ?? {};
        const firstIsApp = first['type'] === 'ClientSide' && firstMeta['type'] === 'App';
        if (firstMeta['type'] === 'App' && firstMeta['restSources'] !== undefined) this.session.sources.register(firstMeta['restSources']);
        if (firstMeta['type'] === 'App' && firstMeta['actionCatalogue'] !== undefined) this.session.actionCatalogue.register(firstMeta['actionCatalogue']);
        if (firstMeta['type'] === 'App' && firstMeta['mockSources'] === true) this.session.sources.setSampleMode(true);
        if (firstIsApp) {
          // Crud MEDIATOR shell: don't render the App chrome — navigate to its home route.
          // What the mediator says of its actions holds for the view it hands over to: an embedded
          // editable view advertises its LongTask (`sse`) on the mediator, and the view's own answer
          // may not repeat it — the scan then went as a plain request and its progress never moved.
          this.inheritedSse = actionFlagsOf(component['actions']).sse;
          const { route: homeRoute, consumedRoute: homeConsumed, serverSideType: homeSst } = appHomeOf(firstMeta);
          // …and so does what the host seeded it with (an island's `stayId`): the web's inner view
          // sends it on its first load and on every reload of the mediator's own routes
          this.mediatorSeed = serverSideState(component, state);
          this.mediatorConsumed = homeConsumed ?? '';
          if (homeRoute || homeSst) void this.navigate(homeRoute, homeConsumed, homeSst);
          return;
        }
        if (id) this.currentComponentId = id;
        if (sst) this.currentServerSideType = sst;
        this.captureComponentContext(component);
        // initialData overlaid with the FRAGMENT state — a reflected view's field values travel in
        // UIFragmentDto.state, and reading initialData alone rendered those fields empty (RN-02).
        this.currentComponentState = serverSideState(component, state);
        this.fieldErrors = {};
        this.view = { ...this.view, component: children.length === 1 ? children[0] : { children }, data };
        this.applyRules(); // initial pass: conditional visibility/disabling on first render
        this.publish({
          component: children.length === 1 ? children[0] : { children },
          state: { ...this.currentComponentState },
          data,
          loading: false,
          error: null,
          version: this.view.version + 1,
        });
        const triggers = asArray(component['triggers']);
        // a snapshot only PAINTS: its OnLoads (a listing's search…) run with the fresh answer
        if (this.applyingSnapshot) return;
        const fresh = this.freshScreen;
        this.freshScreen = false;
        // timed OnLoad/OnSuccess: armed on a NEW screen only — a same-screen re-render (what a
        // refresh answers) must not re-arm the OnLoads, or every round would add another loop
        this.polling.enterScreen(`${sst || this.currentServerSideType}|${route || this.currentRoute}`, triggers, fresh);
        this.fireOnLoadTriggers(triggers);
        return;
      }

      // No inline children: load the component in the background.
      const prev = { ...this.viewNav() };
      this.currentRoute = route;
      this.currentServerSideType = sst;
      if (id) this.currentComponentId = id;
      void this.session.api
        .runAction({
          route,
          consumedRoute: this.currentConsumedRoute,
          actionId: '',
          serverSideType: sst || null,
          initiatorComponentId: id || 'ux_main',
          embeddedChrome: this.embeddedChrome,
          componentState: {},
          appState: this.session.appState,
          parameters: {},
        })
        .then((inc) => this.applyIncrement(inc as Json))
        .catch((e) => {
          Object.assign(this, prev);
          this.publish({ ...this.view, loading: false, error: errorText(e) });
        });
      return;
    }

    this.publish({ component, state, data, loading: false, error: null, version: this.view.version + 1 });
  }

  private viewNav() {
    return {
      currentRoute: this.currentRoute,
      currentConsumedRoute: this.currentConsumedRoute,
      currentServerSideType: this.currentServerSideType,
      currentComponentId: this.currentComponentId,
    };
  }

  /** Fires OnLoad actions such as the Crud `search` (with its default paging state seeded). */
  private fireOnLoadTriggers(triggers: Json[]): void {
    for (const trigger of triggers) {
      if (String(trigger['type']).toLowerCase() !== 'onload') continue;
      if (isTimedOnLoad(trigger)) continue; // delayed: the polling scheduler owns it
      const actionId = str(trigger['actionId']);
      if (!actionId) continue;
      if (actionId === 'search') this.seedSearchState();
      void this.runAction(actionId, undefined, true);
    }
  }

  seedSearchState(): void {
    seedSearchFromRoute(this.currentComponentState, this.currentRoute);
  }

  /** A message's / a finished task's action: a route navigates, an action id runs here. */
  private runToastAction(action: TaskAction | ToastAction): void {
    if (action.route) {
      this.handleCommand({ type: 'NavigateTo', data: action.route });
      return;
    }
    if (action.actionId) void this.runAction(action.actionId, (action.parameters as Json) ?? {});
  }

  /** `_progress-cancel`: asks the server to stop the task (it answers it, cancelled). */
  private async cancelTask(taskId: string): Promise<void> {
    try {
      const increment = await this.session.api.runAction({
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        actionId: '_progress-cancel',
        serverSideType: this.currentServerSideType || null,
        initiatorComponentId: this.currentComponentId,
        embeddedChrome: this.embeddedChrome,
        componentState: {},
        appState: this.session.appState,
        parameters: { taskId },
      });
      for (const cmd of asArray((increment as Json)?.['commands'])) {
        if (str(cmd['type']) === 'Progress') this.handleCommand(cmd);
      }
    } catch (e) {
      this.session.notify(null, `The task could not be cancelled: ${errorText(e)}`, 'error');
    }
  }

  /** Start / end of a task, said to the screen reader (politely). */
  private announceTaskEvents(events: TaskEvent[]): void {
    for (const event of events) {
      if (!event) continue;
      announceLive(event.kind === 'started' ? `${event.task.title || 'Task'} started` : finishedAnnouncement(event.task), false);
    }
  }

  private handleCommand(cmd: Json, origin?: IncrementOrigin): void {
    const type = str(cmd['type']);
    const cmdData = cmd['data'];
    switch (type) {
      case 'Progress': {
        // a long-running task (LongTask): upserted in the session's task center by taskId
        const progress = progressOf(cmdData);
        if (!progress) break;
        if (origin?.taskIds && !origin.taskIds.has(progress.taskId)) {
          origin.taskIds.add(progress.taskId);
          // remembered for this session: if the stream breaks, the task can be resumed
          if (progress.state === 'running') {
            this.session.reattach.remember(progress.taskId, {
              api: this.session.api,
              route: this.currentRoute,
              serverSideType: this.resolveActionTarget(origin.actionId) || null,
            });
          }
          this.session.reattach.streamStarted(progress.taskId);
        }
        if (progress.state !== 'running') this.session.reattach.forget(progress.taskId);
        const event = this.session.tasks.upsert(progress, {
          cancel: () => void this.cancelTask(progress.taskId),
          retry: origin ? () => void this.runAction(origin.actionId, origin.parameters) : undefined,
          runAction: (a) => this.runToastAction(a),
        });
        this.announceTaskEvents([event]);
        break;
      }
      case 'NotificationsChanged':
        // the inbox changed (normally on the live-updates stream, handled by the shell too)
        this.session.inbox.apply(inboxChangeOf(cmdData));
        break;
      case 'SetWindowTitle': {
        const title = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['title']);
        // the window is the host's: an embedded page never names it (nor is announced as a new screen)
        if (this.windowless) break;
        if (title && !title.startsWith('[')) {
          this.windowTitle = title;
          this.session.setTitle(title);
          // Navigating in a native app replaces the screen without any platform-level signal a
          // screen reader would pick up on its own, so it is announced here — the mobile
          // counterpart of the web renderers' live-region announcement.
          announce(title);
        }
        break;
      }
      case 'NavigateTo': {
        const href = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['href']);
        if (!href) break;
        const navTarget = { label: '', route: href, consumedRoute: '', serverSideType: '' }; // a route is no title: the screen shows its own
        if (this.stackNavigator) {
          // a screen already on the stack is gone back to; a saved form gives its place to the record
          this.stackNavigator(navTarget, isFormRoute(this.currentRoute) && !isFormRoute(href));
        } else if (this.detailOpener) {
          this.detailOpener(navTarget);
        } else {
          this.session.openView({ label: '', route: href, consumedRoute: '', serverSideType: '' });
        }
        break;
      }
      case 'RunAction': {
        const actionId = str((cmdData as Json)?.['actionId']);
        if (actionId) {
          if (actionId === 'search') this.seedSearchState();
          void this.runAction(actionId, undefined, true);
        }
        break;
      }
      case 'MarkAsDirty':
        this.setDirty(true);
        break;
      case 'MarkAsClean':
        this.setDirty(false);
        break;
      case 'DispatchEvent':
        this.dispatchNamedEvent(cmdData as Json);
        break;
      case 'CloseModal':
        this.session.closeTopOverlay();
        this.dispatchNamedEvent(cmdData as Json);
        break;
      case 'DownloadFile': {
        // a Document (or a listing export): previewed in the system browser sheet when it sits
        // behind a single-use URL, else written to the cache and handed to the share sheet /
        // the app that opens it. `print` takes the same path — print it from there.
        presentDocument(cmdData as FileDownloadData, this.session.api.baseUrl).catch((e) => {
          this.session.notify(null, String((e as Error)?.message ?? e), 'error');
        });
        break;
      }
      case 'Print':
        // no native print of a rendered screen: said, not silently dropped (see the docs)
        announceLive('Printing is not available in the mobile app', false);
        break;
      case 'UpdateHeaderValue': {
        // a live header value (the business date…): repaint the drawer's header values and say so
        const change = this.session.headerValues.update(str((cmdData as Json)?.['id']), str((cmdData as Json)?.['value']));
        if (change) announceLive(change, false);
        break;
      }
      case 'Announce': {
        // Tell assistive tech what happened (the Redwood `announcement` slot). Draws nothing.
        const text = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['text']);
        announceLive(text, (cmdData as Json)?.['assertive'] === true);
        break;
      }
      default:
        break;
    }
  }

  private dispatchNamedEvent(cmdData: Json | null | undefined): void {
    // Only object payloads get the __source stamp, so legacy events keep their shape.
    const event = namedEventOf(cmdData, this.emitsName);
    if (event) this.session.dispatchEvent(event.eventName, event.payload);
  }

  private publish(view: RenderedView): void {
    this.view = view;
    this.onRender(view);
    // a YAML record page is named by the server before its record arrives ("28"): once its own
    // title template resolves ("Voyager 1"), the title follows it — silently (core/windowTitle.ts)
    const title = this.windowless ? '' : resolvedPageTitle(view.component, view.state ?? {}, view.data);
    if (title && title !== this.windowTitle) {
      this.windowTitle = title;
      this.session.setTitle(title);
    }
  }

  /** The title last shown for this screen (SetWindowTitle, or the page's own once resolved). */
  private windowTitle = '';
}


/** Whether an edit changed a value (arrays/objects by content: a multi-select re-sends a new array). */
function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return false;
}

/** A restAction's body against ctx: when the request declares JSON, every scope is JSON-escaped first
 *  (a quote or a newline in a value broke the body: 400), as on the web (libs/mateu jsonTemplate.ts). */
function bodyOf(target: Json, headers: Record<string, string>, ctx: Record<string, unknown>): string {
  const template = str(target['body']);
  return interpolate(template, declaresJson(headers) ? jsonSafeContext(ctx) : ctx);
}
