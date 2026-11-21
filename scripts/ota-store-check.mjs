#!/usr/bin/env node
// Over-the-air updates only reach installs of the SAME app version (runtimeVersion.policy =
// appVersion, frontend/app/react-native/app.json). When app.json moves to a new version for a
// native change, every release after that publishes its JavaScript for a runtime the stores do not
// have until the new store build goes live — the CI is green, the update "Published!", and every
// phone installed from a store keeps its old JavaScript (it happened with 1.0.1: rc.2, 3.0.0 and
// 3.0.1 reached nobody; the hub kept asking to "Update Mateu" and the store had nothing new).
//
// This check says so, loudly, on the release: it compares the runtime the update is published for
// with the version live in each store — the App Store's public lookup for iOS (automatic) and
// frontend/app/react-native/store-versions.json for Google Play (Play has no public lookup: update
// that file when a Play build goes live). It warns; it never fails the release.
//
//   node scripts/ota-store-check.mjs            # GitHub Actions: ::warning lines + step summary
//   node scripts/ota-store-check.mjs --offline  # no App Store lookup (tests, no network)

import { readFileSync, appendFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const APP_STORE_ID = '6829227403';

/**
 * The stores whose live version is not the runtime the update is published for.
 * @param {string} runtime the app version (app.json expo.version) = the OTA runtime
 * @param {Record<string, string | null | undefined>} live store → live version (null: unknown)
 * @returns {{store: string, live: string | null}[]}
 */
export function strandedStores(runtime, live) {
  return Object.entries(live)
    .filter(([, version]) => version !== runtime)
    .map(([store, version]) => ({ store, live: version ?? null }));
}

/** The warning for one store, in the release's words. */
export function warningFor(runtime, { store, live }) {
  const installed = live ? `app ${live}` : 'an unknown app version';
  return (
    `This over-the-air update is for app ${runtime}, but ${store} has ${installed}: ` +
    `phones installed from ${store} will NOT get it (nor any later release) until a ${runtime} ` +
    `store build is live there. See frontend/app/react-native/RELEASE.md.`
  );
}

async function appStoreVersion() {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}`, {
      signal: AbortSignal.timeout(15000),
    });
    const body = await res.json();
    return body?.results?.[0]?.version ?? null;
  } catch {
    return null;
  }
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const rn = join(root, 'frontend/app/react-native');
  const runtime = JSON.parse(readFileSync(join(rn, 'app.json'), 'utf8')).expo.version;
  const declared = JSON.parse(readFileSync(join(rn, 'store-versions.json'), 'utf8'));
  const offline = process.argv.includes('--offline');
  const live = {
    'Google Play': declared.android ?? null,
    'the App Store': offline ? (declared.ios ?? null) : ((await appStoreVersion()) ?? declared.ios ?? null),
  };
  const stranded = strandedStores(runtime, live);
  if (stranded.length === 0) {
    console.log(`OTA runtime ${runtime} is live in every store.`);
    return;
  }
  const lines = stranded.map((s) => warningFor(runtime, s));
  for (const line of lines) console.log(`::warning title=Over-the-air update reaches no store install::${line}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `## ⚠️ Over-the-air update reaches no store install\n\n${lines.map((l) => `- ${l}`).join('\n')}\n`,
    );
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
