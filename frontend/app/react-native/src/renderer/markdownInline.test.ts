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

test('italic, inline code, strike and bold italic', () => {
  assert.deepEqual(inlineSpans('Quiet *23:00* and `noMargins` ~~old~~ ***both*** _it_'), [
    { kind: 'text', text: 'Quiet ' },
    { kind: 'italic', text: '23:00' },
    { kind: 'text', text: ' and ' },
    { kind: 'code', text: 'noMargins' },
    { kind: 'text', text: ' ' },
    { kind: 'strike', text: 'old' },
    { kind: 'text', text: ' ' },
    { kind: 'boldItalic', text: 'both' },
    { kind: 'text', text: ' ' },
    { kind: 'italic', text: 'it' },
  ]);
});

test('code is never parsed further; snake_case and a lone star stay text; escapes drop the backslash', () => {
  assert.deepEqual(inlineSpans('`**x**` snake_case_name 2 * 3 \\*no\\*'), [
    { kind: 'code', text: '**x**' },
    { kind: 'text', text: ' snake_case_name 2 * 3 *no*' },
  ]);
});

test('${…} is text, never a template', () => {
  assert.deepEqual(inlineSpans('`${state.name}` and ${data.x}'), [
    { kind: 'code', text: '${state.name}' },
    { kind: 'text', text: ' and ${data.x}' },
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
    { kind: 'text', text: ' y' },
  ]);
});
