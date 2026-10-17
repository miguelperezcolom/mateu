// secureStore.ts on web: localStorage, and a blocked storage never breaks the app. Needs module mocks.
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
// (secureStore.test.ts is the device half).
mock.module('react-native', { namedExports: { Platform: { OS: 'web' } } });
const { platformStore } = await import('./secureStore.ts');
const storeOn = async (_os: string) => platformStore;

test('on web the same store is localStorage', async () => {
  const store = await storeOn('web');
  const web = new Map<string, string>();
  (globalThis as any).localStorage = { getItem: (k: string) => web.get(k) ?? null, setItem: (k: string, v: string) => web.set(k, v), removeItem: (k: string) => web.delete(k) };
  await store.set('mateu.sessionId', 'sid-1');
  assert.equal(web.get('mateu.sessionId'), 'sid-1');
  assert.equal(await store.get('mateu.sessionId'), 'sid-1');
  await store.remove('mateu.sessionId');
  assert.equal(await store.get('mateu.sessionId'), null);
  assert.equal(keychain.size, 0);
  delete (globalThis as any).localStorage;
});

test('on web, blocked or missing storage (private mode) reads as empty and writes are dropped, without throwing', async () => {
  const store = await storeOn('web');
  const boom = () => { throw new Error('SecurityError'); };
  (globalThis as any).localStorage = { getItem: boom, setItem: boom, removeItem: boom };
  assert.equal(await store.get('k'), null);
  await store.set('k', 'v');
  await store.remove('k');
  delete (globalThis as any).localStorage;
  assert.equal(await store.get('k'), null);
});
