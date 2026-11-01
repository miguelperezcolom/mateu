import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';
import { MIN_WIRE_VERSION } from '../core/wireVersion.ts';
import { openExternal } from '../renderer/openExternal.ts';
import type { AppSide } from './compat.ts';
import { appVersion } from './storage.ts';
import { storeUrlFor } from './updateTargets.ts';

/**
 * What this app knows of itself for the compatibility check (compat.ts): the wire it was built for,
 * the Mateu release its renderer comes from — `extra.mateuVersion`, stamped by the release builds
 * (MATEU_VERSION, app.config.ts; an over-the-air update carries its own) — and the app version.
 */
export function appSide(): AppSide {
  const extra = (Constants.expoConfig?.extra ?? {}) as { mateuVersion?: unknown };
  // EXPO_PUBLIC_MATEU_VERSION (inlined by the bundler) covers what the app config does not reach:
  // Expo web in development serves app.json without app.config.ts's extras
  const stamped = typeof extra.mateuVersion === 'string' && extra.mateuVersion
    ? extra.mateuVersion
    : process.env.EXPO_PUBLIC_MATEU_VERSION || null;
  return { wire: MIN_WIRE_VERSION, mateuVersion: stamped, appVersion: appVersion() };
}

/** The store (or release page) this installable updates from. */
export function storeUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as { distribution?: unknown };
  return storeUrlFor(Platform.OS, typeof extra.distribution === 'string' ? extra.distribution : undefined);
}

export type UpdateOutcome = 'reloading' | 'store' | 'failed';

/**
 * "Update Mateu": an over-the-air update first (expo-updates — real on EAS-built installables;
 * it relaunches the app on the new bundle and never returns), else the store. Returns what happened
 * so the screen can say so.
 */
export async function updateApp(): Promise<UpdateOutcome> {
  try {
    if (Updates.isEnabled) {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
        return 'reloading';
      }
    }
  } catch {
    // no OTA reachable: the store
  }
  // the one door to the OS for a url (http(s)/mailto/tel only)
  return openExternal(storeUrl()) ? 'store' : 'failed';
}
