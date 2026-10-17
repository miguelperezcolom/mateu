// The built-in OIDC TokenProvider (oidc.ts) against a fake identity provider: expo-auth-session and
// expo-web-browser are replaced, so what is pinned is what the renderer does with the tokens —
// where they are stored, when they are refreshed, what a revoked refresh token or a cancelled login
// leaves behind. Needs `--experimental-test-module-mocks`.
import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { stubNativePackages } from '../../scripts/test/native-packages.mjs';

stubNativePackages(['expo-auth-session', 'expo-web-browser']);

type Json = Record<string, any>;
const idp = {
  discoveries: 0,
  refreshCalls: [] as Json[],
  exchangeCalls: [] as Json[],
  revoked: [] as Json[],
  authRequests: [] as Json[],
  refreshAnswer: null as Json | Error | null,
  promptAnswer: { type: 'success', params: { code: 'the-code' } } as Json,
  exchangeAnswer: { accessToken: 'fresh-at', refreshToken: 'fresh-rt', expiresIn: 3600 } as Json,
  revocationEndpoint: 'https://idp/revoke' as string | undefined,
  completedAuthSession: 0,
};

class FakeAuthRequest {
  codeVerifier = 'verifier-123';
  constructor(options: Json) {
    idp.authRequests.push(options);
  }
  async promptAsync(_discovery: unknown) {
    return idp.promptAnswer;
  }
}

mock.module('expo-auth-session', {
  namedExports: {
    makeRedirectUri: (o: Json) => `${o.scheme}://${o.path}`,
    fetchDiscoveryAsync: async (issuer: string) => {
      idp.discoveries++;
      return { issuer, revocationEndpoint: idp.revocationEndpoint };
    },
    refreshAsync: async (rq: Json) => {
      idp.refreshCalls.push(rq);
      if (idp.refreshAnswer instanceof Error) throw idp.refreshAnswer;
      return idp.refreshAnswer;
    },
    exchangeCodeAsync: async (rq: Json) => {
      idp.exchangeCalls.push(rq);
      return idp.exchangeAnswer;
    },
    revokeAsync: async (rq: Json) => {
      idp.revoked.push(rq);
    },
    AuthRequest: FakeAuthRequest,
    ResponseType: { Code: 'code' },
  },
});
mock.module('expo-web-browser', {
  namedExports: { maybeCompleteAuthSession: () => { idp.completedAuthSession++; } },
});

const { OidcTokenProvider, oidcRedirectUri } = await import('./oidc.ts');

const config = { issuer: 'https://idp/realms/x', clientId: 'mateu-app', scopes: ['openid'], audience: 'api' };

function memoryStore(initial: Json = {}) {
  const data = new Map<string, string>(Object.entries(initial));
  return {
    data,
    get: async (k: string) => data.get(k) ?? null,
    set: async (k: string, v: string) => { data.set(k, v); },
    remove: async (k: string) => { data.delete(k); },
  };
}
const stored = (t: Json) => JSON.stringify(t);

beforeEach(() => {
  idp.discoveries = 0;
  idp.refreshCalls = [];
  idp.exchangeCalls = [];
  idp.revoked = [];
  idp.authRequests = [];
  idp.refreshAnswer = null;
  idp.promptAnswer = { type: 'success', params: { code: 'the-code' } };
  idp.exchangeAnswer = { accessToken: 'fresh-at', refreshToken: 'fresh-rt', expiresIn: 3600 };
  idp.revocationEndpoint = 'https://idp/revoke';
});

test('the web popup is closed on import and the redirect target is the app scheme', () => {
  assert.equal(idp.completedAuthSession, 1);
  assert.equal(oidcRedirectUri(), 'mateu://auth');
});

test('no stored session: not signed in, no token, and the IdP is never contacted', async () => {
  const p = new OidcTokenProvider(config, memoryStore());
  assert.equal(await p.isSignedIn(), false);
  assert.equal(await p.getToken(), null);
  assert.equal(idp.discoveries, 0);
});

test('a stored, still-valid access token is used as is (no refresh)', async () => {
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'at1', refreshToken: 'rt1', expiresAt: Date.now() + 3_600_000 }) });
  const p = new OidcTokenProvider(config, store);
  assert.equal(await p.getToken(), 'at1');
  assert.equal(idp.refreshCalls.length, 0);
});

