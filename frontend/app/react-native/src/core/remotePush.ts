/**
 * REMOTE push (the reach of `@App(osNotifications = true)` beyond an app in front): with the app's
 * opt-in, a server that sends pushes (`App.pushNotifications`) and the user's permission, the
 * phone's Expo push token is registered with the UI's backend through the reserved app-level action
 * `_push-register {token, platform, deviceId, ui}`, and removed with `_push-unregister {token}` on
 * sign-out, when the UI leaves the hub, or when the permission is gone. A push carries `{ui, route}`:
 * a tap opens that UI of the phone's list at that route. While the app is in front a push is not
 * shown by the OS — the bell / toast already tell it.
 *
 * Pure decisions here (unit-tested); the platform part is the {@link PushTokenSource} port
 * (src/ui/localNotifications.ts binds expo-notifications).
 */
import type { NotificationPermission } from './osNotifications.ts';
import type { KeyValueStore } from './sessionId.ts';

export const REGISTER_ACTION = '_push-register';
export const UNREGISTER_ACTION = '_push-unregister';

export interface DevicePushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

/** Where the phone's push token comes from (null = none: no native module, no FCM config, web…). */
export interface PushTokenSource {
  token(): Promise<DevicePushToken | null>;
}

const noTokens: PushTokenSource = { token: async () => null };
let source: PushTokenSource = noTokens;

/** The platform binding (registered at boot). */
export const setPushTokenSource = (value: PushTokenSource | null): void => {
  source = value ?? noTokens;
};
export const pushTokenSource = (): PushTokenSource => source;

/** What a push says about where it leads: the UI's base url and the route. */
export interface PushTarget {
  ui: string;
  route: string | null;
}

const isWebUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.host;
  } catch {
    return false;
  }
};

/** Pure: the target of a remote push's data (`{ui, route}`), or null when it names no UI. */
export function pushTargetOf(data: unknown): PushTarget | null {
  if (!data || typeof data !== 'object') return null;
  const { ui, route } = data as { ui?: unknown; route?: unknown };
  if (!isWebUrl(ui)) return null;
  // a route is a path inside the UI, never a url of its own
  const path = typeof route === 'string' && route.length <= 2048 && !/^[a-z][a-z0-9+.-]*:/i.test(route) && !route.startsWith('//')
    ? route
    : null;
  return { ui, route: path };
}

/** Pure: a notification's trigger says it came from the push service (not posted by the app). */
export const isRemoteTrigger = (trigger: unknown): boolean =>
  !!trigger && typeof trigger === 'object' && (trigger as { type?: unknown }).type === 'push';

/** Pure: the same base url, give or take a trailing slash. */
export const sameUi = (a: string, b: string): boolean => a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

// ── what this phone registered, per UI (to unregister later, even with the UI closed) ──

export const REGISTRATIONS_KEY = 'mateu.push.registrations';
export const DEVICE_ID_KEY = 'mateu.push.deviceId';

export interface PushRegistration {
  token: string;
  /** the app-level dispatch of the UI (its app route and class) */
  route: string;
  serverSideType: string | null;
  at: number;
}

export type Registrations = Record<string, PushRegistration>;

export async function readRegistrations(store: KeyValueStore): Promise<Registrations> {
  try {
    const raw = await store.get(REGISTRATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Registrations) : {};
  } catch {
    return {};
  }
}

async function writeRegistrations(store: KeyValueStore, all: Registrations): Promise<void> {
  try {
    await store.set(REGISTRATIONS_KEY, JSON.stringify(all));
  } catch {
    // a lost record only means the server keeps a token it would drop anyway on the next failure
  }
}

/** The install's push device id: drawn once (a new token of the same phone replaces the old one). */
export async function pushDeviceId(store: KeyValueStore, make: () => string): Promise<string> {
  try {
    const existing = await store.get(DEVICE_ID_KEY);
    if (existing) return existing;
    const id = make();
    await store.set(DEVICE_ID_KEY, id);
    return id;
  } catch {
    return make();
  }
}

