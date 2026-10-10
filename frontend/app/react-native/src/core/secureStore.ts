import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { KeyValueStore } from './sessionId';

/**
 * The persistent store for the install's session id and the OIDC tokens: the platform keychain /
 * keystore on iOS and Android (expo-secure-store — tokens never sit in plain app storage), and
 * localStorage on web, where expo-secure-store is unavailable (the same place the web renderers
 * keep `__mateu_auth_token`). SecureStore keys allow only [A-Za-z0-9._-], which ours respect.
 */
export const platformStore: KeyValueStore =
  Platform.OS === 'web'
    ? {
        get: async (k) => {
          try {
            return globalThis.localStorage?.getItem(k) ?? null;
          } catch {
            return null;
          }
        },
        set: async (k, v) => {
          try {
            globalThis.localStorage?.setItem(k, v);
          } catch {
            // private mode / blocked storage: nothing persists, the app still works this launch
          }
        },
        remove: async (k) => {
          try {
            globalThis.localStorage?.removeItem(k);
          } catch {
            // ignore
          }
        },
      }
    : {
        get: (k) => SecureStore.getItemAsync(k),
        set: (k, v) => SecureStore.setItemAsync(k, v),
        remove: (k) => SecureStore.deleteItemAsync(k),
      };
