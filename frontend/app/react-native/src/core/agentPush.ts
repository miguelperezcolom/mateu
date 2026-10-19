/**
 * Live UI push (MCP phase C, conformance/mcp/README.md "Live UI push"): an LLM, through the
 * backend's MCP endpoint, sends UI — a screen to render, a navigation, an event — to THIS app while
 * it is open. Pure logic (unit-tested); the React side is renderer/AgentPush.tsx.
 *
 *  - the UI SESSION: an id + a channel secret, one per running app (MateuSession). The assistant
 *    chat sends the same id as its `sessionId`, so the conversation and the push channel are one
 *    session, as on the web (where both are the tab's X-Session-Id).
 *  - the CHANNEL: the app-level `_agent-channel` action on the SSE endpoint, an open-ended stream of
 *    increments, each carrying one `AgentPush` command `{kind, event, detail}`; reopened at once when
 *    the server ends it (every 5 minutes), with a back-off on errors.
 *  - `status` messages update the "Connect AI" control; `render` / `navigate` / `event` are applied
 *    EXACTLY like the chat's own UI events (core/uiEvents.ts — one function for both).
 */
import { randomUuid } from './sessionId.ts';
import { reconnectDelay } from './appShellExtras.ts';
import type { ChatUiEvent } from './chatStream.ts';

type Json = Record<string, unknown>;

export const AGENT_CHANNEL_ACTION = '_agent-channel';
export const AGENT_PAIR_ACTION = '_agent-pair';
export const AGENT_UNPAIR_ACTION = '_agent-unpair';
export const AGENT_PUSH_COMMAND = 'AgentPush';
export const AGENT_STATUS_EVENT = 'mateu-agent-status';
/** What this renderer registers as (≤ 32 chars). */
export const AGENT_RENDERER = 'react-native';

/** The server's in-band refusals (README "The UI session and its channel"). */
export const AGENT_ERRORS = {
  foreign: 'This UI session belongs to another channel.',
  disabled: 'Live UI push is not enabled.',
  full: 'Too many live UI sessions; try again later.',
} as const;

// ── the UI session ──────────────────────────────────────────────────────────────────────────

export interface UiSessionIdentity {
  sessionId: string;
  secret: string;
}

type Random = (bytes: Uint8Array) => Uint8Array;

function cryptoRandom(bytes: Uint8Array): Uint8Array {
  const c = (globalThis as { crypto?: { getRandomValues?: (a: Uint8Array) => Uint8Array } }).crypto;
  if (c?.getRandomValues) return c.getRandomValues(bytes);
  // last resort only (a runtime with no CSPRNG): still unique per launch
  for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes;
}

const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');

/** A fresh UI session: an unguessable id (the agent backend keys the chat by it too) and a
 *  256-bit channel secret, sent only on the three agent actions. */
export function newUiSessionIdentity(random: Random = cryptoRandom): UiSessionIdentity {
  return { sessionId: `ui-${randomUuid(random)}`, secret: hex(random(new Uint8Array(32))) };
}

/** The paired state the channel's `status` messages report. */
export interface AgentStatus {
  paired: boolean;
  /** The paired callers' labels, in pairing order. */
  agents: string[];
}

export const NOT_PAIRED: AgentStatus = { paired: false, agents: [] };

/**
 * One app's push state: its UI session (created on first use, kept for the app's life — like a
 * browser tab's — and replaced only when the server says it belongs to another channel) and the
 * last status the channel reported, which the "Connect AI" controls repaint from.
 */
export class AgentPushState {
  private identity: UiSessionIdentity | null = null;
  private current: AgentStatus = NOT_PAIRED;
  private known = false;
  private listeners = new Set<() => void>();

  private readonly make: () => UiSessionIdentity;

  constructor(make: () => UiSessionIdentity = () => newUiSessionIdentity()) {
    this.make = make;
  }

  get session(): UiSessionIdentity {
    if (!this.identity) this.identity = this.make();
    return this.identity;
  }

