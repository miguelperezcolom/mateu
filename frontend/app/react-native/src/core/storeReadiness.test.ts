// What the Play Store pass added to the pure modules: catalogue lookups, tree rows, listing cards,
// tab strips, the state layer, compatibility with an unknown version.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RestSourceCatalogue, mapItemsToRows } from './restFetch.ts';
import { filterRestRows } from './restListing.ts';
import { cardLayoutOf, isImageColumn, listRowModel, pictureUrlOf } from '../renderer/crudListing.ts';
import { segmentsFit } from '../renderer/patternGaps.ts';
import { appCompatibility } from '../hub/compat.ts';
import { themed, theme, applyTheme } from '../theme.ts';
import { uiSessionId } from '../hub/uiSession.ts';

test('a source pages on the server when its entry names a total, never when answered from its sample', () => {
  const c = new RestSourceCatalogue();
  c.register([{ name: 'a', source: { url: 'https://x' }, totalPath: 'total', fields: { name: 'person.name' } }, { name: 'b', source: { url: 'https://y' } }]);
  assert.equal(c.serverTotalPath({ ref: 'a' }), 'total');
  assert.equal(c.serverTotalPath({ ref: 'b' }), undefined);
  assert.equal(c.serverTotalPath({ url: 'https://z', totalPath: 'meta.total' }), 'meta.total');
  assert.equal(c.serverTotalPath(undefined), undefined);
  assert.equal(c.pathOfField({ ref: 'a' }, 'name'), 'person.name');
  assert.equal(c.pathOfField({ ref: 'a' }, 'other'), 'other');
  assert.equal(c.pathOfField(undefined, 'x'), 'x');
});

test('a tree row keeps its children, read through the same field map', () => {
  const rows = mapItemsToRows([{ id: 1, n: 'Sun', children: [{ id: 2, n: 'Earth', children: [{ id: 3, n: 'Moon' }] }] }], undefined, ['id', 'name'], (id) => (id === 'name' ? 'n' : id));
  assert.deepEqual(rows, [{ id: 1, name: 'Sun', children: [{ id: 2, name: 'Earth', children: [{ id: 3, name: 'Moon' }] }] }]);
});

test('a tree search keeps the branches that lead to a match', () => {
  const rows = [{ name: 'Sun', children: [{ name: 'Earth', children: [{ name: 'Moon' }] }, { name: 'Mars' }] }];
  assert.deepEqual(filterRestRows(rows, ['name'], [], { searchText: 'moon' }), [{ name: 'Sun', children: [{ name: 'Earth', children: [{ name: 'Moon' }] }] }]);
  assert.deepEqual(filterRestRows(rows, ['name'], [], { searchText: 'pluto' }), []);
});

test('a card shows its picture on top and the identifier as its title; a row leads with the picture', () => {
  const cols = [{ fieldId: 'image', stereotype: 'image' }, { fieldId: 'group' }, { fieldId: 'name', identifier: true }];
  const layout = cardLayoutOf(cols);
  assert.equal(layout.picture?.fieldId, 'image');
  assert.deepEqual(layout.columns.map((c) => c.fieldId), ['name', 'group']);
  assert.equal(isImageColumn(cols[0]!), true);
  assert.equal(pictureUrlOf('https://a/b.jpg'), 'https://a/b.jpg');
  assert.equal(pictureUrlOf('javascript:alert(1)'), undefined);
  assert.equal(pictureUrlOf(7), undefined);
  const model = listRowModel({ image: 'https://a/b.jpg', name: 'Ana' }, [
    { fieldId: 'image', label: 'Photo', dataType: '', stereotype: 'image', valueLabels: null },
    { fieldId: 'name', label: 'Name', dataType: '', stereotype: '', valueLabels: null },
  ], (v) => String(v ?? ''));
  assert.equal(model.leading, 'https://a/b.jpg');
  assert.equal(model.headline, 'Ana');
  assert.equal(model.supporting, '');
});

