import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyFailure, HttpStatusError, isIdempotentAction, RequestTimeoutError, retryDelayMs, shouldRetry } from './requestPolicy.ts';
import { Connectivity } from './connectivity.ts';
import { loadFailureMessage } from './uxRules.ts';

test('a failure reads in plain words: never the parser jargon or the axios-like codes', () => {
  assert.equal(classifyFailure(new HttpStatusError(503, 'x')).kind, 'server');
  assert.equal(classifyFailure(new HttpStatusError(404, '')).kind, 'notFound');
  assert.equal(classifyFailure(new HttpStatusError(403, '')).kind, 'forbidden');
  assert.equal(classifyFailure(new RequestTimeoutError(1500)).kind, 'timeout');
  assert.equal(classifyFailure(new TypeError('Failed to fetch')).kind, 'offline');
  assert.equal(classifyFailure(new Error('x'), false).kind, 'offline');
  const html = classifyFailure(new SyntaxError(`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`));
  assert.equal(html.kind, 'unreadable');
  assert.doesNotMatch(html.message, /token|JSON/);
  // the legacy message shape still says its status
  assert.equal(classifyFailure(new Error('HTTP 502: bad gateway')).status, 502);
  assert.equal(classifyFailure(new Error('External REST fetch failed: 401')).kind, 'unauthorized');
  // the load-failure screen too
  assert.doesNotMatch(loadFailureMessage(`Unexpected token '<', "<!DOCTYPE "... is not valid JSON`).detail, /token/);
});

test('only reads and declared-idempotent actions are repeated, and only after a timeout or a 5xx', () => {
  assert.equal(isIdempotentAction(''), true, 'the route load');
  assert.equal(isIdempotentAction('search'), true);
  assert.equal(isIdempotentAction('search-guestId'), true);
  assert.equal(isIdempotentAction('save'), false);
  assert.equal(isIdempotentAction('flakyCheck', true), true);
  assert.equal(isIdempotentAction(undefined), false);
  const server = classifyFailure(new HttpStatusError(503, ''));
  assert.equal(shouldRetry(server, 1, true), true);
  assert.equal(shouldRetry(server, 3, true), false, 'at most two retries');
  assert.equal(shouldRetry(server, 1, false), false, 'a save is sent once');
  assert.equal(shouldRetry(classifyFailure(new HttpStatusError(400, '')), 1, true), false);
  assert.equal(shouldRetry(classifyFailure(new TypeError('Failed to fetch')), 1, true), false, 'offline waits for the connection');
  assert.equal(retryDelayMs(1, () => 0.5), 300);
  assert.equal(retryDelayMs(2, () => 0.5), 900);
});

test('connectivity: our traffic decides; listeners hear the change once', () => {
  const c = new Connectivity();
  const heard: boolean[] = [];
  c.subscribe((on) => heard.push(on));
  c.noteReachable();
  c.noteUnreachable();
  c.noteUnreachable();
  c.noteReachable();
  c.notePlatform(false);
  assert.deepEqual(heard, [false, true, false]);
  assert.equal(c.isOnline, false);
});

test('connectivity: an unsubscribed listener hears nothing more', () => {
  const c = new Connectivity();
  const heard: boolean[] = [];
  const off = c.subscribe((on) => heard.push(on));
  c.noteUnreachable();
  off();
  c.noteReachable();
  assert.deepEqual(heard, [false]);
  assert.equal(c.isOnline, true);
});
