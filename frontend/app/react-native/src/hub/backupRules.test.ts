import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Android Auto Backup: a reinstall from the store brings the list of UIs back (AsyncStorage's
// database is backed up) and never the secure store (its keystore key does not survive a reinstall).

const require = createRequire(import.meta.url);
const rules = require('../../plugins/hub-backup-rules.js') as {
  BACKUP_RULES: string;
  DATA_EXTRACTION_RULES: string;
  fullBackupContent: () => string;
  dataExtractionRules: () => string;
  resourceFiles: () => Record<string, string>;
  applyToApplication: (a: { $?: Record<string, string> }) => { $: Record<string, string> };
};
const expo = JSON.parse(readFileSync(new URL('../../app.json', import.meta.url), 'utf8')).expo;

const LIST_DB = '<include domain="database" path="RKStorage"/>';
const NO_SECURE_STORE = '<exclude domain="sharedpref" path="SecureStore"/>';

test('the rules back up the AsyncStorage database and exclude SecureStore — Android 11 and lower', () => {
  const xml = rules.fullBackupContent();
  assert.match(xml, /^<\?xml/);
  assert.match(xml, /<full-backup-content>[\s\S]*<\/full-backup-content>/);
  assert.ok(xml.includes(LIST_DB));
  assert.ok(xml.includes(NO_SECURE_STORE));
});

test('the rules back up the AsyncStorage database and exclude SecureStore — Android 12+, cloud AND device transfer', () => {
  const xml = rules.dataExtractionRules();
  for (const section of ['cloud-backup', 'device-transfer']) {
    const body = new RegExp(`<${section}>([\\s\\S]*?)</${section}>`).exec(xml)?.[1] ?? '';
    assert.ok(body.includes(LIST_DB), `${section} keeps the list`);
    assert.ok(body.includes(NO_SECURE_STORE), `${section} leaves the tokens out`);
  }
});

test('the resource files and the manifest attributes name each other', () => {
  const files = rules.resourceFiles();
  assert.deepEqual(Object.keys(files).sort(), [`${rules.BACKUP_RULES}.xml`, `${rules.DATA_EXTRACTION_RULES}.xml`].sort());
  const app = rules.applyToApplication({});
  assert.equal(app.$['android:allowBackup'], 'true');
  assert.equal(app.$['android:fullBackupContent'], `@xml/${rules.BACKUP_RULES}`);
  assert.equal(app.$['android:dataExtractionRules'], `@xml/${rules.DATA_EXTRACTION_RULES}`);
  // an attribute set before (expo-secure-store's own rules) is replaced
  const replaced = rules.applyToApplication({ $: { 'android:fullBackupContent': '@xml/secure_store_backup_rules', 'android:name': '.MainApplication' } });
  assert.equal(replaced.$['android:fullBackupContent'], `@xml/${rules.BACKUP_RULES}`);
  assert.equal(replaced.$['android:name'], '.MainApplication');
});

test('app.json applies the plugin, keeps backup on and turns expo-secure-store\'s own rules off', () => {
  assert.equal(expo.android.allowBackup, true);
  assert.ok(expo.plugins.includes('./plugins/with-hub-backup'));
  const secureStore = expo.plugins.find((p: unknown) => Array.isArray(p) && p[0] === 'expo-secure-store');
  assert.ok(secureStore, 'expo-secure-store is configured');
  assert.equal(secureStore[1].configureAndroidBackup, false);
  assert.ok(!expo.plugins.includes('expo-secure-store'), 'and listed once');
});
