/**
 * Reading and operating the screen the user has open (conformance/mcp/README.md, "Reading and
 * operating the screen the user has open"): the live-push channel delivers `query` messages —
 * `describe-screen`, `set-fields`, `run-action` — and this app answers each through the app-level
 * `_agent-screen` action with what it shows (core/screenSummary.ts) or why it refused.
 *
 * Everything an agent does here goes through the paths a user's own touch takes: a field is
 * written with the controller's `putState` (rules, OnValueChange, dirty state), an action is
 * pressed with `runAction` (validation, the leave question, the action's confirmation — shown to
 * the USER, who answers it), a row is opened as a press on it. Pure logic over small interfaces
 * (unit-tested); the React side wires the real controllers in (renderer/AgentPush.tsx).
 */
import { buildScreenSummary, editableTargets, focusOf, offeredAction, offeredActionIds, OPEN_ROW_ACTION, pageOf, type SummaryMessage, MAX_MESSAGES } from './screenSummary.ts';

type Json = Record<string, unknown>;

export const AGENT_SCREEN_ACTION = '_agent-screen';
export const QUERY_KIND = 'query';
export const QUERY_EVENTS = ['describe-screen', 'set-fields', 'run-action'] as const;
export type QueryEvent = (typeof QUERY_EVENTS)[number];

/** How long after the last query the "an agent is operating this screen" notice stays. */
export const OPERATING_WINDOW_MS = 120_000;
/** How long a press waits for the screen to settle before it answers what is there. */
export const SETTLE_MS = 6_000;

export interface AgentQuery {
  event: QueryEvent;
  requestId: string;
  detail: Json;
}

export type AgentAnswer = { screen: Json } | { error: { code: string; id?: string } };

const isObj = (v: unknown): v is Json => !!v && typeof v === 'object' && !Array.isArray(v);

/** A `query` message as a query, or null (not one, or malformed: no requestId). */
export function agentQueryOf(kind: string, event: string, detail: unknown): AgentQuery | null {
  if (kind !== QUERY_KIND || !(QUERY_EVENTS as readonly string[]).includes(event)) return null;
  const d = isObj(detail) ? detail : {};
  const requestId = d['requestId'];
  if (typeof requestId !== 'string' || !requestId) return null;
  return { event: event as QueryEvent, requestId, detail: d };
}

/** The `_agent-screen` parameters answering `query` (besides the session id + secret). */
export function answerParameters(query: AgentQuery, answer: AgentAnswer): Json {
  return 'screen' in answer ? { requestId: query.requestId, screen: answer.screen } : { requestId: query.requestId, error: answer.error };
}

// ── what the screen is made of ───────────────────────────────────────────────────────────────

/** A listing as the agent drives it: its search box, filters, pager and rows. */
export interface ListingDriver {
  searchText(): string;
  setSearchText(text: string): void;
  setFilter(fieldId: string, value: unknown): void;
  search(): void;
  changePage(delta: number): void;
  /** Opens the row as a press on it does; false when the listing's rows do not open. */
  openRow(row: Json): boolean;
}

/** What a view controller offers (MateuViewController satisfies it). */
export interface ScreenView {
  currentRoute: string;
  currentComponentState: Json;
  rendered: { component: unknown; state: Json; data: unknown };
  fieldErrors: Record<string, string>;
  fieldAttributes: Record<string, Json>;
  listingPages: Record<string, unknown>;
  listingDrivers: Record<string, ListingDriver>;
  /** The window title the view shows. */
  readonly shownTitle?: string;
  putState(fieldId: string, value: unknown): void;
  runAction(actionId: string, parameters?: Json): Promise<unknown>;
}

/**
 * Per app (shared by its islands): the views on screen as the agent reads them, the shell, the
 * last messages, and whether an agent is operating it now (the notice).
 */
export class AgentScreenRegistry {
  /** The view in the content area (set by the shell with each screen). */
  page: ScreenView | null = null;
  /** The open overlays, bottom to top (set by the overlay host). */
  overlays: () => { component: unknown; view: ScreenView | null }[] = () => [];
  /** The app shell's metadata (context selectors, header actions, the user). */
  app: Json | null = null;
  /** The window title on show. */
  windowTitle = '';
  /** Runs an app-level header action (set by the shell). */
  runAppAction: ((actionId: string) => Promise<unknown>) | null = null;
  /** Navigates as a button with a route does (set by the shell). */
  navigate: ((route: string) => void) | null = null;
  private recent: SummaryMessage[] = [];
  private lastQueryAt = 0;
  private listeners = new Set<() => void>();
  private readonly now: () => number;

  constructor(now: () => number = Date.now) {
    this.now = now;
  }

