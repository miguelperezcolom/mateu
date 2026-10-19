/**
 * The assistant chat (App.sseUrl / the Chat component), as pure logic: the request body, the SSE
 * stream read BY EVENT, the answer it builds, the progress and token lines, and what each UI event
 * the agent emits asks the app to do. ChatPanel.tsx only drives it.
 *
 * A port of libs/mateu infra/ui/chatStream.ts (the web renderer) and apps/redwood/poc/chat.mjs —
 * same semantics, keep them in step. What a payload can be:
 *  - `{"inputTokens":…,"outputTokens":…,"totalTokens":…}` — usage (all-zero = placeholder, ignored);
 *  - `{"event":"agent-delta","detail":{"text":"…"}}` — a piece of the answer, APPENDED;
 *  - `{"event":"agent-status","detail":{"phase":"…","text":"…"}}` — what the agent is doing;
 *  - `{"event":"agent-tool","detail":{"name","server","kind","phase":"start|end","ms","error"}}`;
 *  - `{"event":"agent-error","detail":{"message":"…"}}` — shown as the answer;
 *  - any other `{"event":…}` — a UI event (navigation-requested, close-requested, render-screen, …);
 *  - anything else — answer text. After deltas, the next one is the whole, final answer and REPLACES
 *    them; without deltas each one is a LINE of the answer (joined with '\n', so markdown survives).
 */

type Json = Record<string, unknown>;

export const CHAT_TEXTS = {
  thinking: 'Thinking…',
  answering: 'Answering…',
  callingTool: 'Calling {name}…',
  agentError: 'The assistant failed',
  noAnswer: '⚠️ The assistant gave no answer.',
  errorPrefix: '⚠️ ',
  tool: 'tool',
} as const;

// ── request ──────────────────────────────────────────────────────────────────────────────────

/**
 * A url the app declared (sseUrl, uploadUrl, mcpUrl), resolved against the app's backend base url
 * with URL semantics: absolute stays, `//host/x` takes the base's scheme, `/x` the base's origin,
 * `x` the base's directory. Done by hand: React Native's URL polyfill does not resolve relative urls.
 */
