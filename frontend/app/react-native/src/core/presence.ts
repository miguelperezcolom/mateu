/**
 * RECORD PRESENCE (`@App(presence = true)`) on the phone — the twin of libs/mateu's
 * `infra/presence/presence.ts`: a record screen reports itself every {@link HEARTBEAT_MS} with the
 * `_presence` app-level action (`viewing`, or `editing` while it holds unsaved changes) and `leave`
 * when it goes away; the answer and the app event stream (`_live-updates`) carry `PresenceChanged`
 * commands listing the OTHER people. The server forgets a copy not seen for 30 s; anonymous
 * callers take no part. Pure helpers first (tested), then the per-session hub.
 */

export const PRESENCE_ACTION = '_presence';
export const HEARTBEAT_MS = 10_000;

export interface PresenceEntry { name: string; editing: boolean; since?: string }
export interface PresenceChange { key: string; entries: PresenceEntry[] }

/** Pure: the presence changes an increment carries. */
export function presenceChangesOf(increment: unknown): PresenceChange[] {
  const commands = (increment as { commands?: { type?: string; data?: PresenceChange }[] } | null)?.commands ?? [];
  return commands
    .filter((c) => c?.type === 'PresenceChanged' && typeof c.data?.key === 'string')
    .map((c) => ({ key: c.data!.key, entries: Array.isArray(c.data!.entries) ? c.data!.entries : [] }));
}

/** Pure: the route a screen reports — without the app's own mount, query or surrounding slashes. */
export function presenceRouteOf(route: string, rootRoute?: string): string {
  let path = (route || '').split('?')[0].split('#')[0];
  const root = (rootRoute || '').replace(/\/+$/, '');
  if (root && root !== '/' && (path === root || path.startsWith(root + '/'))) path = path.substring(root.length);
  return path.replace(/\/{2,}/g, '/').replace(/^\/+|\/+$/g, '');
}

/** Pure: a record screen is two segments or more, or a screen that edits — never a create page. */
export function isRecordRoute(route: string, edits = false): boolean {
  const path = route.replace(/\/(edit|view)$/, '');
  if (!path.length || path === 'new' || path.endsWith('/new')) return false;
  return edits || path.split('/').filter(Boolean).length >= 2;
}

function namesText(names: string[]): string {
  if (names.length <= 1) return names[0] ?? '';
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;
}

export interface PresenceSummary { text: string; tone: 'warning' | 'neutral' }

/** Pure: what the chip says — editors first (a warning), then viewers. */
export function presenceSummary(entries: PresenceEntry[]): PresenceSummary | null {
  if (!entries.length) return null;
  const editors = entries.filter((e) => e.editing).map((e) => e.name);
  const viewers = entries.filter((e) => !e.editing).map((e) => e.name);
  const parts: string[] = [];
  if (editors.length) parts.push(`${namesText(editors)} ${editors.length === 1 ? 'is' : 'are'} editing this record`);
  if (viewers.length) parts.push(`${namesText(viewers)} ${viewers.length === 1 ? 'is' : 'are'} viewing it`);
  return { text: parts.join(' · '), tone: editors.length ? 'warning' : 'neutral' };
}

/** Pure: the people who START editing between two answers (announced once). */
export function newEditors(before: PresenceEntry[], after: PresenceEntry[]): string[] {
  const were = new Set(before.filter((e) => e.editing).map((e) => e.name));
  return after.filter((e) => e.editing && !were.has(e.name)).map((e) => e.name);
}

/** Sends one `_presence` report and answers the increment (the session's api client). */
export type PresencePost = (body: {
  serverSideType: string | null; route: string; parameters: Record<string, unknown>;
}) => Promise<unknown>;

interface Watch {
  route: string;
  view: string;
  key?: string;
  entries: PresenceEntry[];
  editing: boolean;
  listener: (entries: PresenceEntry[]) => void;
  timer?: ReturnType<typeof setInterval>;
}

/** The per-session hub: which screens watch which record, the heartbeat, the stream's changes. */
export class PresenceHub {
  private target: { serverSideType: string | null; rootRoute: string } | null = null;
  private readonly watches = new Set<Watch>();
  private readonly tab = Math.random().toString(36).slice(2) + Date.now().toString(36);

  private readonly post: PresencePost;

  constructor(post: PresencePost) {
    this.post = post;
  }

  get enabled(): boolean { return this.target !== null; }

  get rootRoute(): string { return this.target?.rootRoute ?? ''; }

  /** The app on show: presence on → screens report themselves; off → they stop. */
  configure(meta: { presence?: boolean; serverSideType?: string; rootRoute?: string } | null): void {
    const next = meta?.presence ? { serverSideType: meta.serverSideType ?? null, rootRoute: meta.rootRoute ?? '' } : null;
    const changed = (next?.serverSideType ?? null) !== (this.target?.serverSideType ?? null) || !!next !== !!this.target;
    if (!changed) return;
    for (const w of this.watches) this.stop(w, true);
    this.target = next;
    for (const w of this.watches) this.start(w);
  }

  /** A record screen watches its record; the returned function stops watching. */
  watch(route: string, view: string, edits: boolean, editing: boolean, listener: (entries: PresenceEntry[]) => void): { stop: () => void; setEditing: (e: boolean) => void } {
    if (!isRecordRoute(route, edits)) return { stop: () => undefined, setEditing: () => undefined };
    const w: Watch = { route, view, entries: [], editing, listener };
    this.watches.add(w);
    this.start(w);
    return {
      stop: () => {
        if (!this.watches.delete(w)) return;
        this.stop(w, true);
      },
      setEditing: (value: boolean) => {
        if (w.editing === value) return;
        w.editing = value;
        this.send(w, value ? 'editing' : 'viewing');
      },
    };
  }

  /** A change from the app event stream: the watch of that record follows. */
  apply(change: PresenceChange): void {
    for (const w of this.watches) {
      if (w.key === change.key) {
        w.entries = change.entries;
        w.listener(change.entries);
      }
    }
  }

  private start(w: Watch) {
    if (!this.target) return;
    this.send(w, w.editing ? 'editing' : 'viewing');
    clearInterval(w.timer);
    w.timer = setInterval(() => this.send(w, w.editing ? 'editing' : 'viewing'), HEARTBEAT_MS);
  }

  private stop(w: Watch, leave: boolean) {
    clearInterval(w.timer);
    w.timer = undefined;
    if (leave) this.send(w, 'leave');
  }

  private send(w: Watch, state: 'viewing' | 'editing' | 'leave') {
    if (!this.target) return;
    const route = '/' + (this.target.rootRoute || '').replace(/^\/+/, '');
    this.post({
      serverSideType: this.target.serverSideType, route,
      parameters: { route: w.route, view: w.view, tab: this.tab, state },
    }).then((increment) => {
      if (state === 'leave') return;
      for (const change of presenceChangesOf(increment)) {
        w.key = change.key;
        w.entries = change.entries;
        w.listener(change.entries);
      }
    }).catch(() => { /* best effort: the next heartbeat tries again */ });
  }
}
