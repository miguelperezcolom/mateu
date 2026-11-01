import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageTitleTemplate, resolvedPageTitle } from './windowTitle.ts';

const recordPage = {
  type: 'ServerSide',
  children: [{ type: 'ClientSide', metadata: { type: 'Form', title: '${state.name}' }, children: [] }],
};

test('a YAML record page is titled by its own template once the record is in', () => {
  assert.equal(pageTitleTemplate(recordPage), '${state.name}');
  assert.equal(resolvedPageTitle(recordPage, {}, {}), undefined, 'nothing yet: keep the server title');
  assert.equal(resolvedPageTitle(recordPage, { name: 'Voyager 1' }, {}), 'Voyager 1');
});

test('a page whose title is plain text is left to the server title', () => {
  const plain = { type: 'ClientSide', metadata: { type: 'Form', title: 'Missions' }, children: [] };
  assert.equal(pageTitleTemplate(plain), undefined);
  assert.equal(resolvedPageTitle(null, { name: 'x' }, {}), undefined);
});