export function resolveChatUrl(url: string | null | undefined, baseUrl: string): string {
  const u = (url ?? '').trim();
  if (!u) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return u;
  const m = /^([a-z][a-z0-9+.-]*:)(\/\/[^/?#]*)?([^?#]*)/i.exec(baseUrl.trim());
  if (!m) return u;
  const [, scheme, authority = '', path] = m;
  if (u.startsWith('//')) return scheme + u;
  const origin = scheme + authority;
  if (u.startsWith('/')) return origin + u;
  if (u.startsWith('?') || u.startsWith('#')) return origin + (path || '/') + u;
  const dir = (path || '/').replace(/[^/]*$/, '');
  return origin + (dir.startsWith('/') ? dir : '/' + dir) + u;
}

/** The navigation a menu entry (or the agent) names — what a menu click carries. */
export interface ChatNavigation {
  route: string;
  consumedRoute: string;
  actionId: string;
  baseUrl?: string;
  serverSideType?: string;
  uriPrefix?: string;
}

export interface MenuContextEntry {
  path: string[];
  description?: string;
  navigation: ChatNavigation;
}

interface MenuOptionLike {
  label?: string;
  separator?: boolean;
  remote?: boolean;
  route?: string;
  consumedRoute?: string;
  actionId?: string | null;
  baseUrl?: string;
  serverSideType?: string;
  uriPrefix?: string;
  description?: string | null;
  submenus?: MenuOptionLike[] | null;
}

/** The menu flattened into LLM-friendly entries: breadcrumb + the navigation to emit to open it. */
export function menuContextOf(options: unknown, parentPath: string[] = []): MenuContextEntry[] {
  const out: MenuContextEntry[] = [];
  for (const opt of Array.isArray(options) ? (options as MenuOptionLike[]) : []) {
    // separators are not places; an unresolved remote entry points at the remote loader
    if (!opt || opt.separator || opt.remote) continue;
    const path = [...parentPath, opt.label ?? ''];
    if (opt.submenus && opt.submenus.length > 0) {
      out.push(...menuContextOf(opt.submenus, path));
      continue;
    }
    const entry: MenuContextEntry = {
      path,
      navigation: {
        route: opt.route ?? '',
        consumedRoute: opt.consumedRoute ?? '',
        actionId: opt.actionId ?? '',
        baseUrl: opt.baseUrl,
        serverSideType: opt.serverSideType,
        uriPrefix: opt.uriPrefix,
      },
    };
    if (opt.description) entry.description = opt.description;
    out.push(entry);
  }
  return out;
}

export interface ScreenField {
  id: string;
  label: string;
  dataType: string;
  value?: unknown;
}

export interface ScreenAction {
  id: string;
  label: string;
}

export interface ScreenProjection {
  title?: string;
  fields: ScreenField[];
  actions: ScreenAction[];
}

const typeOf = (node: unknown): string | undefined => {
  const md = (node as Json | null)?.['metadata'] as Json | undefined;
  return typeof md?.['type'] === 'string' ? (md['type'] as string) : undefined;
};

/**
 * A self-describing projection of what is on screen (fields with type/label/value + the actions
 * its buttons run) — the shape an MCP agent gets, derived from the rendered wire tree.
 */
export function projectScreen(component: unknown, state: Json | null | undefined): ScreenProjection {
  const fields: ScreenField[] = [];
  const actions: ScreenAction[] = [];
  const seenFields = new Set<string>();
  const seenActions = new Set<string>();
  let title: string | undefined;
  const seen = new Set<unknown>();
  const values = state ?? {};
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const md = (node as Json)['metadata'] as Json | undefined;
    const t = typeOf(node);
    if (md && t === 'FormField' && typeof md['fieldId'] === 'string' && !seenFields.has(md['fieldId'] as string)) {
      const id = md['fieldId'] as string;
      seenFields.add(id);
      const field: ScreenField = { id, label: String(md['label'] ?? id), dataType: String(md['dataType'] ?? 'string') };
      if (Object.prototype.hasOwnProperty.call(values, id)) field.value = values[id];
      fields.push(field);
    } else if (md && t === 'Button' && typeof md['actionId'] === 'string' && md['actionId'] && !seenActions.has(md['actionId'] as string)) {
      seenActions.add(md['actionId'] as string);
      actions.push({ id: md['actionId'] as string, label: String(md['label'] ?? md['actionId']) });
    } else if (md && (t === 'Page' || t === 'Form') && title === undefined) {
      const tt = md['pageTitle'] ?? md['title'];
      if (typeof tt === 'string' && tt) title = tt;
    }
    for (const v of Object.values(node as Json)) if (v && typeof v === 'object') visit(v);
  };
  visit(component);
  const screen: ScreenProjection = { fields, actions };
  if (title) screen.title = title;
  return screen;
}

/** What the user is looking at, as the host knows it. */
export interface ChatScreenSnapshot {
  route: string;
  title?: string;
  componentState?: Json;
  component?: unknown;
}

export interface ChatBodyInput {
  message: string;
  sessionId: string;
  attachments?: { name: string; path: string }[];
  screen?: ChatScreenSnapshot | null;
  appState?: Json;
  /** Already resolved (absolute). */
  mcpUrl?: string;
  /** Sent with the FIRST message only — the caller passes it then. */
  menuContext?: MenuContextEntry[];
}

/** The JSON body of one message; absent keys are omitted. */
export function chatRequestBody(input: ChatBodyInput): Json {
  const body: Json = { message: input.message, sessionId: input.sessionId };
  if (input.attachments && input.attachments.length) body['attachments'] = input.attachments;
  const s = input.screen;
  if (s) {
    body['currentRoute'] = s.route;
    const projection = s.component ? projectScreen(s.component, s.componentState) : null;
    const screenTitle = s.title ?? projection?.title;
    const context: Json = { route: s.route };
    if (screenTitle) context['screenTitle'] = screenTitle;
    if (input.appState) context['appState'] = input.appState;
    context['componentState'] = s.componentState ?? {};
    body['context'] = context;
    if (projection && (projection.fields.length || projection.actions.length || projection.title)) body['screen'] = projection;
  } else if (input.appState) {
    body['context'] = { appState: input.appState };
  }
  if (input.mcpUrl) body['mcpUrl'] = input.mcpUrl;
  if (input.menuContext) body['menuContext'] = input.menuContext;
  return body;
}

/** The upload endpoint's answer: the saved files, as the message's `attachments`. */
export function uploadedFiles(response: unknown): { name: string; path: string }[] {
  const files = (response as { files?: unknown } | null)?.files;
  if (!Array.isArray(files)) return [];
  return files
    .filter((f): f is { name?: unknown; path: string } => !!f && typeof f === 'object' && typeof (f as Json)['path'] === 'string' && !!(f as Json)['path'])
    .map((f) => ({ name: typeof f.name === 'string' && f.name ? f.name : f.path, path: f.path }));
}

// ── response: SSE ────────────────────────────────────────────────────────────────────────────

/**
 * An SSE parser: feed it text as it arrives, in pieces of any size; it returns the data of every
 * event a blank line completed. `data:` lines join with '\n'; only the one optional space after
 * `data:` is dropped (indentation survives); comments and other fields are ignored; CRLF/CR/LF, a CR
 * split from its LF across pieces. `end()` flushes an event the stream ended without a blank line.
 */
export class SseParser {
  private buffer = '';
  private data: string[] = [];
  private hasData = false;

  push(text: string): string[] {
    this.buffer += text;
    const out: string[] = [];
    for (;;) {
      const m = /\r\n|\r|\n/.exec(this.buffer);
      if (!m) break;
      if (m[0] === '\r' && m.index === this.buffer.length - 1) break;
      const line = this.buffer.slice(0, m.index);
      this.buffer = this.buffer.slice(m.index + m[0].length);
      this.line(line, out);
    }
    return out;
  }

  end(): string[] {
    const out: string[] = [];
    if (this.buffer) {
      this.line(this.buffer.replace(/\r$/, ''), out);
      this.buffer = '';
    }
    this.dispatch(out);
    return out;
  }

  private line(line: string, out: string[]) {
    if (line === '') {
      this.dispatch(out);
      return;
    }
    if (line.startsWith(':')) return;
    const colon = line.indexOf(':');
    const field = colon < 0 ? line : line.slice(0, colon);
    if (field !== 'data') return;
    let value = colon < 0 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    this.data.push(value);
    this.hasData = true;
  }

  private dispatch(out: string[]) {
    if (this.hasData) out.push(this.data.join('\n'));
    this.data = [];
    this.hasData = false;
  }
}

export interface TokenUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface AgentStatusDetail {
  phase?: string;
  text?: string;
  [key: string]: unknown;
}

export interface AgentToolDetail {
  name?: string;
  server?: string;
  kind?: string;
  phase?: string;
  ms?: number;
  error?: string;
}

export type ChatStreamMessage =
  | { kind: 'usage'; usage: TokenUsage }
  | { kind: 'delta'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'status'; detail: AgentStatusDetail }
  | { kind: 'tool'; detail: AgentToolDetail }
  | { kind: 'error'; message: string }
  | { kind: 'event'; event: string; detail: unknown };

const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** What one event's data is. */
export function classifyChatPayload(payload: string): ChatStreamMessage {
  const trimmed = payload.trim();
  if (trimmed.startsWith('{')) {
    let obj: Json | null = null;
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) obj = parsed as Json;
    } catch {
      // not JSON: text
    }
    if (obj) {
      if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return { kind: 'usage', usage: obj as TokenUsage };
      if (typeof obj['event'] === 'string') {
        const detail = (obj['detail'] ?? {}) as Json;
        switch (obj['event']) {
          case 'agent-delta':
            return { kind: 'delta', text: typeof detail['text'] === 'string' ? detail['text'] : '' };
          case 'agent-status':
            return { kind: 'status', detail: detail as AgentStatusDetail };
          case 'agent-tool':
            return { kind: 'tool', detail: detail as AgentToolDetail };
          case 'agent-error':
            return { kind: 'error', message: String(detail['message'] ?? CHAT_TEXTS.agentError) };
          default:
            return { kind: 'event', event: obj['event'] as string, detail: obj['detail'] ?? {} };
        }
      }
    }
  }
  return { kind: 'text', text: payload };
}

