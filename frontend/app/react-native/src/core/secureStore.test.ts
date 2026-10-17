// Where the session id and the OIDC tokens live (secureStore.ts): the keychain/keystore on a device,
// localStorage on web — and a blocked web storage never breaks the app. Needs module mocks.
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native', 'expo-secure-store']);

const keychain = new Map<string, string>();
mock.module('expo-secure-store', {
  namedExports: {
    getItemAsync: async (k: string) => keychain.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => { keychain.set(k, v); },
    deleteItemAsync: async (k: string) => { keychain.delete(k); },
  },
});

// Platform.OS is read when the module loads, so each platform gets its own test file
// (secureStore.web.test.ts is the web half).
mock.module('react-native', { namedExports: { Platform: { OS: 'ios' } } });
const { platformStore } = await import('./secureStore.ts');
const storeOn = async (_os: string) => platformStore;

test('on a device the tokens go to the keychain / keystore, never to localStorage', async () => {
  const store = await storeOn('ios');
  const web = new Map<string, string>();
  (globalThis as any).localStorage = { getItem: (k: string) => web.get(k) ?? null, setItem: (k: string, v: string) => web.set(k, v), removeItem: (k: string) => web.delete(k) };
  await store.set('mateu.oidc.tokens', 'secret');
  assert.equal(keychain.get('mateu.oidc.tokens'), 'secret');
  assert.equal(web.size, 0);
  assert.equal(await store.get('mateu.oidc.tokens'), 'secret');
  await store.remove('mateu.oidc.tokens');
  assert.equal(keychain.has('mateu.oidc.tokens'), false);
  delete (globalThis as any).localStorage;
});