test('tabs are segmented buttons only while every label fits', () => {
  assert.equal(segmentsFit(['Identity', 'Schedule'], 400), true);
  assert.equal(segmentsFit(['The work', 'The exhibition', 'Dates', 'Insurance and transport'], 400), false);
  assert.equal(segmentsFit(['a', 'b', 'c', 'd', 'e'], 2000), false);
  assert.equal(segmentsFit([], 400), false);
});

test('an app whose version is unknown is never told it is too old', () => {
  const ui = { wireVersion: '3.0', minAppVersion: '1.0.0' };
  assert.equal(appCompatibility(ui, { wire: '3.0', appVersion: '0.0.0' }).status, 'compatible');
  assert.equal(appCompatibility(ui, { wire: '3.0', appVersion: '0.9.0' }).status, 'required');
});

test('a themed table answers like a plain object and follows the scheme', () => {
  const t = themed(() => ({ ink: theme.ink }));
  assert.deepEqual(Object.keys(t), ['ink']);
  assert.equal('ink' in t, true);
  const light = t.ink;
  applyTheme('dark');
  assert.notEqual(t.ink, light);
  assert.equal(Object.getOwnPropertyDescriptor(t, 'ink')?.value, t.ink);
  applyTheme('light');
});

test('a session id is drawn once and kept; a store that fails still answers one', async () => {
  const data = new Map<string, string>();
  const store = { get: async (k: string) => data.get(k) ?? null, set: async (k: string, v: string) => void data.set(k, v), remove: async () => {} };
  const a = await uiSessionId(store, 'x');
  assert.equal(await uiSessionId(store, 'x'), a);
  const broken = { get: async () => { throw new Error('no'); }, set: async () => {}, remove: async () => {} };
  assert.equal(typeof (await uiSessionId(broken, 'y', () => 'z')), 'string');
});

test('a toolbar folded in twice shows each button once', async () => {
  const { uniqueButtons } = await import('../renderer/patternGaps.ts');
  const b = [{ actionId: 'walkIn', label: 'Walk-in' }, { actionId: 'seed', label: 'Seed' }, { actionId: 'walkIn', label: 'Walk-in' }];
  assert.deepEqual(uniqueButtons(b).map((x) => x.actionId), ['walkIn', 'seed']);
});

test('a card around nothing is not drawn; one with a title or content is', async () => {
  const { drawsNothing } = await import('../renderer/patternGaps.ts');
  const empty = { metadata: { type: 'CustomField', label: 'Recognition', content: null }, children: [] };
  const card = (extra = {}, children: unknown[] = [empty]) => ({ metadata: { type: 'Card', ...extra }, children: [{ metadata: { type: 'VerticalLayout' }, children }] });
  assert.equal(drawsNothing(card()), true);
  assert.equal(drawsNothing(card({ title: 'Historial' })), false);
  assert.equal(drawsNothing(card({}, [{ metadata: { type: 'Text', text: 'x' } }])), false);
});

test('a fact\'s action icon is Material, Redwood\'s token included, never the token as text', async () => {
  const { factAction } = await import('../renderer/factAction.ts');
  assert.equal(factAction({ actionId: 'a', icon: 'oj-ux-ico-tablet-portrait' })?.icon, 'tablet');
  assert.equal(factAction({ actionId: 'a', icon: 'vaadin:money' })?.icon, 'cash');
  assert.equal(factAction({ actionId: 'a', icon: 'something-unknown' })?.icon, 'pencil-outline');
  assert.equal(factAction({ actionId: 'a', icon: '💳' })?.glyph, '💳');
});

test('a card whose content slot holds nothing is not drawn either', async () => {
  const { drawsNothing } = await import('../renderer/patternGaps.ts');
  const empty = { metadata: { type: 'CustomField', content: null }, children: [] };
  assert.equal(drawsNothing({ metadata: { type: 'Card', content: { metadata: { type: 'VerticalLayout' }, children: [empty] } }, children: [] }), true);
  assert.equal(drawsNothing({ metadata: { type: 'Card', content: { metadata: { type: 'Text', text: 'x' } } }, children: [] }), false);
});
