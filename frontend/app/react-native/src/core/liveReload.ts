/**
 * Live reload on the phone — the same development loop the web renderers follow.
 *
 * A backend in development mode (`mateu.dev=true`, the IDE's "Run Mateu App (Live)") streams
 * `GET /mateu/dev/events` and says so in its hub manifest (`devEvents`, never outside development
 * mode). The app follows that stream while a UI is open: a YAML edit (`specs-changed`), an IDE
 * reload after a HotSwap (`reload`) or a restarted server (a `hello` with another boot id) re-renders
 * the screen on display. What each event means is pinned by conformance/client/live-reload.json
 * (libs/mateu liveReloadPolicy.ts is the reference; the IntelliJ plugin runs it too).
 */

export type LiveReloadAction = 'none' | 'page' | 'app';

export interface LiveReloadMessage {
  type?: string;
  bootId?: string;
  scope?: string;
  files?: string[];
}

export interface LiveReloadDecision {
  action: LiveReloadAction;
  /** The boot id to remember from now on. */
  bootId: string | undefined;
}

export function decideLiveReload(message: LiveReloadMessage | undefined | null, knownBootId: string | undefined): LiveReloadDecision {
  if (!message || typeof message !== 'object') return { action: 'none', bootId: knownBootId };
  switch (message.type) {
    case 'hello': {
      const restarted = !!knownBootId && !!message.bootId && message.bootId !== knownBootId;
      return { action: restarted ? 'page' : 'none', bootId: message.bootId ?? knownBootId };
    }
    case 'specs-changed':
    case 'reload':
      return { action: message.scope === 'app' ? 'app' : 'page', bootId: knownBootId };
    default:
      return { action: 'none', bootId: knownBootId };
  }
}

/** Where the dev event stream is for an app at `baseUrl`, per its manifest — undefined outside
 *  development mode. The path is the server's (root-relative), like /mateu/dev/reload. */
export function devEventsUrlOf(baseUrl: string, manifest: unknown): string | undefined {
  const path = (manifest as { devEvents?: unknown } | null | undefined)?.devEvents;
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return undefined;
  try {
    return new URL(baseUrl).origin + path;
  } catch {
    return undefined;
  }
}

/** Splits SSE text into its events' `data:` payloads (JSON); `rest` is an unfinished event. */
export function parseDevEvents(buffer: string): { messages: LiveReloadMessage[]; rest: string } {
  const blocks = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = blocks.pop() ?? '';
  const messages: LiveReloadMessage[] = [];
  for (const block of blocks) {
    const data = block.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trimStart()).join('\n');
    if (!data) continue;
    try {
      messages.push(JSON.parse(data) as LiveReloadMessage);
    } catch {
      // not an event of ours
    }
  }
  return { messages, rest };
}

/** The wait before reconnecting after `failures` failed attempts: 1 s, doubling, capped at 30 s. */
export const reconnectDelay = (failures: number): number => Math.min(30_000, 1000 * 2 ** Math.max(0, failures - 1));

/**
 * Follows the dev event stream at `url` until stopped: each event that means a re-render calls
 * `onAction` (a burst within `settleMs` collapses into one, the strongest wins); a dropped stream
 * reconnects with a back-off, and the boot id survives reconnections — so a restarted server
 * re-renders too. Returns the stop function.
 */
export function followLiveReload(options: {
  url: string;
  fetchImpl: typeof fetch;
  onAction: (action: Exclude<LiveReloadAction, 'none'>) => void;
  settleMs?: number;
  schedule?: (fn: () => void, ms: number) => unknown;
  cancel?: (handle: unknown) => void;
}): () => void {
  const schedule = options.schedule ?? ((fn, ms) => setTimeout(fn, ms));
  const cancel = options.cancel ?? ((h) => clearTimeout(h as ReturnType<typeof setTimeout>));
  const settle = options.settleMs ?? 150;
  let stopped = false;
  let bootId: string | undefined;
  let failures = 0;
  let controller: AbortController | null = null;
  let pending: LiveReloadAction = 'none';
  let pendingTimer: unknown;
  let retryTimer: unknown;

  const fire = () => {
    pendingTimer = undefined;
    const action = pending;
    pending = 'none';
    if (!stopped && action !== 'none') options.onAction(action);
  };
  const handle = (message: LiveReloadMessage) => {
    const decision = decideLiveReload(message, bootId);
    bootId = decision.bootId;
    if (decision.action === 'none') return;
    if (decision.action === 'app' || pending === 'none') pending = decision.action;
    if (pendingTimer === undefined) pendingTimer = schedule(fire, settle);
  };
  const connect = async () => {
    if (stopped) return;
    const own = new AbortController();
    controller = own;
    try {
      // called detached: a browser's fetch invoked as a method of `options` throws "Illegal invocation"
      const fetchImpl = options.fetchImpl;
      const response = await fetchImpl(options.url, { headers: { Accept: 'text/event-stream' }, signal: own.signal });
      if (!response.ok) throw new Error(`dev events: HTTP ${response.status}`);
      failures = 0;
      const reader = (response.body as ReadableStream<Uint8Array> | null)?.getReader?.();
      let buffer = '';
      if (!reader) {
        buffer = await response.text();
        parseDevEvents(buffer + '\n\n').messages.forEach(handle);
      } else {
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parsed = parseDevEvents(buffer);
          buffer = parsed.rest;
          parsed.messages.forEach(handle);
        }
      }
    } catch {
      failures++;
    } finally {
      if (controller === own) controller = null;
    }
    if (!stopped) retryTimer = schedule(() => void connect(), reconnectDelay(Math.max(1, failures)));
  };
  void connect();
  return () => {
    stopped = true;
    controller?.abort();
    if (pendingTimer !== undefined) cancel(pendingTimer);
    if (retryTimer !== undefined) cancel(retryTimer);
  };
}
