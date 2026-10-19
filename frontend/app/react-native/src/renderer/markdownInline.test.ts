import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inlineSpans } from './markdownInline.ts';

test('bold and links are spans, the rest plain text', () => {
  assert.deepEqual(inlineSpans('**Bold** and a [link](https://example.com)'), [
    { kind: 'bold', text: 'Bold' },
    { kind: 'text', text: ' and a ' },
    { kind: 'link', text: 'link', url: 'https://example.com' },
  ]);
});

test('a link to an unsafe scheme is just its text', () => {
  assert.deepEqual(inlineSpans('[x](javascript:void)'), [{ kind: 'text', text: 'x' }]);
});

test('a line with no markup is one text span', () => {
  assert.deepEqual(inlineSpans('plain'), [{ kind: 'text', text: 'plain' }]);
});

test('app-route links are spans only where the caller opens app routes', () => {
  assert.deepEqual(inlineSpans('[Nora](/booking/4)'), [{ kind: 'text', text: 'Nora' }]);
  assert.deepEqual(inlineSpans('[Nora](/booking/4) [x](https://e.com) [y](//cdn)', true), [
    { kind: 'route', text: 'Nora', route: '/booking/4' },
    { kind: 'text', text: ' ' },
    { kind: 'link', text: 'x', url: 'https://e.com' },
    { kind: 'text', text: ' ' },
    { kind: 'text', text: 'y' },
  ]);
});
