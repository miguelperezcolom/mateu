#!/usr/bin/env node
/**
 * The app's NATIVE surface, and the rule that keeps over-the-air updates safe (GA review M6).
 *
 * Every framework release pushes the repository's JavaScript to every installed app of the same app
 * version (`runtimeVersion.policy: appVersion`, mobile.yml `ota`). JavaScript that needs a native
 * module, permission or config plugin the installed binary does not have crashes it — so a change to
 * the native surface must come with a new `expo.version` (and a store build: RELEASE.md). That rule
 * used to live only in RELEASE.md; this script enforces it.
 *
 * The surface: the autolinked native modules and their versions (from @expo/fingerprint — the same
 * list EAS uses), React Native's version, and the native parts of app.json (`plugins`, `ios`,
 * `android` minus the build number, `scheme`). It is committed as native-surface.json with the app
 * version it belongs to.
 *
 *   node scripts/native-surface.mjs --check   fails when the surface changed but expo.version did not,
 *                                             or when native-surface.json is not current
 *   node scripts/native-surface.mjs --write   records the current surface (after bumping expo.version)
 *
 * Needs the app's dependencies installed (`npm ci --ignore-scripts`).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = join(dirname(fileURLToPath(import.meta.url)), '..');
const recordFile = join(app, 'native-surface.json');
const require = createRequire(join(app, 'package.json'));

// code-unit order (what a bare sort() gives), stated: the recorded file must not move with a locale
const byCodeUnits = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

const sorted = (value) => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort(byCodeUnits).map((k) => [k, sorted(value[k])]));
  }
  return value;
};

export async function currentSurface() {
  const expo = JSON.parse(readFileSync(join(app, 'app.json'), 'utf8')).expo;
  const { createFingerprintAsync } = require('@expo/fingerprint');
  const fingerprint = await createFingerprintAsync(app);
  const modules = {};
  for (const source of fingerprint.sources) {
    if (source.type !== 'dir' || !source.reasons.some((r) => /Autolinking/.test(r))) continue;
    // node_modules/<name>[/android|/ios] → the package
    const parts = source.filePath.split('/');
    const name = parts[1].startsWith('@') ? `${parts[1]}/${parts[2]}` : parts[1];
    modules[name] = JSON.parse(readFileSync(join(app, 'node_modules', name, 'package.json'), 'utf8')).version;
  }
  const { versionCode: _versionCode, ...android } = expo.android ?? {};
  const { buildNumber: _buildNumber, ...ios } = expo.ios ?? {};
  return {
    appVersion: expo.version,
    surface: sorted({
      reactNative: JSON.parse(readFileSync(join(app, 'node_modules/react-native/package.json'), 'utf8')).version,
      modules,
      plugins: expo.plugins ?? [],
      ios,
      android,
      scheme: expo.scheme ?? null,
    }),
  };
}

const json = (value) => JSON.stringify(value, null, 2) + '\n';

async function main(flag) {
  const now = await currentSurface();
  if (flag === '--write') {
    writeFileSync(recordFile, json(now));
    console.log(`✓ native-surface.json recorded for app version ${now.appVersion}`);
    return 0;
  }
  if (flag !== '--check') {
    console.error('Usage: node scripts/native-surface.mjs --check|--write');
    return 2;
  }
  const recorded = JSON.parse(readFileSync(recordFile, 'utf8'));
  if (json(recorded) === json(now)) {
    console.log(`✓ the native surface is the one recorded for app version ${now.appVersion}`);
    return 0;
  }
  if (json(recorded.surface) !== json(now.surface) && recorded.appVersion === now.appVersion) {
    console.error(`✗ The app's native surface changed but expo.version is still ${now.appVersion}.`);
    console.error('  Every release pushes the JavaScript over the air to installed apps of that version, and');
    console.error('  JavaScript that needs a native change crashes them. Bump "version" in app.json (and make a');
    console.error('  store build, RELEASE.md), then: node scripts/native-surface.mjs --write');
  } else {
    console.error('✗ native-surface.json is not current: node scripts/native-surface.mjs --write');
  }
  return 1;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) process.exit(await main(process.argv[2]));
