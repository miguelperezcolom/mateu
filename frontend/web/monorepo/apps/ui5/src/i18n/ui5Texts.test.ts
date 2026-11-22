import { test } from 'node:test'
import assert from 'node:assert/strict'
import { UI5_TEXTS } from './ui5Texts.ts'

test('every SAP renderer word is in the six languages, with the same placeholders', () => {
  const keys = Object.keys(UI5_TEXTS.en).sort()
  const holes = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
  for (const [lang, table] of Object.entries(UI5_TEXTS)) {
    assert.deepEqual(Object.keys(table).sort(), keys, lang)
    for (const k of keys) assert.equal(holes((table as Record<string, string>)[k]!), holes((UI5_TEXTS.en as Record<string, string>)[k]!), `${lang}.${k}`)
  }
})
