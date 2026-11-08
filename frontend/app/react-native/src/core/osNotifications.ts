/**
 * OS-LEVEL notifications of one running UI (design/progress-and-notifications.md, "OS-level
 * notifications"), opt-in per app (`@App(osNotifications = true)` → App.osNotifications). Two events
 * are worth leaving the app for — a NEW unread inbox entry and a task that finished (done/failed)
 * while it was in the background — and they are posted only while the app is not in front. LOCAL
 * notifications only (no push service, no token, nothing leaves the device). Permission is asked only
 * from the user's tap ("Notify me on this device"), never on its own.
 *
 * Pure decisions here; the platform part is the {@link LocalNotifier} port (src/ui/localNotifications.ts
 * binds expo-notifications, a missing native module / web → none).
 */
import type { InboxItem } from './inbox.ts';
import type { Task } from './taskCenter.ts';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

export interface OsNotification {
  /** collapses repeats (the entry id / the task id) */
  id: string;
  title: string;
  body: string;
  /** opened on tap */
  route?: string | null;
  /** which UI posted it (the base url): a tap opens it in that UI only */
  scope: string;
}

export interface LocalNotifier {
  permission(): Promise<NotificationPermission>;
  /** Asks the OS (call it ONLY from a user's gesture). */
  request(): Promise<NotificationPermission>;
  show(notification: OsNotification): Promise<void>;
  /** A tap on one of ours: the app is in front again. */
  onOpened(listener: (notification: { route?: string | null; scope: string }) => void): () => void;
}

const none: LocalNotifier = {
  permission: async () => 'unavailable',
  request: async () => 'unavailable',
  show: async () => undefined,
  onOpened: () => () => undefined,
};

let notifier: LocalNotifier = none;

/** The platform binding (registered at boot); without one nothing is ever posted. */
export const setLocalNotifier = (value: LocalNotifier | null): void => {
  notifier = value ?? none;
};
export const localNotifier = (): LocalNotifier => notifier;

const NOTIFY_STATES = new Set(['done', 'failed']);

/** Pure: the OS notification of a new inbox entry. */
export function inboxNotificationOf(item: InboxItem, scope: string): OsNotification {
  return {
    id: `inbox-${item.id}`,
    title: item.title || item.text || 'Notification',
    body: item.title ? item.text ?? '' : '',
    route: item.route ?? item.actions?.find((a) => !!a.route)?.route ?? null,
    scope,
  };
}

/** Pure: the OS notification of a finished task — only one the user was not waiting for. */
export function taskNotificationOf(task: Task, scope: string): OsNotification | null {
  if (!NOTIFY_STATES.has(task.state) || !task.backgrounded) return null;
  const failed = task.state === 'failed';
  return {
    id: `task-${task.taskId}`,
    title: `${task.title || 'Task'} ${failed ? 'failed' : 'finished'}`,
    body: failed ? task.error || task.text || '' : task.text || '',
    route: task.resultActions.find((a) => !!a.route)?.route ?? null,
    scope,
  };
}

/** What the wiring listens to (a MateuSession's stores). */
export interface NotifiedSession {
  readonly osNotifications: boolean;
  readonly api: { readonly baseUrl: string };
  readonly inbox: { subscribeNew(listener: (item: InboxItem) => void): () => void };
  readonly tasks: { subscribeEvents(listener: (event: { kind: 'started' | 'finished'; task: Task }) => void): () => void };
}

/**
 * Posts a session's notifications while `inFront()` is false and the app opted in. Answers the
 * unsubscribe. The permission is read, never asked, here: without it nothing is posted.
 */
export function wireOsNotifications(session: NotifiedSession, inFront: () => boolean): () => void {
  const post = (notification: OsNotification | null) => {
    if (!notification || !session.osNotifications || inFront()) return;
    void (async () => {
      const current = localNotifier();
      if ((await current.permission()) !== 'granted') return;
      await current.show(notification);
    })().catch(() => undefined);
  };
  const scope = session.api.baseUrl;
  const offInbox = session.inbox.subscribeNew((item) => post(inboxNotificationOf(item, scope)));
  const offTasks = session.tasks.subscribeEvents((event) => {
    if (event.kind === 'finished') post(taskNotificationOf(event.task, scope));
  });
  return () => {
    offInbox();
    offTasks();
  };
}
