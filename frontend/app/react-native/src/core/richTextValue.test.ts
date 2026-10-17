import { test } from 'node:test';
import assert from 'node:assert/strict';
import { richTextHtml } from './richTextValue.ts';

// Same contract as libs/mateu's richTextValue.test.ts: a legacy Quill Delta value opens as HTML.
test('a legacy Delta value opens as HTML, not as raw JSON', () => {
  assert.equal(richTextHtml('[{"insert":"Hi","attributes":{"bold":true}},{"insert":"\\n"}]'), '<p><strong>Hi</strong></p>');
  assert.equal(richTextHtml('{"ops":[{"insert":"a\\n"},{"insert":"b"},{"insert":"\\n","attributes":{"list":"bullet"}}]}'), '<p>a</p><ul><li>b</li></ul>');
});

test('HTML and plain text pass through untouched', () => {
  assert.equal(richTextHtml('<p>Guest prefers a <strong>quiet</strong> room</p>'), '<p>Guest prefers a <strong>quiet</strong> room</p>');
  assert.equal(richTextHtml('[not json'), '[not json');
  assert.equal(richTextHtml(null), '');
});

test('unsafe links are dropped, text is escaped', () => {
  assert.equal(richTextHtml('[{"insert":"x<y","attributes":{"link":"javascript:alert(1)"}},{"insert":"\\n"}]'), '<p>x&lt;y</p>');
});