test('an expiring token is refreshed first; the new token is stored and the old refresh token kept when the IdP omits it', async () => {
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'old', refreshToken: 'rt1', expiresAt: Date.now() - 1 }) });
  idp.refreshAnswer = { accessToken: 'new', expiresIn: 300 };
  const p = new OidcTokenProvider(config, store);
  assert.equal(await p.getToken(), 'new');
  assert.deepEqual(idp.refreshCalls[0], { clientId: 'mateu-app', refreshToken: 'rt1', extraParams: { audience: 'api' } });
  const saved = JSON.parse(store.data.get('mateu.oidc.tokens')!);
  assert.equal(saved.accessToken, 'new');
  assert.equal(saved.refreshToken, 'rt1');
  // discovery is fetched once and reused
  await p.refresh();
  assert.equal(idp.discoveries, 1);
});

test('a revoked refresh token ends the session: the stored tokens are removed and no token is offered', async () => {
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'old', refreshToken: 'rt1', expiresAt: Date.now() - 1 }) });
  idp.refreshAnswer = new Error('invalid_grant');
  const p = new OidcTokenProvider(config, store);
  assert.equal(await p.getToken(), null);
  assert.equal(store.data.has('mateu.oidc.tokens'), false);
  assert.equal(await p.isSignedIn(), false);
});

test('refresh without a refresh token is refused without calling the IdP', async () => {
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'at', expiresAt: null }) });
  const p = new OidcTokenProvider(config, store);
  assert.equal(await p.refresh(), false);
  assert.equal(idp.refreshCalls.length, 0);
});

test('a corrupt stored value counts as signed out', async () => {
  const p = new OidcTokenProvider(config, memoryStore({ 'mateu.oidc.tokens': '{not json' }));
  assert.equal(await p.getToken(), null);
});

test('a store that throws on read counts as signed out instead of breaking the boot', async () => {
  const store = { get: async () => { throw new Error('keychain locked'); }, set: async () => {}, remove: async () => {} };
  const p = new OidcTokenProvider(config, store);
  assert.equal(await p.isSignedIn(), false);
});

test('login: Authorization Code + PKCE, the code is exchanged with the verifier and the tokens are stored under the UI key', async () => {
  const store = memoryStore();
  const p = new OidcTokenProvider(config, store, 'ui.42.tokens');
  assert.equal(await p.login(), true);
  assert.equal(idp.authRequests[0].usePKCE, true);
  assert.equal(idp.authRequests[0].responseType, 'code');
  assert.equal(idp.authRequests[0].redirectUri, 'mateu://auth');
  assert.deepEqual(idp.authRequests[0].extraParams, { audience: 'api' });
  assert.deepEqual(idp.exchangeCalls[0], {
    clientId: 'mateu-app',
    code: 'the-code',
    redirectUri: 'mateu://auth',
    extraParams: { audience: 'api', code_verifier: 'verifier-123' },
  });
  assert.equal(JSON.parse(store.data.get('ui.42.tokens')!).accessToken, 'fresh-at');
  assert.equal(store.data.has('mateu.oidc.tokens'), false);
  assert.equal(await p.getToken(), 'fresh-at');
});

test('a cancelled login (or one without a code) stores nothing', async () => {
  for (const answer of [{ type: 'cancel', params: {} }, { type: 'success', params: {} }]) {
    idp.promptAnswer = answer;
    const store = memoryStore();
    const p = new OidcTokenProvider(config, store);
    assert.equal(await p.login(), false);
    assert.equal(store.data.size, 0);
  }
  assert.equal(idp.exchangeCalls.length, 0);
});

test('logout forgets the tokens locally and revokes the refresh token when the IdP offers revocation', async () => {
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'at', refreshToken: 'rt', expiresAt: null }) });
  const p = new OidcTokenProvider({ ...config, audience: undefined }, store);
  await p.getToken();
  await p.logout();
  assert.equal(store.data.size, 0);
  assert.deepEqual(idp.revoked, [{ clientId: 'mateu-app', token: 'rt' }]);
  assert.equal(await p.getToken(), null);
});

test('logout without revocation endpoint (or without a session) is local only', async () => {
  idp.revocationEndpoint = undefined;
  const store = memoryStore({ 'mateu.oidc.tokens': stored({ accessToken: 'at', expiresAt: null }) });
  const p = new OidcTokenProvider(config, store);
  await p.getToken();
  await p.logout();
  assert.equal(idp.revoked.length, 0);
  idp.discoveries = 0;
  const empty = new OidcTokenProvider(config, memoryStore());
  await empty.logout();
  assert.equal(idp.discoveries, 0);
});
