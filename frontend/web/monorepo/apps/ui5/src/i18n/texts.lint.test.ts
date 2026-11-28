import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chromeTextsLint } from '../../../../../react-renderer/scripts/chromeLint.ts'
// UI5's enumerated property values (a ui5-button's design, a control's value state, a list's
// selection mode, an input's type…) are protocol words, not chrome: they are blanked before the
// patterns run, so a line is only flagged for the text the user reads
const UI5_ENUMS = /'(?:Positive|Negative|Critical|Information|Neutral|Emphasized|Transparent|Default|None|Good|Error|Set2|Submit|Square|Circle|Image|Decorative|Center|End|Start|Ascending|Descending|Up|Down|Standard|NoCurrentPage|Inactive|Active|Single|Multiple|SingleSelect|Top|Bottom|AlertDialog|Dialog|Email|Number|Password|Tel|URL|Search|Text|Footer|Inline|Popin|Normal|Wrap|Attention|Lite)'/g

// the shared chrome-text lint (frontend/web/react-renderer/scripts/chromeLint.ts) over this app and the shared tree
test('no hard-coded chrome text in the SAP renderer nor in the shared React renderer tree', () => {
  assert.deepEqual(chromeTextsLint({ appSrc: new URL('..', import.meta.url).pathname, protocolWords: UI5_ENUMS }), [],
    'move these to react-renderer/i18n/rendererTexts.ts (or reuse a web chromeTexts key), or mark a non-chrome literal with // i18n-ok')
})
