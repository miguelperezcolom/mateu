import { test } from 'node:test';
import assert from 'node:assert/strict';
import { declaresJson, interpolateBody, jsonEscape, jsonSafe, jsonSafeContext } from './jsonTemplate.ts';
import { interpolate } from './expressions.ts';

test('a JSON body escapes the VALUES, never the template (libs/mateu jsonTemplate.ts)', () => {
  assert.equal(jsonEscape('say "hi"\n\\'), 'say \\"hi\\"\\n\\\\');
  assert.equal(jsonEscape('\u0001'), '\\u0001');
  assert.deepEqual(jsonSafe({ a: 'x"y', n: 3, l: ['q"'] }), { a: 'x\\"y', n: 3, l: ['q\\"'] });
  assert.ok(declaresJson({ 'Content-Type': 'application/json; charset=utf-8' }));
  assert.ok(!declaresJson({ 'Content-Type': 'text/plain' }));
  assert.ok(!declaresJson(undefined));
});

test('a restAction body filled from an escaped context stays valid JSON', () => {
  const ctx = { state: { name: 'O"Brien\nJr', age: 40 } };
  const body = interpolate('{"name":"${state.name}","age":${state.age}}', jsonSafeContext(ctx));
  assert.deepEqual(JSON.parse(body), { name: 'O"Brien\nJr', age: 40 });
});

test('an opaque interpolation escapes each placeholder only when the request declares JSON', () => {
  const resolve = (t: string) => interpolate(t, { state: { q: 'a"b' } });
  assert.equal(interpolateBody('{"q":"${state.q}"}', { 'content-type': 'application/json' }, resolve), '{"q":"a\\"b"}');
  assert.equal(interpolateBody('q=${state.q}', { 'content-type': 'text/plain' }, resolve), 'q=a"b');
});
