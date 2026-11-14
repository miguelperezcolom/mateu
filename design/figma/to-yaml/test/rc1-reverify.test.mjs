// GA review 2 (Figma area) findings still open on 3.0-rc.1 — pinned as `todo`: they report, they
// do not fail the suite. Drop `todo` once fixed and the assertion holds.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isPlain } from '../src/yaml.mjs'
import { slugify } from '../src/convert.mjs'

// Finding 1: a text that YAML (Jackson 1.2-ish / PyYAML 1.1) reads as a number, a time or a date
// must be written quoted, or `1.` shows `1.0`, `12:30` shows `750` on Python and `+.inf` breaks the page.
const LOOKS_TYPED = ['1.', '+.inf', '0b101', '12:30', '1:30:00', '2026-11-13']
test('GA r2 Figma #1: number-, time- and date-looking texts are quoted', { todo: 'open on rc.1' }, () => {
  for (const s of LOOKS_TYPED) assert.equal(isPlain(s), false, JSON.stringify(s))
})

// Finding 4a: slugs keep the combining marks of non-Latin scripts (\p{M}).
test('GA r2 Figma #4: a Thai / Devanagari name keeps its combining marks', { todo: 'open on rc.1' }, () => {
  assert.equal(slugify('สวัสดี'), 'สวัสดี')
  assert.equal(slugify('हिन्दी'), 'हिन्दी')
})
