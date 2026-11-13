// The import driver around the converter: frame selection, what it writes and reports, the
// Figma API errors. The conversion itself is pinned by ../to-yaml's golden files.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ImportError, fetchFigmaFile, frameNames, importFile, selectFrames } from '../figma-import.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const fixturePath = join(here, '../../to-yaml/test/fixtures/starwars.figma.json')
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))
const golden = join(here, '../../to-yaml/test/golden')
const script = join(here, '../figma-import.mjs')
const out = () => mkdtempSync(join(tmpdir(), 'figma-import-'))

test('frames are the top-level screens of the design canvases', () => {
  const names = frameNames(fixture)
  assert.ok(names.includes('species'))
  assert.ok(!names.some((n) => n.startsWith('_')))
})

test('selecting frames by name or slug keeps only those (and their partials)', () => {
  const dir = out()
  const report = importFile(fixture, { out: dir, frames: ['SPECIES'] })
  assert.deepEqual(report.files.map((f) => f.path), ['species.yaml', 'partials/species-list.yaml'])
  assert.equal(readFileSync(join(dir, 'species.yaml'), 'utf8'), readFileSync(join(golden, 'species.yaml'), 'utf8'))
  const bySlug = importFile(fixture, { out: out(), frames: ['about-this-demo'] })
  assert.deepEqual(bySlug.files.map((f) => f.path), ['about-this-demo.yaml'])
})

test('an unknown frame lists the frames there are', () => {
  assert.throws(() => selectFrames(fixture, ['nope']), (e) => e instanceof ImportError && /No frame called "nope"/.test(e.message) && /species/.test(e.message))
})

test('statuses: created, unchanged, updated, skipped (hand-written) unless forced; a dry run writes nothing', () => {
  const dir = out()
  const dry = importFile(fixture, { out: dir, frames: ['species'], dryRun: true })
  assert.deepEqual(dry.files.map((f) => f.status), ['created', 'created'])
  assert.ok(!existsSync(join(dir, 'species.yaml')))

  assert.deepEqual(importFile(fixture, { out: dir, frames: ['species'] }).files.map((f) => f.status), ['created', 'created'])
  assert.deepEqual(importFile(fixture, { out: dir, frames: ['species'] }).files.map((f) => f.status), ['unchanged', 'unchanged'])

  writeFileSync(join(dir, 'species.yaml'), readFileSync(join(dir, 'species.yaml'), 'utf8') + '# touched\n')
  assert.equal(importFile(fixture, { out: dir, frames: ['species'] }).files[0].status, 'updated')

  writeFileSync(join(dir, 'species.yaml'), 'type: Form\ntitle: mine\n')
  const skipped = importFile(fixture, { out: dir, frames: ['species'] })
  assert.equal(skipped.files[0].status, 'skipped')
  assert.match(skipped.warnings.at(-1), /not generated from Figma/)
  assert.equal(readFileSync(join(dir, 'species.yaml'), 'utf8'), 'type: Form\ntitle: mine\n')
  assert.equal(importFile(fixture, { out: dir, frames: ['species'], force: true }).files[0].status, 'updated')
})

test('the report carries each file’s type and whether it is a partial', () => {
  const report = importFile(fixture, { out: out(), dryRun: true })
  const species = report.files.find((f) => f.path === 'species.yaml')
  assert.deepEqual([species.type, species.partial], ['Form', false])
  assert.equal(report.files.find((f) => f.path.startsWith('partials/')).partial, true)
})

const respond = (status, body = {}) => async () => ({ status, ok: status < 300, json: async () => body })

test('the Figma API: token header, and errors that say what to do', async () => {
  let seen
  const ok = await fetchFigmaFile('KEY123', 'figd_t', {
    api: 'http://x/',
    fetchImpl: async (url, init) => {
      seen = [url, init.headers['X-Figma-Token']]
      return { status: 200, ok: true, json: async () => ({ document: {} }) }
    },
  })
  assert.deepEqual(seen, ['http://x/v1/files/KEY123', 'figd_t'])
  assert.deepEqual(ok, { document: {} })
  await assert.rejects(fetchFigmaFile('K', '', {}), /No Figma token.*File content: Read only/)
  await assert.rejects(fetchFigmaFile('K', 'figd_secret', { fetchImpl: respond(403) }), (e) => /HTTP 403/.test(e.message) && !e.message.includes('figd_secret'))
  await assert.rejects(fetchFigmaFile('K', 't', { fetchImpl: respond(404) }), /not found/)
  await assert.rejects(fetchFigmaFile('K', 't', { fetchImpl: respond(429) }), /rate-limited/)
  await assert.rejects(fetchFigmaFile('K', 't', { fetchImpl: respond(500) }), /HTTP 500/)
  await assert.rejects(fetchFigmaFile('K', 't', { fetchImpl: async () => { throw new TypeError('fetch failed') } }), /Could not reach/)
})

test('as a script: --json → a JSON report on stdout; a usage error exits 1 with a message', () => {
  const dir = out()
  const report = JSON.parse(execFileSync(process.execPath, [script, '--json', fixturePath, '--out', dir, '--frames', 'species', '--report', 'json'], { encoding: 'utf8' }))
  assert.equal(report.files[0].path, 'species.yaml')
  const bad = spawnSync(process.execPath, [script, '--out', dir], { encoding: 'utf8' })
  assert.equal(bad.status, 1)
  assert.match(bad.stderr, /--key <fileKey>/)
  const text = execFileSync(process.execPath, [script, '--json', fixturePath, '--out', dir, '--frames', 'species', '--dry-run'], { encoding: 'utf8' })
  assert.match(text, /^unchanged +species\.yaml/m)
})

test('a Figma Section lists and selects its frames, never itself; an authored name is renamed', () => {
  const text = (characters) => ({ id: `t-${characters}`, name: 'Text', type: 'TEXT', characters })
  const file = {
    document: {
      children: [
        {
          type: 'CANVAS',
          name: 'Screens',
          children: [
            {
              id: '1:1',
              name: 'Flows',
              type: 'SECTION',
              children: [
                { id: '1:2', name: 'Login', type: 'FRAME', children: [text('a')] },
                { id: '1:3', name: 'Signup', type: 'FRAME', children: [text('b')] },
              ],
            },
            { id: '1:4', name: 'Routes', type: 'FRAME', children: [text('c')] },
          ],
        },
      ],
    },
  }
  assert.deepEqual(frameNames(file), ['Login', 'Signup', 'Routes'])
  const dir = out()
  writeFileSync(join(dir, 'routes.yaml'), 'type: Routes\nroutes: []\n')
  const report = importFile(file, { out: dir, frames: ['signup', 'Routes'] })
  assert.deepEqual(report.files.map((f) => [f.path, f.status]), [['signup.yaml', 'created'], ['routes-page.yaml', 'created']])
  assert.equal(readFileSync(join(dir, 'routes.yaml'), 'utf8'), 'type: Routes\nroutes: []\n')
  assert.throws(() => selectFrames(file, ['Flows']), /No frame called "Flows"/)
})
