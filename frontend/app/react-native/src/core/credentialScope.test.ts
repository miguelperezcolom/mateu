import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CredentialScope, appStateFor, originOf, withoutCredentials } from './credentialScope.ts';
import { MateuSession, declareMenuRemotes, islandSession, navigationSession } from './MateuSession.ts';
import { chatNavigationOf } from './chatStream.ts';
import { MateuApiClient } from '../api/MateuApiClient.ts';
import { setTokenProvider, type TokenProvider } from './auth.ts';

const tokens: TokenProvider = { getToken: async () => 'tok', refresh: async () => false };

test('origins: http(s) only; a relative url belongs to the root backend', () => {
  assert.equal(originOf('https://a.example/admin'), 'https://a.example');
  assert.equal(originOf('/x', 'https://a.example/admin'), 'https://a.example');
  assert.equal(originOf('//b.example/x'), 'https://b.example');
  assert.equal(originOf('javascript:alert(1)'), undefined);
  assert.equal(originOf('file:///etc/passwd'), undefined);
  assert.equal(originOf('/x', ''), originOf('', ''), 'a relative root: same origin');
});

test('the app backend is trusted; a remote it names is; a remote a remote names is not', () => {
  const scope = new CredentialScope('https://app.example/console');
  assert.equal(scope.mayCarryCredentials('https://app.example/other'), true);
  assert.equal(scope.mayCarryCredentials('https://inbox.example'), false);
  scope.declare('https://app.example/console', ['https://inbox.example/_inbox']);
  assert.equal(scope.mayCarryCredentials('https://inbox.example/_inbox/mateu/v3/sync/x'), true);
  // the declared remote names another one: it cannot hand out the credentials
  scope.declare('https://inbox.example/_inbox', ['https://evil.example']);
  assert.equal(scope.mayCarryCredentials('https://evil.example'), false);
  assert.equal(scope.mayCarryCredentials('javascript:x'), false);
  scope.trustRoot('https://api.example');
  assert.equal(scope.mayCarryCredentials('https://api.example/x'), true);
});

test('the credential headers and @AppContext values are dropped for an untrusted target', () => {
  assert.deepEqual(withoutCredentials({ authorization: 'Bearer t', 'X-Session-Id': 's', Accept: 'x' }), { Accept: 'x' });
  assert.deepEqual(appStateFor({ hotel: 'H1', theme: 'dark' }, ['hotel'], false), { theme: 'dark' });
  assert.deepEqual(appStateFor({ hotel: 'H1', theme: 'dark' }, ['hotel'], true), { hotel: 'H1', theme: 'dark' });
});

test('a client sends the Bearer and the session id only to a trusted url', async () => {
  const api = new MateuApiClient('https://app.example', 'sid', tokens);
  const own = await api.headers();
  assert.equal(own['X-Session-Id'], 'sid');
  assert.equal(own['Authorization'], 'Bearer tok');
  const other = await api.headers({ Accept: 'text/event-stream' }, 'https://chat.elsewhere.example/sse');
  assert.equal(other['X-Session-Id'], undefined);
  assert.equal(other['Authorization'], undefined);
  assert.equal(other['Accept'], 'text/event-stream');
});

test('islands: the app backend names one (credentials + context); that island names another (anonymous)', async () => {
  setTokenProvider(tokens);
  try {
    const host = new MateuSession('https://app.example', 'sid', { hotel: 'H1', mode: 'x' });
    host.appContextKeys.add('hotel');
    const island = islandSession(host, 'https://inbox.example/_inbox');
    assert.equal((await island.api.headers())['Authorization'], 'Bearer tok');
    assert.equal((await island.api.headers())['X-Session-Id'], 'sid');
    assert.deepEqual(island.appState, { hotel: 'H1', mode: 'x' });

    const nested = islandSession(island, 'https://evil.example');
    const headers = await nested.api.headers();
    assert.equal(headers['Authorization'], undefined);
    assert.equal(headers['X-Session-Id'], undefined);
    assert.deepEqual(nested.appState, { mode: 'x' }, 'no @AppContext value for an untrusted island');

    // the same origin as the app is the app
    assert.equal(islandSession(host, '').api, host.api);
    assert.equal((await islandSession(host, 'https://app.example/other').api.headers())['Authorization'], 'Bearer tok');
  } finally {
    setTokenProvider(undefined);
  }
});

test('NB2: a NAVIGATION (the assistant\'s navigation-requested) never makes its baseUrl trusted', async () => {
  setTokenProvider(tokens);
  try {
    const host = new MateuSession('https://app.example', 'sid', { hotel: 'H1', mode: 'x' });
    host.appContextKeys.add('hotel');
    // the agent streams {"event":"navigation-requested","detail":{"route":"/x","baseUrl":"https://attacker.example"}}
    const nav = chatNavigationOf({ route: '/x', baseUrl: 'https://attacker.example' })!;
    const there = navigationSession(host, nav.baseUrl!);
    const headers = await there.api.headers();
    assert.equal(headers['Authorization'], undefined, 'no Bearer to an origin nobody declared');
    assert.equal(headers['X-Session-Id'], undefined);
    assert.deepEqual(there.appState, { mode: 'x' }, 'no @AppContext value either');
    assert.equal(host.credentials.mayCarryCredentials('https://attacker.example'), false, 'and it stays untrusted');

    // a remote the app's MENU names (its backend chose it) is trusted, for a navigation too
    declareMenuRemotes(host, [{ label: 'Inbox', submenus: [{ label: 'Mail', route: '/mail', baseUrl: 'https://inbox.example/_inbox' }] }]);
    assert.equal((await navigationSession(host, 'https://inbox.example/_inbox').api.headers())['Authorization'], 'Bearer tok');
    // …but a menu answered by a REMOTE cannot hand out trust
    const remote = navigationSession(host, 'https://inbox.example/_inbox');
    declareMenuRemotes(remote, [{ label: 'x', baseUrl: 'https://evil.example' }]);
    assert.equal(host.credentials.mayCarryCredentials('https://evil.example'), false);
    // the app's own backend is the app
    assert.equal(navigationSession(host, '').api, host.api);
  } finally {
    setTokenProvider(undefined);
  }
});

test('R5: a backslash or a tab does not make another origin "relative" — expo web reads \\host as //host', async () => {
  setTokenProvider(tokens);
  try {
    for (const base of ['', 'https://app.example']) {
      const scope = new CredentialScope(base);
      for (const foreign of ['\\\\attacker.example', '/\\attacker.example', '\\/attacker.example', '/\t/attacker.example', ' //attacker.example/x']) {
        assert.equal(scope.mayCarryCredentials(foreign), false, `${JSON.stringify(foreign)} over ${JSON.stringify(base)}`);
      }
      assert.equal(scope.mayCarryCredentials('/mateu/v3/sync/x'), true);
    }
    // the chain the review ran: an agent navigation to \\attacker.example carries nothing
    const host = new MateuSession('', 'sid', { hotel: 'H1' });
    host.appContextKeys.add('hotel');
    const there = navigationSession(host, chatNavigationOf({ route: '/x', baseUrl: '\\\\attacker.example' })!.baseUrl!);
    const headers = await there.api.headers();
    assert.equal(headers['Authorization'], undefined);
    assert.equal(headers['X-Session-Id'], undefined);
    assert.deepEqual(there.appState, {});
  } finally {
    setTokenProvider(undefined);
  }
});
