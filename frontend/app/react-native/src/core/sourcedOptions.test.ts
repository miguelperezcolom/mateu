import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourcedOptionsControl } from './sourcedOptions.ts';

const src = { url: '/tags', itemsPath: 'items' };

test('a multi-value field fed by an optionsSource keeps its own control', () => {
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'multiSelect', dataType: 'array' }), 'multiSelect');
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'checkbox', dataType: 'array' }), 'checkbox');
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'checkbox' }, ['a']), 'checkbox');
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'listBox' }), 'listBox');
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'treeSelect' }), 'treeSelect');
  // a catalogue ref is a source too
  assert.equal(sourcedOptionsControl({ optionsSource: { ref: 'tags' }, stereotype: 'multiSelect', dataType: 'array' }), 'multiSelect');
  // a collection with no stereotype of its own (a multi combobox) is a multi-select
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'combobox', dataType: 'array' }), 'multiSelect');
  assert.equal(sourcedOptionsControl({ optionsSource: src, dataType: 'array' }), 'multiSelect');
});

test('the single select, inline options and no source stay as they were', () => {
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'combobox', dataType: 'string' }), null);
  assert.equal(sourcedOptionsControl({ optionsSource: src }), null);
  // a single-valued checkbox is a boolean, not a set
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'checkbox', dataType: 'bool' }), null);
  assert.equal(sourcedOptionsControl({ optionsSource: src, stereotype: 'multiSelect', options: [{ value: 'a' }] }), null);
  assert.equal(sourcedOptionsControl({ stereotype: 'multiSelect', dataType: 'array' }), null);
  assert.equal(sourcedOptionsControl({ optionsSource: {}, stereotype: 'multiSelect', dataType: 'array' }), null);
});
