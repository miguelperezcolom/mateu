import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { kitContractOf } from './kitContract.ts'

test('views/kit-contract.json lists exactly what the shared views take from @kit and @kit/icons', () => {
  const written = JSON.parse(readFileSync(new URL('../views/kit-contract.json', import.meta.url), 'utf8'))
  assert.deepEqual(written, kitContractOf(new URL('../views', import.meta.url).pathname),
    'regenerate it: node frontend/web/react-renderer/scripts/write-kit-contract.ts')
})
