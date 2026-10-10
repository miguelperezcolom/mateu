import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSwitcherOptions, foldoutSummaryOf, heroToneColors, HERO_TONES, overlayContentWithData, overlayIdOf,
  showsPreSearch, switcherCurrentLabel, switcherOf, switcherPick, upsertOverlay, type RecordSwitcher,
} from './patternGaps.ts';
import { cssLengthPx, gridTrackSizes, orderByAreas, responsiveColumns } from './wireWidgets.ts';

const switcher: RecordSwitcher = {
  options: [
    { value: 'h1', label: 'Hotel Málaga', description: 'Costa del Sol' },
    { value: 'h2', label: 'Hotel Palma', description: 'Mallorca' },
    { value: 'h3', label: 'Riu Plaza', description: 'Madrid centro' },
  ],
  value: 'h2',
  type: 'context',
  label: 'Hotel',
  searchable: true,
  disabled: false,
  actionId: '_switchRecord',
};

// ── A2 switcher ──────────────────────────────────────────────────────────────────────────

test('switcherOf: only a switcher with options is drawn', () => {
  assert.equal(switcherOf({}), null);
  assert.equal(switcherOf({ switcher: null }), null);
  assert.equal(switcherOf({ switcher: { options: [] } }), null);
  assert.equal(switcherOf({ switcher })?.value, 'h2');
});

test('the closed selector shows the current value label, falling back to the raw value', () => {
  assert.equal(switcherCurrentLabel(switcher), 'Hotel Palma');
  assert.equal(switcherCurrentLabel({ ...switcher, value: 'zz' }), 'zz');
});

test('filtering is case/accent-insensitive, over label and description, every word must match', () => {
  const labels = (q: string) => filterSwitcherOptions(switcher.options!, q).map((o) => o.label);
  assert.deepEqual(labels(''), ['Hotel Málaga', 'Hotel Palma', 'Riu Plaza']);
  assert.deepEqual(labels('malaga'), ['Hotel Málaga']);
  assert.deepEqual(labels('HOTEL mallorca'), ['Hotel Palma']);
  assert.deepEqual(labels('madrid'), ['Riu Plaza']);
  assert.deepEqual(labels('nowhere'), []);
});

test('picking another entry dispatches the action with {_record}; same value or disabled does nothing', () => {
  assert.deepEqual(switcherPick(switcher, 'h3'), { actionId: '_switchRecord', parameters: { _record: 'h3' } });
  assert.equal(switcherPick(switcher, 'h2'), null);
  assert.equal(switcherPick({ ...switcher, disabled: true }, 'h3'), null);
  assert.equal(switcherPick({ ...switcher, actionId: null }, 'h1')?.actionId, '_switchRecord');
});

// ── A3 hero tone ─────────────────────────────────────────────────────────────────────────

test('hero tones map to the shared dark palette with light ink; unknown/null → default look', () => {
  assert.deepEqual(heroToneColors('ocean'), { background: '#1f4e79', title: '#ffffff', subtitle: 'rgba(255,255,255,.85)' });
  assert.equal(heroToneColors('Sienna')?.background, '#7a4a2e');
  assert.equal(heroToneColors(null), null);
  assert.equal(heroToneColors('auto'), null);
  assert.equal(heroToneColors('chartreuse'), null);
  assert.deepEqual(Object.keys(HERO_TONES), ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna']);
});

// ── A4 foldout summary ───────────────────────────────────────────────────────────────────

test('the summary-N slot is found beside overview and panel-N', () => {
  const kids = [{ slot: 'overview' }, { slot: 'panel-0' }, { slot: 'summary-0', id: 's0' }, { slot: 'panel-1' }];
  assert.equal((foldoutSummaryOf(kids, 0) as { id: string }).id, 's0');
  assert.equal(foldoutSummaryOf(kids, 1), undefined);
});

// ── A5 pre-search ────────────────────────────────────────────────────────────────────────

test('pre-search shows until the first search answers, then never again', () => {
  const pre = [{ metadata: { type: 'Text' } }];
  assert.equal(showsPreSearch(pre, false), true);
  assert.equal(showsPreSearch(pre, true), false);
  assert.equal(showsPreSearch(null, false), false);
  assert.equal(showsPreSearch([], false), false);
});

// ── overlays: same Drawer.id refreshes in place ──────────────────────────────────────────

const drawer = (id: string | null, marker: string) => ({ id: 'fieldId', metadata: { type: 'Drawer', id, marker } });

test('an Add with the id of an open overlay replaces it in place (no duplicate)', () => {
  let stack = upsertOverlay([], { component: drawer('crud-edit-drawer', 'row 1'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer('crud-edit-drawer', 'row 2'), revision: 0 });
  assert.equal(stack.length, 1);
  assert.equal((stack[0]!.component as ReturnType<typeof drawer>).metadata.marker, 'row 2');
  assert.equal(stack[0]!.revision, 1);
});

test('different or missing overlay ids stack (the shared wrapper id is not an identity)', () => {
  let stack = upsertOverlay([], { component: drawer('a', '1'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer('b', '2'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer(null, '3'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer(null, '4'), revision: 0 });
  assert.equal(stack.length, 4);
  assert.equal(overlayIdOf(drawer(null, 'x')), '');
});

test('refreshing an overlay under another keeps the stack order', () => {
  let stack = upsertOverlay([], { component: drawer('a', '1'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer('b', '2'), revision: 0 });
  stack = upsertOverlay(stack, { component: drawer('a', '1b'), revision: 0 });
  assert.deepEqual(stack.map((o) => overlayIdOf(o.component)), ['a', 'b']);
});

test('the overlay initialData seeds its content, over the content own initialData', () => {
  const content = { type: 'ServerSide', initialData: { name: 'old', keep: 1 } };
  assert.deepEqual(
    (overlayContentWithData({ content, initialData: { name: 'typed' } }) as { initialData: unknown }).initialData,
    { name: 'typed', keep: 1 },
  );
  assert.equal(overlayContentWithData({ content }), content);
  assert.equal(overlayContentWithData({}), null);
});

// ── ResponsiveGrid (GeneralOverview info slot / DataManagement docked panel) ─────────────

test('rem stackBelow is honoured: 48rem stacks a phone and a small tablet, not a large one', () => {
  assert.equal(cssLengthPx('48rem'), 768);
  assert.equal(responsiveColumns('1fr 20rem', 390, '48rem'), 1);
  assert.equal(responsiveColumns('1fr 20rem', 700, '48rem'), 1);
  assert.equal(responsiveColumns('1fr 20rem', 1024, '48rem'), 2);
});

test('simple track lists become flex sizes; fancy ones fall back', () => {
  assert.deepEqual(gridTrackSizes('1fr 22rem'), [{ fr: 1 }, { px: 352 }]);
  assert.equal(gridTrackSizes('repeat(2, 1fr)'), null);
  assert.equal(gridTrackSizes(''), null);
});

test('a promoted info slot (listed first to stack on top) goes back to its area when wide', () => {
  const kids = [{ slot: 'info', n: 'I' }, { slot: 'main', n: 'M' }];
  assert.deepEqual(orderByAreas('"main info"', kids)?.map((k) => k.n), ['M', 'I']);
  assert.deepEqual(orderByAreas('main info', kids)?.map((k) => k.n), ['M', 'I']);
  assert.equal(orderByAreas('"main info" "foot foot"', [{ slot: 'main' }]), null);
  assert.equal(orderByAreas(null, kids), null);
});
