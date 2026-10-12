import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from '../api/MateuApiClient.ts';
import { setTokenProvider, type TokenProvider } from '../core/auth.ts';
import { onSessionExpired } from '../core/sessionGuard.ts';

/** Each hub UI session owns its MateuApiClient + TokenProvider; these pin that a token never reaches
 *  another UI's server, and that a 401 re-authenticates only the UI that got it. */

type Call = { url: string; auth?: string; session?: string };
let calls: Call[] = [];
let statusFor: (url: string, auth?: string) => number = () => 200;
const realFetch = globalThis.fetch;

beforeEach(() => {
  calls = [];
  statusFor = () => 200;
  setTokenProvider(undefined);
  onSessionExpired(undefined);
  globalThis.fetch = (async (url: string, init: { headers: Record<string, string> }) => {
    const auth = init.headers['Authorization'];
    calls.push({ url, auth, session: init.headers['X-Session-Id'] });
    const status = statusFor(url, auth);
    return { ok: status < 400, status, text: async () => '{"fragments":[]}' } as unknown as Response;
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  setTokenProvider(undefined);
});

const provider = (token: string, over: Partial<TokenProvider> = {}): TokenProvider & { token: string; refreshes: number; logins: number } => {
  const p = {
    token,
    refreshes: 0,
    logins: 0,
    getToken: async () => p.token,
    refresh: over.refresh ?? (async () => false),
    login: over.login ?? (async () => (p.logins++, false)),
  };
  return p;
};

test('two UIs send their own token, to their own server, with their own session id', async () => {
  const a = new MateuApiClient('https://a.com', 'sa', provider('TOKEN-A'));
  const b = new MateuApiClient('https://b.com', 'sb', provider('TOKEN-B'));
  await a.initialLoad('', {});
  await b.initialLoad('', {});
  assert.deepEqual(calls, [
    { url: 'https://a.com/mateu/v3/sync/_no_route', auth: 'Bearer TOKEN-A', session: 'sa' },
    { url: 'https://b.com/mateu/v3/sync/_no_route', auth: 'Bearer TOKEN-B', session: 'sb' },
  ]);
});

test('an open UI (auth = null) never picks up a global or another UI\'s token', async () => {
  setTokenProvider(provider('GLOBAL'));
  const open = new MateuApiClient('https://open.com', 's', null);
  await open.initialLoad('', {});
  assert.equal(calls[0].auth, undefined);
});

test('the legacy single-backend client (auth undefined) still uses the global provider', async () => {
  setTokenProvider(provider('GLOBAL'));
  await new MateuApiClient('https://x.com', 's').initialLoad('', {});
  assert.equal(calls[0].auth, 'Bearer GLOBAL');
});

test('a 401 refreshes only the UI that got it, then retries with the new token', async () => {
  const pa = provider('OLD-A', {
    refresh: async () => {
      pa.refreshes++;
      pa.token = 'NEW-A';
      return true;
    },
  });
  const pb = provider('TOKEN-B', {
    refresh: async () => {
      pb.refreshes++;
      return true;
    },
  });
  // a global handler belongs to someone else: it must not be consulted for a hub session
  let globalHandlerCalls = 0;
  onSessionExpired(() => (globalHandlerCalls++, true));
  statusFor = (url, auth) => (new URL(url).host === 'a.com' && auth === 'Bearer OLD-A' ? 401 : 200);
  const a = new MateuApiClient('https://a.com', 'sa', pa);
  const b = new MateuApiClient('https://b.com', 'sb', pb);
  await a.initialLoad('', {});
  await b.initialLoad('', {});
  assert.equal(pa.refreshes, 1);
  assert.equal(pb.refreshes, 0);
  assert.equal(globalHandlerCalls, 0);
  assert.deepEqual(calls.map((c) => c.auth), ['Bearer OLD-A', 'Bearer NEW-A', 'Bearer TOKEN-B']);
});

test('a 401 on a UI whose refresh fails asks THAT UI to log in, and fails when declined', async () => {
  const pa = provider('A');
  statusFor = () => 401;
  const a = new MateuApiClient('https://a.com', 'sa', pa);
  await assert.rejects(a.initialLoad('', {}), /HTTP 401/);
  assert.equal(pa.logins, 1);
  assert.equal(calls.length, 1);
});

test('an open UI answering 401 fails without any re-auth', async () => {
  let globalHandlerCalls = 0;
  onSessionExpired(() => (globalHandlerCalls++, true));
  statusFor = () => 401;
  await assert.rejects(new MateuApiClient('https://o.com', 's', null).initialLoad('', {}), /HTTP 401/);
  assert.equal(globalHandlerCalls, 0);
  assert.equal(calls.length, 1);
});
