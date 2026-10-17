// The hub's stores (storage.ts): the UI list is metadata in AsyncStorage, tokens and per-UI session
// ids go to the platform secret store — never the other way round. Plus the http/link policy.
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native', 'expo-secure-store', 'expo-constants', '@react-native-async-storage/async-storage']);

const asyncStorage = new Map<string, string>();
const keychain = new Map<string, string>();
const constants: { expoConfig: any } = { expoConfig: { version: '2.1.0' } };
mock.module('@react-native-async-storage/async-storage', {
  defaultExport: {
    getItem: async (k: string) => asyncStorage.get(k) ?? null,
    setItem: async (k: string, v: string) => { asyncStorage.set(k, v); },
    removeItem: async (k: string) => { asyncStorage.delete(k); },
  },
});
mock.module('expo-secure-store', {
  namedExports: {
    getItemAsync: async (k: string) => keychain.get(k) ?? null,
    setItemAsync: async (k: string, v: string) => { keychain.set(k, v); },
    deleteItemAsync: async (k: string) => { keychain.delete(k); },
  },
});
mock.module('expo-constants', { defaultExport: constants });
mock.module('react-native', { namedExports: { Platform: { OS: 'android' } } });

const storage = await import('./storage.ts');
const { uiSecretKeys } = await import('./uiStore.ts');

test('UI metadata lives in AsyncStorage, secrets in the keychain', async () => {
  await storage.metaStore.set('mateu.uis', '[]');
  assert.equal(asyncStorage.get('mateu.uis'), '[]');
  assert.equal(await storage.metaStore.get('mateu.uis'), '[]');
  await storage.metaStore.remove('mateu.uis');
  assert.equal(asyncStorage.has('mateu.uis'), false);
  await storage.secretStore.set('ui.1.tokens', 'tok');
  assert.equal(keychain.get('ui.1.tokens'), 'tok');
  assert.equal(asyncStorage.size, 0);
});

test('the hub UiStore persists the UI list as metadata, and forgetting a UI clears its secrets from the keychain', async () => {
  keychain.clear();
  asyncStorage.clear();
  const { entry } = await storage.uiStore.add('https://apps.example.com/admin');
  assert.ok(asyncStorage.size > 0);
  assert.ok([...asyncStorage.values()].some((v) => v.includes('apps.example.com')));
  assert.equal(keychain.size, 0);
  const keys = uiSecretKeys(entry.id);
  await storage.secretStore.set(keys.tokens, 'tok');
  await storage.secretStore.set(keys.sessionId, 'sid');
  await storage.uiStore.remove(entry.id);
  assert.ok(![...asyncStorage.values()].some((v) => v.includes('apps.example.com')));
  assert.equal(keychain.size, 0);
});

test('plain http is refused outside development builds unless explicitly allowed', () => {
  assert.equal(storage.allowInsecure, false);
});

test('on a device no extra link host is accepted (only the universal link)', () => {
  assert.deepEqual(storage.extraLinkHosts, []);
});

test('the app version is the installable expo.version, 0.0.0 when unknown', () => {
  assert.equal(storage.appVersion(), '2.1.0');
  constants.expoConfig = null;
  assert.equal(storage.appVersion(), '0.0.0');
});
