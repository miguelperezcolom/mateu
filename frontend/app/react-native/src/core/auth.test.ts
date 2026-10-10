import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { authHeaders, reauthenticateWithProvider, setTokenProvider, type TokenProvider } from './auth.ts';
import { handleSessionExpired, onSessionExpired } from './sessionGuard.ts';
import { installSessionId, randomUuid, SESSION_ID_KEY, type KeyValueStore } from './sessionId.ts';
import { MateuApiClient } from '../api/MateuApiClient.ts';

const memoryStore = (seed: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } => {
  const data = { ...seed };
  return {
    data,
    get: async (k) => data[k] ?? null,
    set: async (k, v) => {
      data[k] = v;
    },
    remove: async (k) => {
      delete data[k];
    },
  };
};

const provider = (over: Partial<TokenProvider> & { token?: string | null } = {}): TokenProvider & { token: string | null } => {
  const p = {
    token: over.token === undefined ? 'tok-1' : over.token,
    getToken: async () => p.token,
    refresh: over.refresh ?? (async () => false),
    login: over.login,
  };
  return p;
};

beforeEach(() => {
  setTokenProvider(undefined);
  onSessionExpired(undefined);
});

// ── session id ──────────────────────────────────────────────────────────────

test('randomUuid is a v4 UUID and two draws differ', () => {
  const a = randomUuid();
  assert.match(a, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(a, randomUuid());
});

test('the session id is created once per install and then reused', async () => {
  const store = memoryStore();
  const first = await installSessionId(store);
  assert.equal(store.data[SESSION_ID_KEY], first);
  assert.equal(await installSessionId(store), first);
  assert.notEqual(first, 'native-session-1');
});

test('a broken store still yields a per-launch id, never a shared constant', async () => {
  const broken: KeyValueStore = {
    get: async () => {
      throw new Error('no keychain');
    },
    set: async () => {},
    remove: async () => {},
  };
  const id = await installSessionId(broken, () => 'fresh');
  assert.equal(id, 'fresh');
});

// ── token provider ──────────────────────────────────────────────────────────

test('no provider → no Authorization header', async () => {
  assert.deepEqual(await authHeaders(), {});
});

test('a provider with a token → Bearer header', async () => {
  setTokenProvider(provider());
  assert.deepEqual(await authHeaders(), { Authorization: 'Bearer tok-1' });
});

test('a provider that throws does not break the request', async () => {
  setTokenProvider({
    getToken: async () => {
      throw new Error('x');
    },
    refresh: async () => false,
  });
  assert.deepEqual(await authHeaders(), {});
});

test('re-auth: silent refresh first; interactive login only when refresh fails', async () => {
  const calls: string[] = [];
  setTokenProvider(
    provider({
      refresh: async () => {
        calls.push('refresh');
        return false;
      },
      login: async () => {
        calls.push('login');
        return true;
      },
    }),
  );
  assert.equal(await reauthenticateWithProvider(), true);
  assert.deepEqual(calls, ['refresh', 'login']);
  calls.length = 0;
  assert.equal(await reauthenticateWithProvider(false), false);
  assert.deepEqual(calls, ['refresh']);
});

test('sessionGuard: an explicit handler wins over the provider', async () => {
  let loginCalled = false;
  setTokenProvider(provider({ login: async () => ((loginCalled = true), true) }));
  onSessionExpired(() => false);
  assert.equal(await handleSessionExpired(), false);
  assert.equal(loginCalled, false);
});

test('sessionGuard: concurrent 401s share ONE re-auth', async () => {
  let logins = 0;
  setTokenProvider(
    provider({
      login: async () => {
        logins++;
        await new Promise((r) => setTimeout(r, 10));
        return true;
      },
    }),
  );
  const results = await Promise.all([handleSessionExpired(), handleSessionExpired(), handleSessionExpired()]);
  assert.deepEqual(results, [true, true, true]);
  assert.equal(logins, 1);
});

// ── the API client ──────────────────────────────────────────────────────────

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

const answer = (status: number, body: unknown) =>
  ({ status, ok: status >= 200 && status < 300, text: async () => JSON.stringify(body) }) as unknown as Response;

test('requests carry X-Session-Id and the Bearer token', async () => {
  const seen: Record<string, string>[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    seen.push(init.headers as Record<string, string>);
    return answer(200, { fragments: [] });
  }) as typeof fetch;
  setTokenProvider(provider({ token: 'abc' }));
  await new MateuApiClient('http://x', 'install-42').initialLoad('', {});
  assert.equal(seen[0]['X-Session-Id'], 'install-42');
  assert.equal(seen[0]['Authorization'], 'Bearer abc');
});

test('a 401 re-authenticates and retries ONCE with the new token', async () => {
  const p = provider({ token: 'old' });
  p.refresh = async () => {
    p.token = 'new';
    return true;
  };
  setTokenProvider(p);
  const tokens: string[] = [];
  globalThis.fetch = (async (_url: string, init: RequestInit) => {
    const auth = (init.headers as Record<string, string>)['Authorization'];
    tokens.push(auth);
    return auth === 'Bearer new' ? answer(200, { ok: 1 }) : answer(401, {});
  }) as typeof fetch;
  const res = await new MateuApiClient('http://x', 's').initialLoad('', {});
  assert.deepEqual(res, { ok: 1 });
  assert.deepEqual(tokens, ['Bearer old', 'Bearer new']);
});

test('a 401 nobody can fix fails normally after one attempt', async () => {
  let calls = 0;
  globalThis.fetch = (async () => {
    calls++;
    return answer(401, {});
  }) as typeof fetch;
  await assert.rejects(new MateuApiClient('http://x', 's').initialLoad('', {}), /HTTP 401/);
  assert.equal(calls, 1);
});

test('a wire major mismatch is reported once', async () => {
  globalThis.fetch = (async () => answer(200, { wireVersion: '4.0' })) as typeof fetch;
  const client = new MateuApiClient('http://x', 's');
  const warnings: string[] = [];
  client.onWireMismatch = (m) => warnings.push(m);
  const warn = console.warn;
  console.warn = () => {};
  try {
    await client.initialLoad('', {});
    await client.initialLoad('', {});
  } finally {
    console.warn = warn;
  }
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /4\.0/);
});

test('release builds do not log request bodies', async () => {
  globalThis.fetch = (async () => answer(200, {})) as typeof fetch;
  const logged: unknown[] = [];
  const log = console.log;
  console.log = (...a: unknown[]) => logged.push(a);
  try {
    // __DEV__ is undefined under node — the release case
    await new MateuApiClient('http://x', 's').initialLoad('', { secret: 'pin' });
  } finally {
    console.log = log;
  }
  assert.equal(logged.length, 0);
});
