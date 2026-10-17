// Data-derived links (MINOR 5 of the GA review): only http(s)/mailto/tel may reach Linking.openURL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeExternalUrl } from './linkTarget.ts';

test('http(s), mailto and tel are opened as written (trimmed)', () => {
  assert.equal(safeExternalUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(safeExternalUrl(' HTTP://example.com '), 'HTTP://example.com');
  assert.equal(safeExternalUrl('mailto:someone@example.com'), 'mailto:someone@example.com');
  assert.equal(safeExternalUrl('tel:+34600000000'), 'tel:+34600000000');
});

test('every other scheme is refused', () => {
  for (const url of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<b>x</b>', 'file:///etc/passwd',
    'intent://scan/#Intent;scheme=zxing;end', 'sms:123', 'myapp://pay?amount=1', 'content://x/y']) {
    assert.equal(safeExternalUrl(url), null, url);
  }
});

test('control characters smuggled into a scheme, blanks and non-strings are not links', () => {
  assert.equal(safeExternalUrl('java\tscript:alert(1)'), null);
  assert.equal(safeExternalUrl('https://exa\nmple.com'), null);
  assert.equal(safeExternalUrl(''), null);
  assert.equal(safeExternalUrl('   '), null);
  assert.equal(safeExternalUrl(undefined), null);
  assert.equal(safeExternalUrl(42), null);
  assert.equal(safeExternalUrl('/products'), null);
});
