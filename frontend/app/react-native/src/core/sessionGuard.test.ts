import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleSessionExpired } from './sessionGuard.ts';
import { setTokenProvider } from './auth.ts';

const provider = (refreshes = false, logs = false) => {
  const calls = { login: 0 };
  return {
    calls,
    getToken: async () => null,
    isSignedIn: async () => false,
    refresh: async () => refreshes,
    login: async () => {
      calls.login += 1;
      return logs;
    },
    logout: async () => {},
  };
};

test('a UI that is not on screen renews its token but never opens the browser', async () => {
  const p = provider();
  assert.equal(await handleSessionExpired(p as never, false), false);
  assert.equal(p.calls.login, 0);
});

test('a refused sign-in does not open the browser again on every request', async () => {
  const p = provider();
  let t = 1_000_000;
  const now = () => t;
  await handleSessionExpired(p as never, true, now);
  await handleSessionExpired(p as never, true, now);
  assert.equal(p.calls.login, 1);
  t += 61_000;
  await handleSessionExpired(p as never, true, now);
  assert.equal(p.calls.login, 2);
});

test('GA-5.5: the PROCESS-WIDE provider honours a silent re-auth too (the queue never opens the browser)', async () => {
  const p = provider();
  setTokenProvider(p as never);
  try {
    assert.equal(await handleSessionExpired(undefined, false), false);
    assert.equal(p.calls.login, 0);
    await handleSessionExpired(undefined, true);
    assert.equal(p.calls.login, 1);
  } finally {
    setTokenProvider(undefined);
  }
});

test('a token that renews asks nothing', async () => {
  const p = provider(true);
  assert.equal(await handleSessionExpired(p as never, true), true);
  assert.equal(p.calls.login, 0);
});
