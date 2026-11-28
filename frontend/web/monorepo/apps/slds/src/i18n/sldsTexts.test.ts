import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SLDS_TEXTS } from './sldsTexts.ts'

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

test('every Salesforce renderer word is in the six languages, with the same placeholders', () => {
  const keys = Object.keys(SLDS_TEXTS.en)
  for (const [lang, table] of Object.entries(SLDS_TEXTS)) {
    assert.deepEqual(Object.keys(table).sort(), [...keys].sort(), `${lang}: the same keys as English`)
    for (const k of keys) {
      const text = (table as Record<string, string>)[k]
      assert.ok(text && text.trim(), `${lang}.${k} is written`)
      assert.deepEqual(placeholders(text), placeholders((SLDS_TEXTS.en as Record<string, string>)[k]), `${lang}.${k} keeps its placeholders`)
    }
  }
})