/** A usage object that says nothing: every counter it has is zero (older agents' placeholders). */
export function isEmptyUsage(usage: TokenUsage | null | undefined): boolean {
  if (!usage) return true;
  const values = [usage.inputTokens, usage.outputTokens, usage.totalTokens].filter(isNumber);
  return values.length === 0 || values.every((v) => v === 0);
}

const count = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** «1,234 tokens (in 1,000 · out 234)»; null when the usage says nothing. */
export function usageLine(usage: TokenUsage | null | undefined): string | null {
  if (!usage || isEmptyUsage(usage)) return null;
  const { inputTokens: i, outputTokens: o } = usage;
  const total = isNumber(usage.totalTokens) && usage.totalTokens > 0 ? usage.totalTokens : (isNumber(i) ? i : 0) + (isNumber(o) ? o : 0);
  const parts = [isNumber(i) ? `in ${count(i)}` : null, isNumber(o) ? `out ${count(o)}` : null].filter(Boolean);
  return `${count(total)} tokens${parts.length ? ` (${parts.join(' · ')})` : ''}`;
}

/** The answer of one turn, as the stream builds it. */
export class ChatAnswer {
  text = '';
  private streamed = false;

  delta(piece: string): string {
    this.text += piece;
    this.streamed = true;
    return this.text;
  }

