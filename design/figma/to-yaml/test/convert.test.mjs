// The converter against a hand-made Figma REST payload (test/fixtures/starwars.figma.json: the
// Star Wars screens composed with the library) — pinned file by file against test/golden, which
// the Java side (FigmaYamlGoldenTest, backend/shared/core) runs through the real validator and
// YAML loader. Regenerate the golden after a deliberate change with `npm run golden`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml, slugify } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/schema.mjs'
import { isPlain, toYaml } from '../src/yaml.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = JSON.parse(readFileSync(join(here, 'fixtures/starwars.figma.json'), 'utf8'))
const golden = join(here, 'golden')
const converter = () => new FigmaToYaml({ contract: loadContract(), schema: loadSchema() })

function goldenFiles(dir = golden) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? goldenFiles(join(dir, d.name)) : [relative(golden, join(dir, d.name))],
  )
}

test('the fixture converts to the golden specs/ui, file by file', () => {
  const { files, warnings } = converter().convert(fixture)
  assert.deepEqual(warnings, [])
  assert.deepEqual(files.map((f) => f.path).sort(), goldenFiles().sort())
  for (const f of files) assert.equal(f.text, readFileSync(join(golden, f.path), 'utf8'), f.path)
})

test('the library pages, `_` frames, hidden and `#` layers are never content', () => {
  const { files } = converter().convert(fixture)
  const all = files.map((f) => f.text).join('\n')
  assert.ok(!files.some((f) => f.path.startsWith('scratch') || f.path.includes('mateu')))
  assert.ok(!all.includes('not content'))
  assert.ok(!all.includes('designer notes'))
  assert.ok(!all.includes('#placeholder'))
})

test('a template instance and a screen frame holding one fill the template the same way', () => {
  const { files } = converter().convert(fixture)
  const byPath = Object.fromEntries(files.map((f) => [f.path, f.value]))
  // welcome: the instance IS the screen, slots filled in place
  assert.equal(byPath['welcome.yaml'].template.type, 'WelcomePage')
  assert.equal(byPath['welcome.yaml'].template.backgroundColor, 'dark-slate')
  assert.equal(byPath['welcome.yaml'].toolbar[0].buttonStyle, 'primary')
  // person: a frame with the instance and SIBLING slot frames; non-slot siblings are the content
  const person = byPath['person.yaml']
  assert.equal(person.template.type, 'ItemOverviewPage')
  assert.equal(person.template.avatar.src, '${state.image}')
  assert.equal(person.template.body.length, 3)
  assert.equal(person.content[0].type, 'TabLayout')
  // a Section's propertyList marks its fields as property rows
  const physique = person.content[0].tabs[0].content.content[0]
  assert.ok(physique.content.content.every((f) => f.propertyRow && f.readOnly))
})

test('a param the instance does not have, or a value with no YAML counterpart, is a warning, not output', () => {
  const file = structuredClone(fixture)
  const welcome = file.document.children[0].children[0]
  const config = (function find(n) {
    if (n.name === '#config') return n
    for (const c of n.children ?? []) {
      const f = find(c)
      if (f) return f
    }
    return null
  })(welcome.children[0].children.find((c) => c.name === 'slot:toolbar').children[0])
  config.characters = 'actionId=; route=people; colour=red'
  const { files, warnings } = converter().convert(file)
  assert.ok(warnings.some((w) => w.includes('"colour" is not a param')), warnings.join('\n'))
  assert.ok(!files[0].text.includes('colour'))
})

test('a Java-only archetype on a screen is reported and the screen kept as a free page', () => {
  const file = {
    document: {
      children: [
        {
          type: 'CANVAS',
          name: 'Screens',
          children: [
            {
              id: '1:1',
              name: 'Old dashboard',
              type: 'INSTANCE',
              componentId: 'c1',
              componentProperties: { pageWidth: { type: 'VARIANT', value: 'fixed' } },
              children: [{ id: '1:2', name: 'Title', type: 'TEXT', characters: 'KPIs' }],
            },
          ],
        },
      ],
    },
    components: { c1: { name: 'pageWidth=fixed', componentSetId: 's1' } },
    componentSets: { s1: { name: 'Mateu/Page Templates/Dashboard' } },
  }
  const { files, warnings } = converter().convert(file)
  assert.equal(files[0].path, 'old-dashboard.yaml')
  assert.equal(files[0].value.type, 'Form')
  assert.ok(warnings.some((w) => w.includes('DashboardLandingPage')), warnings.join('\n'))
})

test('a typed #config value is typed by the schema, and an untyped one is refused', () => {
  const file = structuredClone(fixture)
  const json = JSON.stringify(file).replace('maxColumns=2', 'maxColumns=two')
  const { warnings } = converter().convert(JSON.parse(json))
  assert.ok(warnings.some((w) => w.includes('maxColumns: "two" is not an integer')), warnings.join('\n'))
})

test('the YAML emitter quotes exactly what a plain scalar would misread', () => {
  for (const s of ['people', 'Back to People', 'Characters, planets', 'species/new', '20rem', 'Height (cm)'])
    assert.ok(isPlain(s), s)
  for (const s of ['true', 'no', '82', '1.5', '', ' x', 'a: b', '${state.name}', '- x', '#x', 'a #b', '"q"', '*x'])
    assert.ok(!isPlain(s), s)
  assert.equal(toYaml({ a: [{ b: 1, c: ['x'] }], d: {} }), 'a:\n  - b: 1\n    c:\n      - x\nd: {}\n')
})

test('file names come from the frame names', () => {
  assert.equal(slugify('About this demo'), 'about-this-demo')
  assert.equal(slugify('Fleet'), 'fleet')
  assert.equal(slugify('Señal  ·  Nº 1'), 'senal-no-1')
})
