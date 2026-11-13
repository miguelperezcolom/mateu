import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ExpoConfig } from 'expo/config';
import { readFileSync } from 'node:fs';
import { applyPushConfig, remotePushEnabled } from './pushConfig.ts';

const hubJson = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8')).expo as ExpoConfig;
// what applyVariant hands over for a fixed build (app.config.ts applies the variant first)
const appJson = { ...hubJson, extra: { ...(hubJson.extra ?? {}), mateuVariant: 'fixed' } } as ExpoConfig;
const allCredentials = { GOOGLE_SERVICES_JSON: '/tmp/google-services.json', MATEU_IOS_PUSH: 'true' };

test('the hub never has remote push, even with the credentials in its environment', () => {
  for (const hub of [hubJson, { ...hubJson, extra: { ...(hubJson.extra ?? {}), mateuVariant: 'hub' } } as ExpoConfig]) {
    const out = applyPushConfig(hub, allCredentials);
    assert.equal(out, hub);
    assert.ok((out.plugins ?? []).includes('./plugins/with-local-notifications-only'));
    assert.equal(out.android?.googleServicesFile, undefined);
    assert.equal(remotePushEnabled(out.extra), false);
  }
});

test('a fixed build with credentials says so in extra.remotePush; one without them does not', () => {
  assert.equal(remotePushEnabled(applyPushConfig(appJson, allCredentials).extra), true);
  assert.equal(remotePushEnabled(applyPushConfig(appJson, { GOOGLE_SERVICES_JSON: '/x.json' }).extra), true);
  assert.equal(remotePushEnabled(applyPushConfig(appJson, { MATEU_IOS_PUSH: 'true' }).extra), true);
  assert.equal(remotePushEnabled(applyPushConfig(appJson, {}).extra), false);
  // a binary built before the flag existed (the store's 1.0.1) carries none
  assert.equal(remotePushEnabled(hubJson.extra), false);
  assert.equal(remotePushEnabled(undefined), false);
});

test('without push credentials the build is as app.json says: local notifications only', () => {
  const out = applyPushConfig(appJson, {});
  assert.equal(out, appJson);
  assert.ok((out.plugins ?? []).includes('./plugins/with-local-notifications-only'));
  assert.equal(out.android?.googleServicesFile, undefined);
});

test('GOOGLE_SERVICES_JSON points Android at the Firebase config', () => {
  const out = applyPushConfig(appJson, { GOOGLE_SERVICES_JSON: '/tmp/google-services.json' });
  assert.equal(out.android?.googleServicesFile, '/tmp/google-services.json');
  assert.equal(out.android?.package, appJson.android?.package);
});

test('MATEU_IOS_PUSH keeps the push entitlement, in production mode except for development', () => {
  const out = applyPushConfig(appJson, { MATEU_IOS_PUSH: 'true' });
  const plugins = out.plugins ?? [];
  assert.ok(!plugins.includes('./plugins/with-local-notifications-only'));
  const notifications = plugins.find((p) => Array.isArray(p) && p[0] === 'expo-notifications') as [string, Record<string, unknown>];
  assert.equal(notifications[1].mode, 'production');
  assert.equal(notifications[1].defaultChannel, 'mateu');

  const dev = applyPushConfig(appJson, { MATEU_IOS_PUSH: 'true', APP_VARIANT: 'development' });
  const devNotifications = (dev.plugins ?? []).find((p) => Array.isArray(p) && p[0] === 'expo-notifications') as [string, Record<string, unknown>];
  assert.equal(devNotifications[1].mode, 'development');
});
