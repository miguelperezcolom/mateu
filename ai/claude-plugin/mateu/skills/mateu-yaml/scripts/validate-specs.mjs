#!/usr/bin/env node
// Validates every *.yaml / *.yml under the given files/directories against Mateu's unified
// specs/ui schema (specs-schema.json). Catches unknown component `type:`s, wrong enum values
// (e.g. `dataType: decimal`) and wrong shapes. It does NOT catch misspelled keys: the schema is open
// (no additionalProperties: false) and the loaders ignore unknown keys, so `titel:` passes silently.
//
// Node resolves `ajv`/`yaml` from the SCRIPT's directory, so run it from a scratch copy:
//   mkdir -p /tmp/mateu-validate && cp validate-specs.mjs /tmp/mateu-validate/ && cd /tmp/mateu-validate
//   npm i ajv@8 yaml
//   node validate-specs.mjs /path/to/project/src/main/resources/specs/ui
//
// Schema: $MATEU_SPECS_SCHEMA (a path or URL), else the published one on GitHub (master).
import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import Ajv from 'ajv'

const DEFAULT =
  'https://raw.githubusercontent.com/miguelperezcolom/mateu/master/backend/shared/uidl/specs-schema.json'
const where = process.env.MATEU_SPECS_SCHEMA ?? DEFAULT
const schema = /^https?:/.test(where)
  ? await (await fetch(where)).json()
  : JSON.parse(fs.readFileSync(where, 'utf8'))
const validate = new Ajv({ strict: false, allErrors: true }).compile(schema)

const files = []
const walk = (d) => {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (/\.ya?ml$/.test(f)) files.push(p)
  }
}
const args = process.argv.slice(2)
if (!args.length) {
  console.error('usage: node validate-specs.mjs <specs/ui dir or files…>')
  process.exit(2)
}
for (const a of args) (fs.statSync(a).isDirectory() ? walk(a) : files.push(a))

let bad = 0
for (const f of files) {
  let value
  try {
    value = YAML.parse(fs.readFileSync(f, 'utf8'))
  } catch (e) {
    bad++
    console.log('FAIL ', f, '\n      not valid YAML:', e.message.split('\n')[0])
    continue
  }
  if (validate(value)) {
    console.log('ok   ', f)
    continue
  }
  bad++
  // A oneOf failure lists every branch; the deepest paths are the useful ones.
  const errors = [...validate.errors].sort((a, b) => b.instancePath.length - a.instancePath.length)
  console.log('FAIL ', f)
  const lines = [...new Set(errors.map((e) =>
    `      ${e.instancePath || '/'} ${e.message}${e.params?.allowedValues ? ' ' + JSON.stringify(e.params.allowedValues) : ''}`))]
  for (const l of lines.slice(0, 4)) console.log(l)
}
console.log(`${files.length - bad}/${files.length} valid`)
process.exit(bad ? 1 : 0)
