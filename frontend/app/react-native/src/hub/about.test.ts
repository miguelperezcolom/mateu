import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aboutRows, checkMessage, publishedAt } from './about.ts';

const value = (rows: { label: string; value: string }[], label: string) => rows.find((r) => r.label === label)?.value;

test('the app version carries the native build number when the platform reports one', () => {
  assert.equal(value(aboutRows({ version: '1.0.0', build: 200002, updatesEnabled: false, embedded: true }), 'App version'), '1.0.0 (200002)');
  assert.equal(value(aboutRows({ version: '1.0.0', build: null, updatesEnabled: false, embedded: true }), 'App version'), '1.0.0');
});

test('a build running its own bundle says no update is applied yet', () => {
  const rows = aboutRows({ version: '1.0.0', updatesEnabled: true, embedded: true, channel: 'production', runtimeVersion: '1.0.0' });
  assert.equal(value(rows, 'Running'), 'The code built into the app (no update applied yet)');
  assert.equal(value(rows, 'Update channel'), 'production');
  assert.equal(value(rows, 'Runtime'), '1.0.0');
});

test('an applied update is named by its id and publication time', () => {
  const rows = aboutRows({
    version: '1.0.0', updatesEnabled: true, embedded: false,
    updateId: '01a1b80b-e7c0-75ff-9317-1fb55b7c0749', updateCreatedAt: new Date(2026, 10, 7, 23, 5),
  });
  assert.equal(value(rows, 'Running'), 'Update 01a1b80b · published 2026-11-07 23:05');
});

test('a build without updates says so and lists nothing about channels', () => {
  const rows = aboutRows({ version: '1.0.0', mateuVersion: '3.0-beta.51', updatesEnabled: false, embedded: true, channel: 'x' });
  assert.equal(value(rows, 'Mateu'), '3.0-beta.51');
  assert.equal(value(rows, 'Running'), 'This build does not take updates');
  assert.equal(value(rows, 'Update channel'), undefined);
});

test('the check outcome reads as a sentence; idle says nothing', () => {
  assert.equal(checkMessage({ kind: 'idle' }), null);
  assert.equal(checkMessage({ kind: 'latest' }), 'You have the latest version.');
  assert.equal(checkMessage({ kind: 'failed', message: 'offline' }), 'Could not check for updates: offline');
  assert.equal(publishedAt(new Date(2026, 0, 3, 9, 7)), '2026-01-03 09:07');
});