  line(text: string): string {
    if (this.streamed) {
      this.text = text;
      this.streamed = false;
    } else {
      this.text = this.text ? this.text + '\n' + text : text;
    }
    return this.text;
  }

  error(message: string): string {
    this.text = CHAT_TEXTS.errorPrefix + message;
    this.streamed = false;
    return this.text;
  }
}

export interface ChatToolStep {
  name: string;
  server?: string;
  kind?: string;
  ms?: number;
  error?: string;
  running: boolean;
}

/** What the agent is doing, as the status and tool events say. */
export class ChatProgress {
  phase?: string;
  statusText?: string;
  since: number;
  steps: ChatToolStep[] = [];
  answering = false;
  reported = false;

  constructor(now: number) {
    this.since = now;
  }

  status(detail: AgentStatusDetail, now: number) {
    this.reported = true;
    const text = typeof detail.text === 'string' ? detail.text : undefined;
    if (detail.phase !== this.phase || text !== this.statusText || this.answering) this.since = now;
    this.phase = detail.phase;
    this.statusText = text;
    this.answering = false;
  }

  tool(detail: AgentToolDetail, now: number) {
    this.reported = true;
    const name = detail.name ?? CHAT_TEXTS.tool;
    if (detail.phase === 'start') {
      this.steps = [...this.steps, { name, server: detail.server, kind: detail.kind, running: true }];
      this.since = now;
      this.answering = false;
      return;
    }
    const steps = this.steps.slice();
    let i = steps.length - 1;
    while (i >= 0 && !(steps[i].running && steps[i].name === name)) i--;
    const done: ChatToolStep = { name, server: detail.server, kind: detail.kind, ms: detail.ms, error: detail.error, running: false };
    if (i >= 0) steps[i] = done;
    else steps.push(done);
    this.steps = steps;
    this.since = now;
  }

  text(now: number) {
    if (!this.answering) this.since = now;
    this.answering = true;
  }

  get runningTool(): ChatToolStep | undefined {
    for (let i = this.steps.length - 1; i >= 0; i--) if (this.steps[i].running) return this.steps[i];
    return undefined;
  }

  /** The one line under the conversation; the panel's own «Thinking…» when nothing was reported. */
  line(now: number): string {
    const secs = Math.max(0, Math.floor((now - this.since) / 1000));
    const withSecs = (s: string) => (secs > 0 ? `${s} ${secs} s` : s);
    const running = this.runningTool;
    if (running) return withSecs(CHAT_TEXTS.callingTool.replace('{name}', running.name));
    if (this.answering) return CHAT_TEXTS.answering;
    return withSecs(this.statusText || CHAT_TEXTS.thinking);
  }
}

/** One UI event the agent emitted. */
export interface ChatUiEvent {
  event: string;
  detail: unknown;
}

/** What one piece of the stream changed. */
export interface ChatTurnUpdate {
  /** The answer changed (delta / text / error). */
  answer: boolean;
  /** The progress or the token line changed. */
  progress: boolean;
  /** UI events, in arrival order — to be applied NOW, mid-stream. */
  events: ChatUiEvent[];
}

/** One turn of the conversation: the stream in, the answer + progress + usage + events out. */
export class ChatTurn {
  readonly answer = new ChatAnswer();
  readonly progress: ChatProgress;
  usage: TokenUsage | null = null;
  private readonly parser = new SseParser();

  constructor(now: number) {
    this.progress = new ChatProgress(now);
  }

  push(chunk: string, now: number): ChatTurnUpdate {
    return this.apply(this.parser.push(chunk), now);
  }

