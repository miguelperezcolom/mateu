import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { LocalNotifier, NotificationPermission } from '../core/osNotifications';
import { isRemoteTrigger, pushTargetOf, type DevicePushToken, type PushTarget, type PushTokenSource } from '../core/remotePush';

/**
 * The OS-notification port bound to `expo-notifications`: the LOCAL notifications the app posts
 * (core/osNotifications.ts) and, for a UI whose server sends pushes, the Expo push token and the
 * taps on REMOTE pushes (core/remotePush.ts). No token is asked for unless a UI turns push on.
 *
 * The module is loaded LAZILY and its failure is tolerated: an install whose binary predates the
 * native module (its JavaScript came over the air) must not crash — it simply has no OS
 * notifications. On the web (expo web) the browser's Notification API stands in.
 */
type ExpoNotifications = typeof import('expo-notifications');

const CHANNEL = 'mateu';
let loaded: Promise<ExpoNotifications | null> | null = null;

const expoNotifications = (): Promise<ExpoNotifications | null> => {
  if (!loaded) {
    loaded = import('expo-notifications')
      .then(async (module) => {
        // asked only while the app is in front: we post local ones only in the background, and a
        // REMOTE push arriving now is not shown — the bell / the toast already tell it
        module.setNotificationHandler({
          handleNotification: async (notification) => {
            const remote = isRemoteTrigger(notification.request.trigger);
            return {
              shouldShowBanner: !remote,
              shouldShowList: !remote,
              shouldPlaySound: false,
              shouldSetBadge: false,
            };
          },
        });
        if (Platform.OS === 'android') {
          await module.setNotificationChannelAsync(CHANNEL, {
            name: 'Mateu',
            importance: module.AndroidImportance.DEFAULT,
          });
        }
        return module;
      })
      .catch(() => null);
  }
  return loaded;
};

const statusOf = (status: string | undefined): NotificationPermission =>
  status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';

type WebNotification = {
  permission: string;
  requestPermission(): Promise<string>;
  new (title: string, options: { body?: string; tag?: string }): { onclick: (() => void) | null };
};
const webNotification = (): WebNotification | null =>
  (globalThis as { Notification?: WebNotification }).Notification ?? null;

function webNotifier(): LocalNotifier {
  const listeners = new Set<(n: { route?: string | null; scope: string }) => void>();
  return {
    permission: async () => {
      const api = webNotification();
      if (!api) return 'unavailable';
      return api.permission === 'default' ? 'undetermined' : statusOf(api.permission);
    },
    request: async () => {
      const api = webNotification();
      if (!api) return 'unavailable';
      const answer = await api.requestPermission();
      return answer === 'default' ? 'undetermined' : statusOf(answer);
    },
    show: async (n) => {
      const api = webNotification();
      if (!api || api.permission !== 'granted') return;
      const shown = new api(n.title, { body: n.body, tag: n.id });
      shown.onclick = () => {
        (globalThis as { focus?: () => void }).focus?.();
        for (const l of listeners) l({ route: n.route, scope: n.scope });
      };
    },
    onOpened: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

function nativeNotifier(): LocalNotifier {
  return {
    permission: async () => {
      const module = await expoNotifications();
      if (!module) return 'unavailable';
      return statusOf((await module.getPermissionsAsync()).status);
    },
    request: async () => {
      const module = await expoNotifications();
      if (!module) return 'unavailable';
      return statusOf((await module.requestPermissionsAsync()).status);
    },
    show: async (n) => {
      const module = await expoNotifications();
      if (!module) return;
      await module.scheduleNotificationAsync({
        identifier: n.id,
        content: { title: n.title, body: n.body || undefined, data: { route: n.route ?? null, scope: n.scope } },
        // null = now
        trigger: Platform.OS === 'android' ? { channelId: CHANNEL } : null,
      });
    },
    onOpened: (listener) => {
      let remove: (() => void) | null = null;
      let off = false;
      void expoNotifications().then((module) => {
        if (!module || off) return;
        const subscription = module.addNotificationResponseReceivedListener((response) => {
          const data = (response.notification.request.content.data ?? {}) as { route?: string | null; scope?: string };
          if (typeof data.scope === 'string') listener({ route: data.route ?? null, scope: data.scope });
        });
        remove = () => subscription.remove();
      });
      return () => {
        off = true;
        remove?.();
      };
    },
  };
}

/** The binding of this platform. */
export function platformNotifier(): LocalNotifier {
  return Platform.OS === 'web' ? webNotifier() : nativeNotifier();
}

/** The Expo push token of this install (null: web, no native module, no FCM/APNs set up, no
 *  project id). Asked only once a UI turned push on and the user granted the permission. */
export function platformPushTokens(): PushTokenSource {
  return {
    token: async (): Promise<DevicePushToken | null> => {
      if (Platform.OS !== 'ios' && Platform.OS !== 'android') return null;
      const module = await expoNotifications();
      if (!module) return null;
      const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
      const projectId = extra?.eas?.projectId ?? (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
      if (!projectId) return null;
      try {
        const answer = await module.getExpoPushTokenAsync({ projectId });
        return answer?.data ? { token: answer.data, platform: Platform.OS } : null;
      } catch {
        // an Android build without google-services.json, an iOS build without the push entitlement
        return null;
      }
    },
  };
}

let launchResponseRead = false;

/**
 * Taps on REMOTE pushes naming a UI (`{ui, route}`): the one that launched the app (read once per
 * process) and any later one. Local notifications are not reported here (they carry a `scope`).
 */
export function onPushOpened(listener: (target: PushTarget) => void): () => void {
  if (Platform.OS === 'web') return () => undefined;
  let remove: (() => void) | null = null;
  let off = false;
  const handle = (response: { notification: { request: { content: { data?: unknown }; trigger?: unknown } } } | null) => {
    if (!response || off) return;
    const request = response.notification.request;
    if (!isRemoteTrigger(request.trigger)) return;
    const target = pushTargetOf(request.content.data);
    if (target) listener(target);
  };
  void expoNotifications().then(async (module) => {
    if (!module || off) return;
    const subscription = module.addNotificationResponseReceivedListener((response) => handle(response));
    remove = () => subscription.remove();
    if (!launchResponseRead) {
      launchResponseRead = true;
      // the tap that launched a closed app
      handle(module.getLastNotificationResponse?.() ?? null);
    }
  });
  return () => {
    off = true;
    remove?.();
  };
}
