import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PRIMER_TEXTS } from './primerTexts.ts'

// every language has every key, none empty, and the same {placeholders} as English
const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()

test('every Primer chrome text exists in the six languages, with the same placeholders', () => {
  const en = PRIMER_TEXTS.en
  for (const [lang, catalogue] of Object.entries(PRIMER_TEXTS)) {
    assert.deepEqual(Object.keys(catalogue).sort(), Object.keys(en).sort(), `${lang}: the same keys as en`)
    for (const [key, text] of Object.entries(catalogue)) {
      assert.ok(text.trim().length > 0, `${lang}.${key} is empty`)
      assert.deepEqual(placeholders(text), placeholders(en[key as keyof typeof en]), `${lang}.${key} placeholders`)
    }
  }
})
