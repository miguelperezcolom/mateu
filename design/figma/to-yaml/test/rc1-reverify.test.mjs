// GA review 2 (Figma area) findings, open on 3.0-rc.1 and fixed for rc.2.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPlain } from '../src/yaml.mjs'
import { slugify, slugWasCapped, MAX_SEGMENT } from '../src/convert.mjs'

// Finding 1: a text that YAML (Jackson 1.2-ish / PyYAML 1.1) reads as a number, a time or a date
// must be written quoted, or `1.` shows `1.0`, `12:30` shows `750` on Python and `+.inf` breaks the page.
const LOOKS_TYPED = ['1.', '+.inf', '-.Inf', '.NaN', '0b101', '0x1F', '1_000', '12:30', '1:30:00', '2026-11-13', '2026-11-13T10:00:00Z', '.5', '-3']
test('GA r2 Figma #1: number-, time- and date-looking texts are quoted', () => {
  for (const s of LOOKS_TYPED) assert.equal(isPlain(s), false, JSON.stringify(s))
})

// Finding 4a: slugs keep the combining marks of non-Latin scripts (\p{M}).
test('GA r2 Figma #4: a Thai / Devanagari name keeps its combining marks', () => {
  assert.equal(slugify('สวัสดี'), 'สวัสดี')
  assert.equal(slugify('हिन्दी'), 'हिन्दी')
})

test('GA r2 Figma #1: ordinary words and labels stay plain', () => {
  for (const s of ['Save', 'Step 1', 'Room 12', 'Hello world', 'v2 notes', 'ok']) assert.equal(isPlain(s), true, s)
})

// Finding 4b: a long frame name is cut to a file name every file system takes, and the cut is said.
test('GA r2 Figma #4: a long frame name gives a short enough file name', () => {
  const slug = slugify('a'.repeat(300))
  assert.equal(slug.length, MAX_SEGMENT)
  assert.ok(Buffer.byteLength(slugify('漢'.repeat(200)) + '.yaml') < 255)
  assert.ok(slugWasCapped('x'.repeat(MAX_SEGMENT + 1)))
  assert.ok(!slugWasCapped('Orders / Detail'))
})
