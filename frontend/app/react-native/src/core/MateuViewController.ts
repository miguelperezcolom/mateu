import { evaluateExpression, interpolate, interpolateUrl } from './expressions.ts';
import { applyClientRules } from './clientRules.ts';
import { actionFlagsOf, actionTargetOf, appHomeOf, errorSummary, fieldErrorsOf, namedEventOf, orchestratorOf, ownsAction, seedSearchDefaults, subscriptionParameters, toastOf, triggerPlanOf } from './componentContext.ts';
import { evalCondition } from './legacyCondition.ts';
import { asArray, detailLabel, errorText, getByPath, str, trimSlashes } from './viewWire.ts';
import { MateuSession, type NavTarget } from './MateuSession.ts';
import { setAppLocale } from './money.ts';
import { externalAuthHeaders } from './restFetch.ts';
import { announce, announceLive } from '../a11y/a11y.ts';
import { presentDocument } from './documentEffects.ts';
import type { FileDownloadData } from './documents.ts';
import { isTimedOnLoad, PollingScheduler } from './polling.ts';
import { isFormRoute, mediatorMove, serverSideState } from './uxRules.ts';
import { isDev } from '../api/MateuApiClient.ts';
import { isClientRunnable, resolveAction, type ShellAction } from './shellFlows.ts';
import type { ConfirmationDialogTexts } from './actionConfirmation.ts';

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
  /** Nesting of flows applied client-side, bounded so a flow running itself cannot loop. */
  private flowDepth = 0;
  private actionValidationRequired: Record<string, boolean> = {};
  private actionRowsSelectedRequired: Record<string, boolean> = {};
  private actionConfirmation: Record<string, ConfirmationDialogTexts> = {};
  /** Actions answered as a STREAM of increments (`ActionDto.sse` — a LongTask). */
  private actionSse: Record<string, boolean> = {};
  private actionBubble: Record<string, boolean> = {};
  /** @RestAction/@RestData: actions whose descriptor makes the client fetch an external REST
   *  endpoint instead of dispatching to the Mateu server (keyed by action id). */
  private actionRestData: Record<string, Json> = {};
  private currentValidations: Json[] = [];
  /** Client-side rules of the current component (RuleMapper wire shape). */
  private currentRules: Json[] = [];

  /** Rule-driven field attribute overrides (SetAttributeValue): fieldId → {hidden, disabled, …}. */
  fieldAttributes: Record<string, Json> = {};

  /** @Emits name stamped as __source on dispatched events. */
  private emitsName = '';
  /** @AutoSave: debounced action fired after edits. */
  private autoSave: { actionId: string; debounceMillis: number } | null = null;
  private autoSaveTimer: ReturnType<typeof setTimeout> | undefined;

  /** Action-returned banners (UIIncrementDto.banners) — cleared on navigation. */
  actionBanners: PageBanner[] = [];

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
  /** Errors/messages silenced (embedded islands). */
  silentErrors = false;

  private dataHandlers: Record<string, (data: unknown) => void> = {};
  /** Field-scoped data (lookup `search-<field>` results arrive as `{ <fieldId>: page }`). */
  private fieldDataHandlers: Record<string, (data: unknown) => void> = {};
  private view: RenderedView = { component: null, state: {}, data: null, loading: false, error: null, version: 0 };

  /** Periodic refresh: timed OnLoad + OnSuccess triggers, tied to the screen (generation). */
  private readonly polling = new PollingScheduler(
    (actionId) => {
      if (actionId === 'search') this.seedSearchState();
      // Like every trigger, silent: a failure logs, never a toast. runAction shows no busy
      // indicator here, so `background` needs no extra handling on this renderer.
      void this.runAction(actionId, undefined, true);
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
    try {
      const increment = await this.session.api.initialLoad(route, this.session.appState);
      this.currentRoute = route ?? '';
      this.freshScreen = true;
      this.applyIncrement(increment as Json);
    } catch (e) {
      this.publish({ ...this.view, loading: false, error: errorText(e) });
    }
  }

  async navigate(route: string, consumedRoute: string, serverSideType: string): Promise<void> {
    this.publish({ ...this.view, loading: true, error: null });
    try {
      const increment = await this.session.api.navigate(route, consumedRoute, serverSideType, this.session.appState);
      this.currentRoute = route ?? '';
      this.currentConsumedRoute = consumedRoute ?? '';
      this.currentServerSideType = serverSideType ?? '';
      this.navigationServerSideType = serverSideType ?? '';
      this.currentComponentState = {};
      this.actionBanners = []; // action banners don't survive page navigations
      this.freshScreen = true;
      this.applyIncrement(increment as Json);
      if (this.view.loading) this.publish({ ...this.view, loading: false });
    } catch (e) {
      this.publish({ ...this.view, loading: false, error: errorText(e) });
    }
  }

  async runAction(actionId: string, parameters?: Json, silent = false): Promise<void> {
    // Dirty guard on discarding actions (Cancel on an edit form).
    // The host may confirm asynchronously; a synchronous confirm hook keeps it simple here.
    if (this.trackDirty && this.dirty && DISCARD_ACTIONS.has(actionId)) {
      const proceed = await this.confirmDiscard();
      if (!proceed) return;
      this.setDirty(false);
    }

    // Bulk actions (@Action(rowsSelectedRequired)): don't dispatch on an empty selection —
    // same client-side guard (and message) as the web's mateu-component.
    if (this.actionRowsSelectedRequired[actionId] === true) {
      const selection = this.currentComponentState['crud_selected_items'];
      if (!Array.isArray(selection) || selection.length === 0) {
        this.session.notify(null, 'You first need to select some rows', 'warning');
        return;
      }
    }

    // Client-side validation: flagged actions and bubbled crud submits (the mediator's flags are
    // invisible to us — its validating set is stable framework knowledge).
    const requiresValidation =
      this.actionValidationRequired[actionId] === true ||
      (!this.ownsAction(actionId) && BUBBLED_SUBMIT_ACTIONS.has(actionId));
    if (requiresValidation) {
      const errors = this.collectFieldErrors();
      this.fieldErrors = {};
      if (Object.keys(errors).length > 0) {
        this.fieldErrors = errors;
        // the version bump remounts the field tree — render against the EDITED state
        this.publish({ ...this.view, state: { ...this.currentComponentState }, version: this.view.version + 1 });
        const summary = errorSummary(errors);
        this.session.notify('There are validation errors', summary, 'warning');
        // A toast is a visual affordance: a screen-reader user gets no indication that the save
        // was refused, let alone why. Speak it.
        announce(`There are validation errors. ${summary}`);
        return;
      }
    }

    // @Action(confirmationRequired): ask first, with the declared texts — same order as the web's
    // mateu-component (selection guard, validation, then the question).
    const confirmation = this.actionConfirmation[actionId];
    if (confirmation && !(await this.session.confirmAction(confirmation))) return;

    // @RestAction/@RestData: call the external REST endpoint CLIENT-SIDE instead of dispatching to
    // the Mateu server — fetch + merge the response into the state + toast (fires on click for a
    // @RestAction button, and on mount for @RestData via its OnLoad trigger's __restdata__ action).
    const rest = this.actionRestData[actionId];
    if (rest) {
      await this.handleRestAction(rest, actionId);
      return;
    }

    // A declared FLOW (the page's own `actions:` lowered to commands) or, for an id the page does
    // NOT declare, the app's ACTION catalogue — owner first. Either runs here with no round-trip; a
    // RunAction inside the flow comes back through this method and resolves the same way.
    const resolved = resolveAction(actionId, this.currentActionDefs, this.session.actionCatalogue.get());
    if (isClientRunnable(resolved) && this.flowDepth < 8) {
      if (resolved!.commands && resolved!.commands.length) {
        this.flowDepth++;
        try {
          for (const cmd of resolved!.commands) this.handleCommand(cmd as Json);
        } finally {
          this.flowDepth--;
        }
        return;
      }
      if (resolved!.restAction) {
        await this.handleRestAction(resolved!.restAction as Json, actionId);
        return;
      }
    }

    const generation = this.polling.currentGeneration;
    try {
      if (this.actionSse[actionId]) {
        // a LongTask: each progress increment is applied as it arrives
        await this.session.api.runActionStream(
          {
            route: this.currentRoute,
            consumedRoute: this.currentConsumedRoute,
            actionId,
            serverSideType: this.resolveActionTarget(actionId) || null,
            initiatorComponentId: this.currentComponentId,
            componentState: this.currentComponentState,
            appState: this.session.appState,
            parameters: parameters ?? {},
          },
          (increment) => this.applyIncrement(increment as Json),
        );
        this.polling.actionSucceeded(generation, actionId);
        return;
      }
      const increment = await this.session.api.runAction({
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        actionId,
        serverSideType: this.resolveActionTarget(actionId) || null,
        initiatorComponentId: this.currentComponentId,
        componentState: this.currentComponentState,
        appState: this.session.appState,
        parameters: parameters ?? {},
      });
      this.applyIncrement(increment as Json);
      // OnSuccess triggers (the polling loop) — only if we are still on the screen that dispatched it
      this.polling.actionSucceeded(generation, actionId);
    } catch (e) {
      if (silent || this.silentErrors) devLog('[Mateu] action failed:', actionId, errorText(e));
      else this.session.notify(null, `Action failed: ${errorText(e)}`, 'error');
    }
  }

  /** Host hook: asked before a discarding action throws away unsaved changes. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  /**
   * Runs a @RestAction/@RestData descriptor: fetch the external endpoint CLIENT-SIDE (url/headers/
   * body interpolated from the live state), then merge the object at resultPath into the form state
   * (so bound fields refresh) and show a success toast; an error shows a failure toast. No server
   * round-trip — the RN analogue of the web's mateu-component.handleRestAction.
   */
  private async handleRestAction(rest: Json, actionId?: string): Promise<void> {
    const ctx = {
      state: this.currentComponentState,
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
      if (sampled !== undefined) {
        json = sampled;
      } else if (this.session.sources.viaProxy(source)) {
        // Proxy mode: route through the Mateu server (no CORS, secrets injected server-side) via
        // the reserved __restfetch__ action. The __restdata__ (screen-load) id resolves the class
        // @RestData source; any other id is a @RestAction method — hence the source kind.
        const kind = actionId === '__restdata__' ? 'data' : 'action';
        json = await this.fetchViaProxy(kind, actionId ?? '');
      } else {
        const url = interpolateUrl(str(target['url']), ctx);
        const method = (str(target['method']) || 'GET').toUpperCase();
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries((target['headers'] as Json) ?? {})) headers[k] = resolve(v);
        // A registered client-side auth provider supplies dynamic headers (merged last, so it wins).
        Object.assign(headers, await externalAuthHeaders({ url, method }));
        const init: RequestInit = { method, headers };
        if (method !== 'GET' && method !== 'HEAD' && target['body']) init.body = resolve(target['body']);
        const res = await fetch(url, init);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
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
      const message = interpolate(str(rest['successMessage']), ctx);
      if (message) this.session.notify(null, message, 'info', { duration: 3000 });
    } catch (e) {
      if (this.silentErrors) devLog('[Mateu] rest action failed:', errorText(e));
      else this.session.notify(null, 'Request failed', 'error');
    }
  }

  /**
   * Proxy-mode external fetch: route a DECLARED REST source through the Mateu server via the
   * reserved __restfetch__ action (the server resolves the source, injects ${secret.X} and fetches
   * server-side — no CORS, secrets off the client). Returns the raw JSON the server fetched
   * (appData._restfetch), or {} on failure. Shared by the options/rows/action/data proxy paths.
   */
  async fetchViaProxy(sourceKind: string, sourceId: string): Promise<unknown> {
    try {
      const increment = (await this.session.api.runAction({
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        actionId: '__restfetch__',
        serverSideType: this.currentServerSideType || null,
        initiatorComponentId: this.currentComponentId,
        componentState: this.currentComponentState,
        appState: this.session.appState,
        parameters: { _sourceKind: sourceKind, _sourceId: sourceId },
      })) as Json;
      return (increment?.['appData'] as Json)?.['_restfetch'] ?? {};
    } catch (e) {
      devLog('[Mateu] proxy rest fetch failed:', errorText(e));
      return {};
    }
  }

  // ── field state ─────────────────────────────────────────────────────────────────────

  putState(fieldId: string, value: unknown): void {
    this.currentComponentState[fieldId] = value;
    this.markUserEdit();
    // Rules react to edits (observed fields, conditional visibility/disabling).
    this.applyRulesAndRepublish();
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
    if (this.dirty === value) return;
    this.dirty = value;
    this.onDirtyChanged(value);
  }

  // ── action bubbling / validation ────────────────────────────────────────────────────

  private captureComponentContext(sscNode: Json): void {
    const flags = actionFlagsOf(sscNode['actions']);
    this.currentComponentActions = flags.ids;
    this.currentActionDefs = asArray(sscNode['actions']) as ShellAction[];
    this.actionValidationRequired = flags.validationRequired;
    this.actionRowsSelectedRequired = flags.rowsSelectedRequired;
    this.actionConfirmation = flags.confirmation;
    this.actionSse = flags.sse;
    this.actionBubble = flags.bubble;
    this.actionRestData = flags.restData;
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
    this.session.unsubscribeAll(this);
    for (const sub of plan.subscriptions) {
      this.session.subscribe(this, sub.eventName, (payload) => {
        const params = subscriptionParameters(sub, payload);
        if (params) void this.runAction(sub.actionId, params, true);
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

  private applyRulesAndRepublish(): void {
    if (this.applyRules()) {
      this.publish({ ...this.view, state: { ...this.currentComponentState }, version: this.view.version + 1 });
    }
  }

  private ownsAction(actionId: string): boolean {
    return ownsAction(this.currentComponentActions, actionId);
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
    return fieldErrorsOf(this.currentValidations, (condition) => this.evalValidationCondition(condition));
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

  applyIncrement(increment: Json): void {
    // first: the components about to render may fetch from the sources they name
    this.session.sources.addReferenced(increment['restSources']);
    for (const fragment of asArray(increment['fragments'])) this.applyFragment(fragment);

    for (const msg of asArray(increment['messages'])) {
      const toast = toastOf(msg);
      if (!toast) continue;
      if (this.silentErrors) {
        devLog(`[Mateu] ${toast.variant}: ${toast.text}`);
        continue;
      }
      // Undoable message (Message.undoActionId): the toast's Undo button dispatches the reverse
      // action on THIS controller — the initiator whose action produced the message.
      const undo = toast.undo;
      this.session.notify(toast.title, toast.text, toast.variant, {
        duration: toast.duration,
        undo: undo ? { label: undo.label, onPress: () => void this.runAction(undo.actionId, undo.parameters) } : undefined,
      });
    }

    for (const cmd of asArray(increment['commands'])) this.handleCommand(cmd);

    // Action-returned banners (PageBanner/PageBanners): bare returns replace, .append accumulates.
    const banners = asArray(increment['banners']) as PageBanner[];
    if (banners.length > 0) {
      this.actionBanners = increment['appendBanners'] === true ? [...this.actionBanners, ...banners] : banners;
      this.publish({ ...this.view, version: this.view.version + 1 });
    }

    const newAppState = increment['appState'];
    if (newAppState && typeof newAppState === 'object') {
      Object.assign(this.session.appState, newAppState);
    }
  }

  private applyFragment(fragment: Json): void {
    const targetId = str(fragment['targetComponentId']);
    const action = str(fragment['action']) || 'Replace';
    const component = fragment['component'] as Json | null;
    const state = (fragment['state'] as Json) ?? null;
    const data = fragment['data'];

    // Overlay fragments (action Add + Drawer/Dialog) stack over the page. The opener context
    // lets a ClientSide overlay content dispatch its actions against THIS view's component.
    const overlayType = component ? str((component['metadata'] as Json)?.['type']) : '';
    if (action.toLowerCase() === 'add' && (overlayType === 'Drawer' || overlayType === 'Dialog')) {
      this.session.openOverlay(component, state, data, {
        route: this.currentRoute,
        consumedRoute: this.currentConsumedRoute,
        serverSideType: this.currentServerSideType,
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
  mountServerSide(component: unknown): void {
    const node = component as Json;
    this.currentRoute = str(node['route']) || this.currentRoute;
    this.currentServerSideType = str(node['serverSideType']) || this.currentServerSideType;
    this.navigationServerSideType = this.currentServerSideType;
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
          const { route: homeRoute, consumedRoute: homeConsumed, serverSideType: homeSst } = appHomeOf(firstMeta);
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
    seedSearchDefaults(this.currentComponentState);
  }

  private handleCommand(cmd: Json): void {
    const type = str(cmd['type']);
    const cmdData = cmd['data'];
    switch (type) {
      case 'SetWindowTitle': {
        const title = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['title']);
        if (title && !title.startsWith('[')) {
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
        const navTarget = { label: trimSlashes(href), route: href, consumedRoute: '', serverSideType: '' };
        if (this.stackNavigator) {
          // a screen already on the stack is gone back to; a saved form gives its place to the record
          this.stackNavigator(navTarget, isFormRoute(this.currentRoute) && !isFormRoute(href));
        } else if (this.detailOpener) {
          this.detailOpener(navTarget);
        } else {
          this.session.openView({ label: trimSlashes(href), route: href, consumedRoute: '', serverSideType: '' });
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
  }
}

const DISCARD_ACTIONS = new Set(['cancel-edit', 'cancel-view', 'cancel']);
