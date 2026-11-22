import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LAZY_FAMILIES } from './families.ts'

// the keys of `export const <family>: Catalogue = { … }` in the family module (identifiers or `Key: Value`)
const keysOf = (file: string, name: string): string[] => {
  const src = readFileSync(new URL(file, import.meta.url), 'utf8')
  const start = src.indexOf(`export const ${name}: Catalogue = {`)
  assert.ok(start >= 0, `${file} exports ${name}`)
  const body = src.slice(src.indexOf('{', start) + 1, src.indexOf('\n}', start))
  return body.split(',').map((k) => k.trim().split(/\s*:/)[0]).filter((k) => k && !k.startsWith('//'))
}

for (const family of Object.keys(LAZY_FAMILIES) as (keyof typeof LAZY_FAMILIES)[]) {
  test(`the ${family} family draws exactly the types families.ts names`, () => {
    assert.deepEqual([...LAZY_FAMILIES[family]].sort(), keysOf(`./${family}.tsx`, family).sort())
  })
}
