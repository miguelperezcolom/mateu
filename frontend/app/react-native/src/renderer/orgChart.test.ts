// The OrgChart's focus presentation (orgChart.ts): presentation, initial focus, ancestors, labels.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  findOrgNode, initialOrgPath, moreLevelsLabel, orgAncestors, orgChildren, orgDisplay, orgInitials, orgNodeLabel,
  orgPathTo, reportsLabel, visibleAncestors,
} from './orgChart.ts';

const tree = {
  id: 'ceo', title: 'Ada Lovelace', subtitle: 'CEO',
  children: [
    { id: 'cto', title: 'Grace Hopper', children: [{ id: 7 as unknown as string, title: 'Linus' }, { title: 'No id' }] },
    { id: 'cfo', title: 'Joan' },
  ],
};

test('display: only "focus" focuses; null, unknown and "tree" draw the tree', () => {
  assert.equal(orgDisplay('focus'), 'focus');
  assert.equal(orgDisplay(' FOCUS '), 'focus');
  assert.equal(orgDisplay('tree'), 'tree');
  assert.equal(orgDisplay(null), 'tree');
  assert.equal(orgDisplay(undefined), 'tree');
  assert.equal(orgDisplay('radial'), 'tree');
});

test('the path to a node by id (string compare), root first; unknown → undefined', () => {
  assert.deepEqual(orgPathTo(tree, 'cto')?.map((n) => n.title), ['Ada Lovelace', 'Grace Hopper']);
  assert.deepEqual(orgPathTo(tree, '7')?.map((n) => n.title), ['Ada Lovelace', 'Grace Hopper', 'Linus']);
  assert.deepEqual(orgPathTo(tree, 7)?.map((n) => n.title), ['Ada Lovelace', 'Grace Hopper', 'Linus']);
  assert.deepEqual(orgPathTo(tree, 'ceo')?.map((n) => n.title), ['Ada Lovelace']);
  assert.equal(orgPathTo(tree, 'nobody'), undefined);
  assert.equal(orgPathTo(tree, null), undefined);
  assert.equal(orgPathTo(tree, ''), undefined);
  assert.equal(orgPathTo(undefined, 'ceo'), undefined);
  assert.equal(findOrgNode(tree, 'cfo')?.title, 'Joan');
  assert.equal(findOrgNode(tree, 'x'), undefined);
});

test('a focused chart opens on the node `focus` names, else on the root', () => {
  assert.deepEqual(initialOrgPath(tree, 'cto').map((n) => n.title), ['Ada Lovelace', 'Grace Hopper']);
  assert.deepEqual(initialOrgPath(tree, 'missing').map((n) => n.title), ['Ada Lovelace']);
  assert.deepEqual(initialOrgPath(tree, null).map((n) => n.title), ['Ada Lovelace']);
  assert.deepEqual(initialOrgPath(undefined, 'cto'), []);
});

test('ancestors are the path without the focused node; children default to none', () => {
  const path = initialOrgPath(tree, '7');
  assert.deepEqual(orgAncestors(path).map((n) => n.title), ['Ada Lovelace', 'Grace Hopper']);
  assert.deepEqual(orgAncestors([tree]), []);
  assert.deepEqual(orgAncestors([]), []);
  assert.deepEqual(orgChildren(tree).map((n) => n.title), ['Grace Hopper', 'Joan']);
  assert.deepEqual(orgChildren({ title: 'leaf' }), []);
  assert.deepEqual(orgChildren(undefined), []);
});

test('a phone shows only the direct parent and folds the rest until expanded', () => {
  const chain = ['root', 'vp', 'director', 'manager'];
  assert.deepEqual(visibleAncestors(chain, true, false), { hidden: 3, shown: ['manager'] });
  assert.deepEqual(visibleAncestors(chain, true, true), { hidden: 0, shown: chain });
  assert.deepEqual(visibleAncestors(chain, false, false), { hidden: 0, shown: chain });
  assert.deepEqual(visibleAncestors(['root'], true, false), { hidden: 0, shown: ['root'] });
  assert.deepEqual(visibleAncestors([], true, false), { hidden: 0, shown: [] });
  assert.equal(moreLevelsLabel(1), '1 more level');
  assert.equal(moreLevelsLabel(3), '3 more levels');
  assert.equal(reportsLabel(2), 'Reports (2)');
});

test('initials: the avatar glyph, else the first letters of two words of the title, else "?"', () => {
  assert.equal(orgInitials({ title: 'Ada Lovelace' }), 'AL');
  assert.equal(orgInitials({ title: 'grace brewster murray hopper' }), 'GB');
  assert.equal(orgInitials({ title: 'Linus' }), 'L');
  assert.equal(orgInitials({ title: 'Ada', avatar: '👩' }), '👩');
  assert.equal(orgInitials({ title: 'Ada Lovelace', avatar: 'https://x/a.png' }), 'AL');
  assert.equal(orgInitials({ title: 'Ada Lovelace', avatar: 'vaadin:user' }), 'AL');
  assert.equal(orgInitials({ title: 'Ángel Ñúñez' }), 'ÁÑ');
  assert.equal(orgInitials({}), '?');
  assert.equal(orgNodeLabel({ title: 'Ada', subtitle: 'CEO' }), 'Ada, CEO');
  assert.equal(orgNodeLabel({ title: 'Ada', subtitle: '' }), 'Ada');
});
