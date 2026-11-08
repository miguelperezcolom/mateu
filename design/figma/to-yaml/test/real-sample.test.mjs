// A file really composed in Figma, through the Plugin API, with instances of the published Mateu UI
// Kit: unlike fixtures/native.figma.json (synthetic), design/figma/e2e/real-sample-screens.figma.json
// is what `GET /v1/files/:key` answers for native slots and component properties (trimmed by
// design/figma/e2e/trim.mjs). Its golden output was served by a real app and exercised in a browser.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml, actionIdsOf, undeclaredActionWarnings } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/load.mjs'

const e2e = join(dirname(fileURLToPath(import.meta.url)), '../../e2e')
const fixture = JSON.parse(readFileSync(join(e2e, 'real-sample-screens.figma.json'), 'utf8'))
const convert = () => new FigmaToYaml({ contract: loadContract(), schema: loadSchema() }).convert(fixture)

test('the real file converts to its golden, with no warnings', () => {
  const { files, warnings } = convert()
  assert.deepEqual(warnings, [])
  assert.deepEqual(files.map((f) => f.path), ['contact.yaml', 'artwork.yaml', 'artworks.yaml', 'dashboard.yaml', 'onboarding.yaml', 'welcome.yaml'])
  for (const f of files) assert.equal(f.text, readFileSync(join(e2e, 'golden', f.path), 'utf8'), f.path)
})

test('a value drawn on a property row is illustration: the state supplies the real one', () => {
  const artwork = convert().files.find((f) => f.path === 'artwork.yaml').value
  assert.equal(artwork.template.body[0].id, 'technique')
  assert.ok(!('initialValue' in artwork.template.body[0]))
})

test('an action the design names and nobody declares is reported', () => {
  const { files } = convert()
  assert.deepEqual([...actionIdsOf(files.find((f) => f.path === 'contact.yaml').value)], ['save', 'cancel'])
  const all = undeclaredActionWarnings(files, new Set(['save', 'cancel', 'edit', 'refresh']))
  assert.equal(all.length, 1)
  assert.match(all[0], /onboarding\.yaml: action "finish" is not declared/)
})
