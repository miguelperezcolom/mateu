import { MateuSession, NavTarget } from './MateuSession';

type Json = Record<string, any>;

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
  private currentInnerRoute = '';
  /** The sst this view was NAVIGATED with (crud orchestrator) — bubbling fallback. */
  private navigationServerSideType = '';
  private orchestratorServerSideType = '';
  /** Guards the bare-App-shell unwrap against a misresolving backend bouncing us forever. */
  private appShellHops = 0;
  private orchestratorComponentRoute = '';

  // Action metadata of the currently-loaded server-side component.
  private currentComponentActions: string[] = [];
  private actionValidationRequired: Record<string, boolean> = {};
  private actionBubble: Record<string, boolean> = {};
  private currentValidations: Json[] = [];

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
  /** Errors/messages silenced (embedded islands). */
  silentErrors = false;

  private dataHandlers: Record<string, (data: unknown) => void> = {};
  private view: RenderedView = { component: null, state: {}, data: null, loading: false, error: null, version: 0 };

  constructor(session: MateuSession) {
    this.session = session;
  }

  get rendered(): RenderedView {
    return this.view;
  }

  registerDataHandler(id: string, handler: (data: unknown) => void): void {
    if (id) this.dataHandlers[id] = handler;
  }

  // ── navigation / actions ────────────────────────────────────────────────────────────

  async initialLoad(route: string): Promise<void> {
    this.publish({ ...this.view, loading: true, error: null });
    try {
      const increment = await this.session.api.initialLoad(route, this.session.appState);
      this.currentRoute = route ?? '';
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
        this.publish({ ...this.view, version: this.view.version + 1 });
        this.session.notify(
          'Revisa los campos',
          Object.entries(errors).map(([f, m]) => `${f}: ${m}`).join('; '),
          'warning',
        );
        return;
      }
    }

    try {
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
    } catch (e) {
      if (silent || this.silentErrors) console.log('[Mateu] action failed:', actionId, errorText(e));
      else this.session.notify(null, `Action failed: ${errorText(e)}`, 'error');
    }
  }

  /** Host hook: asked before a discarding action throws away unsaved changes. */
  confirmDiscard: () => Promise<boolean> = async () => true;

  // ── field state ─────────────────────────────────────────────────────────────────────

  putState(fieldId: string, value: unknown): void {
    this.currentComponentState[fieldId] = value;
    this.markUserEdit();
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
    const actions: string[] = [];
    const validationFlags: Record<string, boolean> = {};
    const bubbleFlags: Record<string, boolean> = {};
    for (const a of asArray(sscNode['actions'])) {
      const id = str(a['id']);
      if (!id) continue;
      actions.push(id);
      validationFlags[id] = a['validationRequired'] === true;
      bubbleFlags[id] = a['bubble'] === true;
    }
    this.currentComponentActions = actions;
    this.actionValidationRequired = validationFlags;
    this.actionBubble = bubbleFlags;
    this.currentValidations = asArray(sscNode['validations']);

    const initialData = (sscNode['initialData'] as Json) ?? {};
    const componentRoute = str(initialData['componentRoute']) || str(initialData['_componentRoute']);
    const sst = str(sscNode['serverSideType']);
    if (componentRoute && sst) {
      this.orchestratorServerSideType = sst;
      this.orchestratorComponentRoute = componentRoute;
    }

    // A freshly-(re)loaded component starts clean; the wire flag says whether to track edits.
    this.trackDirty = sscNode['confirmOnNavigationIfDirty'] === true;
    this.setDirty(false);

    // @SubscribeTo / OnCustomEvent triggers → the session event bus.
    this.session.unsubscribeAll(this);
    for (const trigger of asArray(sscNode['triggers'])) {
      if (String(trigger['type']).toLowerCase() !== 'oncustomevent') continue;
      const eventName = str(trigger['eventName']);
      const actionId = str(trigger['actionId']);
      if (!eventName || !actionId) continue;
      this.session.subscribe(this, eventName, (payload) => {
        const params = payload && typeof payload === 'object' ? (payload as Json) : {};
        void this.runAction(actionId, params, true);
      });
    }
  }

  private ownsAction(actionId: string): boolean {
    for (const owned of this.currentComponentActions) {
      if (owned === actionId) return true;
      if (owned.endsWith('*') && actionId.startsWith(owned.slice(0, -1))) return true;
    }
    return false;
  }

  private resolveActionTarget(actionId: string): string {
    const bubble = !this.ownsAction(actionId) || this.actionBubble[actionId] === true;
    if (
      bubble &&
      this.orchestratorServerSideType &&
      this.orchestratorServerSideType !== this.currentServerSideType &&
      this.currentRoute.startsWith(this.orchestratorComponentRoute)
    ) {
      return this.orchestratorServerSideType;
    }
    // Unowned action on an inner view (e.g. "edit" on a crud detail): bubble to the sst the view
    // was navigated with (the crud orchestrator).
    if (bubble && this.navigationServerSideType && this.navigationServerSideType !== this.currentServerSideType) {
      return this.navigationServerSideType;
    }
    return this.currentServerSideType;
  }

  private collectFieldErrors(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const v of this.currentValidations) {
      const condition = str(v['condition']);
      if (condition && !evalCondition(condition, this.currentComponentState)) {
        const fieldId = str(v['fieldId']);
        if (!(fieldId in errors)) errors[fieldId] = str(v['message']) || 'Invalid value';
      }
    }
    return errors;
  }

  // ── increment application ───────────────────────────────────────────────────────────

  applyIncrement(increment: Json): void {
    for (const fragment of asArray(increment['fragments'])) this.applyFragment(fragment);

    for (const msg of asArray(increment['messages'])) {
      const text = str(msg['text']);
      if (!text) continue;
      const variant = (str(msg['variant']) || 'info') as 'info' | 'warning' | 'error';
      if (this.silentErrors) console.log(`[Mateu] ${variant}: ${text}`);
      else this.session.notify(str(msg['title']) || null, text, variant);
    }

    for (const cmd of asArray(increment['commands'])) this.handleCommand(cmd);

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

    // Overlay fragments (action Add + Drawer/Dialog) stack over the page.
    const overlayType = component ? str((component['metadata'] as Json)?.['type']) : '';
    if (action.toLowerCase() === 'add' && (overlayType === 'Drawer' || overlayType === 'Dialog')) {
      this.session.openOverlay(component, state, data);
      return;
    }

    if (!component) {
      // Data-only fragment — push to a registered data handler (e.g. Crud search results).
      if (data !== null && data !== undefined) {
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
        if (this.currentInnerRoute && trimSlashes(routeSuffix) === this.currentInnerRoute) {
          // Same inner route: stay put — a RunAction command in the same increment refreshes data.
          Object.assign(this.currentComponentState, state);
          return;
        }
        const fullRoute = base + routeSuffix;
        const sst =
          this.orchestratorServerSideType && this.orchestratorComponentRoute === stateComp
            ? this.orchestratorServerSideType
            : this.navigationServerSideType || this.currentServerSideType;
        const isDetail = routeSuffix !== '' && fullRoute !== base;
        if (this.detailOpener && isDetail) {
          this.detailOpener({ label: detailLabel(routeSuffix), route: fullRoute, consumedRoute: base, serverSideType: sst });
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
    this.renderComponentFragment(node, (node['initialData'] as Json) ?? {}, null);
  }

  /** Renders a component fragment: ServerSide wrappers unwrap here (mediator App → follow-up
   *  navigation; inline children → captured + rendered; no children → background load). */
  private renderComponentFragment(component: Json, state: Json, data: unknown): void {
    // A bare App shell answering a MENU navigation (route resolved through the app class):
    // don't render the chrome — follow its home route to the actual content.
    const meta = (component['metadata'] as Json) ?? {};
    if (component['type'] !== 'ServerSide' && meta['type'] === 'App') {
      const homeRoute = str(meta['homeRoute']);
      const homeConsumed = str(meta['homeConsumedRoute']);
      const homeSst = str(meta['homeServerSideType']) || str(meta['serverSideType']);
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
        if (firstIsApp) {
          // Crud MEDIATOR shell: don't render the App chrome — navigate to its home route.
          const homeRoute = str(firstMeta['homeRoute']);
          const homeConsumed = str(firstMeta['homeConsumedRoute']);
          const homeSst = str(firstMeta['homeServerSideType']) || str(firstMeta['serverSideType']);
          if (homeRoute || homeSst) void this.navigate(homeRoute, homeConsumed, homeSst);
          return;
        }
        if (id) this.currentComponentId = id;
        if (sst) this.currentServerSideType = sst;
        this.captureComponentContext(component);
        const initialData = (component['initialData'] as Json) ?? {};
        this.currentComponentState = { ...initialData };
        this.fieldErrors = {};
        this.publish({
          component: children.length === 1 ? children[0] : { children },
          state: initialData,
          data,
          loading: false,
          error: null,
          version: this.view.version + 1,
        });
        this.fireOnLoadTriggers(asArray(component['triggers']));
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
      const actionId = str(trigger['actionId']);
      if (!actionId) continue;
      if (actionId === 'search') this.seedSearchState();
      void this.runAction(actionId, undefined, true);
    }
  }

  seedSearchState(): void {
    const s = this.currentComponentState;
    if (s['page'] === undefined) s['page'] = 0;
    if (s['size'] === undefined) s['size'] = 10;
    if (s['sort'] === undefined) s['sort'] = [];
    if (s['searchText'] === undefined) s['searchText'] = '';
  }

  private handleCommand(cmd: Json): void {
    const type = str(cmd['type']);
    const cmdData = cmd['data'];
    switch (type) {
      case 'SetWindowTitle': {
        const title = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['title']);
        if (title && !title.startsWith('[')) this.session.setTitle(title);
        break;
      }
      case 'NavigateTo': {
        const href = typeof cmdData === 'string' ? cmdData : str((cmdData as Json)?.['href']);
        if (!href) break;
        if (this.detailOpener) {
          this.detailOpener({ label: trimSlashes(href), route: href, consumedRoute: '', serverSideType: '' });
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
      default:
        break;
    }
  }

  private dispatchNamedEvent(cmdData: Json | null | undefined): void {
    const eventName = str(cmdData?.['eventName']);
    if (!eventName) return;
    const payload = cmdData?.['payload'] ?? cmdData?.['detail'] ?? null;
    this.session.dispatchEvent(eventName, payload);
  }

  private publish(view: RenderedView): void {
    this.view = view;
    this.onRender(view);
  }
}

const DISCARD_ACTIONS = new Set(['cancel-edit', 'cancel-view', 'cancel']);

// ── helpers ─────────────────────────────────────────────────────────────────────────────

function asArray(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value);
}

function trimSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, '');
}

function detailLabel(routeSuffix: string): string {
  const seg = trimSlashes(routeSuffix).split('/').pop() ?? '';
  if (!seg) return 'Detail';
  return seg.toLowerCase() === 'new' ? 'New' : seg;
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

/** Client-side validation conditions: `state['x']` truthiness and simple numeric comparisons. */
function evalCondition(condition: string, state: Json): boolean {
  const comparison = /state\['([^']+)'\]\s*(>=|<=|==|!=|>|<)\s*(-?\d+(?:\.\d+)?)/.exec(condition.trim());
  if (comparison) {
    const left = toNumber(state[comparison[1]]);
    const right = Number(comparison[3]);
    switch (comparison[2]) {
      case '>=': return left >= right;
      case '<=': return left <= right;
      case '>': return left > right;
      case '<': return left < right;
      case '==': return left === right;
      case '!=': return left !== right;
      default: return true;
    }
  }
  const truthy = /state\['([^']+)'\]/.exec(condition.trim());
  if (truthy) return isTruthy(state[truthy[1]]);
  return true;
}

function isTruthy(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'boolean') return v;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

function toNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''));
  return Number.isNaN(n) ? 0 : n;
}