  end(now: number): ChatTurnUpdate {
    return this.apply(this.parser.end(), now);
  }

  /** The text the bubble shows once the stream is over. */
  get finalText(): string {
    return this.answer.text || CHAT_TEXTS.noAnswer;
  }

  private apply(payloads: string[], now: number): ChatTurnUpdate {
    const update: ChatTurnUpdate = { answer: false, progress: false, events: [] };
    for (const payload of payloads) {
      const msg = classifyChatPayload(payload);
      switch (msg.kind) {
        case 'usage':
          // the LAST usage is the turn's, not a sum; placeholders say nothing
          if (!isEmptyUsage(msg.usage)) {
            this.usage = msg.usage;
            update.progress = true;
          }
          break;
        case 'delta':
          this.answer.delta(msg.text);
          this.progress.text(now);
          update.answer = update.progress = true;
          break;
        case 'text':
          this.answer.line(msg.text);
          this.progress.text(now);
          update.answer = update.progress = true;
          break;
        case 'error':
          this.answer.error(msg.message);
          update.answer = true;
          break;
        case 'status':
          this.progress.status(msg.detail, now);
          update.progress = true;
          break;
        case 'tool':
          this.progress.tool(msg.detail, now);
          update.progress = true;
          break;
        case 'event':
          update.events.push({ event: msg.event, detail: msg.detail });
          break;
      }
    }
    return update;
  }
}

// ── UI events ────────────────────────────────────────────────────────────────────────────────

export type ChatPreviewTarget = 'content' | 'drawer' | 'dialog';

export interface RenderScreenRequest {
  /** What travels as the `_yaml` parameter of the `__preview__` action. */
  yaml: string;
  target: ChatPreviewTarget;
  title?: string;
}

/** A render-screen detail as a request; null when it carries neither yaml nor uidl. */
export function renderScreenRequestOf(detail: unknown): RenderScreenRequest | null {
  const d = (detail && typeof detail === 'object' ? detail : {}) as Json;
  let yaml: string | null = null;
  if (typeof d['yaml'] === 'string' && d['yaml']) yaml = d['yaml'];
  else if (typeof d['uidl'] === 'string' && d['uidl']) yaml = d['uidl'];
  else if (d['uidl'] && typeof d['uidl'] === 'object') yaml = JSON.stringify(d['uidl']);
  if (yaml === null) return null;
  const target: ChatPreviewTarget = d['target'] === 'drawer' || d['target'] === 'dialog' ? d['target'] : 'content';
  const req: RenderScreenRequest = { yaml, target };
  if (typeof d['title'] === 'string' && d['title']) req.title = d['title'];
  return req;
}

/** The reserved sync action the shell runs to render a declared screen it was handed. */
export const PREVIEW_ACTION = '__preview__';

/** The `__preview__` request: the current route, nothing consumed beyond it, NO serverSideType. */
export function previewActionOf(req: RenderScreenRequest, currentRoute: string) {
  return {
    route: currentRoute,
    consumedRoute: currentRoute,
    actionId: PREVIEW_ACTION,
    serverSideType: null,
    initiatorComponentId: 'chat-render-screen',
    componentState: {},
    parameters: { _yaml: req.yaml },
  };
}

/** The first fragment of an increment that carries a component (what the preview shows). */
export function firstComponentFragment(increment: unknown): Json | null {
  const fragments = (increment as { fragments?: unknown } | null)?.fragments;
  if (!Array.isArray(fragments)) return null;
  return (fragments.find((f) => f && typeof f === 'object' && (f as Json)['component']) as Json | undefined) ?? null;
}

/** The overlay node (a Drawer or Dialog) a preview aimed at a drawer/dialog opens as. */
export function previewOverlayOf(fragment: Json, target: 'drawer' | 'dialog', title?: string): Json {
  const component = fragment['component'] as Json;
  const state = fragment['state'];
  const content =
    state && typeof state === 'object' && Object.keys(state as Json).length > 0
      ? { ...component, initialData: { ...((component['initialData'] as Json) ?? {}), ...(state as Json) } }
      : component;
  return {
    type: 'ClientSide',
    id: 'chat-render-screen',
    metadata: { type: target === 'dialog' ? 'Dialog' : 'Drawer', headerTitle: title ?? '', content },
    children: [],
  };
}

