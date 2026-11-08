/**
 * The NOTIFICATION INBOX of one running UI, pure (the drawer's bell paints it): the server's list
 * (`NotificationsSupplier` → `_notifications-list`) ∪ the session's own entries — an `inbox`
 * Message, an entry pushed by `NotificationsChanged` that the server list does not have yet —
 * deduplicated by id (a pushed entry with a known id REPLACES it). Grouped by `category`, filtered
 * (unread / all / resolved). See design/progress-and-notifications.md.
 */

export interface InboxAction {
  label?: string | null;
  actionId?: string | null;
  parameters?: Record<string, unknown> | null;
  route?: string | null;
  style?: string | null;
}

export interface InboxItem {
  id: string;
  title: string;
  text?: string | null;
  route?: string | null;
  unread: boolean;
  when?: string | null;
  category?: string | null;
  variant?: string | null;
  resolved?: boolean;
  actions?: InboxAction[];
  hasDetail?: boolean;
  /** Only this session knows it (an inbox Message): its actions run on the screen that sent it. */
  local?: boolean;
  /** The local entry's actions, already bound to that screen. */
  run?: (action: InboxAction) => void;
}

export type InboxFilter = 'unread' | 'all' | 'resolved';

export interface InboxGroup {
  category: string;
  items: InboxItem[];
}

const text = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));

/** Pure: an inbox entry from the wire (AppNotification / AppNotificationDto). */
export function inboxItemOf(raw: unknown): InboxItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = text(r['id']);
  if (!id) return null;
  return {
    id,
    title: text(r['title']),
    text: text(r['text']) || null,
    route: text(r['route']) || null,
    unread: r['unread'] !== false,
    when: text(r['when']) || null,
    category: text(r['category']) || null,
    variant: text(r['variant']) || null,
    resolved: r['resolved'] === true,
    actions: Array.isArray(r['actions']) ? (r['actions'] as InboxAction[]).filter((a) => a && typeof a === 'object') : [],
    hasDetail: r['hasDetail'] === true,
  };
}

/** Pure: the entries shown under a filter. Resolved ones only under "resolved"; unread = not read. */
export function filtered(items: InboxItem[], filter: InboxFilter): InboxItem[] {
  if (filter === 'resolved') return items.filter((i) => i.resolved);
  const open = items.filter((i) => !i.resolved);
  return filter === 'unread' ? open.filter((i) => i.unread) : open;
}

/** Pure: grouped by category, in order of first appearance; the uncategorised group is "". */
export function grouped(items: InboxItem[]): InboxGroup[] {
  const groups: InboxGroup[] = [];
  for (const item of items) {
    const category = item.category ?? '';
    let group = groups.find((g) => g.category === category);
    if (!group) {
      group = { category, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}

/** Pure: the badge — unread entries not resolved. */
export function unreadCount(items: InboxItem[]): number {
  return items.filter((i) => i.unread && !i.resolved).length;
}

/** What a NotificationsChanged command asks for. */
export type InboxChange =
  | { kind: 'upsert'; item: InboxItem }
  | { kind: 'remove'; id: string }
  | { kind: 'refetch' };

/** Pure: the change a NotificationsChanged command's data carries. */
export function inboxChangeOf(data: unknown): InboxChange {
  const d = (data ?? {}) as Record<string, unknown>;
  const item = inboxItemOf(d['notification']);
  if (item) return { kind: 'upsert', item };
  const removed = text(d['removedId']);
  if (removed) return { kind: 'remove', id: removed };
  return { kind: 'refetch' };
}

export class InboxStore {
  private server: InboxItem[] = [];
  private session: InboxItem[] = [];
  private dismissed = new Set<string>();
  private listeners = new Set<(change?: InboxChange) => void>();

  /** The list the server answered (it is the truth for what it holds). */
  setServer(items: InboxItem[]): void {
    this.server = items;
    // an entry the server now knows is no longer only ours
    const known = new Set(items.map((i) => i.id));
    this.session = this.session.filter((s) => !known.has(s.id) || s.local);
    this.emit();
  }

  /** An entry only this session knows (an inbox Message, a pushed entry). Same id = replaces. */
  addSession(item: InboxItem): void {
    this.dismissed.delete(item.id);
    this.session = [...this.session.filter((s) => s.id !== item.id), item];
    this.emit();
  }

  /** Applies a pushed change; answers it (a `refetch` asks the bell to fetch the list again). */
  apply(change: InboxChange): InboxChange {
    if (change.kind === 'upsert') {
      const onServer = this.server.findIndex((s) => s.id === change.item.id);
      if (onServer >= 0) {
        this.server = this.server.map((s, i) => (i === onServer ? change.item : s));
        this.emit(change);
      } else {
        this.dismissed.delete(change.item.id);
        this.session = [...this.session.filter((s) => s.id !== change.item.id), change.item];
        this.emit(change);
      }
    } else if (change.kind === 'remove') {
      this.server = this.server.filter((s) => s.id !== change.id);
      this.session = this.session.filter((s) => s.id !== change.id);
      this.emit(change);
    } else {
      this.emit(change);
    }
    return change;
  }

  /** Marks entries read here (the server is told separately). */
  markRead(ids: string[] | 'all'): void {
    const all = ids === 'all';
    const mark = (i: InboxItem) => (all || (ids as string[]).includes(i.id) ? { ...i, unread: false } : i);
    this.server = this.server.map(mark);
    this.session = this.session.map(mark);
    this.emit();
  }

  /** Hides entries (the per-item dismiss; a server entry is also dismissed on the server). */
  dismiss(ids: string[]): void {
    for (const id of ids) this.dismissed.add(id);
    this.session = this.session.filter((s) => !ids.includes(s.id));
    this.emit();
  }

  /** server ∪ session, newest session entries first, without dismissed ones. */
  items(): InboxItem[] {
    const ids = new Set(this.server.map((s) => s.id));
    const ours = this.session.filter((s) => !ids.has(s.id)).reverse();
    return [...ours, ...this.server].filter((i) => !this.dismissed.has(i.id));
  }

  subscribe(listener: (change?: InboxChange) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(change?: InboxChange): void {
    for (const l of this.listeners) {
      try {
        l(change);
      } catch {
        // a broken listener does not stop the others
      }
    }
  }
}
