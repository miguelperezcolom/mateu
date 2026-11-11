import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { ExpoConfig } from 'expo/config';
import { readFileSync } from 'node:fs';
import { applyPushConfig } from './pushConfig.ts';

const appJson = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8')).expo as ExpoConfig;

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
