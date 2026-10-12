import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MateuApiClient, setStreamingFetch } from './MateuApiClient.ts';

// A LongTask answers on the SSE endpoint with one increment per step: each has to reach the
// screen as it arrives (the progress dialog moves), not all together once the task is over.
test('an sse action posts to the stream endpoint and applies each increment as it arrives', async () => {
  const enc = new TextEncoder();
  const chunks = ['data: {"fragments":[{"step":1}]}\n\n', 'data: {"fragm', 'ents":[{"step":2}]}\n\n:heartbeat\n\n', 'data: {"fragments":[{"step":3}]}'];
  let seenUrl = '';
  let seenAccept = '';
  const applied: unknown[] = [];
  setStreamingFetch((async (url: string, init: { headers: Record<string, string> }) => {
    seenUrl = url;
    seenAccept = init.headers['Accept'];
    let i = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        if (i < chunks.length) controller.enqueue(enc.encode(chunks[i++]));
        else controller.close();
      },
    });
    return new Response(body, { status: 200 });
  }) as unknown as typeof fetch);
  try {
    const api = new MateuApiClient('http://x', 's');
    await api.runActionStream(
      { route: '/long-task', consumedRoute: '', actionId: 'runLongTask', serverSideType: 'T', initiatorComponentId: 'c', componentState: {}, appState: {}, parameters: {} },
      (inc) => applied.push(inc),
    );
  } finally {
    setStreamingFetch(null);
  }
  assert.equal(seenUrl, 'http://x/mateu/v3/sse/long-task');
  assert.equal(seenAccept, 'text/event-stream');
  assert.deepEqual(applied, [{ fragments: [{ step: 1 }] }, { fragments: [{ step: 2 }] }, { fragments: [{ step: 3 }] }]);
});