  /** A toast the user was shown (the last ten are part of the screen). */
  noteMessage(message: SummaryMessage): void {
    this.recent = [...this.recent, message].slice(-MAX_MESSAGES);
  }

  get messages(): SummaryMessage[] {
    return this.recent;
  }

  /** An agent asked something: the notice shows (again) and stays OPERATING_WINDOW_MS. */
  noteQuery(): void {
    const was = this.operating();
    this.lastQueryAt = this.now();
    if (!was) this.emit();
  }

  /** The agent was stopped (Stop) or unpaired: the notice goes at once. */
  stopOperating(): void {
    if (!this.lastQueryAt) return;
    this.lastQueryAt = 0;
    this.emit();
  }

  operating(at: number = this.now()): boolean {
    return this.lastQueryAt > 0 && at - this.lastQueryAt < OPERATING_WINDOW_MS;
  }

  /** When the notice goes by itself (0: not shown). */
  operatingUntil(): number {
    return this.lastQueryAt ? this.lastQueryAt + OPERATING_WINDOW_MS : 0;
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((l) => {
      try {
        l();
      } catch {
        /* keep the others */
      }
    });
  }

  /** The view in front: the top overlay's when one is open, else the page's. */
  front(): { view: ScreenView | null; overlay: { component: unknown; view: ScreenView | null } | null } {
    const stack = this.overlays();
    const top = stack.length ? stack[stack.length - 1] : null;
    return top ? { view: top.view, overlay: top } : { view: this.page, overlay: null };
  }

  /** The summary of what is on screen now, or null when nothing is. */
  describe(appState: Json = {}): Json | null {
    const page = this.page;
    const { overlay } = this.front();
    if (!page && !overlay) return null;
    return buildScreenSummary({
      route: page?.currentRoute ?? '',
      windowTitle: this.windowTitle || page?.shownTitle || null,
      view: page ? summaryView(page) : null,
      overlay: overlay ? { component: overlay.component, view: overlay.view ? summaryView(overlay.view) : { content: null } } : null,
      app: this.app,
      appState,
      messages: this.recent,
    });
  }
}

function summaryView(v: ScreenView) {
  const searchTexts: Record<string, string> = {};
  for (const [id, d] of Object.entries(v.listingDrivers ?? {})) {
    try {
      searchTexts[id] = d.searchText();
    } catch {
      /* a listing gone meanwhile */
    }
  }
  return {
    content: v.rendered?.component ?? null,
    state: { ...(v.rendered?.state ?? {}), ...(v.currentComponentState ?? {}) },
    fieldErrors: v.fieldErrors,
    fieldAttributes: v.fieldAttributes,
    listings: v.listingPages,
    searchTexts,
  };
}

// ── answering ────────────────────────────────────────────────────────────────────────────────

export interface QueryDeps {
  registry: AgentScreenRegistry;
  appState: Json;
  /** Waits until the app has no call of its own in flight (≤ SETTLE_MS). */
  idle: () => Promise<void>;
  /** Lets the screen repaint what changed (a React commit) before it is read again. */
  repaint?: () => Promise<void>;
}

const refuse = (code: string, id?: string): AgentAnswer => ({ error: id === undefined ? { code } : { code, id } });

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
const defaultRepaint = () => delay(120);

/** At most `ms` for `p`; whatever it does, the answer is not held longer. */
async function bounded(p: unknown, ms: number): Promise<void> {
  await Promise.race([Promise.resolve(p).catch(() => undefined), delay(ms)]);
}

/** Answers one query (see the module comment). Never throws: a failure is `failed`. */
export async function answerQuery(query: AgentQuery, deps: QueryDeps): Promise<AgentAnswer> {
  try {
    return await answer(query, deps);
  } catch {
    return refuse('failed');
  }
}

