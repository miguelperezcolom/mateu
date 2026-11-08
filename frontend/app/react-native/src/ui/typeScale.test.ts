import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * UX review RN-23: the renderer used 19 font sizes, some of 8–10pt. Every literal `fontSize` in the
 * renderer now comes from Material 3's type scale (labelSmall 11 … headlineLarge 32) — nothing under
 * the HIG's 11pt minimum, and no one-off sizes between the steps. A new size has to join the scale.
 */
const SCALE = new Set([11, 12, 14, 16, 22, 24, 28, 32]);

const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name) ? [path] : [];
  });

test('every fontSize literal is a step of the type scale (≥ 11)', () => {
  const src = new URL('..', import.meta.url).pathname;
  const off: string[] = [];
  for (const file of files(src)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/fontSize:\s*([0-9.]+)/g)) {
      if (!SCALE.has(Number(m[1]))) off.push(`${file.slice(src.length)}: ${m[0]}`);
    }
  }
  assert.deepEqual(off, []);
});
