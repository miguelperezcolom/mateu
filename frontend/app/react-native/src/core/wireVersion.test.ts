import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkWireVersion } from './wireVersion.ts';

test('wire version: another major is refused with a message naming both majors', () => {
  const check = checkWireVersion('4.0');
  assert.equal(check.ok, false);
  const message = 'message' in check ? check.message : '';
  assert.match(message, /speaks Mateu wire 4\.x/);
  assert.match(message, /supports 3\.x/);
  // an older major too
  assert.equal(checkWireVersion('2.0').ok, false);
  // garbage or absent: nothing to judge
  assert.equal(checkWireVersion('').ok, true);
  assert.equal(checkWireVersion(42).ok, true);
});

test('wire version: the session shows a mismatch to the user (a toast), not only the dev log', () => {
  const source = readFileSync(new URL('./MateuSession.ts', import.meta.url), 'utf8');
  assert.match(source, /this\.api\.onWireMismatch = \(message\) => this\.notify\(/);
});
