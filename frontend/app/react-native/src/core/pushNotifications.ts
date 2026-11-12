/**
 * PUSH notifications of a UI, through Expo Push Service (pure, unit-tested; the platform part is the
 * {@link PushPort}, bound to expo-notifications in src/ui/localNotifications.ts).
 *
 * A UI whose app class implements `PushTokenRegistry` says so on the wire (`App.pushNotifications`).
 * Nothing is asked on its own: the user turns "Notifications on this phone" on for THAT UI (its
 * drawer), and only then does the app ask the OS for permission, read the device's Expo push token
 * and register it with that UI ALONE (`_push-register`, through the session's own API client — the
 * token never travels to another backend). Per UI, the phone draws an opaque key (`uiKey`); the
 * backend sends it back in every push (`data.mateu.ui`), which is how a tap finds the UI and the
 * route to open — a push carrying a key this phone does not hold opens nothing. Turning it off, or
 * removing the UI from the hub, forgets the key first and then tells the backend
 * (`_push-unregister`). A UI turned on is registered again at every start (Expo may rotate a token),
 * never asking permission again.
 *
 * What the server does with the token — keeping it, sending — is the app's: Mateu keeps nothing.
 */
import type { KeyValueStore } from './sessionId.ts';
import { secureRandomBytes } from './secureRandom.ts';
import { sanitizeRoute } from '../hub/links.ts';
import type { NotificationPermission } from './osNotifications.ts';

export const PUSH_REGISTER = '_push-register';
export const PUSH_UNREGISTER = '_push-unregister';
/** The per-UI registrations (plain app storage: a key and a token are not credentials of the user). */
export const PUSH_REGISTRATIONS_KEY = 'mateu.push.registrations';

export type PushPlatform = 'ios' | 'android';

/** The device side of push (expo-notifications). */
export interface PushPort {
  /** ios / android; null where there is no push (the web build, a binary without the module). */
  readonly platform: PushPlatform | null;
  permission(): Promise<NotificationPermission>;
  /** Asks the OS — call it ONLY from the user's gesture. */
  request(): Promise<NotificationPermission>;
  /** The device's Expo push token; null when it has none (no project id, no FCM/APNs credentials). */
  token(): Promise<string | null>;
  /** A tap on a push notification: its `data`. */
  onOpened(listener: (data: unknown) => void): () => void;
  /** A push that arrived while the app is in front: its `data`. */
  onReceived(listener: (data: unknown) => void): () => void;
  /** The `data` of the push whose tap launched the app (cold start), or null. */
  launchedBy(): Promise<unknown>;
}

const none: PushPort = {
  platform: null,
  permission: async () => 'unavailable',
  request: async () => 'unavailable',
  token: async () => null,
  onOpened: () => () => undefined,
  onReceived: () => () => undefined,
  launchedBy: async () => null,
};

let port: PushPort = none;

/** The platform binding (registered at boot); without one push is simply unavailable. */
export const setPushPort = (value: PushPort | null): void => {
  port = value ?? none;
};
export const pushPort = (): PushPort => port;

const EXPO_TOKEN = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]{8,200}\]$/;
const UI_KEY = /^[A-Za-z0-9_-]{8,64}$/;

/** The token shape every backend accepts (and checks again). */
export const isExpoPushToken = (token: unknown): token is string => typeof token === 'string' && EXPO_TOKEN.test(token);

/** A fresh opaque key for one UI on this phone (secure random: a guessed key would open nothing,
 *  but it must not tell one phone from another either). */
