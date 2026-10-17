// openExternal is the one door from data to Linking.openURL (MINOR 5 of the GA review).
import { mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['react-native']);
const opened: string[] = [];
mock.module('react-native', { namedExports: { Linking: { openURL: async (u: string) => { opened.push(u); } } } });
const { openExternal } = await import('./openExternal.ts');

test('a safe url is handed to the OS', () => {
  opened.length = 0;
  assert.equal(openExternal(' https://example.com/x '), true);
  assert.deepEqual(opened, ['https://example.com/x']);
});

test('javascript:, file:, intent: and custom schemes never reach Linking.openURL', () => {
  opened.length = 0;
  const warn = console.warn;
  console.warn = () => {};
  try {
    for (const url of ['javascript:alert(1)', 'file:///data/data/app/x', 'intent://x#Intent;end', 'otherapp://do', null]) {
      assert.equal(openExternal(url), false);
    }
  } finally {
    console.warn = warn;
  }
  assert.deepEqual(opened, []);
});

test('no other source file hands a url to Linking.openURL directly', async () => {
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const { join, relative } = await import('node:path');
  const root = new URL('..', import.meta.url).pathname;
  // trusted urls only: the app's own cached file (documentEffects) and the store constant (UiSession)
  const allowed = new Set(['renderer/openExternal.ts', 'core/documentEffects.ts', 'hub/ui/UiSession.tsx']);
  const offenders: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) {
        const rel = relative(root, path);
        if (!allowed.has(rel) && /Linking\.openURL\(/.test(readFileSync(path, 'utf8'))) offenders.push(rel);
      }
    }
  };
  walk(root);
  assert.deepEqual(offenders, []);
});
