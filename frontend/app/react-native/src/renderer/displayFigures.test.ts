// DisplayRenderer's figures and derived texts (displayFigures.ts).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  checklistProgress, commentAvatar, fileIcon, funnelStages, heatCells, initiallyFlagged,
  initialPaymentMethod, initialQueueSelection, isImageAvatar, ledgerTotal, noticeShows, offerCtaLabel,
  ratingStars, resourceCardWidth, skeletonCount, sparkHeights, taskProgressModel, trendBarHeights,
} from './displayFigures.ts';

test('sparkline bars span 4..26 over the series range; a flat series sits at the floor', () => {
  assert.deepEqual(sparkHeights([]), []);
  assert.deepEqual(sparkHeights([10, 20, 15]), [4, 26, 15]);
  assert.deepEqual(sparkHeights([5, 5]), [4, 4]);
});

test('trend bars span 8..98 with zero always on the scale', () => {
  assert.deepEqual(trendBarHeights([0, 10]), [8, 98]);
  assert.deepEqual(trendBarHeights([5]), [98]);
  assert.deepEqual(trendBarHeights([-10, 0, 10]), [8, 53, 98]);
  // all zeros: the max is clamped to 1, bars at the floor
  assert.deepEqual(trendBarHeights([0, 0]), [8, 8]);
});

test('heatmap: undated cells dropped, four intensity steps over the max, zero is a ghost', () => {
  const cells = heatCells([
    { date: 'a', value: 0 }, { value: 100 }, { date: 'b', value: 100 }, { date: 'c', value: 60 },
    { date: 'd', value: 30 }, { date: 'e', value: 10 }, { date: 'f' },
  ]);
  assert.deepEqual(cells.map((c) => c.cell.date), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(cells.map((c) => c.color), [
    'rgba(26,115,232,0.08)', 'rgba(26,115,232,1)', 'rgba(26,115,232,0.75)',
    'rgba(26,115,232,0.5)', 'rgba(26,115,232,0.3)', 'rgba(26,115,232,0.08)',
  ]);
});

test('funnel: conversion from the previous stage, bar width proportional with an 8% floor', () => {
  const stages = funnelStages([{ value: 200 }, { value: 50 }, { value: 0 }, { value: 4 }, {}]);
  assert.deepEqual(stages.map((s) => s.conversion), ['', '25% of previous', '0% of previous', '', '0% of previous']);
  assert.deepEqual(stages.map((s) => s.widthPct), [100, 25, 8, 8, 8]);
  assert.equal(stages[4].value, 0);
  assert.deepEqual(funnelStages([]), []);
});

test('rating stars clamp to 0..5', () => {
  assert.equal(ratingStars(3), '★★★☆☆');
  assert.equal(ratingStars(9), '★★★★★');
  assert.equal(ratingStars(-2), '☆☆☆☆☆');
});

test('initially open/done indexes, checklist and task progress', () => {
  assert.deepEqual(initiallyFlagged([{ open: true }, {}, { open: true }], (p) => p.open), { 0: true, 2: true });
  assert.deepEqual(checklistProgress({ 0: true, 1: false, 2: true }, 3), { doneCount: 2, pct: 67 });
  assert.deepEqual(checklistProgress({}, 0), { doneCount: 0, pct: 0 });
  const tp = taskProgressModel(3, 1);
  assert.equal(tp.complete, false);
  assert.deepEqual(tp.pills, [{ n: 1, label: '1/3', done: true }, { n: 2, label: '2/3', done: false }, { n: 3, label: '3/3', done: false }]);
  assert.equal(taskProgressModel(2, 2).complete, true);
  assert.equal(taskProgressModel(0, 0).complete, false);
  assert.deepEqual(taskProgressModel(0, 0).pills, []);
});

test('ledger total: the declared one wins, else the non-included lines', () => {
  const lines = [{ amount: 100 }, { amount: 30, included: true }, { amount: -10 }, {}];
  assert.equal(ledgerTotal(lines), 90);
  assert.equal(ledgerTotal(lines, 0), 0);
  assert.equal(ledgerTotal([], undefined), 0);
});

test('file icons by type, avatars, card widths, skeleton count and offer label', () => {
  assert.equal(fileIcon('PDF'), '📕');
  assert.equal(fileIcon('xlsx'), '📗');
  assert.equal(fileIcon('exe'), '📄');
  assert.equal(fileIcon(undefined), '📄');
  assert.equal(isImageAvatar('https://x/a.png'), true);
  assert.equal(isImageAvatar('data:image/png;base64,AA'), true);
  assert.equal(isImageAvatar('👩'), false);
  assert.equal(isImageAvatar(undefined), false);
  assert.equal(commentAvatar({ avatar: '🦊', author: 'Ana' }), '🦊');
  assert.equal(commentAvatar({ avatar: 'vaadin:user', author: 'Ana' }), 'A');
  assert.equal(commentAvatar({}), '?');
  assert.equal(resourceCardWidth(4), '25%');
  assert.equal(resourceCardWidth(0), '33.333%');
  assert.equal(skeletonCount(undefined), 3);
  assert.equal(skeletonCount(0), 3);
  assert.equal(skeletonCount(5), 5);
  assert.equal(offerCtaLabel({ actionLabel: 'Add' }), 'Add');
  assert.equal(offerCtaLabel({ added: true, actionLabel: 'Add', addedLabel: 'Added' }), 'Added');
  assert.equal(offerCtaLabel({ added: true, actionLabel: 'Add' }), 'Add');
});

test('initial selections and whether a notice shows', () => {
  assert.equal(initialQueueSelection([{ items: [{ id: 'a' }] }, {}, { items: [{ id: 'b', selected: true }, { id: 'c', selected: true }] }]), 'b');
  assert.equal(initialQueueSelection([]), undefined);
  assert.equal(initialPaymentMethod('card', [{ id: 'cash' }]), 'card');
  assert.equal(initialPaymentMethod(undefined, [{ id: 'cash' }]), 'cash');
  assert.equal(initialPaymentMethod('', []), undefined);
  assert.deepEqual(noticeShows('  ', 0), { hasText: false, shows: false });
  assert.deepEqual(noticeShows(undefined, 2), { hasText: false, shows: true });
  assert.deepEqual(noticeShows('Hi', 0), { hasText: true, shows: true });
});
