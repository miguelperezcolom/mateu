import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyVariant, bootModeOf, hubEnabled, variantOf, type VariantConfig } from './buildVariant.ts';

const appJson = (): VariantConfig => ({
  name: 'Mateu',
  slug: 'mateu-native',
  scheme: 'mateu',
  ios: {
    bundleIdentifier: 'io.mateu.app',
    associatedDomains: ['applinks:mateu.io'],
    infoPlist: { NSCameraUsageDescription: 'Mateu uses the camera to scan QR codes…' },
  },
  android: { package: 'io.mateu.app', intentFilters: [{ action: 'VIEW' }], permissions: ['android.permission.CAMERA'] },
  plugins: ['expo-asset', ['expo-camera', { cameraPermission: 'scan QR codes', microphonePermission: false }]],
  extra: { mateuRegistryUrl: '', mateuAppId: '', eas: { projectId: 'p' } },
});

test('the hub is the default and keeps app.json as it is', () => {
  assert.equal(variantOf({}), 'hub');
  assert.equal(variantOf({ MATEU_VARIANT: ' HUB ' }), 'hub');
  const hub = applyVariant(appJson(), {});
  assert.deepEqual({ ...hub, extra: undefined }, { ...appJson(), extra: undefined });
  assert.equal(hub.extra?.mateuVariant, 'hub');
  assert.ok(hubEnabled(hub.extra!));
});

test('an unknown variant fails the build', () => {
  assert.throws(() => variantOf({ MATEU_VARIANT: 'kiosk' }), /hub or fixed/);
});

test('a fixed build needs its UI, as a url or registry coordinates', () => {
  assert.throws(() => applyVariant(appJson(), { MATEU_VARIANT: 'fixed' }), /needs its UI/);
  assert.throws(() => applyVariant(appJson(), { MATEU_VARIANT: 'fixed', MATEU_REGISTRY_URL: 'https://r' }), /needs its UI/);
  assert.throws(() => applyVariant(appJson(), { MATEU_VARIANT: 'fixed', MATEU_FIXED_URL: 'crm.acme.com' }), /http\(s\) URL/);
  const viaRegistry = applyVariant(appJson(), { MATEU_VARIANT: 'fixed', MATEU_REGISTRY_URL: 'https://r', MATEU_APP_ID: 'crm' });
  assert.equal(viaRegistry.extra?.mateuRegistryUrl, 'https://r');
  assert.equal(viaRegistry.extra?.mateuAppId, 'crm');
});

test('a fixed build claims none of the hub links and brands itself', () => {
  const fixed = applyVariant(appJson(), {
    MATEU_VARIANT: 'fixed',
    MATEU_FIXED_URL: 'https://crm.acme.com/crm',
    MATEU_FIXED_ROUTE: '/orders',
    MATEU_APP_NAME: 'Acme CRM',
    MATEU_BUNDLE_ID: 'com.acme.CRM',
  });
  assert.equal(fixed.name, 'Acme CRM');
  assert.equal(fixed.scheme, 'com.acme.crm');
  assert.equal(fixed.ios?.bundleIdentifier, 'com.acme.CRM');
  assert.equal(fixed.android?.package, 'com.acme.CRM');
  assert.equal(fixed.ios?.associatedDomains, undefined);
  assert.equal(fixed.android?.intentFilters, undefined);
  assert.deepEqual(fixed.android?.permissions, ['android.permission.CAMERA']); // photo fields keep it
  assert.match(String(fixed.ios?.infoPlist?.NSCameraUsageDescription), /^Acme CRM uses the camera for the photo fields/);
  assert.deepEqual(fixed.plugins?.[1], ['expo-camera', { cameraPermission: 'Acme CRM uses the camera for the photo fields of its screens.', microphonePermission: false }]);
  assert.equal(fixed.extra?.mateuFixedUrl, 'https://crm.acme.com/crm');
  assert.equal(fixed.extra?.mateuFixedRoute, '/orders');
  assert.equal(fixed.extra?.eas && (fixed.extra.eas as { projectId: string }).projectId, 'p');
  assert.equal(hubEnabled(fixed.extra!), false);
});

test('a fixed build never takes the hub scheme, and validates its own', () => {
  const base = { MATEU_VARIANT: 'fixed', MATEU_FIXED_URL: 'https://x.io' };
  assert.equal(applyVariant(appJson(), base).scheme, 'mateu-app');
  assert.equal(applyVariant(appJson(), { ...base, MATEU_APP_SCHEME: 'acmecrm' }).scheme, 'acmecrm');
  assert.throws(() => applyVariant(appJson(), { ...base, MATEU_APP_SCHEME: 'mateu' }), /other than 'mateu'/);
  assert.throws(() => applyVariant(appJson(), { ...base, MATEU_APP_SCHEME: 'Bad Scheme' }), /URL scheme/);
  assert.throws(() => applyVariant(appJson(), { ...base, MATEU_BUNDLE_ID: 'nodots' }), /bundle id/);
  const noIds = applyVariant({ name: 'M' }, base);
  assert.equal(noIds.ios?.bundleIdentifier, undefined);
  assert.deepEqual(noIds.plugins, []);
});

test('the boot mode: a developer run, then the fixed UI, then the registry, else the hub', () => {
  assert.deepEqual(bootModeOf({}, false), { kind: 'hub' });
  assert.deepEqual(bootModeOf({ mateuFixedUrl: 'https://x.io/' }, true), { kind: 'direct' });
  assert.deepEqual(bootModeOf({ mateuFixedUrl: 'https://x.io/app/', mateuFixedRoute: '/a' }, false), {
    kind: 'fixed',
    baseUrl: 'https://x.io/app',
    route: '/a',
  });
  assert.deepEqual(bootModeOf({ mateuRegistryUrl: 'https://r', mateuAppId: 'a' }, false), { kind: 'registry', registryUrl: 'https://r', appId: 'a' });
  assert.deepEqual(bootModeOf({ mateuRegistryUrl: 7 }, false, { registryUrl: 'https://r', appId: 'b' }), {
    kind: 'registry',
    registryUrl: 'https://r',
    appId: 'b',
  });
  assert.deepEqual(bootModeOf({}, false, {}), { kind: 'hub' });
});
