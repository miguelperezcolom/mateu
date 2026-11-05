import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { materialIconOf, wireIconNames } from './wireIcons.ts';

test('a vaadin token maps to its Material icon', () => {
  assert.equal(materialIconOf('vaadin:rocket'), 'rocket-launch-outline');
  assert.equal(materialIconOf('vaadin:home'), 'home-outline');
});

test('a name it does not know, an emoji or nothing draws nothing', () => {
  assert.equal(materialIconOf('vaadin:no-such-icon'), undefined);
  assert.equal(materialIconOf('🚀'), undefined);
  assert.equal(materialIconOf(''), undefined);
  assert.equal(materialIconOf(null), undefined);
});

test('an explicit Material name passes through', () => {
  assert.equal(materialIconOf('mdi:rocket'), 'rocket');
});

// the font's glyph map, wherever npm put it; the pure suite also runs where the app's packages are not installed
const glyphMap = (() => {
  try {
    const at = createRequire(import.meta.url).resolve('@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json');
    return existsSync(at) ? at : undefined;
  } catch {
    return undefined;
  }
})();

test('every icon in the table exists in the font the app ships', { skip: glyphMap ? false : 'the app\'s packages are not installed here' }, () => {
  const glyphs = JSON.parse(readFileSync(glyphMap!, 'utf8'));
  const missing = wireIconNames().filter((n) => !(n in glyphs));
  assert.deepEqual(missing, []);
});

test('every icon the Space and Museums menus declare has a Material icon', () => {
  for (const app of ['demo-space', 'demo-museum']) {
    const yaml = readFileSync(new URL(`../../../../../demo/${app}/src/main/resources/specs/ui/app.yaml`, import.meta.url), 'utf8');
    for (const m of yaml.matchAll(/vaadin:[a-z-]+/g)) assert.ok(materialIconOf(m[0]), m[0]);
  }
});
