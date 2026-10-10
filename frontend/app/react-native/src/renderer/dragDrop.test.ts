import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  accepts, canMove, draggedIds, dropOn, dropParameters, moveToLabel, registerDropZone,
  subscribeDropZones, zoneLabel, zonesAccepting, type DropZoneMeta, type MountedDropZone,
} from './dragDrop.ts';

const window2: DropZoneMeta = {
  accept: 'charge', actionId: 'moveCharges', parameters: { window: 2 }, title: 'Window 2', subtitle: 'Guest (cash)',
};

test('a zone accepts only its own type, and only with an action', () => {
  assert.equal(accepts(window2, 'charge'), true);
  assert.equal(accepts(window2, 'room'), false);
  assert.equal(accepts(window2, null), false);
  assert.equal(accepts({ ...window2, actionId: null }, 'charge'), false);
  assert.equal(accepts({ ...window2, accept: null }, 'charge'), false);
});

test('the drop parameters are the zone parameters plus _draggedIds and _dragType', () => {
  assert.deepEqual(dropParameters(window2, 'charge', ['c1', 'c2']), {
    window: 2, _draggedIds: ['c1', 'c2'], _dragType: 'charge',
  });
  assert.deepEqual(dropParameters({ accept: 'x', actionId: 'a' }, 'x', []), { _draggedIds: [], _dragType: 'x' });
});

test('dragged ids come from the row identity, blanks dropped', () => {
  assert.deepEqual(draggedIds([{ id: 'c1' }, { _id: 7 }, { name: 'no id' }, { key: 'k' }]), ['c1', '7', 'k']);
});

test('labels: zone title first; Move to… pluralises', () => {
  assert.equal(zoneLabel(window2), 'Window 2');
  assert.equal(zoneLabel({ subtitle: 'Sub', actionId: 'a' }), 'Sub');
  assert.equal(zoneLabel({ actionId: 'a' }), 'a');
  assert.equal(moveToLabel(1), 'Move to…');
  assert.equal(moveToLabel(3), 'Move 3 rows to…');
  assert.equal(canMove('charge', 1), true);
  assert.equal(canMove('charge', 0), false);
  assert.equal(canMove(undefined, 2), false);
});

test('the registry lists the mounted zones accepting a type and dispatches on the zone', () => {
  const calls: [string, Record<string, unknown>][] = [];
  let changes = 0;
  const unsubscribe = subscribeDropZones(() => changes++);
  const zone: MountedDropZone = { key: 'w2', meta: window2, dispatch: (a, p) => calls.push([a, p]) };
  const other: MountedDropZone = {
    key: 'r1', meta: { accept: 'room', actionId: 'moveRoom', title: 'Rooms' }, dispatch: () => assert.fail('wrong zone'),
  };
  const off1 = registerDropZone(zone);
  const off2 = registerDropZone(other);
  assert.deepEqual(zonesAccepting('charge').map((z) => z.key), ['w2']);
  assert.equal(dropOn(zone, 'charge', [{ id: 'c1' }, { id: 'c2' }]), true);
  assert.deepEqual(calls, [['moveCharges', { window: 2, _draggedIds: ['c1', 'c2'], _dragType: 'charge' }]]);
  // wrong type / no ids: nothing dispatched
  assert.equal(dropOn(zone, 'room', [{ id: 'c1' }]), false);
  assert.equal(dropOn(zone, 'charge', [{ name: 'x' }]), false);
  assert.equal(calls.length, 1);
  off1();
  off2();
  assert.deepEqual(zonesAccepting('charge'), []);
  assert.equal(changes, 4);
  unsubscribe();
});
