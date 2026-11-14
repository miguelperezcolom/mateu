import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordTiming, timed, timings } from './timing.ts';

test('timings are recorded rounded, with their source when one is given, and the last 50 kept', async () => {
  const info = console.info;
  const logged: string[] = [];
  console.info = (m: string) => void logged.push(m);
  try {
    recordTiming('manifest', 12.6, 'cache');
    recordTiming('shell', 3.2);
    assert.deepEqual(timings().slice(-2), [{ step: 'manifest', ms: 13, source: 'cache' }, { step: 'shell', ms: 3 }]);
    assert.deepEqual(logged.slice(-2), ['[Mateu timing] manifest: 13 ms (cache)', '[Mateu timing] shell: 3 ms']);

    const result = await timed('bundle', async () => 'etag-304', (r) => (r.endsWith('304') ? '304' : undefined));
    assert.equal(result, 'etag-304');
    const last = timings().at(-1)!;
    assert.equal(last.step, 'bundle');
    assert.equal(last.source, '304');
    assert.equal(await timed('first screen', async () => 1), 1);
    assert.equal(timings().at(-1)!.source, undefined);

    for (let i = 0; i < 60; i++) recordTiming(`s${i}`, i);
    assert.equal(timings().length, 50);
    assert.equal(timings()[0].step, 's10');
    assert.equal((globalThis as Record<string, unknown>).__mateuTimings instanceof Array, true);
    // a copy: changing it leaves the kept ones alone
    timings().pop();
    assert.equal(timings().length, 50);
  } finally {
    console.info = info;
  }
});
