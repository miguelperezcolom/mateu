import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inputPurposeProps } from './inputPurpose.ts';

test('WCAG 1.3.5: an HTML autocomplete token becomes the platform hints', () => {
  assert.deepEqual(inputPurposeProps('email'), { autoComplete: 'email', textContentType: 'emailAddress' });
  assert.deepEqual(inputPurposeProps('given-name'), { autoComplete: 'name-given', textContentType: 'givenName' });
  assert.deepEqual(inputPurposeProps('shipping postal-code'), { autoComplete: 'postal-code', textContentType: 'postalCode' });
  assert.deepEqual(inputPurposeProps('off'), { autoComplete: 'off', textContentType: 'none' });
});

test('no token, or one it does not know, gives no hint', () => {
  assert.deepEqual(inputPurposeProps(undefined), {});
  assert.deepEqual(inputPurposeProps('  '), {});
  assert.deepEqual(inputPurposeProps('favourite-colour'), {});
});
