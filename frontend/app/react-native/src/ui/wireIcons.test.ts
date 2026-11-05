import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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

test('every icon in the table exists in the font the app ships', () => {
  const glyphs = JSON.parse(readFileSync(new URL('../../node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json', import.meta.url), 'utf8'));
  const missing = wireIconNames().filter((n) => !(n in glyphs));
  assert.deepEqual(missing, []);
});

test('every icon the Space and Museums menus declare has a Material icon', () => {
  for (const app of ['demo-space', 'demo-museum']) {
    const yaml = readFileSync(new URL(`../../../../../demo/${app}/src/main/resources/specs/ui/app.yaml`, import.meta.url), 'utf8');
    for (const m of yaml.matchAll(/vaadin:[a-z-]+/g)) assert.ok(materialIconOf(m[0]), m[0]);
  }
});