async function answer(query: AgentQuery, deps: QueryDeps): Promise<AgentAnswer> {
  const { registry } = deps;
  const repaint = deps.repaint ?? defaultRepaint;
  const describe = () => registry.describe(deps.appState);
  const settled = async () => {
    await deps.idle();
    await repaint();
    const after = describe();
    return after ? { screen: after } : refuse('unsupported');
  };
  const summary = describe();
  if (!summary) return refuse('unsupported');
  if (query.event === 'describe-screen') return { screen: summary };

  const { view } = registry.front();

  if (query.event === 'set-fields') {
    const values = isObj(query.detail['values']) ? (query.detail['values'] as Json) : {};
    const targets = editableTargets(summary);
    for (const id of Object.keys(values)) if (!targets.has(id)) return refuse('unknownField', id);
    if (!view) return refuse('unsupported');
    for (const [id, value] of Object.entries(values)) {
      const where = targets.get(id)!;
      if (where === 'field') {
        view.putState(id, value);
        continue;
      }
      const [kind, listing] = [where.slice(0, where.indexOf(':')), where.slice(where.indexOf(':') + 1)];
      const driver = view.listingDrivers[listing] ?? view.listingDrivers['crud'];
      if (!driver) return refuse('unsupported');
      if (kind === 'searchText') driver.setSearchText(value === null || value === undefined ? '' : String(value));
      else driver.setFilter(id, value);
    }
    return settled();
  }

  // run-action
  const actionId = typeof query.detail['actionId'] === 'string' ? (query.detail['actionId'] as string) : '';
  const parameters = isObj(query.detail['parameters']) ? (query.detail['parameters'] as Json) : {};
  if (!actionId || !offeredActionIds(summary).has(actionId)) return refuse('unknownAction', actionId);
  const offered = offeredAction(summary, actionId);
  if (offered && offered['enabled'] === false) return refuse('disabledAction', actionId);

  // a header action of the app shell
  const appAction = (Array.isArray(summary['appActions']) ? (summary['appActions'] as Json[]) : []).some(function has(a): boolean {
    return a['id'] === actionId || (Array.isArray(a['children']) && (a['children'] as Json[]).some(has));
  });
  const front = focusOf(summary);
  const inFront = offeredActionIdsOfPart(front).has(actionId);
  if (appAction && !inFront) {
    if (!registry.runAppAction) return refuse('unsupported');
    await bounded(registry.runAppAction(actionId), SETTLE_MS);
    return settled();
  }
  if (!view) return refuse('unsupported');

  const rowIndex = typeof query.detail['row'] === 'number' ? (query.detail['row'] as number) : undefined;
  const listings = Array.isArray(front['listings']) ? (front['listings'] as Json[]) : [];
  const listingId = typeof query.detail['listing'] === 'string' ? (query.detail['listing'] as string) : (listings[0]?.['id'] as string | undefined);
  const builtIn = actionId === 'search' || actionId === 'nextPage' || actionId === 'prevPage';
  if (builtIn || actionId === OPEN_ROW_ACTION || rowIndex !== undefined) {
    const driver = listingId ? view.listingDrivers[listingId] ?? view.listingDrivers['crud'] : undefined;
    if (builtIn) {
      if (!driver) return refuse('unsupported');
      if (actionId === 'search') driver.search();
      else driver.changePage(actionId === 'nextPage' ? 1 : -1);
      return settled();
    }
    const rows = listingId ? rawRows(view, listingId) : [];
    const row = rowIndex !== undefined ? rows[rowIndex] : undefined;
    if (!isObj(row)) return refuse('unknownRow', String(rowIndex ?? ''));
    if (actionId === OPEN_ROW_ACTION) {
      if (!driver || !driver.openRow(row)) return refuse('unsupported');
      return settled();
    }
    // a row action: the row as the press of its cell sends it (wireWidgets.rowActionParameters)
    const rowParams = actionId.startsWith('action-on-row-') ? { _clickedRow: row } : { ...row };
    await bounded(view.runAction(actionId, { ...rowParams, ...parameters }), SETTLE_MS);
    return settled();
  }

  // a button with a route navigates, as its press does
  if (offered && typeof offered['navigatesTo'] === 'string' && offered['id'] === offered['navigatesTo']) {
    if (!registry.navigate) return refuse('unsupported');
    registry.navigate(offered['navigatesTo'] as string);
    return settled();
  }
  await bounded(view.runAction(actionId, Object.keys(parameters).length ? parameters : undefined), SETTLE_MS);
  return settled();
}

function offeredActionIdsOfPart(part: Json): Set<string> {
  return offeredActionIds({ ...part, appActions: [] });
}

/** The rows of a listing's current page as the view painted them (uncapped: what a press gets). */
export function rawRows(view: ScreenView, listingId: string): unknown[] {
  const page = pageOf(view.listingPages?.[listingId] ?? view.listingPages?.['crud']);
  return page && Array.isArray(page['content']) ? (page['content'] as unknown[]) : [];
}

/**
 * Resolves when `busy()` has been false (checked as it changes, via `subscribe`), or after `ms`.
 * A short grace first: a press dispatches its call on the next tick.
 */
export function waitIdle(busy: () => boolean, subscribe: (l: (busy: boolean) => void) => () => void, ms: number = SETTLE_MS): Promise<void> {
  return new Promise<void>((resolve) => {
    let done = false;
    let off: (() => void) | undefined;
    const finish = () => {
      if (done) return;
      done = true;
      off?.();
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(finish, ms);
    setTimeout(() => {
      if (done) return;
      if (!busy()) return finish();
      off = subscribe((b) => {
        if (!b) finish();
      });
    }, 30);
  });
}
