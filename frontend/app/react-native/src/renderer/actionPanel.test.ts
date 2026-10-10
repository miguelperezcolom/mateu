import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  actionPanelView, countLabel, maxPerCategoryOf, orderActions, panelLabel, type ActionPanelMeta,
} from './actionPanel.ts';

const meta: ActionPanelMeta = {
  label: 'I want to…',
  shortcut: 'ctrl+i',
  maxPerCategory: 2,
  hideUnpopulatedToggle: true,
  categories: [
    {
      title: 'Modify',
      actions: [
        { label: 'Rate', actionId: 'rate', populated: false },
        { label: 'Traces', actionId: 'traces', count: 3, populated: true },
        { label: 'Notes', actionId: 'notes', count: 40, populated: true, parameters: { tab: 'notes' } },
        { label: 'Lock', actionId: 'lock', populated: false, disabled: true },
      ],
    },
    { title: 'Empty one', actions: [{ label: 'Nothing', actionId: 'n', populated: false }] },
    { title: 'No actions', actions: [] },
  ],
};

test('count labels: (n) when > 0, (25+) above 25, nothing otherwise', () => {
  assert.equal(countLabel('Traces', 3), 'Traces (3)');
  assert.equal(countLabel('Traces', 25), 'Traces (25)');
  assert.equal(countLabel('Traces', 26), 'Traces (25+)');
  assert.equal(countLabel('Traces', 0), 'Traces');
  assert.equal(countLabel('Traces', null), 'Traces');
});

test('populated actions first, declared order otherwise', () => {
  const ordered = orderActions(meta.categories![0].actions!);
  assert.deepEqual(ordered.map((a) => a.actionId), ['traces', 'notes', 'rate', 'lock']);
});

test('defaults: label and maxPerCategory', () => {
  assert.equal(panelLabel({}), 'I want to…');
  assert.equal(panelLabel({ label: 'Do' }), 'Do');
  assert.equal(maxPerCategoryOf({}), 10);
  assert.equal(maxPerCategoryOf({ maxPerCategory: 0 }), 10);
  assert.equal(maxPerCategoryOf({ maxPerCategory: 3 }), 3);
});

test('cuts at maxPerCategory with a Show more (k) control; empty categories are dropped', () => {
  const view = actionPanelView(meta);
  assert.deepEqual(view.map((c) => c.title), ['Modify', 'Empty one']);
  const modify = view[0];
  assert.deepEqual(modify.actions.map((a) => a.label), ['Traces (3)', 'Notes (25+)']);
  assert.equal(modify.hiddenCount, 2);
  assert.equal(modify.moreLabel, 'Show more (2)');
  assert.deepEqual(modify.actions[1].parameters, { tab: 'notes' });
  assert.equal(modify.actions[0].populated, true);
});

test('Show more reveals the rest of that category only', () => {
  const view = actionPanelView(meta, { expanded: new Set([0]) });
  assert.deepEqual(view[0].actions.map((a) => a.actionId), ['traces', 'notes', 'rate', 'lock']);
  assert.equal(view[0].hiddenCount, 0);
  assert.equal(view[0].moreLabel, undefined);
  assert.equal(view[0].actions[3].disabled, true);
});

test('Hide unpopulated drops unpopulated actions and the categories left empty', () => {
  const view = actionPanelView(meta, { hideUnpopulated: true });
  assert.deepEqual(view.map((c) => c.title), ['Modify']);
  assert.deepEqual(view[0].actions.map((a) => a.actionId), ['traces', 'notes']);
  assert.equal(view[0].hiddenCount, 0);
});

test('Hide unpopulated is ignored when the panel offers no toggle', () => {
  const view = actionPanelView({ ...meta, hideUnpopulatedToggle: false }, { hideUnpopulated: true });
  assert.equal(view.length, 2);
});