export function newPushKey(random: (bytes: Uint8Array) => Uint8Array = secureRandomBytes): string {
  return 'p' + Array.from(random(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
}

/** What a push asks the phone to open: `data.mateu = {ui: <key>, route?: <mount-relative route>}`. */
export interface PushTarget {
  key: string;
  /** A route of that UI ('' = where it opens). Never an absolute or protocol-relative URL. */
  route: string;
}

/** Pure: the target of a push's `data`, or null when it is not one of ours / is malformed. */
export function pushTargetOf(data: unknown): PushTarget | null {
  const mateu = data && typeof data === 'object' ? (data as Record<string, unknown>)['mateu'] : null;
  if (!mateu || typeof mateu !== 'object') return null;
  const m = mateu as Record<string, unknown>;
  const key = m['ui'];
  if (typeof key !== 'string' || !UI_KEY.test(key)) return null;
  const route = typeof m['route'] === 'string' ? sanitizeRoute(m['route']) ?? '' : '';
  return { key, route };
}

/** One UI this phone takes push notifications from. */
export interface PushRecord {
  key: string;
  /** The UI (its base URL): the ONLY backend this token is sent to. */
  baseUrl: string;
  token: string;
  platform: PushPlatform;
  /** Where the app-level actions go (the app shell's route and class), to unregister without a screen. */
  route: string;
  serverSideType: string | null;
}

const sanitize = (raw: unknown): PushRecord[] => {
  if (!Array.isArray(raw)) return [];
  const out: PushRecord[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const e = r as Record<string, unknown>;
    if (typeof e['key'] !== 'string' || !UI_KEY.test(e['key'])) continue;
    if (typeof e['baseUrl'] !== 'string' || !e['baseUrl'] || !isExpoPushToken(e['token'])) continue;
    if (e['platform'] !== 'ios' && e['platform'] !== 'android') continue;
    if (out.some((x) => x.baseUrl === e['baseUrl'] || x.key === e['key'])) continue;
    out.push({
      key: e['key'],
      baseUrl: e['baseUrl'],
      token: e['token'] as string,
      platform: e['platform'],
      route: typeof e['route'] === 'string' ? e['route'] : '',
      serverSideType: typeof e['serverSideType'] === 'string' ? e['serverSideType'] : null,
    });
  }
  return out;
};

/** The UIs this phone takes pushes from (persisted; one record per base URL). */
export class PushRegistrations {
  private listeners = new Set<() => void>();
  private readonly store: KeyValueStore;

  constructor(store: KeyValueStore) {
    this.store = store;
  }

  async list(): Promise<PushRecord[]> {
    try {
      const raw = await this.store.get(PUSH_REGISTRATIONS_KEY);
      return raw ? sanitize(JSON.parse(raw)) : [];
    } catch {
      return [];
    }
  }

  async forBaseUrl(baseUrl: string): Promise<PushRecord | undefined> {
    return (await this.list()).find((r) => r.baseUrl === baseUrl);
  }

  async byKey(key: string): Promise<PushRecord | undefined> {
    return (await this.list()).find((r) => r.key === key);
  }

  async put(record: PushRecord): Promise<void> {
    const rest = (await this.list()).filter((r) => r.baseUrl !== record.baseUrl && r.key !== record.key);
    await this.save([...rest, record]);
  }

  async remove(baseUrl: string): Promise<void> {
    await this.save((await this.list()).filter((r) => r.baseUrl !== baseUrl));
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private async save(list: PushRecord[]): Promise<void> {
    await this.store.set(PUSH_REGISTRATIONS_KEY, JSON.stringify(list)).catch(() => undefined);
    for (const l of this.listeners) l();
  }
}

/** Runs an app-level action against ONE UI's backend (its own API client and credentials). */
export interface PushHost {
  readonly baseUrl: string;
  /** The app shell's route and class (what the app-level actions are dispatched with). */
  readonly route: string;
  readonly serverSideType: string | null;
  run(actionId: string, parameters: Record<string, unknown>): Promise<unknown>;
}

const parametersOf = (r: Pick<PushRecord, 'token' | 'platform' | 'key'>) => ({
  token: r.token,
  service: 'expo',
  platform: r.platform,
  uiKey: r.key,
});

export type EnableOutcome = 'enabled' | 'denied' | 'unavailable' | 'failed';

/**
 * The user turned it on for this UI (call it from that tap: it may ask the OS). The registration is
 * kept only once the UI's backend accepted it.
 */
export async function enablePush(host: PushHost, registrations: PushRegistrations, device: PushPort = port): Promise<EnableOutcome> {
  if (!device.platform) return 'unavailable';
  let permission = await device.permission();
  if (permission === 'unavailable') return 'unavailable';
  if (permission !== 'granted') permission = await device.request();
  if (permission !== 'granted') return permission === 'unavailable' ? 'unavailable' : 'denied';
  const token = await device.token().catch(() => null);
  if (!isExpoPushToken(token)) return 'unavailable';
  const existing = await registrations.forBaseUrl(host.baseUrl);
  const record: PushRecord = {
    key: existing?.key ?? newPushKey(),
    baseUrl: host.baseUrl,
    token,
    platform: device.platform,
    route: host.route,
    serverSideType: host.serverSideType,
  };
  try {
    await host.run(PUSH_REGISTER, parametersOf(record));
  } catch {
    return 'failed';
  }
  await registrations.put(record);
  return 'enabled';
}

/**
 * Turned off, or the UI removed: the key is forgotten FIRST (a push still on its way opens nothing),
 * then the backend is told — best effort: offline, the phone has stopped listening anyway.
 */
export async function disablePush(
  baseUrl: string,
  registrations: PushRegistrations,
  host: ((r: PushRecord) => PushHost | null | Promise<PushHost | null>) | PushHost | null,
): Promise<void> {
  const record = await registrations.forBaseUrl(baseUrl);
  if (!record) return;
  await registrations.remove(baseUrl);
  try {
    const target = typeof host === 'function' ? await host(record) : host;
    if (!target || target.baseUrl !== record.baseUrl) return;
    await target.run(PUSH_UNREGISTER, parametersOf(record));
  } catch {
    // the backend drops the token when Expo answers DeviceNotRegistered, or on its own
  }
}

/**
 * At every start of a UI the user turned on: registered again (the token may have rotated). Never
 * asks for permission; a permission withdrawn in the OS settings leaves the record as it is.
 */
export async function refreshPush(host: PushHost, registrations: PushRegistrations, device: PushPort = port): Promise<boolean> {
  const record = await registrations.forBaseUrl(host.baseUrl);
  if (!record || !device.platform) return false;
  if ((await device.permission()) !== 'granted') return false;
  const token = await device.token().catch(() => null);
  if (!isExpoPushToken(token)) return false;
  const fresh: PushRecord = { ...record, token, platform: device.platform, route: host.route, serverSideType: host.serverSideType };
  try {
    await host.run(PUSH_REGISTER, parametersOf(fresh));
  } catch {
    return false;
  }
  if (token !== record.token || fresh.route !== record.route || fresh.serverSideType !== record.serverSideType) {
    await registrations.put(fresh);
  }
  return true;
}

/** The record a push belongs to (by its key), or null — a push for a key this phone does not hold. */
export async function recordOfPush(data: unknown, registrations: PushRegistrations): Promise<{ record: PushRecord; route: string } | null> {
  const target = pushTargetOf(data);
  if (!target) return null;
  const record = await registrations.byKey(target.key);
  return record ? { record, route: target.route } : null;
}

/**
 * Taps on push notifications, the one that launched the app included (asked ONCE per process: a
 * second listener — a remount — does not reopen it): `open` gets the record (the UI) and the route.
 * A push for a key this phone does not hold, or not one of ours, opens nothing. Answers the unsubscribe.
 */
let launchHandled = false;
export function onPushOpened(
  registrations: PushRegistrations,
  open: (record: PushRecord, route: string) => void,
  device: PushPort = port,
): () => void {
  let alive = true;
  const handle = (data: unknown) =>
    void recordOfPush(data, registrations)
      .then((found) => {
        if (alive && found) open(found.record, found.route);
      })
      .catch(() => undefined);
  if (!launchHandled) {
    launchHandled = true;
    void device.launchedBy().then((data) => data && handle(data)).catch(() => undefined);
  }
  const off = device.onOpened(handle);
  return () => {
    alive = false;
    off();
  };
}

/** Tests only: the launching push is asked again. */
export const resetLaunchHandledForTests = (): void => {
  launchHandled = false;
};

/** The texts of the push switch (en/es, like the hub's own). */
export function pushTexts(locale: string | undefined) {
  const es = /^es\b/i.test(locale ?? '');
  return es
    ? {
        label: 'Notificaciones en este teléfono',
        denied: 'Las notificaciones de Mateu están desactivadas en los ajustes del teléfono.',
        unavailable: 'Este teléfono no puede recibir notificaciones de esta UI.',
        failed: 'No se pudieron activar las notificaciones. Inténtalo de nuevo.',
        enabled: 'Recibirás notificaciones de esta UI en este teléfono.',
        disabled: 'Ya no recibirás notificaciones de esta UI.',
      }
    : {
        label: 'Notifications on this phone',
        denied: 'Notifications for Mateu are turned off in the phone settings.',
        unavailable: 'This phone cannot receive notifications from this UI.',
        failed: 'Notifications could not be turned on. Try again.',
        enabled: 'You will get notifications from this UI on this phone.',
        disabled: 'You will no longer get notifications from this UI.',
      };
}
