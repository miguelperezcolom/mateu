import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { PushRegistrations, type PushPort } from '../core/pushNotifications';
import type { NotificationPermission } from '../core/osNotifications';
import { expoNotifications } from './localNotifications';

/**
 * The PUSH port bound to `expo-notifications` (core/pushNotifications.ts holds every decision). The
 * Expo push token needs the build's EAS project id (`extra.eas.projectId`) and, on Android, the FCM
 * credentials of the build (`android.googleServicesFile`, app.config.ts): without them `token()`
 * answers null and the UI's switch says this phone cannot receive notifications. A binary without
 * the native module (JavaScript that came over the air) and the web build have no push at all.
 */
const statusOf = (status: string | undefined): NotificationPermission =>
  status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';

const dataOf = (response: { notification: { request: { content: { data?: unknown } } } } | null | undefined): unknown =>
  response?.notification.request.content.data ?? null;

function nativePushPort(platform: 'ios' | 'android'): PushPort {
  const listen = (subscribe: (module: NonNullable<Awaited<ReturnType<typeof expoNotifications>>>) => { remove(): void }) => {
    let remove: (() => void) | null = null;
    let off = false;
    void expoNotifications().then((module) => {
      if (!module || off) return;
      const subscription = subscribe(module);
      remove = () => subscription.remove();
    });
    return () => {
      off = true;
      remove?.();
    };
  };
  return {
    platform,
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
    token: async () => {
      const module = await expoNotifications();
      const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
      if (!module || !projectId) return null;
      try {
        return (await module.getExpoPushTokenAsync({ projectId })).data ?? null;
      } catch {
        // no FCM/APNs credentials in this build, or the device has no push service
        return null;
      }
    },
    onOpened: (listener) => listen((module) => module.addNotificationResponseReceivedListener((r) => listener(dataOf(r)))),
    onReceived: (listener) => listen((module) => module.addNotificationReceivedListener((n) => listener(n.request.content.data ?? null))),
    launchedBy: async () => {
      const module = await expoNotifications();
      if (!module) return null;
      try {
        return dataOf(await module.getLastNotificationResponseAsync());
      } catch {
        return null;
      }
    },
  };
}

/** The binding of this platform; null on the web (the hub's UIs use their own web push, if any). */
export function platformPushPort(): PushPort | null {
  return Platform.OS === 'ios' || Platform.OS === 'android' ? nativePushPort(Platform.OS) : null;
}

/** The UIs this phone takes pushes from: plain app storage (a key and a token are no credentials). */
export const pushRegistrations = new PushRegistrations({
  get: (k) => AsyncStorage.getItem(k),
  set: (k, v) => AsyncStorage.setItem(k, v),
  remove: (k) => AsyncStorage.removeItem(k),
});
