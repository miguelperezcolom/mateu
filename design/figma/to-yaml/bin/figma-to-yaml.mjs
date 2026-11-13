#!/usr/bin/env node
// figma-to-yaml <file.json> --out <specs/ui dir> [--clean] [--force] [--contract <path>] [--schema <path>]
// figma-to-yaml <library.json> --self-test [--report <results.json>]   (npm run self-test -- <file>)
//
// <file.json> is the Figma REST payload of a file designed with the Mateu library:
//   curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/files/<key> > design.json
// Writes one YAML page per screen frame (plus partials/<ref>.yaml) and prints the warnings.
// --clean deletes, before writing, the *.yaml files of the output dir that THIS converter wrote
// (they start with its "Generated from the Figma frame" header) — never a hand-written file such as
// routes.yaml or sources.yaml living in the same specs/ui. Without --force, an existing file it did
// not write is never written over either (a warning names it) — the import driver's rule.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FigmaToYaml, undeclaredActionWarnings, wasGenerated } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/load.mjs'

function usage(message) {
  if (message) console.error(message)
  console.error('usage: figma-to-yaml <file.json> --out <dir> [--clean] [--force] [--contract <path>] [--schema <path>]')
  console.error('       figma-to-yaml <library.json> --self-test [--report <results.json>]')
  process.exit(2)
}

const args = process.argv.slice(2)
const opts = { clean: false }
const positional = []
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--out') opts.out = args[++i]
  else if (a === '--contract') opts.contract = args[++i]
  else if (a === '--schema') opts.schema = args[++i]
  else if (a === '--clean') opts.clean = true
  else if (a === '--force') opts.force = true
  else if (a === '--self-test') opts.selfTest = true
  else if (a === '--report') opts.report = args[++i]
  else if (a === '-h' || a === '--help') usage()
  else if (a.startsWith('--')) usage(`unknown option ${a}`)
  else positional.push(a)
}
if (positional.length !== 1 || (!opts.out && !opts.selfTest)) usage()

const file = JSON.parse(readFileSync(positional[0], 'utf8'))
const converter = new FigmaToYaml({ contract: loadContract(opts.contract), schema: loadSchema(opts.schema) })

// --self-test: the LIBRARY file's `Mateu · Self-test` page (drawn by the plugin's "Mateu Library
// Self-test" command), every instance converted on its own. Exits 1 unless each one converts to a
// component with no warning (entries with no YAML counterpart are listed, not failed).
// --report <file> writes the per-instance results as JSON.
if (opts.selfTest) {
  const { page, results } = converter.selfTest(file)
  if (!page) {
    console.error('no "Mateu · Self-test" page in this file: run the plugin\'s "Mateu Library Self-test" command in the library file, then download it again')
    process.exit(1)
  }
  for (const r of results.filter((x) => x.status === 'failed')) {
    console.log(`FAIL ${r.name}${r.cell ? `  [${r.cell}]` : ''} (${r.nodeId})`)
    for (const w of r.warnings) console.log(`     ${w}`)
  }
  const count = (s) => results.filter((x) => x.status === s).length
  const noYaml = [...new Set(results.filter((x) => x.status === 'noYaml').map((x) => x.name))]
  console.log(`self-test: ${results.length} instances — ${count('ok')} ok, ${count('failed')} failed, ${count('noYaml')} with no YAML counterpart (${noYaml.length} entries)`)
  if (opts.report) {
    writeFileSync(opts.report, JSON.stringify(results.map(({ name, cell, status, value, warnings }) => ({ name, cell, status, warnings, value })), null, 1) + '\n')
    console.log(`wrote ${opts.report}`)
  }
  process.exit(count('failed') > 0 || results.length === 0 ? 1 : 0)
}

const { files, warnings } = converter.convert(file)

function yamlFiles(dir) {
  let out = []
  try {
    for (const d of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, d.name)
      if (d.isDirectory()) out = out.concat(yamlFiles(p))
      else if (d.name.endsWith('.yaml')) out.push(p)
    }
  } catch {
    // no directory yet
  }
  return out
}

const generated = (p) => wasGenerated(readFileSync(p, 'utf8'))
if (opts.clean) for (const p of yamlFiles(opts.out)) if (generated(p)) rmSync(p)
const skipped = []
for (const f of files) {
  const target = join(opts.out, f.path)
  // the import driver's rule: a file this converter did not write is somebody's work
  if (!opts.force && existsSync(target) && !generated(target)) {
    skipped.push(`${f.path}: exists and was not generated from Figma — left as it is (--force to overwrite)`)
    continue
  }
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, f.text)
  console.log(`wrote ${target}  ← "${f.frame}"`)
}
// the ids this specs/ui declares: every `id:` entry of a `type: Actions` file
const declaredActions = new Set()
for (const p of yamlFiles(opts.out)) {
  const text = readFileSync(p, 'utf8')
  if (!/^type:\s*Actions\b/m.test(text)) continue
  for (const m of text.matchAll(/^\s*-\s*(?:\{\s*)?id:\s*["']?([^\s,"'}]+)/gm)) declaredActions.add(m[1])
}
for (const w of [...warnings, ...skipped, ...undeclaredActionWarnings(files, declaredActions)]) console.warn(`warning: ${w}`)
