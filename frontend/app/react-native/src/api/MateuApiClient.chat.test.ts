import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient, setStreamingFetch } from './MateuApiClient.ts';

// The assistant's stream and upload go through the client: the same credential scope and the same
// one-shot re-authentication on a 401 as every Mateu request.

const provider = (first: string, renewed: string | null) => {
  const p = {
    token: first,
    refreshes: 0,
    getToken: async () => p.token,
    refresh: async () => {
      p.refreshes++;
      if (renewed === null) return false;
      p.token = renewed;
      return true;
    },
    login: async () => false,
  };
  return p;
};

test('the chat stream hands the text over as it arrives — a character split across chunks included', async () => {
  const bytes = new TextEncoder().encode('data: café\n\n');
  const chunks = [bytes.slice(0, 9), bytes.slice(9)]; // splits the two bytes of «é»
  const seen: { url: string; headers: Record<string, string>; body: string }[] = [];
  setStreamingFetch((async (url: string, init: { headers: Record<string, string>; body: string }) => {
    seen.push({ url, headers: init.headers, body: init.body });
    let i = 0;
    return new Response(new ReadableStream<Uint8Array>({ pull(c) { if (i < chunks.length) c.enqueue(chunks[i++]); else c.close(); } }), { status: 200 });
  }) as unknown as typeof fetch);
  const texts: string[] = [];
  try {
    await new MateuApiClient('http://x', 's', provider('T', null)).postStream('http://x/api/chat', '{"message":"hi"}', (t) => texts.push(t));
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(texts.join(''), 'data: café\n\n');
  assert.equal(seen[0].headers['Accept'], 'text/event-stream');
  assert.equal(seen[0].headers['Authorization'], 'Bearer T');
  assert.equal(seen[0].body, '{"message":"hi"}');
});

test('a chat endpoint on another origin is called without the user\'s credentials', async () => {
  const seen: Record<string, string>[] = [];
  setStreamingFetch((async (_url: string, init: { headers: Record<string, string> }) => {
    seen.push(init.headers);
    return { ok: true, status: 200, body: null, text: async () => 'data: x\n\n' } as unknown as Response;
  }) as unknown as typeof fetch);
  const texts: string[] = [];
  try {
    await new MateuApiClient('http://x', 's', provider('T', null)).postStream('http://elsewhere/chat', '{}', (t) => texts.push(t));
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(seen[0]['Authorization'], undefined);
  assert.equal(seen[0]['X-Session-Id'], undefined);
  assert.deepEqual(texts, ['data: x\n\n']); // no stream reader: the whole text at the end
});

test('a chat stream 401 re-authenticates once; an HTTP error is an error', async () => {
  const auths: (string | undefined)[] = [];
  const p = provider('OLD', 'NEW');
  setStreamingFetch((async (_url: string, init: { headers: Record<string, string> }) => {
    auths.push(init.headers['Authorization']);
    return new Response(init.headers['Authorization'] === 'Bearer NEW' ? 'data: ok\n\n' : 'no', { status: init.headers['Authorization'] === 'Bearer NEW' ? 200 : 401 });
  }) as unknown as typeof fetch);
  const texts: string[] = [];
  try {
    await new MateuApiClient('http://x', 's', p).postStream('http://x/chat', '{}', (t) => texts.push(t));
    await assert.rejects(new MateuApiClient('http://x', 's', null).postStream('http://x/chat', '{}', () => {}), /HTTP 401: no/);
  } finally {
    setStreamingFetch(null);
  }
  assert.deepEqual(auths, ['Bearer OLD', 'Bearer NEW', undefined]);
  assert.equal(texts.join(''), 'data: ok\n\n');
});

test('an upload is multipart: credentials but no JSON content type; a 401 is retried once', async () => {
  const original = globalThis.fetch;
  const seen: { url: string; headers: Record<string, string>; body: unknown }[] = [];
  let status = 401;
  globalThis.fetch = (async (url: string, init: { headers: Record<string, string>; body: unknown }) => {
    seen.push({ url, headers: init.headers, body: init.body });
    const s = status;
    status = 200;
    return new Response(s === 200 ? '{"files":[{"name":"a.png","path":"up/a.png"}]}' : '', { status: s });
  }) as unknown as typeof fetch;
  const form = new FormData();
  form.append('sessionId', 'c1');
  try {
    const answer = await new MateuApiClient('http://x', 's', provider('OLD', 'NEW')).postForm('http://x/upload', form);
    assert.deepEqual(answer, { files: [{ name: 'a.png', path: 'up/a.png' }] });
  } finally {
    globalThis.fetch = original;
  }
  assert.equal(seen.length, 2);
  assert.equal(seen[1].headers['Content-Type'], undefined);
  assert.equal(seen[1].headers['Authorization'], 'Bearer NEW');
  assert.equal(seen[1].body, form);
});

test('an upload error says the status; an empty answer is an empty object', async () => {
  const original = globalThis.fetch;
  const answers = [new Response('too big', { status: 413 }), new Response('', { status: 200 })];
  globalThis.fetch = (async () => answers.shift()!) as unknown as typeof fetch;
  try {
    const api = new MateuApiClient('http://x', 's', null);
    await assert.rejects(api.postForm('http://x/upload', new FormData()), /HTTP 413: too big/);
    assert.deepEqual(await api.postForm('http://x/upload', new FormData()), {});
  } finally {
    globalThis.fetch = original;
  }
});
