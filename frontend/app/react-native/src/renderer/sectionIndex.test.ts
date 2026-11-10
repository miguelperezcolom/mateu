import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSectionCard, isStickySection, sectionTitleOf, showsSectionIndex } from './sectionIndex.ts';

const text = (t: string, container = 'h3') => ({ type: 'ClientSide', metadata: { type: 'Text', container, text: t }, children: [] });

test('an @Section card is marked by its class; a pinned one by --sticky', () => {
  assert.equal(isSectionCard({ cssClasses: 'mateu-section' }), true);
  assert.equal(isSectionCard({ cssClasses: 'mateu-section mateu-section--sticky' }), true);
  assert.equal(isStickySection({ cssClasses: 'mateu-section mateu-section--sticky' }), true);
  assert.equal(isSectionCard({ cssClasses: 'mateu-sectionx' }), false);
  assert.equal(isSectionCard({}), false);
});

test('a section`s title: the title slot, else the first heading of its content', () => {
  assert.equal(sectionTitleOf({ metadata: { title: 'Arrival' } }), 'Arrival');
  assert.equal(sectionTitleOf({ metadata: { title: text('Rooms', 'div') } }), 'Rooms');
  const card = { metadata: { title: null, content: { metadata: { type: 'VerticalLayout' }, children: [{ metadata: { type: 'HorizontalLayout' }, children: [text('Spa')] }, text('Not this')] } } };
  assert.equal(sectionTitleOf(card), 'Spa');
  assert.equal(sectionTitleOf({ metadata: { content: { metadata: { type: 'VerticalLayout' }, children: [text('plain', 'div')] } } }), '');
});

test('the index shows when declared, never when refused, else from five sections', () => {
  assert.equal(showsSectionIndex(true, 2), true);
  assert.equal(showsSectionIndex(true, 0), false);
  assert.equal(showsSectionIndex(false, 9), false);
  assert.equal(showsSectionIndex(undefined, 4), false);
  assert.equal(showsSectionIndex(null, 5), true);
});
