import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { platformStore } from '../core/secureStore';
import type { KeyValueStore } from '../core/sessionId';
import { UiStore } from './uiStore';

/** The list of UIs (metadata): AsyncStorage (localStorage on web). Never tokens — see uiStore.ts. */
export const metaStore: KeyValueStore = {
  get: (k) => AsyncStorage.getItem(k),
  set: (k, v) => AsyncStorage.setItem(k, v),
  remove: (k) => AsyncStorage.removeItem(k),
};

/** Tokens and per-UI session ids: the keychain / keystore (expo-secure-store); localStorage on web. */
export const secretStore: KeyValueStore = platformStore;

export const uiStore = new UiStore(metaStore, secretStore);

declare const __DEV__: boolean | undefined;

/** Plain http is refused except on development builds (or with EXPO_PUBLIC_MATEU_ALLOW_HTTP=true,
 *  e.g. the `development` EAS variant that talks to a LAN backend). */
export const allowInsecure: boolean =
  (typeof __DEV__ !== 'undefined' && !!__DEV__) || process.env.EXPO_PUBLIC_MATEU_ALLOW_HTTP === 'true';

/** On the web build, `<own origin>/add?u=…` is accepted like the universal link (what the probe uses). */
export const extraLinkHosts: string[] =
  Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.host ? [window.location.host] : [];

export const appVersion = (): string => Constants.expoConfig?.version ?? '0.0.0';
