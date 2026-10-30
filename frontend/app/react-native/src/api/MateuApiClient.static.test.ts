import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient } from './MateuApiClient.ts';

// A static bundle answers the LOADS; an ACTION goes on to the server — a hybrid deployment (the
// bundle + /mateu/** proxied to a backend) has one — and only a host with no server behind it ends
// in "This UI has no server".

const local = {
  answer: (rq: { actionId: string }) => {
    if (rq.actionId) throw new Error(`This UI has no server: "${rq.actionId}" cannot run here.`);
    return { fromBundle: true };
  },
};

const withFetch = async (status: number, body: unknown, run: (seen: string[]) => Promise<void>) => {
  const real = globalThis.fetch;
  const seen: string[] = [];
  globalThis.fetch = (async (url: string) => {
    seen.push(String(url));
    return { ok: status < 400, status, text: async () => JSON.stringify(body), headers: { get: () => null } };
  }) as any;
  try { await run(seen); } finally { globalThis.fetch = real; }
};

test('a load is answered by the bundle, with no request', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(200, {}, async (seen) => {
    assert.deepEqual(await api.runAction({ route: '/people', actionId: '' } as any), { fromBundle: true });
    assert.deepEqual(seen, []);
  });
});

test('an action reaches the server behind a hybrid bundle', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(200, { appData: { _restfetch: { ok: 1 } } }, async (seen) => {
    assert.deepEqual(await api.runAction({ route: '/people', actionId: '__restfetch__' } as any), { appData: { _restfetch: { ok: 1 } } });
    assert.deepEqual(seen, ['https://ui.example/mateu/v3/sync/people']);
  });
});

test('with no server behind the host, an action is told so', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(404, 'Not found', async () => {
    await assert.rejects(api.runAction({ route: '/people', actionId: 'delete' } as any), /This UI has no server/);
  });
});

test('a server error is reported as such, not as "no server"', async () => {
  const api = new MateuApiClient('https://ui.example', 's');
  api.local = local;
  await withFetch(500, 'boom', async () => {
    await assert.rejects(api.runAction({ route: '/people', actionId: 'delete' } as any), /HTTP 500/);
  });
});
