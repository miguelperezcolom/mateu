import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SCOPES,
  isExpiring,
  oidcConfigFrom,
  oidcConfigFromEnv,
  parseStoredTokens,
  tokensFromResponse,
} from './oidcConfig.ts';
import { checkWireVersion, MIN_WIRE_VERSION } from './wireVersion.ts';

test('a registry auth block becomes an OIDC config', () => {
  const c = oidcConfigFrom({ issuer: 'https://id.example.com/realms/acme/', clientId: 'mobile', scopes: ['openid'] });
  assert.deepEqual(c, {
    type: 'oidc',
    issuer: 'https://id.example.com/realms/acme',
    clientId: 'mobile',
    scopes: ['openid'],
    audience: undefined,
    loginOnStart: true,
  });
});

test('missing issuer/clientId or another type → no OIDC', () => {
  assert.equal(oidcConfigFrom(undefined), null);
  assert.equal(oidcConfigFrom({ issuer: 'https://x' }), null);
  assert.equal(oidcConfigFrom({ type: 'basic', issuer: 'https://x', clientId: 'c' }), null);
});

test('scopes default, and a space/comma string is split', () => {
  assert.deepEqual(oidcConfigFrom({ issuer: 'https://x', clientId: 'c' })!.scopes, DEFAULT_SCOPES);
  assert.deepEqual(oidcConfigFrom({ issuer: 'https://x', clientId: 'c', scopes: 'openid, profile email' })!.scopes, [
    'openid',
    'profile',
    'email',
  ]);
});

test('the env flavour reads the EXPO_PUBLIC_MATEU_OIDC_* vars', () => {
  const c = oidcConfigFromEnv({
    EXPO_PUBLIC_MATEU_OIDC_ISSUER: 'https://x',
    EXPO_PUBLIC_MATEU_OIDC_CLIENT_ID: 'c',
    EXPO_PUBLIC_MATEU_OIDC_AUDIENCE: 'api',
    EXPO_PUBLIC_MATEU_OIDC_LOGIN_ON_START: 'false',
  });
  assert.equal(c!.audience, 'api');
  assert.equal(c!.loginOnStart, false);
  assert.equal(oidcConfigFromEnv({}), null);
});

test('token bookkeeping: expiry from expires_in, refresh keeps the old refresh token', () => {
  const first = tokensFromResponse({ accessToken: 'a', refreshToken: 'r', expiresIn: 300 }, null, 1_000);
  assert.equal(first.expiresAt, 301_000);
  const refreshed = tokensFromResponse({ accessToken: 'b', expiresIn: 300 }, first, 2_000);
  assert.equal(refreshed.refreshToken, 'r');
  assert.equal(refreshed.accessToken, 'b');
});

test('isExpiring honours the skew; unknown expiry counts as valid', () => {
  assert.equal(isExpiring(null), true);
  assert.equal(isExpiring({ accessToken: 'a', expiresAt: null }), false);
  assert.equal(isExpiring({ accessToken: 'a', expiresAt: 100_000 }, 50_000), false);
  assert.equal(isExpiring({ accessToken: 'a', expiresAt: 100_000 }, 80_000), true);
});

test('stored tokens parse defensively', () => {
  assert.equal(parseStoredTokens(null), null);
  assert.equal(parseStoredTokens('not json'), null);
  assert.equal(parseStoredTokens('{"accessToken":""}'), null);
  assert.equal(parseStoredTokens('{"accessToken":"x","expiresAt":null}')!.accessToken, 'x');
});

test('wire version: same major ok, newer minor ok with a note, other major refused', () => {
  assert.equal(MIN_WIRE_VERSION, '3.0');
  assert.deepEqual(checkWireVersion('3.0'), { ok: true });
  assert.deepEqual(checkWireVersion(undefined), { ok: true });
  const newer = checkWireVersion('3.2');
  assert.equal(newer.ok, true);
  assert.ok('note' in newer && newer.note);
  assert.equal(checkWireVersion('4.0').ok, false);
  assert.equal(checkWireVersion('2.9').ok, false);
  assert.equal(checkWireVersion('3.0', '3.1').ok, false);
});
