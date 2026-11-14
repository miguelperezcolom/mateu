import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Paper's Appbar.Content already makes its string title the heading; a header role passed to it
// lands on the container, so Expo web drew an <h1> inside an <h1> (the fixed build's app bar).
const src = fileURLToPath(new URL('..', import.meta.url));
const files = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : /\.tsx$/.test(n) ? [p] : [];
  });

test('no Appbar.Content is given a header role of its own (no heading inside a heading)', () => {
  const offenders = files(src).filter((f) =>
    [...readFileSync(f, 'utf8').matchAll(/<Appbar\.Content\b[^>]*>/gs)].some((m) => /accessibilityRole="header"|role="heading"/.test(m[0])),
  );
  assert.deepEqual(offenders, []);
});
