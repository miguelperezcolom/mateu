// What a designer can do on an ordinary canvas that used to break the output: names that land on
// authored specs/ui files, soft line breaks in a text, partials named in words, screens in a
// Section, switches whose YAML default is on, odd frame names (GA review, area 7).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml, screensOf, slugify, wasGenerated } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/load.mjs'
import { isPlain, toYaml } from '../src/yaml.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const cli = join(here, '../bin/figma-to-yaml.mjs')
const converter = () => new FigmaToYaml({ contract: loadContract(), schema: loadSchema() })

let ids = 0
const id = () => `9:${++ids}`
const text = (characters, name = 'Text') => ({ id: id(), name, type: 'TEXT', characters })
const frame = (name, children = [], extra = {}) => ({ id: id(), name, type: 'FRAME', children, ...extra })
const instance = (componentId, componentProperties = {}, children = []) => ({ id: id(), name: componentId, type: 'INSTANCE', componentId, componentProperties, children })
const fileOf = (children, components = {}) => ({ document: { children: [{ type: 'CANVAS', name: 'Screens', children }] }, components, componentSets: {} })
const COMPONENTS = {
  hl: { name: 'Mateu/Layout/HorizontalLayout' },
  fp: { name: 'Mateu/Layout/FoldoutPanel' },
  io: { name: 'Mateu/Page Templates/ItemOverviewPage' },
}

test('a screen named like an authored specs/ui file is renamed, with a warning', () => {
  const { files, warnings } = converter().convert(
    fileOf([frame('Routes', [text('Today’s delivery routes')]), frame('Project', [text('x')]), frame('translations/es', [text('y')]), frame('Orders', [text('z')])]),
  )
  assert.deepEqual(files.map((f) => f.path), ['routes-page.yaml', 'project-page.yaml', 'translations-page/es.yaml', 'orders.yaml'])
  assert.equal(warnings.filter((w) => /is a specs\/ui file that is not a page/.test(w)).length, 3, warnings.join('\n'))
})

test('the CLI never writes over a file it did not write, unless --force', () => {
  const dir = mkdtempSync(join(tmpdir(), 'figma-to-yaml-'))
  const design = join(dir, 'design.json')
  writeFileSync(design, JSON.stringify(fileOf([frame('Orders', [text('Hello')])])))
  const out = join(dir, 'specs')
  const mine = 'type: Form\ntitle: written by hand\n'
  spawnSync(process.execPath, [cli, design, '--out', out])
  writeFileSync(join(out, 'orders.yaml'), mine)
  const run = spawnSync(process.execPath, [cli, design, '--out', out, '--clean'], { encoding: 'utf8' })
  assert.equal(readFileSync(join(out, 'orders.yaml'), 'utf8'), mine)
  assert.match(run.stderr, /orders\.yaml: exists and was not generated from Figma/)
  spawnSync(process.execPath, [cli, design, '--out', out, '--force'])
  assert.ok(wasGenerated(readFileSync(join(out, 'orders.yaml'), 'utf8')))
})

test('a soft line break, CR, NEL or a control character in a text still makes valid, exact YAML', () => {
  for (const s of ['line one\u2028line two', 'a\u2029b', 'a\rb', 'a\u0085b', 'a\u0007b', 'a\u009bb', 'a\ufffeb'])
    assert.ok(!isPlain(s), JSON.stringify(s))
  const yaml = toYaml({ text: 'line one\u2028line two\u0085x\u2029y\r' })
  assert.equal(yaml, 'text: "line one\\u2028line two\\u0085x\\u2029y\\r"\n')
  assert.ok(!/[\u2028\u2029\u0085\r]/.test(yaml))
  // the escapes are JSON's too, so the value reads back exactly
  assert.equal(JSON.parse(yaml.substring('text: '.length)), 'line one\u2028line two\u0085x\u2029y\r')
})

