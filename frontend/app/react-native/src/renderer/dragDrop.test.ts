import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DropZoneRegistry, accepts, canMove, dragPreviewLabel, draggedIds, dropOn, dropParameters, moveToLabel, registerDropZone,
  rowsToDrag, subscribeDropZones, zoneAt, zoneLabel, zonesAccepting, type DropZoneMeta, type MountedDropZone,
} from './dragDrop.ts';

test('drag: the zone under the finger is the innermost box containing it', () => {
  const rects = [
    { key: 'outer', x: 0, y: 0, width: 400, height: 400 },
    { key: 'inner', x: 50, y: 50, width: 100, height: 100 },
    { key: 'collapsed', x: 60, y: 60, width: 0, height: 0 },
  ];
  assert.equal(zoneAt(rects, 70, 70), 'inner');
  assert.equal(zoneAt(rects, 300, 300), 'outer');
  assert.equal(zoneAt(rects, 500, 10), undefined);
  assert.equal(zoneAt([], 1, 1), undefined);
});

test('drag: a long press lifts the selection when the row is in it, else the row alone', () => {
  const a = { id: 1, name: 'Minibar' };
  const b = { id: 2, name: 'Laundry' };
  const c = { id: 3, name: 'Room' };
  assert.deepEqual(rowsToDrag(a, [a, b]), [a, b]);
  assert.deepEqual(rowsToDrag({ id: 2 }, [a, b]), [a, b]);
  assert.deepEqual(rowsToDrag(c, [a, b]), [c]);
  assert.deepEqual(rowsToDrag(c, []), [c]);
  assert.equal(dragPreviewLabel([a, b], (r) => String(r['name'])), '2 rows');
  assert.equal(dragPreviewLabel([a], (r) => String(r['name'])), 'Minibar');
  assert.equal(dragPreviewLabel([{ id: 9 }], () => ''), '9');
});

test('drag: the registry carries the drag (type + hovered zone), measures the accepting zones and finds a zone by key', async () => {
  const registry = new DropZoneRegistry();
  let notified = 0;
  registry.subscribe(() => notified++);
  const meta: DropZoneMeta = { accept: 'charge', actionId: 'moveCharges' };
  const z1: MountedDropZone = {
    key: 'z1', meta, dispatch: () => {},
    measure: async () => ({ key: 'z1', x: 0, y: 100, width: 300, height: 80 }),
  };
  const broken: MountedDropZone = { key: 'z2', meta, dispatch: () => {}, measure: async () => { throw new Error('gone'); } };
  const other: MountedDropZone = { key: 'z3', meta: { ...meta, accept: 'room' }, dispatch: () => {}, measure: async () => ({ key: 'z3', x: 0, y: 0, width: 1, height: 1 }) };
  registry.register(z1);
  registry.register(broken);
  registry.register(other);
  assert.deepEqual(await registry.measureAccepting('charge'), [{ key: 'z1', x: 0, y: 100, width: 300, height: 80 }]);
  const before = notified;
  registry.setDrag({ type: 'charge' });
  registry.setDrag({ type: 'charge' });
  registry.setDrag({ type: 'charge', hovered: 'z1' });
  assert.equal(notified - before, 2);
  assert.deepEqual(registry.dragState(), { type: 'charge', hovered: 'z1' });
  assert.equal(registry.zone('z1'), z1);
  assert.equal(registry.zone(undefined), undefined);
  registry.setDrag(undefined);
  assert.equal(registry.dragState(), undefined);
});

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
