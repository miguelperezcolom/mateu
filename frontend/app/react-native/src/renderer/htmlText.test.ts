import { test } from 'node:test';
import assert from 'node:assert/strict';
import { htmlToMarkdown, stripHtml } from './htmlText.ts';

test('tags are removed until none is left, even when removing one splices another', () => {
  assert.equal(stripHtml('<scr<b>ipt>alert(1)</scr</b>ipt>'), 'alert(1)');
  assert.equal(stripHtml('a <<b>i>b'), 'a b');
});

test('block tags become line breaks and entities are decoded once', () => {
  assert.equal(stripHtml('<p>one</p><p>two &amp;lt; three</p>'), 'one\ntwo &lt; three');
  assert.equal(stripHtml('x &lt;tag&gt; y'), 'x <tag> y');
  assert.equal(stripHtml('<ul><li>a</li><li>b</li></ul>'), '• a\n• b');
});

test('HTML as the Markdown that draws its structure; no tag survives', () => {
  assert.equal(htmlToMarkdown('<h2>Rooms</h2><p>Sea <strong>view</strong>, <em>quiet</em>.</p><ul><li>Wi-Fi</li><li>Pool</li></ul>'), '## Rooms\n\nSea **view**, *quiet*.\n\n- Wi-Fi\n- Pool');
  assert.equal(htmlToMarkdown('<p>See <a href="https://mateu.io">the docs</a><br>now</p>'), 'See [the docs](https://mateu.io)  \nnow');
  assert.equal(htmlToMarkdown('<blockquote>Quiet</blockquote>'), '> Quiet');
  assert.equal(htmlToMarkdown('<scr<b>ipt>alert(1)</script>x'), 'alert(1)x');
});
