// The view controller's wire readers and route texts (viewWire.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asArray, detailLabel, errorText, getByPath, str, trimSlashes } from './viewWire.ts';

test('asArray and str tolerate anything the wire sends', () => {
  assert.deepEqual(asArray([{ a: 1 }]), [{ a: 1 }]);
  assert.deepEqual(asArray(undefined), []);
  assert.deepEqual(asArray({ length: 1 }), []);
  assert.equal(str(null), '');
  assert.equal(str(undefined), '');
  assert.equal(str(0), '0');
  assert.equal(str(false), 'false');
});

test('a dot path walks objects; a missing hop is undefined; an empty path is the value', () => {
  const json = { data: { address: { city: 'Palma' } }, n: 0 };
  assert.equal(getByPath(json, ''), json);
  assert.deepEqual(getByPath(json, 'data.address'), { city: 'Palma' });
  assert.equal(getByPath(json, 'data.address.city'), 'Palma');
  assert.equal(getByPath(json, 'data.nope.city'), undefined);
  assert.equal(getByPath(json, 'n.x'), undefined);
});

test('route texts: slashes trimmed, the detail label from the last segment', () => {
  assert.equal(trimSlashes('//a/b//'), 'a/b');
  assert.equal(detailLabel('/42/edit'), 'edit');
  assert.equal(detailLabel('/NEW'), 'New');
  assert.equal(detailLabel('/7'), '7');
  assert.equal(detailLabel('/'), 'Detail');
  assert.equal(detailLabel(''), 'Detail');
});

test('error text: an Error is its message, anything else its string', () => {
  assert.equal(errorText(new Error('boom')), 'boom');
  assert.equal(errorText('plain'), 'plain');
  assert.equal(errorText(404), '404');
});