/** A navigation-requested detail as the navigation a menu click carries. */
export function chatNavigationOf(detail: unknown): ChatNavigation | null {
  const d = (detail && typeof detail === 'object' ? detail : {}) as Json;
  const s = (k: string) => (typeof d[k] === 'string' ? (d[k] as string) : undefined);
  const nav: ChatNavigation = { route: s('route') ?? '', consumedRoute: s('consumedRoute') ?? '', actionId: s('actionId') ?? '' };
  if (!nav.route && !nav.actionId) return null;
  for (const k of ['baseUrl', 'serverSideType', 'uriPrefix'] as const) {
    const v = s(k);
    if (v) nav[k] = v;
  }
  return nav;
}

// ── links in answers ─────────────────────────────────────────────────────────────────────────

/** The in-app route an href names: one starting with a single '/' (not '//host'). */
export function inAppRouteOf(href: string | null | undefined): string | undefined {
  const value = (href ?? '').trim();
  if (!value.startsWith('/') || value.startsWith('//')) return undefined;
  return value;
}

/**
 * How to open `route` the way the menu would: the menu entry whose route is the longest prefix of
 * it lends its app (consumedRoute, baseUrl, serverSideType, …) — /booking/bookings/4MBZS7 opens in
 * the app that serves /booking/bookings. Null when no entry serves it.
 */
export function menuNavigationOf(menu: unknown, route: string): ChatNavigation | null {
  const path = route.split(/[?#]/)[0];
  let best: MenuOptionLike | undefined;
  let bestLength = -1;
  const walk = (options: unknown) => {
    for (const option of Array.isArray(options) ? (options as MenuOptionLike[]) : []) {
      if (!option || option.separator) continue;
      if (option.submenus?.length) {
        walk(option.submenus);
        continue;
      }
      if (option.remote) continue;
      const own = (option.route ?? '').split(/[?#]/)[0];
      if (!own || own === '/') continue;
      if ((path === own || path.startsWith(own.endsWith('/') ? own : own + '/')) && own.length > bestLength) {
        best = option;
        bestLength = own.length;
      }
    }
  };
  walk(menu);
  if (!best) return null;
  const nav: ChatNavigation = { route, consumedRoute: best.consumedRoute ?? '', actionId: '' };
  if (best.baseUrl) nav.baseUrl = best.baseUrl;
  if (best.serverSideType) nav.serverSideType = best.serverSideType;
  if (best.uriPrefix) nav.uriPrefix = best.uriPrefix;
  return nav;
}

/**
 * A link pressed in an answer: an app route opens IN the app — through the menu entry that serves
 * it, else through the shell's route resolution (nothing consumed); null = not an app route (an
 * external link opens externally).
 */
export function chatLinkNavigation(menu: unknown, href: string | null | undefined): ChatNavigation | null {
  const route = inAppRouteOf(href);
  if (!route) return null;
  return menuNavigationOf(menu, route) ?? { route, consumedRoute: '', actionId: '' };
}

/** What the host can do with an agent's UI event. */
export interface ChatEventHooks {
  /** The session event bus (@SubscribeTo / OnCustomEvent); true when a subscriber took it. */
  dispatch: (event: string, detail: unknown) => boolean;
  navigate: (nav: ChatNavigation) => void;
  close: () => void;
  /** The shell's own render target (`__preview__`). */
  renderScreen: (req: RenderScreenRequest) => void;
}

/** What an agent's UI event did — for tests and logs. */
export type ChatEventOutcome = 'navigated' | 'closed' | 'subscriber' | 'rendered' | 'ignored' | 'dispatched';

/** Applies one UI event the agent emitted. */
export function applyChatEvent(e: ChatUiEvent, hooks: ChatEventHooks): ChatEventOutcome {
  const detail = e.detail ?? {};
  switch (e.event) {
    case 'navigation-requested': {
      const nav = chatNavigationOf(detail);
      if (!nav) return 'ignored';
      hooks.navigate(nav);
      return 'navigated';
    }
    case 'close-requested':
      hooks.close();
      return 'closed';
    case 'render-screen': {
      // a component on screen that subscribes to it owns it; else the shell renders it
      if (hooks.dispatch(e.event, detail)) return 'subscriber';
      const req = renderScreenRequestOf(detail);
      if (!req) return 'ignored';
      hooks.renderScreen(req);
      return 'rendered';
    }
    default:
      hooks.dispatch(e.event, detail);
      return 'dispatched';
  }
}