test('a partial named in words is written AND referenced by its slug; two alike get two files', () => {
  const { files } = converter().convert(
    fileOf([frame('Home', [frame('partial:Species List', [text('one')]), frame('partial:日本', [text('two')]), frame('partial:日本!', [text('three')])])]),
  )
  const home = files.find((f) => f.path === 'home.yaml').value
  const refs = home.content.map((c) => c.ref)
  assert.deepEqual(refs, ['species-list', '日本', '日本-2'])
  assert.deepEqual(files.filter((f) => f.partial).map((f) => f.path), ['partials/species-list.yaml', 'partials/日本.yaml', 'partials/日本-2.yaml'])
  for (const r of refs) assert.ok(files.some((f) => f.path === `partials/${r}.yaml`), r)
})

test('the screens inside a Figma Section are screens, not one page', () => {
  const file = fileOf([{ id: id(), name: 'Flows', type: 'SECTION', children: [frame('Login', [text('a')]), { id: id(), name: 'Inner', type: 'SECTION', children: [frame('Signup', [text('b')])] }] }])
  assert.deepEqual(screensOf(file).map((n) => n.name), ['Login', 'Signup'])
  const { files } = converter().convert(file)
  assert.deepEqual(files.map((f) => f.path), ['login.yaml', 'signup.yaml'])
})

test('unspaced and folded write the false that the YAML default would otherwise turn on', () => {
  const row = instance('hl', { 'unspaced#1:1': { type: 'BOOLEAN', value: true }, 'spacing#1:2': { type: 'BOOLEAN', value: false } }, [
    { id: id(), name: 'slot:content', type: 'FRAME', children: [text('x')] },
  ])
  const untouched = instance('hl', { 'unspaced#1:1': { type: 'BOOLEAN', value: false } }, [{ id: id(), name: 'slot:content', type: 'FRAME', children: [text('y')] }])
  const panel = instance('fp', { 'folded#1:3': { type: 'BOOLEAN', value: true } }, [{ id: id(), name: 'slot:content', type: 'FRAME', children: [text('z')] }])
  const { files, warnings } = converter().convert(fileOf([frame('Page', [row, untouched, panel])], COMPONENTS))
  assert.deepEqual(warnings, [])
  const [a, b, c] = files[0].value.content
  assert.equal(a.spacing, false)
  assert.ok(!('spacing' in b))
  assert.equal(c.open, false)
  assert.match(files[0].text, /spacing: false/)
})

test('frame names: any script keeps its letters, slashes never escape the folder', () => {
  assert.equal(slugify('日本語'), '日本語')
  assert.equal(slugify('Заказы'), 'заказы')
  assert.equal(slugify('/'), 'page')
  assert.equal(slugify('/a//b/'), 'a/b')
  assert.equal(slugify('../../etc/passwd'), 'etc/passwd')
  assert.equal(slugify('Señal  ·  Nº 1'), 'senal-no-1')
  assert.equal(slugify('한국'), '한국')
})

test('a line break in a frame name stays inside the generated comment', () => {
  const { files } = converter().convert(fileOf([frame('Evil\ntype: UI\nhome: x', [text('a')])]))
  const lines = files[0].text.split('\n')
  assert.ok(lines[0].startsWith('# Generated from the Figma frame "Evil type: UI home: x"'), lines[0])
  assert.ok(!files[0].text.includes('\ntype: UI'))
})

test('a page template inside a wrapper frame is reported, not silently read as content', () => {
  const { warnings } = converter().convert(fileOf([frame('Person', [frame('Wrapper', [instance('io', {}, [text('t')])])])], COMPONENTS))
  assert.ok(warnings.some((w) => /inside a frame of the screen/.test(w)), warnings.join('\n'))
})

test('the generated header is what tells a generated file', () => {
  assert.ok(wasGenerated('# Generated from the Figma frame "x" (node 1:1) by design/figma/to-yaml.\n'))
  assert.ok(!wasGenerated('type: Routes\n'))
  assert.ok(!existsSync(join(here, 'nope')))
})
