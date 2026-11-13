// R1 (pre-GA review): a queue is only ever loaded, counted and sent for the person who filled it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ANONYMOUS_OWNER, OfflineQueue, outboxKeyOf, singleUiQueueId, type QueuedRequest } from './offlineQueue.ts';
import { followSignIns, sameSessionFor, jwtClaims, ownerOf, ownerOfTokens, storedOwnerOf } from './outboxOwner.ts';
import { reauthenticate, type TokenProvider } from './auth.ts';
import type { StoredTokens } from './oidcConfig.ts';
import type { KeyValueStore } from './sessionId.ts';

const memory = (): KeyValueStore & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    get: async (k) => data.get(k) ?? null,
    set: async (k, v) => void data.set(k, v),
    remove: async (k) => void data.delete(k),
  };
};

const b64url = (s: string) => Buffer.from(s, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwt = (claims: Record<string, unknown>) => `${b64url('{"alg":"RS256"}')}.${b64url(JSON.stringify(claims))}.sig`;

const ISSUER = 'https://login.example.com/realms/acme';
/** What the app's sign-in keeps for a person (a fresh access token each time). */
const tokensOf = (sub: string, n = 1, extra: Record<string, unknown> = {}): StoredTokens => ({
  accessToken: `opaque-access-${sub}-${n}`,
  refreshToken: `refresh-${sub}-${n}`,
  idToken: jwt({ iss: ISSUER, sub, aud: 'mateu-mobile', iat: n, ...extra }),
  expiresAt: null,
  issuer: ISSUER,
  clientId: 'mateu-mobile',
});

const request = (state: Record<string, unknown>): QueuedRequest => ({
  route: '/stock', consumedRoute: '', actionId: 'save', serverSideType: 'acme.Stock', initiatorComponentId: 'c1',
  componentState: state, appState: {}, parameters: {},
});

test('the owner is iss + sub (+ tenant) of the id token; a renewed token of the same person is the same owner', () => {
  const alice = ownerOfTokens(tokensOf('alice', 1));
  assert.ok(alice);
  assert.equal(ownerOfTokens(tokensOf('alice', 2)), alice); // renewed: other tokens, same person
  assert.equal(ownerOfTokens(tokensOf('alice', 1)), ownerOf(`${ISSUER}/`, 'alice')); // trailing slash ignored
  assert.notEqual(ownerOfTokens(tokensOf('bob')), alice);
  // same subject at another issuer, or in another tenant, is someone else
  assert.notEqual(ownerOfTokens({ ...tokensOf('alice'), idToken: jwt({ iss: 'https://other.example.com', sub: 'alice' }) }), alice);
  assert.notEqual(ownerOfTokens(tokensOf('alice', 1, { tid: 't1' })), ownerOfTokens(tokensOf('alice', 1, { tid: 't2' })));
  // no id token: a JWT access token says who it is; an opaque one alone does not
  assert.equal(ownerOfTokens({ accessToken: jwt({ iss: ISSUER, sub: 'alice' }), expiresAt: null }), alice);
  assert.equal(ownerOfTokens({ accessToken: 'opaque', expiresAt: null }), null);
  assert.equal(ownerOfTokens({ accessToken: jwt({ sub: 'alice' }), expiresAt: null }, ISSUER), alice); // no iss: the configured one
  assert.equal(ownerOfTokens(null), null);
  assert.equal(jwtClaims('not.a.jwt!'), null);
  assert.deepEqual(jwtClaims(jwt({ sub: 'ñandú' })), { sub: 'ñandú' });
});

test('the badge owner: the stored sign-in, nobody when signed out of a UI that signs in, anonymous otherwise', async () => {
  const store = memory();
  assert.equal(await storedOwnerOf(store, 'tokens', true), null);
  assert.equal(await storedOwnerOf(store, 'tokens', false), ANONYMOUS_OWNER);
  await store.set('tokens', JSON.stringify(tokensOf('alice')));
  assert.equal(await storedOwnerOf(store, 'tokens', true), ownerOfTokens(tokensOf('alice')));
});

/** One UI on one phone: who is signed in, and its queue as the app builds it for that person. */
function device() {
  const store = memory();
  let signedIn: StoredTokens | null = null;
  const owner = () => ownerOfTokens(signedIn);
  const sent: { as: string | null; state: unknown; key: string }[] = [];
  const server = async (rq: QueuedRequest, key: string) => {
    sent.push({ as: owner(), state: rq.componentState, key });
    return {};
  };
  const queueFor = () => {
    const o = owner();
    return o ? new OfflineQueue(store, 'ui1', o) : null; // UiSession: nobody → no queue
  };
  return {
    store,
    sent,
    server,
    owner,
    queueFor,
    signIn: (t: StoredTokens) => void (signedIn = t),
    signOut: () => void (signedIn = null),
  };
}

test("Alice queues offline, signs out, Bob signs in: nothing of Alice's is sent, listed or counted; Alice back with a renewed token drains hers as her", async () => {
  const phone = device();
  phone.signIn(tokensOf('alice', 1));
  const alices = phone.queueFor()!;
  assert.equal(await alices.enqueue(request({ counted: 7, by: 'alice' }), 'key-alice-0001', 'Stock · Save'), true);
  assert.equal(await OfflineQueue.countOf(phone.store, 'ui1', phone.owner()), 1);

  // sign-out: the queue is suspended, not deleted
  phone.signOut();
  assert.equal(phone.queueFor(), null);
  assert.equal(await OfflineQueue.countOf(phone.store, 'ui1', phone.owner()), 0); // the hub shows nothing
  assert.ok([...phone.store.data.keys()].some((k) => k.startsWith(outboxKeyOf('ui1', ownerOfTokens(tokensOf('alice'))!))));

  // Bob
  phone.signIn(tokensOf('bob', 1));
  const bobs = phone.queueFor()!;
  assert.deepEqual(await bobs.list(), []);
  assert.equal(bobs.status, 'ok');
  assert.equal(await OfflineQueue.countOf(phone.store, 'ui1', phone.owner()), 0);
  const bobDrain = await bobs.drain(phone.server, () => true, phone.owner);
  assert.equal(bobDrain.sent.length, 0);
  // even Alice's queue object, were it still around, sends nothing while Bob is the one signed in
  const stale = await alices.drain(phone.server, () => true, phone.owner);
  assert.equal(stale.sent.length, 0);
  assert.equal(stale.stoppedBy?.kind, 'notOwner');
  assert.deepEqual(phone.sent, []);
  // and Bob's own changes stay his
  await bobs.enqueue(request({ counted: 1, by: 'bob' }), 'key-bob-00001', 'Stock · Save');
  phone.signOut();

  // Alice again — a renewed token, same iss + sub
  phone.signIn(tokensOf('alice', 2));
  const again = phone.queueFor()!;
  assert.deepEqual((await again.list()).map((i) => i.key), ['key-alice-0001']);
  assert.equal(await OfflineQueue.countOf(phone.store, 'ui1', phone.owner()), 1);
  const drained = await again.drain(phone.server, () => true, phone.owner);
  assert.equal(drained.sent.length, 1);
  assert.deepEqual(phone.sent, [{ as: ownerOfTokens(tokensOf('alice')), state: { counted: 7, by: 'alice' }, key: 'key-alice-0001' }]);
  // Bob's is still there for Bob, untouched
  assert.equal(await OfflineQueue.countOf(phone.store, 'ui1', ownerOfTokens(tokensOf('bob'))), 1);
});

test('the owner is checked before EACH send: a change of user mid-drain stops it', async () => {
  const phone = device();
  phone.signIn(tokensOf('alice'));
  const q = phone.queueFor()!;
  await q.enqueue(request({ n: 1 }), 'key-a-000001', 'A');
  await q.enqueue(request({ n: 2 }), 'key-a-000002', 'B');
  const result = await q.drain(async (rq, key) => {
    const answer = await phone.server(rq, key);
    phone.signIn(tokensOf('bob')); // someone else signs in while the first one was on its way
    return answer;
  }, () => true, phone.owner);
  assert.equal(result.sent.length, 1);
  assert.equal(result.stoppedBy?.kind, 'notOwner');
  assert.deepEqual(phone.sent.map((s) => s.key), ['key-a-000001']);
  assert.deepEqual((await q.list()).map((i) => i.key), ['key-a-000002']);
});

test('nobody signed in sends nothing; a UI with no sign-in keeps its anonymous queue as before', async () => {
  const store = memory();
  const anon = new OfflineQueue(store, 'ui1');
  assert.equal(anon.owner, ANONYMOUS_OWNER);
  await anon.enqueue(request({ n: 1 }), 'key-n-000001', 'A');
  assert.equal((await anon.drain(async () => ({}), () => true, () => null)).stoppedBy?.kind, 'notOwner');
  assert.equal((await anon.drain(async () => ({}))).sent.length, 1); // default: the anonymous owner
});

test("a queue stored under another owner's key is not read as one's own", async () => {
  const store = memory();
  await new OfflineQueue(store, 'ui1', 'alice').enqueue(request({ n: 1 }), 'key-a-000001', 'A');
  // copy Alice's stored queue under Bob's key (a digest collision, or a tampered store)
  const aliceKey = outboxKeyOf('ui1', 'alice');
  const bobKey = outboxKeyOf('ui1', 'bob');
  for (const [k, v] of [...store.data]) if (k.startsWith(aliceKey)) store.data.set(bobKey + k.slice(aliceKey.length), v);
  const bobs = new OfflineQueue(store, 'ui1', 'bob');
  assert.deepEqual(await bobs.list(), []);
  assert.equal(bobs.status, 'damaged'); // shown as a problem, never as Alice's items
});

test("removing a UI drops every owner's queue (and the pre-owner layout)", async () => {
  const store = memory();
  await new OfflineQueue(store, 'ui1', 'alice').enqueue(request({ n: 1 }), 'key-a-000001', 'A');
  await new OfflineQueue(store, 'ui1', 'bob').enqueue(request({ n: 2 }), 'key-b-000001', 'B');
  await store.set('mateu.ui.ui1.outbox.n', '1');
  await store.set('mateu.ui.ui1.outbox.0', '[{"key":"old"}]');
  await OfflineQueue.clear(store, 'ui1');
  assert.equal(store.data.size, 0);
});

test('the pre-owner layout is never read as anyone\'s queue and is dropped', async () => {
  const store = memory();
  await store.set('mateu.ui.ui1.outbox.n', '1');
  await store.set('mateu.ui.ui1.outbox.0', JSON.stringify([{ key: 'old-key-0001', request: { actionId: 'save' } }]));
  const q = new OfflineQueue(store, 'ui1');
  assert.deepEqual(await q.list(), []);
  assert.equal(q.status, 'ok');
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(store.data.size, 0);
});

test('GA-5.4: a different PERSON gets a new session; somebody signing in where nobody was keeps it', () => {
  assert.equal(sameSessionFor('alice', 'bob'), false);
  assert.equal(sameSessionFor('alice', 'alice'), true);
  assert.equal(sameSessionFor(null, 'alice'), true, 'a lazy sign-in keeps the screen, only the queue is new');
  assert.equal(sameSessionFor(undefined, 'alice'), true);
  assert.equal(sameSessionFor('alice', null), true);
});

test('GA-5.5: a build bound to one UI has its own queue, named by its base url and secure-store safe', () => {
  const id = singleUiQueueId('https://stock.example/app');
  assert.notEqual(id, singleUiQueueId('https://other.example/app'));
  assert.match(outboxKeyOf(id, 'alice'), /^[A-Za-z0-9._-]+$/);
});

// GA-5.4: after an in-session sign-in as somebody else, B's change is never filed in A's queue
test("GA-5.4: enqueue refuses when who is signed in now is not the queue's owner", async () => {
  const store = memory();
  const aliceQueue = new OfflineQueue(store, 'ui1', 'alice');
  // Bob signed in through a 401 while Alice's session stayed mounted
  assert.equal(await aliceQueue.enqueue(request({ n: 1 }), 'key-b-000001', 'B', undefined, () => 'bob'), false);
  assert.equal(await aliceQueue.enqueue(request({ n: 1 }), 'key-b-000002', 'B', undefined, async () => null), false);
  assert.equal(await aliceQueue.enqueue(request({ n: 1 }), 'key-b-000003', 'B', undefined, () => Promise.reject(new Error('x'))), false);
  assert.deepEqual(await aliceQueue.list(), []);
  assert.equal(store.data.size, 0, 'nothing written under Alice');
  // Alice herself still queues
  assert.equal(await aliceQueue.enqueue(request({ n: 2 }), 'key-a-000001', 'A', undefined, () => 'alice'), true);
  assert.equal(await aliceQueue.isOwnedBy(() => 'alice'), true);
  assert.equal(await aliceQueue.isOwnedBy(() => 'bob'), false);
});

test('GA-5.4: an interactive sign-in a 401 opened makes the host read the owner again; a refresh does not', async () => {
  let who = 'alice';
  let signIns = 0;
  const provider: TokenProvider = {
    getToken: async () => 't',
    refresh: async () => false,
    login: async () => {
      signIns++;
      who = 'bob';
      return true;
    },
    owner: async () => who,
  };
  const other: TokenProvider = { getToken: async () => 't', refresh: async () => false, login: async () => true };
  const seen: (string | null)[] = [];
  const stop = followSignIns(provider, () => provider.owner!(), (o) => seen.push(o));
  try {
    assert.equal(await reauthenticate(other, true), true);
    await new Promise((r) => setTimeout(r, 0));
    assert.deepEqual(seen, [], "another UI's sign-in is not this session's");
    // a silent refresh is the same person: nothing to re-read
    const refreshing: TokenProvider = { ...provider, refresh: async () => true };
    const stop2 = followSignIns(refreshing, async () => 'x', (o) => seen.push(o));
    assert.equal(await reauthenticate(refreshing, true), true);
    stop2();
    assert.equal(await reauthenticate(provider, true), true);
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(signIns, 1);
    assert.deepEqual(seen, ['bob']);
  } finally {
    stop();
  }
  assert.equal(await reauthenticate(provider, true), true);
  await new Promise((r) => setTimeout(r, 0));
  assert.deepEqual(seen, ['bob'], 'unsubscribed');
});
