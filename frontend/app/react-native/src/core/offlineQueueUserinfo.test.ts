// Opaque tokens (no JWT id/access token): the owner is asked of the provider's userinfo endpoint at
// sign-in / refresh time, stored with the tokens, and read offline from there.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OfflineQueue, type QueuedRequest } from './offlineQueue.ts';
import { ownerOf, ownerOfTokens, storedOwnerOf, withResolvedOwner, type UserinfoFetch } from './outboxOwner.ts';
import { parseStoredTokens, type StoredTokens } from './oidcConfig.ts';
import type { KeyValueStore } from './sessionId.ts';

const ISSUER = 'https://login.example.com';
const USERINFO = 'https://login.example.com/userinfo';

const memory = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
};

/** A provider whose userinfo answers by access token; records what it was asked. */
function provider(users: Record<string, Record<string, unknown> | 'fail' | 'throw'>) {
  const asked: { url: string; auth: string }[] = [];
  const fetchFn: UserinfoFetch = async (url, init) => {
    const auth = init.headers['Authorization'];
    asked.push({ url, auth });
    const user = users[auth.replace(/^Bearer /, '')];
    if (user === 'throw' || user === undefined) throw new TypeError('Network request failed');
    return { ok: user !== 'fail', json: async () => (user === 'fail' ? {} : user) };
  };
  return { fetchFn, asked };
}

const opaque = (access: string, refresh = `r-${access}`): StoredTokens => ({ accessToken: access, refreshToken: refresh, expiresAt: null });
const request = (by: string): QueuedRequest => ({
  route: '/stock', consumedRoute: '', actionId: 'save', serverSideType: 'acme.Stock', initiatorComponentId: 'c1',
  componentState: { by }, appState: {}, parameters: {},
});

test('opaque tokens: the owner is userinfo\'s sub (+ tenant) at the configured issuer, kept with the tokens', async () => {
  const idp = provider({ 'at-alice': { sub: 'alice', tenant_id: 't1' } });
  const tokens = await withResolvedOwner(opaque('at-alice'), ISSUER, USERINFO, null, idp.fetchFn);
  assert.equal(tokens.owner, ownerOf(ISSUER, 'alice', 't1'));
  assert.deepEqual(idp.asked, [{ url: USERINFO, auth: 'Bearer at-alice' }]);
  // stored, then read back OFFLINE (no userinfo call)
  const round = parseStoredTokens(JSON.stringify(tokens));
  assert.equal(ownerOfTokens(round), ownerOf(ISSUER, 'alice', 't1'));
  const store = memory();
  await store.set('tok', JSON.stringify(tokens));
  assert.equal(await storedOwnerOf(store, 'tok', true), ownerOf(ISSUER, 'alice', 't1'));
});

test('token claims win: an id token means no userinfo call and no stored owner', async () => {
  const idp = provider({});
  const b64 = (s: string) => Buffer.from(s).toString('base64url');
  const idToken = `${b64('{}')}.${b64(JSON.stringify({ iss: ISSUER, sub: 'alice' }))}.s`;
  const tokens = await withResolvedOwner({ ...opaque('at'), idToken, owner: 'stale' }, ISSUER, USERINFO, null, idp.fetchFn);
  assert.equal(idp.asked.length, 0);
  assert.equal(tokens.owner, undefined);
  assert.equal(ownerOfTokens(tokens), ownerOf(ISSUER, 'alice'));
});

test('userinfo failing, missing, insecure or naming nobody: no owner at sign-in → no queue, as before', async () => {
  for (const user of ['fail', 'throw', { name: 'no sub' }] as const) {
    const idp = provider({ at: user as Record<string, unknown> | 'fail' | 'throw' });
    const tokens = await withResolvedOwner(opaque('at'), ISSUER, USERINFO, null, idp.fetchFn);
    assert.equal(ownerOfTokens(tokens), null, JSON.stringify(user));
  }
  const idp = provider({ at: { sub: 'alice' } });
  assert.equal(ownerOfTokens(await withResolvedOwner(opaque('at'), ISSUER, undefined, null, idp.fetchFn)), null);
  assert.equal(ownerOfTokens(await withResolvedOwner(opaque('at'), ISSUER, 'http://login.example.com/userinfo', null, idp.fetchFn)), null);
  assert.equal(idp.asked.length, 0); // no endpoint / not https: the token is never sent
  // stored tokens with no owner → nobody: the UI session builds no queue, the badge counts 0
  const store = memory();
  await store.set('tok', JSON.stringify(opaque('at')));
  assert.equal(await storedOwnerOf(store, 'tok', true), null);
  assert.equal(await OfflineQueue.countOf(store, 'ui1', null), 0);
});

test('a refresh resolving another sub is another owner; a refresh whose userinfo fails keeps the owner of the grant it refreshed', async () => {
  const idp = provider({ a1: { sub: 'alice' }, a2: { sub: 'bob' }, a3: 'fail' });
  const first = await withResolvedOwner(opaque('a1', 'r'), ISSUER, USERINFO, null, idp.fetchFn);
  const other = await withResolvedOwner(opaque('a2', 'r'), ISSUER, USERINFO, first, idp.fetchFn);
  assert.equal(other.owner, ownerOf(ISSUER, 'bob'));
  assert.notEqual(other.owner, first.owner);
  const kept = await withResolvedOwner(opaque('a3', 'r'), ISSUER, USERINFO, first, idp.fetchFn);
  assert.equal(kept.owner, first.owner);
});

test('opaque sign-ins: Alice queues, Bob signs in and sees/sends nothing, Alice back (renewed opaque token) drains hers', async () => {
  const idp = provider({ 'alice-1': { sub: 'alice' }, 'alice-2': { sub: 'alice' }, 'bob-1': { sub: 'bob' } });
  const store = memory();
  let signedIn: StoredTokens | null = null;
  const signIn = async (access: string) => void (signedIn = await withResolvedOwner(opaque(access), ISSUER, USERINFO, null, idp.fetchFn));
  const owner = () => ownerOfTokens(signedIn);
  const sent: { as: string | null; by: unknown }[] = [];
  const server = async (rq: QueuedRequest) => (sent.push({ as: owner(), by: rq.componentState['by'] }), {});

  await signIn('alice-1');
  const alice = owner()!;
  assert.ok(alice);
  await new OfflineQueue(store, 'ui1', alice).enqueue(request('alice'), 'key-alice-0001', 'Save');
  signedIn = null; // sign-out: suspended

  await signIn('bob-1');
  const bobs = new OfflineQueue(store, 'ui1', owner()!);
  assert.deepEqual(await bobs.list(), []);
  assert.equal(await OfflineQueue.countOf(store, 'ui1', owner()), 0);
  assert.equal((await new OfflineQueue(store, 'ui1', alice).drain(server, () => true, owner)).stoppedBy?.kind, 'notOwner');
  assert.deepEqual(sent, []);
  signedIn = null;

  await signIn('alice-2');
  assert.equal(owner(), alice);
  const hers = new OfflineQueue(store, 'ui1', owner()!);
  assert.equal((await hers.drain(server, () => true, owner)).sent.length, 1);
  assert.deepEqual(sent, [{ as: alice, by: 'alice' }]);
  assert.ok(idp.asked.every((a) => a.url === USERINFO));
});
