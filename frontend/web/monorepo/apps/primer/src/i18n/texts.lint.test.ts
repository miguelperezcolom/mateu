import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chromeTextsLint } from '../../../../../react-renderer/scripts/chromeLint.ts'

// the shared chrome-text lint (frontend/web/react-renderer/scripts/chromeLint.ts) over this app and the shared tree
test('no hard-coded chrome text in the Primer renderer nor in the shared React renderer tree', () => {
  assert.deepEqual(chromeTextsLint({ appSrc: new URL('..', import.meta.url).pathname }), [],
    'move these to react-renderer/i18n/rendererTexts.ts (or reuse a web chromeTexts key), or mark a non-chrome literal with // i18n-ok')
})