/** A registration this recent is not repeated on the next foreground. */
export const REFRESH_AFTER_MS = 10 * 60 * 1000;

/** What one UI's sync needs. */
export interface PushSyncContext {
  baseUrl: string;
  /** the app opted in AND its server sends pushes */
  enabled: boolean;
  permission: () => Promise<NotificationPermission>;
  token: () => Promise<DevicePushToken | null>;
  deviceId: () => Promise<string>;
  /** runs an app-level action of the UI; answers its increment */
  run: (actionId: string, parameters: Record<string, unknown>) => Promise<unknown>;
  store: KeyValueStore;
  dispatch: { route: string; serverSideType: string | null };
  now?: () => number;
}

/** Pure: whether an answer to `_push-register` says the server kept the token. */
export function registeredIn(increment: unknown): boolean {
  for (const fragment of (increment as { fragments?: { data?: Record<string, unknown> }[] })?.fragments ?? []) {
    const push = fragment.data?.['_push'] as { registered?: unknown } | undefined;
    if (push && typeof push === 'object') return push.registered === true;
  }
  return false;
}

export type PushSyncOutcome = 'registered' | 'unchanged' | 'unregistered' | 'none';

/**
 * Brings one UI's registration in line with what is true now: registered while the app opted in,
 * push is on and the permission is granted (again after {@link REFRESH_AFTER_MS}, or with a new
 * token — the server's default store forgets on restart); unregistered otherwise. Never throws.
 */
export async function syncPushRegistration(ctx: PushSyncContext): Promise<PushSyncOutcome> {
  const now = (ctx.now ?? Date.now)();
  try {
    const all = await readRegistrations(ctx.store);
    const current = all[ctx.baseUrl];
    const allowed = ctx.enabled && (await ctx.permission()) === 'granted';
    if (!allowed) {
      if (!current) return 'none';
      await ctx.run(UNREGISTER_ACTION, { token: current.token }).catch(() => undefined);
      delete all[ctx.baseUrl];
      await writeRegistrations(ctx.store, all);
      return 'unregistered';
    }
    const device = await ctx.token();
    if (!device) return 'none';
    if (current && current.token === device.token && now - current.at < REFRESH_AFTER_MS) return 'unchanged';
    if (current && current.token !== device.token) {
      await ctx.run(UNREGISTER_ACTION, { token: current.token }).catch(() => undefined);
    }
    const answer = await ctx.run(REGISTER_ACTION, {
      token: device.token,
      platform: device.platform,
      deviceId: await ctx.deviceId(),
      ui: ctx.baseUrl,
    });
    if (!registeredIn(answer)) {
      if (current) {
        delete all[ctx.baseUrl];
        await writeRegistrations(ctx.store, all);
      }
      return 'none';
    }
    all[ctx.baseUrl] = { token: device.token, route: ctx.dispatch.route, serverSideType: ctx.dispatch.serverSideType, at: now };
    await writeRegistrations(ctx.store, all);
    return 'registered';
  } catch {
    return 'none';
  }
}

/**
 * Forgets one UI's registration on this phone and asks its server to forget the token too (sign-out,
 * the UI removed from the hub). `run` gets the recorded app-level dispatch. Never throws.
 */
export async function unregisterPush(
  store: KeyValueStore,
  baseUrl: string,
  run: (actionId: string, parameters: Record<string, unknown>, dispatch: PushRegistration) => Promise<unknown>,
): Promise<boolean> {
  try {
    const all = await readRegistrations(store);
    const current = all[baseUrl];
    if (!current) return false;
    delete all[baseUrl];
    await writeRegistrations(store, all);
    await run(UNREGISTER_ACTION, { token: current.token }, current).catch(() => undefined);
    return true;
  } catch {
    return false;
  }
}

// ── taps: who opens a UI named by a push ──

let hubHandlesTaps = false;
/** The hub opens a tapped push's UI itself (its list knows them all); a fixed app's session does. */
export const setHubHandlesPushTaps = (value: boolean): void => {
  hubHandlesTaps = value;
};
export const hubHandlesPushTaps = (): boolean => hubHandlesTaps;
