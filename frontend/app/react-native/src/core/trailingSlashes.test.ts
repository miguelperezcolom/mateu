import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withoutTrailingSlashes } from './trailingSlashes.ts';

test('drops every trailing slash and nothing else', () => {
  assert.equal(withoutTrailingSlashes('https://ui.example/app///'), 'https://ui.example/app');
  assert.equal(withoutTrailingSlashes('https://ui.example/a//b'), 'https://ui.example/a//b');
  assert.equal(withoutTrailingSlashes('///'), '');
  assert.equal(withoutTrailingSlashes(''), '');
});
