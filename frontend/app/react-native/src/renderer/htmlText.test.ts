import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml } from './htmlText.ts';

test('tags are removed until none is left, even when removing one splices another', () => {
  assert.equal(stripHtml('<scr<b>ipt>alert(1)</scr</b>ipt>'), 'alert(1)');
  assert.equal(stripHtml('a <<b>i>b'), 'a b');
});

test('block tags become line breaks and entities are decoded once', () => {
  assert.equal(stripHtml('<p>one</p><p>two &amp;lt; three</p>'), 'one\ntwo &lt; three');
  assert.equal(stripHtml('x &lt;tag&gt; y'), 'x <tag> y');
  assert.equal(stripHtml('<ul><li>a</li><li>b</li></ul>'), '• a\n• b');
});
