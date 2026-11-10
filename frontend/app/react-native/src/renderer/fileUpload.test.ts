import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acceptsMedia, fileValueSummary } from './fileUpload.ts';
import { minuteChoices, timeText } from './dateCalendar.ts';

test('which accept lists the photo library can satisfy', () => {
  assert.equal(acceptsMedia(''), true);
  assert.equal(acceptsMedia('image/*'), true);
  assert.equal(acceptsMedia('.png,.pdf'), true);
  assert.equal(acceptsMedia('.pdf,.txt'), false);
});

test('a file value is described by its type and size, never its base64', () => {
  assert.equal(fileValueSummary('data:application/pdf;base64,' + 'A'.repeat(4096)), 'PDF · 3 KB');
  assert.equal(fileValueSummary('data:text/plain;base64,aGk=', 'note.txt'), 'note.txt · PLAIN · 1 KB');
  assert.equal(fileValueSummary('https://x.io/files/a%20b.pdf'), 'a b.pdf');
  assert.equal(fileValueSummary(''), '');
});

test('a LocalTime shows as HH:MM; the minute picker keeps an odd minute', () => {
  assert.equal(timeText('09:30:00'), '09:30');
  assert.equal(timeText('7:05'), '07:05');
  assert.equal(timeText('nope'), '');
  assert.ok(minuteChoices('09:33').includes('33'));
  assert.equal(minuteChoices('').length, 12);
});
