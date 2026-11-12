import { Platform } from 'react-native';
import type { LocalNotifier, NotificationPermission } from '../core/osNotifications';

/**
 * The OS-notification port bound to `expo-notifications` — LOCAL notifications (core/osNotifications.ts).
 * Push notifications have their own port over the same module (src/ui/pushPort.ts).
 *
 * The module is loaded LAZILY and its failure is tolerated: an install whose binary predates the
 * native module (its JavaScript came over the air) must not crash — it simply has no OS
 * notifications. On the web (expo web) the browser's Notification API stands in.
 */
type ExpoNotifications = typeof import('expo-notifications');

const CHANNEL = 'mateu';
let loaded: Promise<ExpoNotifications | null> | null = null;

/** The module, loaded once (shared with the push port, src/ui/pushPort.ts); null without it. */
export const expoNotifications = (): Promise<ExpoNotifications | null> => {
  if (!loaded) {
    loaded = import('expo-notifications')
      .then(async (module) => {
        // shown while the app is in front too: a local one is only posted in the background, and a
        // PUSH that arrives with the app open is still worth the banner (core/pushNotifications.ts)
        module.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
          }),
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
