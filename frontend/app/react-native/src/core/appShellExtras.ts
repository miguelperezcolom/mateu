/**
 * The app-level E2 patterns on the native renderer — the pure part, tested with node:test:
 *
 *  - QUICK LAUNCH (`AppDto.shortcuts`): a phone has no keyboard accelerators, so the `key` of an
 *    app shortcut does not apply; its quick-launch `code` does — typed in the drawer's "Code" box.
 *  - LIVE HEADER VALUES (`AppDto.headerValues`, the `UpdateHeaderValue` command, `liveUpdates`):
 *    an app-wide store the drawer paints from, plus the helpers of the event stream.
 *  - IDLE SESSION (`AppDto.idleSession`): the clock that decides active / warning / expired.
 */

export interface AppShortcut {
  key?: string | null;
  label: string;
  route?: string | null;
  actionId?: string | null;
  code?: string | null;
}

export interface HeaderValue {
  id: string;
  label?: string | null;
  value?: string | null;
}

export interface IdleSession {
  timeoutSeconds: number;
  warningSeconds: number;
  signOutUrl?: string | null;
  keepAliveActionId?: string | null;
}

// ---- quick launch ------------------------------------------------------------------------------

/** The shortcut whose code is exactly what was typed (case-insensitive, trimmed). */
export const quickLaunchMatch = (shortcuts: AppShortcut[] | null | undefined, query: string): AppShortcut | undefined => {
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return undefined;
  return (shortcuts ?? []).find((s) => !!s.code && s.code.trim().toLowerCase() === q && (!!s.route || !!s.actionId));
};

/** The shortcuts listed in the drawer: those with a code and somewhere to go, code order kept. */
export const launchableShortcuts = (shortcuts: AppShortcut[] | null | undefined): AppShortcut[] =>
  (shortcuts ?? []).filter((s) => !!s.code && (!!s.route || !!s.actionId));

// ---- header values -----------------------------------------------------------------------------

type Listener = () => void;

/** App-wide store of the header values (one running app at a time). */
export class HeaderValuesStore {
  private values = new Map<string, HeaderValue>();
  private listeners = new Set<Listener>();

  list(): HeaderValue[] {
    return [...this.values.values()];
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** What the shell declared — authoritative when the app (re)loads. */
  seed(declared: HeaderValue[] | null | undefined): void {
    const next = declared ?? [];
    const same =
      next.length === this.values.size &&
      next.every((v) => {
        const c = this.values.get(v.id);
        return !!c && c.value === v.value && c.label === v.label;
      });
    if (same) return;
    this.values.clear();
    next.forEach((v) => this.values.set(v.id, { ...v }));
    this.emit();
  }

  /** Changes one value; returns the change to announce ("Business date changed to 13 Oct"), or
   *  null when nothing changed. */
  update(id: string, value: string | null | undefined): string | null {
    if (!id) return null;
    const current = this.values.get(id);
    const text = value ?? '';
    if (current && (current.value ?? '') === text) return null;
    this.values.set(id, { id, label: current?.label ?? null, value: text });
    this.emit();
    return `${current?.label || id} changed to ${text}`;
  }

  reset(): void {
    this.values.clear();
    this.listeners.clear();
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

export const headerValues = new HeaderValuesStore();

/** The header-value changes an increment carries (the `UpdateHeaderValue` commands). */
export const headerChangesOf = (increment: unknown): { id: string; value: string }[] => {
  const commands =
    (increment as { commands?: { type?: string; data?: { id?: string; value?: string } }[] } | null)?.commands ?? [];
  return commands
    .filter((c) => c?.type === 'UpdateHeaderValue' && !!c.data?.id)
    .map((c) => ({ id: c.data!.id!, value: c.data!.value ?? '' }));
};

/** Wait before reconnecting the event stream after `failures` consecutive errors (0 = clean end). */
export const reconnectDelay = (failures: number): number =>
  failures <= 0 ? 1_000 : Math.min(60_000, 2_000 * 2 ** (failures - 1));

/**
 * Splits the text received so far into complete SSE events: the `data:` payloads parsed as JSON
 * (heartbeats and malformed chunks skipped) and what is left for the next chunk.
 */
export const parseSseChunk = (buffer: string): { increments: unknown[]; rest: string } => {
  const events = buffer.split('\n\n');
  const rest = events.pop() ?? '';
  const increments: unknown[] = [];
  for (const event of events) {
    const line = event.trim();
    if (!line.startsWith('data:')) continue;
    try {
      increments.push(JSON.parse(line.substring(5).trim()));
    } catch {
      /* skip */
    }
  }
  return { increments, rest };
};

// ---- idle session ------------------------------------------------------------------------------

export type IdlePhase = 'active' | 'warning' | 'expired';

/** Where the session stands, the same rule as the web renderer's idleSession.ts. */
export const idlePhase = (
  now: number,
  lastActivity: number,
  idle: Pick<IdleSession, 'timeoutSeconds' | 'warningSeconds'>,
): { phase: IdlePhase; secondsLeft: number } => {
  const timeoutMs = Math.max(1, idle.timeoutSeconds) * 1000;
  const warningMs = Math.min(timeoutMs, Math.max(1, idle.warningSeconds) * 1000);
  const elapsed = Math.max(0, now - lastActivity);
  const secondsLeft = Math.max(0, Math.ceil((timeoutMs - elapsed) / 1000));
  if (elapsed >= timeoutMs) return { phase: 'expired', secondsLeft: 0 };
  if (elapsed >= timeoutMs - warningMs) return { phase: 'warning', secondsLeft };
  return { phase: 'active', secondsLeft };
};

/** Where "Sign out" goes on a phone: an absolute url opens outside the app; anything else (an app
 *  path such as "/signed-out") resets the app to its root — Mateu does no authentication. */
export const signOutTarget = (url: string | null | undefined): { kind: 'url'; url: string } | { kind: 'root' } =>
  url && /^https?:\/\//i.test(url.trim()) ? { kind: 'url', url: url.trim() } : { kind: 'root' };
