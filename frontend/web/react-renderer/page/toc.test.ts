import { test } from 'node:test'
import assert from 'node:assert/strict'
import { sectionsOf, showsToc, tocShortcutIndex } from './toc.ts'

const card = (title: string, sticky = false) => ({
  type: 'ClientSide', cssClasses: `mateu-section${sticky ? ' mateu-section--sticky' : ''}`, metadata: { type: 'Card', title },
})
const row = (...children: unknown[]) => ({ type: 'ClientSide', metadata: { type: 'HorizontalLayout' }, children })
const column = (...children: unknown[]) => ({ type: 'ClientSide', metadata: { type: 'VerticalLayout' }, children })

test('stacked sections are counted, side-by-side ones are listed but not counted', () => {
  const s = sectionsOf([column(card('A', true), card('B')), row(card('C'), card('D'))])
  assert.deepEqual(s.entries.map((e) => e.title), ['A', 'B', 'C', 'D'])
  assert.equal(s.stacked, 2)
  assert.equal(s.entries[0].sticky, true)
})

test('an island is another view: its sections are not the page index', () => {
  const s = sectionsOf([card('A'), { type: 'ServerSide', children: [card('X')] }])
  assert.deepEqual(s.entries.map((e) => e.title), ['A'])
})

test('auto shows the index from five stacked sections; true / false decide', () => {
  const five = sectionsOf([1, 2, 3, 4, 5].map((i) => card(`S${i}`)))
  const four = sectionsOf([1, 2, 3, 4].map((i) => card(`S${i}`)))
  assert.equal(showsToc(undefined, five), true)
  assert.equal(showsToc(undefined, four), false)
  assert.equal(showsToc(true, four), true)
  assert.equal(showsToc(false, five), false)
  assert.equal(showsToc(undefined, sectionsOf([row(...[1, 2, 3, 4, 5].map((i) => card(`S${i}`)))])), false)
})

test('Ctrl+Alt+digit by code, keypad included', () => {
  const k = (code: string, extra = {}) => ({ ctrlKey: true, altKey: true, metaKey: false, shiftKey: false, code, ...extra })
  assert.equal(tocShortcutIndex(k('Digit1')), 0)
  assert.equal(tocShortcutIndex(k('Numpad9')), 8)
  assert.equal(tocShortcutIndex(k('Digit0')), -1)
  assert.equal(tocShortcutIndex(k('Digit2', { shiftKey: true })), -1)
})
