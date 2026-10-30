#!/usr/bin/env node
// figma-to-yaml <file.json> --out <specs/ui dir> [--clean] [--contract <path>] [--schema <path>]
//
// <file.json> is the Figma REST payload of a file designed with the Mateu library:
//   curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/files/<key> > design.json
// Writes one YAML page per screen frame (plus partials/<ref>.yaml) and prints the warnings.
// --clean deletes the *.yaml files the output dir already has before writing (never anything else).
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { FigmaToYaml } from '../src/convert.mjs'
import { loadContract, loadSchema } from '../src/schema.mjs'

function usage(message) {
  if (message) console.error(message)
  console.error('usage: figma-to-yaml <file.json> --out <dir> [--clean] [--contract <path>] [--schema <path>]')
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
  else if (a === '-h' || a === '--help') usage()
  else if (a.startsWith('--')) usage(`unknown option ${a}`)
  else positional.push(a)
}
if (positional.length !== 1 || !opts.out) usage()

const file = JSON.parse(readFileSync(positional[0], 'utf8'))
const converter = new FigmaToYaml({ contract: loadContract(opts.contract), schema: loadSchema(opts.schema) })
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

if (opts.clean) for (const p of yamlFiles(opts.out)) rmSync(p)
for (const f of files) {
  const target = join(opts.out, f.path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, f.text)
  console.log(`wrote ${target}  ← "${f.frame}"`)
}
for (const w of warnings) console.warn(`warning: ${w}`)
