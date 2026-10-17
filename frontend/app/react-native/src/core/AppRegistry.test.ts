// The app registry boot (AppRegistry.ts): where an installable finds its backend, and when it must
// stop and ask the user to update. expo-constants is replaced (the installable's app.json).
import { afterEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['expo-constants']);
const constants: { expoConfig: Record<string, any> | null } = { expoConfig: { version: '1.4.0', extra: {} } };
mock.module('expo-constants', { defaultExport: constants });

const { readRegistryConfig, registryEntryUrl, fetchRegistryEntry, compareVersions, installedRendererVersion, updateRequired } =
  await import('./AppRegistry.ts');

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  constants.expoConfig = { version: '1.4.0', extra: {} };
  delete process.env.EXPO_PUBLIC_MATEU_REGISTRY_URL;
  delete process.env.EXPO_PUBLIC_MATEU_APP_ID;
});

test('the registry coordinates come from app.json extra, else from the EXPO_PUBLIC env vars', () => {
  constants.expoConfig = { extra: { mateuRegistryUrl: 'https://reg.example.com', mateuAppId: 'admin' } };
  assert.deepEqual(readRegistryConfig(), { registryUrl: 'https://reg.example.com', appId: 'admin' });
  constants.expoConfig = { extra: {} };
  process.env.EXPO_PUBLIC_MATEU_REGISTRY_URL = 'https://dev-reg';
  process.env.EXPO_PUBLIC_MATEU_APP_ID = 'dev-app';
  assert.deepEqual(readRegistryConfig(), { registryUrl: 'https://dev-reg', appId: 'dev-app' });
});

test('without both a registry url and an app id there is no registry (the dev config boots)', () => {
  constants.expoConfig = { extra: { mateuRegistryUrl: 'https://reg' } };
  assert.equal(readRegistryConfig(), null);
  constants.expoConfig = null;
  assert.equal(readRegistryConfig(), null);
});

test('the entry url: {registryUrl}/{appId}.json for static hosting, or the {appId} placeholder for dynamic registries', () => {
  assert.equal(registryEntryUrl({ registryUrl: 'https://reg/apps//', appId: 'my app' }), 'https://reg/apps/my%20app.json');
  assert.equal(registryEntryUrl({ registryUrl: 'https://reg/api?id={appId}', appId: 'a/b' }), 'https://reg/api?id=a%2Fb');
});

test('fetching the entry asks for JSON and returns it', async () => {
  const seen: any[] = [];
  globalThis.fetch = (async (url: string, init: any) => {
    seen.push({ url, init });
    return { ok: true, status: 200, json: async () => ({ appId: 'admin', baseUrl: 'https://apps/admin', parameters: { tenantId: '1' } }) };
  }) as any;
  const entry = await fetchRegistryEntry({ registryUrl: 'https://reg', appId: 'admin' });
  assert.equal(entry.baseUrl, 'https://apps/admin');
  assert.deepEqual(entry.parameters, { tenantId: '1' });
  assert.equal(seen[0].url, 'https://reg/admin.json');
  assert.equal(seen[0].init.headers.Accept, 'application/json');
});

test('a registry error or an entry without baseUrl is reported with the cause, never booted', async () => {
  globalThis.fetch = (async () => ({ ok: false, status: 404, json: async () => ({}) })) as any;
  await assert.rejects(fetchRegistryEntry({ registryUrl: 'https://reg', appId: 'x' }), /HTTP 404 for https:\/\/reg\/x\.json/);
  globalThis.fetch = (async () => ({ ok: true, status: 200, json: async () => ({ appId: 'x' }) })) as any;
  await assert.rejects(fetchRegistryEntry({ registryUrl: 'https://reg', appId: 'x' }), /'x' has no baseUrl/);
});

test('versions compare numerically by segment, missing segments count as 0', () => {
  assert.ok(compareVersions('1.10.0', '1.9.9') > 0);
  assert.equal(compareVersions('1.2', '1.2.0'), 0);
  assert.ok(compareVersions('1.2.0', '1.2.1') < 0);
  assert.equal(compareVersions('1.x', '1.0'), 0);
});

test('an update is required only when the entry asks for a newer renderer than the installed one', () => {
  assert.equal(installedRendererVersion(), '1.4.0');
  assert.equal(updateRequired({ baseUrl: 'x' }), false);
  assert.equal(updateRequired({ baseUrl: 'x', requiredRendererVersion: '1.4.0' }), false);
  assert.equal(updateRequired({ baseUrl: 'x', requiredRendererVersion: '1.5' }), true);
  constants.expoConfig = {};
  assert.equal(installedRendererVersion(), '0.0.0');
});