  /** A new UI session (the old one is someone else's now); the status is unknown again. */
  rotate(): UiSessionIdentity {
    this.identity = this.make();
    this.setStatus(NOT_PAIRED, false);
    return this.identity;
  }

  get status(): AgentStatus {
    return this.current;
  }

  /** Whether the channel has reported a status yet (i.e. it is connected). */
  get connected(): boolean {
    return this.known;
  }

  /** Records a status; returns what changed, to announce ("AI connected: alice"), or null. */
  setStatus(status: AgentStatus, known = true): string | null {
    const before = this.current;
    const same =
      this.known === known &&
      before.paired === status.paired &&
      before.agents.length === status.agents.length &&
      before.agents.every((a, i) => a === status.agents[i]);
    if (same) return null;
    this.current = { paired: status.paired, agents: [...status.agents] };
    this.known = known;
    this.emit();
    if (!known) return null;
    if (status.paired && !before.paired) return `AI connected: ${agentsLine(status.agents)}`;
    if (!status.paired && before.paired) return 'AI disconnected';
    if (status.paired && status.agents.length !== before.agents.length) return `AI connected: ${agentsLine(status.agents)}`;
    return null;
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
        /* a broken painter must not stop the others */
      }
    });
  }
}

/** "alice", "alice and an agent", "alice, bob and an agent". */
export function agentsLine(agents: string[]): string {
  const names = agents.filter((a) => typeof a === 'string' && a.trim()).map((a) => a.trim());
  if (names.length === 0) return 'an agent';
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

// ── the wire ────────────────────────────────────────────────────────────────────────────────

export interface AgentPushMessage {
  kind: string;
  event: string;
  detail: unknown;
}

/** The AgentPush commands an increment carries, in order (anything malformed skipped). */
export function agentPushMessagesOf(increment: unknown): AgentPushMessage[] {
  const commands = (increment as { commands?: unknown } | null)?.commands;
  if (!Array.isArray(commands)) return [];
  const out: AgentPushMessage[] = [];
  for (const c of commands) {
    if (!c || typeof c !== 'object' || (c as Json)['type'] !== AGENT_PUSH_COMMAND) continue;
    const data = (c as Json)['data'];
    if (!data || typeof data !== 'object') continue;
    const d = data as Json;
    if (typeof d['kind'] !== 'string' || typeof d['event'] !== 'string') continue;
    out.push({ kind: d['kind'], event: d['event'], detail: d['detail'] ?? {} });
  }
  return out;
}

/** A `status` detail as a status (defensive: the agents are strings). */
export function agentStatusOf(detail: unknown): AgentStatus {
  const d = (detail && typeof detail === 'object' ? detail : {}) as Json;
  const agents = Array.isArray(d['agents']) ? (d['agents'] as unknown[]).filter((a): a is string => typeof a === 'string') : [];
  return { paired: d['paired'] === true, agents };
}

/** The events a pushed message may NOT carry under kind `event` (they have kinds of their own). */
const RESERVED_EVENTS = new Set(['render-screen', 'navigation-requested', 'close-requested', AGENT_STATUS_EVENT]);
const EVENT_NAME = /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/;

export type AgentPushRoute =
  | { kind: 'status'; status: AgentStatus }
  | { kind: 'ui'; event: ChatUiEvent }
  | { kind: 'ignored' };

/**
 * What to do with one pushed message: a status updates the "Connect AI" control and is NOT
 * dispatched; render / navigate / event become the very event the chat would have received.
 * A kind whose event does not match it (or an unknown kind) is ignored — the server never sends
 * one, so it is not ours to guess.
 */
export function routeAgentPush(message: AgentPushMessage): AgentPushRoute {
  const detail = message.detail ?? {};
  switch (message.kind) {
    case 'status':
      return message.event === AGENT_STATUS_EVENT ? { kind: 'status', status: agentStatusOf(detail) } : { kind: 'ignored' };
    case 'render':
      return message.event === 'render-screen' ? { kind: 'ui', event: { event: 'render-screen', detail } } : { kind: 'ignored' };
    case 'navigate':
      return message.event === 'navigation-requested' ? { kind: 'ui', event: { event: 'navigation-requested', detail } } : { kind: 'ignored' };
    case 'event':
      return EVENT_NAME.test(message.event) && !RESERVED_EVENTS.has(message.event)
        ? { kind: 'ui', event: { event: message.event, detail } }
        : { kind: 'ignored' };
    default:
      return { kind: 'ignored' };
  }
}

export type AgentChannelError = 'foreign' | 'disabled' | 'full' | 'other';

/** The error an increment answers with (an error message), classified; null when there is none. */
export function agentErrorOf(increment: unknown): { kind: AgentChannelError; text: string } | null {
  const messages = (increment as { messages?: unknown } | null)?.messages;
  if (!Array.isArray(messages)) return null;
  for (const m of messages) {
    if (!m || typeof m !== 'object') continue;
    const r = m as Json;
    const text = typeof r['text'] === 'string' ? r['text'].trim() : '';
    if (r['variant'] !== 'error' && !Object.values(AGENT_ERRORS).includes(text as never)) continue;
    if (text === AGENT_ERRORS.foreign) return { kind: 'foreign', text };
    if (text === AGENT_ERRORS.disabled) return { kind: 'disabled', text };
    if (text === AGENT_ERRORS.full) return { kind: 'full', text };
    return { kind: 'other', text: text || 'Something went wrong' };
  }
  return null;
}

/** What the agent actions need of the app shell. */
export interface AgentAppMeta {
  serverSideType?: string | null;
  rootRoute?: string | null;
}

/** The request of an agent action: app-level like `_live-updates` — the app's serverSideType, its
 *  root route, nothing consumed — with the UI session's id + secret (+ `extra`). */
export function agentActionRequest(
  meta: AgentAppMeta,
  actionId: string,
  identity: UiSessionIdentity,
  appState: Record<string, unknown>,
  extra: Record<string, unknown> = {},
) {
  const route = (meta.rootRoute ?? '').replace(/^\/+/, '');
  return {
    route: route ? '/' + route : '',
    consumedRoute: '',
    actionId,
    serverSideType: meta.serverSideType ?? null,
    initiatorComponentId: 'mateu-agent-push',
    componentState: {},
    appState,
    parameters: { sessionId: identity.sessionId, secret: identity.secret, ...extra },
  };
}

export interface AgentPairing {
  code: string;
  expiresInSeconds: number;
}

/**
 * The `_agentPairing` an answer of `_agent-pair` / `_agent-unpair` carries: `found` false when no
 * fragment names it (an error answer), `pairing` null after an unpair.
 */
export function agentPairingOf(increment: unknown): { found: boolean; pairing: AgentPairing | null } {
  const fragments = (increment as { fragments?: unknown } | null)?.fragments;
  for (const f of Array.isArray(fragments) ? fragments : []) {
    const data = f && typeof f === 'object' ? (f as Json)['data'] : null;
    if (!data || typeof data !== 'object' || !('_agentPairing' in (data as Json))) continue;
    const p = (data as Json)['_agentPairing'];
    if (!p || typeof p !== 'object') return { found: true, pairing: null };
    const r = p as Json;
    if (typeof r['code'] !== 'string' || !r['code']) return { found: true, pairing: null };
    const seconds = typeof r['expiresInSeconds'] === 'number' && r['expiresInSeconds'] > 0 ? r['expiresInSeconds'] : 300;
    return { found: true, pairing: { code: r['code'], expiresInSeconds: seconds } };
  }
  return { found: false, pairing: null };
}

// ── the channel ─────────────────────────────────────────────────────────────────────────────

/** Wait before reopening the channel: a clean end (the server's 5-minute cut) reopens AT ONCE;
 *  errors back off like the live-updates stream (2 s, 4 s, … 60 s). */
export const agentReconnectDelay = (failures: number): number => (failures <= 0 ? 0 : reconnectDelay(failures));

export interface AgentChannelDeps {
  /** Opens the stream with this request and hands every increment over as it arrives; resolves
   *  when the server ends it, rejects on a transport error. */
  open: (request: ReturnType<typeof agentActionRequest>, onIncrement: (increment: unknown) => void, signal: AbortSignal) => Promise<void>;
  /** The request to open with (read on every connect: the identity may have rotated, the route moved). */
  request: () => ReturnType<typeof agentActionRequest>;
  state: AgentPushState;
  /** A pushed UI event, to apply exactly like the chat's. */
  onEvent: (event: ChatUiEvent) => void;
  /** A status change worth announcing ("AI connected: alice"). */
  onAnnounce?: (text: string) => void;
  schedule?: (fn: () => void, ms: number) => () => void;
  log?: (message: string) => void;
}

const defaultSchedule = (fn: () => void, ms: number) => {
  const t = setTimeout(fn, ms);
  return () => clearTimeout(t);
};

/**
 * The push channel of one app: `start()` opens it (no-op while open), `stop()` closes it (the app
 * went to the background — reopened on `start()`), `dispose()` for good. A stream that ends after
 * having delivered something reopens at once; one that fails, answers an error or ends without a
 * word backs off. "This UI session belongs to another channel." gives the app a new UI session.
 */
export class AgentChannel {
  private controller: AbortController | null = null;
  private cancelTimer: (() => void) | null = null;
  private failures = 0;
  private disposed = false;
  private running = false;

  private readonly deps: AgentChannelDeps;

  constructor(deps: AgentChannelDeps) {
    this.deps = deps;
  }

  get isOpen(): boolean {
    return this.controller !== null;
  }

  get consecutiveFailures(): number {
    return this.failures;
  }

  start(): void {
    if (this.disposed) return;
    this.running = true;
    if (this.controller || this.cancelTimer) return;
    void this.connect();
  }

  stop(): void {
    this.running = false;
    this.cancelTimer?.();
    this.cancelTimer = null;
    const c = this.controller;
    this.controller = null;
    c?.abort();
  }

  dispose(): void {
    this.disposed = true;
    this.stop();
  }

  /** Applies one increment of the stream; answers whether it was an error. */
  handle(increment: unknown): boolean {
    const error = agentErrorOf(increment);
    if (error) {
      this.deps.log?.(`agent channel: ${error.text}`);
      if (error.kind === 'foreign') this.deps.state.rotate();
      return true;
    }
    for (const message of agentPushMessagesOf(increment)) {
      const route = routeAgentPush(message);
      if (route.kind === 'status') {
        const said = this.deps.state.setStatus(route.status);
        if (said) this.deps.onAnnounce?.(said);
      } else if (route.kind === 'ui') {
        try {
          this.deps.onEvent(route.event);
        } catch (e) {
          this.deps.log?.(`agent channel: applying ${route.event.event} failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }
    return false;
  }

  private async connect(): Promise<void> {
    if (this.disposed || !this.running || this.controller) return;
    const own = new AbortController();
    this.controller = own;
    let delivered = false;
    let failed = false;
    try {
      await this.deps.open(
        this.deps.request(),
        (increment) => {
          if (this.controller !== own) return;
          if (this.handle(increment)) failed = true;
          else delivered = true;
        },
        own.signal,
      );
      if (!delivered) failed = true;
    } catch {
      failed = true;
    }
    if (this.controller !== own) return; // stopped meanwhile: stop() decides what comes next
    this.controller = null;
    this.failures = failed ? this.failures + 1 : 0;
    if (!this.running || this.disposed) return;
    const cancel = (this.deps.schedule ?? defaultSchedule)(() => {
      this.cancelTimer = null;
      void this.connect();
    }, agentReconnectDelay(this.failures));
    this.cancelTimer = cancel;
  }
}
