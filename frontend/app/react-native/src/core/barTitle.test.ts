import { test } from 'node:test';
import assert from 'node:assert/strict';
import { barTitleOf, bodyRepeatsBar } from './barTitle.ts';

test('the bar names the screen on view, not the app (RN-22)', () => {
  assert.equal(barTitleOf('Products', 'Acme backoffice'), 'Products');
});

test('until a screen names itself the bar keeps the app title, then the hub name', () => {
  assert.equal(barTitleOf(null, 'Acme backoffice'), 'Acme backoffice');
  assert.equal(barTitleOf('  ', 'Acme backoffice'), 'Acme backoffice');
  assert.equal(barTitleOf(undefined, null, 'Star Wars'), 'Star Wars');
  assert.equal(barTitleOf(undefined), 'Mateu');
});

test('a page header that repeats the bar drops its title; a different one stays', () => {
  assert.equal(bodyRepeatsBar('Products', 'Products'), true);
  assert.equal(bodyRepeatsBar(' products ', 'Products'), true, 'same words, any case and spacing');
  assert.equal(bodyRepeatsBar('Espresso machine', 'Products'), false);
  assert.equal(bodyRepeatsBar('Products', null), false, 'no bar (tabs): the body keeps its title');
  assert.equal(bodyRepeatsBar('', 'Products'), false);
});
