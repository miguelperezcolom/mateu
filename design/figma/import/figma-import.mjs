#!/usr/bin/env node
// figma-import — the one step behind every "Import from Figma" front door (the Maven goal
// `mateu-bundle:figma`, IntelliJ's and VS Code's "Import from Figma…"). It fetches a Figma file
// through the REST API (or reads a payload already on disk), keeps the frames asked for, runs the
// converter (../to-yaml, `FigmaToYaml` — its public entry, never a second implementation) and
// writes the YAML pages into the output folder.
//
//   figma-import (--key <fileKey> | --json <file.json>) --out <specs/ui dir>
//                [--frames a,b] [--dry-run] [--force] [--report json|text]
//                [--contract <path>] [--schema <path>] [--api <base url>]
//
// --api (default: FIGMA_API_URL, else https://api.figma.com) points at another server — a proxy, or
// a test double.
//
// The token is read from the FIGMA_TOKEN environment variable ONLY (never an argument: arguments
// show up in process listings) and is never printed. The front doors resolve it (env, a secrets
// file, the IDE's password store) and pass it down.
//
// What it does NOT do: register routes. The front doors append the new pages to routes.yaml with
// the same minimal text edit their Add Route… already uses (conformance/client/figma-import.json
// pins the three implementations), because they own the editor buffers and the undo history.
//
// The report (--report json, on stdout) is the contract with the front doors:
//   { files: [{path, frame, type, partial, status}], warnings: [..], frames: [..available..] }
// status: created | updated | unchanged | skipped (an existing file the converter did not write —
// it has no "Generated from the Figma" header — is left alone unless --force).
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml, slugify } from '../to-yaml/src/convert.mjs'
import { loadContract, loadSchema } from '../to-yaml/src/schema.mjs'

const here = dirname(fileURLToPath(import.meta.url))
export const MIN_NODE_MAJOR = 20
export const TOKEN_HELP =
  'Create a personal access token in Figma (Settings › Security › Personal access tokens) with the scope ' +
  '"File content: Read only", then put it in the FIGMA_TOKEN environment variable or in ~/.mateu-secrets/figma-token.'

export class ImportError extends Error {}

/** The first existing path among [candidates] (resolved against this file), or the first one. */
function firstExisting(...candidates) {
  const paths = candidates.map((c) => resolve(here, c))
  return paths.find((p) => existsSync(p)) ?? paths[0]
}

/** Where the contract and the authoring schema are: bundled next to this file, else the repo. */
export function defaultPaths() {
  return {
    contract: firstExisting('../contract.json'),
    schema: firstExisting('../uidl-schema.json', '../../../backend/shared/uidl/uidl-schema.json'),
  }
}

/** GET /v1/files/:key with the token; the errors say what to do about them. */
export async function fetchFigmaFile(key, token, { api = 'https://api.figma.com', fetchImpl = fetch } = {}) {
  if (!token) throw new ImportError(`No Figma token. ${TOKEN_HELP}`)
  let res
  try {
    res = await fetchImpl(`${api.replace(/\/+$/, '')}/v1/files/${encodeURIComponent(key)}`, {
      headers: { 'X-Figma-Token': token },
      signal: AbortSignal.timeout(120_000),
    })
  } catch (e) {
    throw new ImportError(`Could not reach the Figma API (${e?.cause?.code ?? e?.name ?? e}).`)
  }
  if (res.status === 403 || res.status === 401)
    throw new ImportError(`Figma refused the token (HTTP ${res.status}): it is invalid, expired or lacks the file content scope. ${TOKEN_HELP}`)
  if (res.status === 404)
    throw new ImportError(`Figma file "${key}" not found — check the URL, and that the token's account can open the file.`)
  if (res.status === 429) throw new ImportError('Figma rate-limited the request (HTTP 429). Try again in a minute.')
  if (!res.ok) throw new ImportError(`The Figma API answered HTTP ${res.status}.`)
  return res.json()
}

/** The names of the screen frames of a file (top-level children of its non-library canvases). */
export function frameNames(file) {
  const out = []
  for (const canvas of file.document?.children ?? []) {
    if (canvas.type !== 'CANVAS' || /^Mateu ·/.test(canvas.name)) continue
    for (const node of canvas.children ?? []) if (node.visible !== false && !node.name.startsWith('_')) out.push(node.name)
  }
  return out
}

/**
 * The file with only the screen frames named in [frames] (by name or by slug, case-insensitive).
 * A name that matches nothing is an error that lists what there is.
 */
export function selectFrames(file, frames) {
  const wanted = (frames ?? []).map((f) => f.trim()).filter(Boolean)
  if (wanted.length === 0) return file
  const norm = (s) => String(s).trim().toLowerCase()
  const matches = (node) => wanted.some((w) => norm(w) === norm(node.name) || slugify(w) === slugify(node.name))
  const missing = wanted.filter((w) => !frameNames(file).some((n) => norm(w) === norm(n) || slugify(w) === slugify(n)))
  if (missing.length)
    throw new ImportError(`No frame called ${missing.map((m) => `"${m}"`).join(', ')}. Frames in the file: ${frameNames(file).join(', ') || '(none)'}`)
  const document = {
    ...file.document,
    children: (file.document?.children ?? []).map((canvas) =>
      canvas.type !== 'CANVAS' || /^Mateu ·/.test(canvas.name) ? canvas : { ...canvas, children: (canvas.children ?? []).filter(matches) },
    ),
  }
  return { ...file, document }
}

const GENERATED = /Generated from the Figma/

/**
 * Converts [file] and writes the pages into [out] (nothing written when [dryRun]). Returns the
 * report. The converter's warnings are passed through as they are — they are free text and evolve.
 */
export function importFile(file, { out, frames, dryRun = false, force = false, contract, schema } = {}) {
  if (!out) throw new ImportError('No output folder (--out).')
  const paths = defaultPaths()
  const converter = new FigmaToYaml({ contract: loadContract(contract ?? paths.contract), schema: loadSchema(schema ?? paths.schema) })
  const { files, warnings } = converter.convert(selectFrames(file, frames))
  const report = { files: [], warnings: [...warnings], frames: frameNames(file) }
  for (const f of files) {
    const target = join(out, f.path)
    let status
    if (!existsSync(target)) status = 'created'
    else {
      const before = readFileSync(target, 'utf8')
      if (before === f.text) status = 'unchanged'
      else if (!force && !GENERATED.test(before.split('\n').slice(0, 5).join('\n'))) {
        status = 'skipped'
        report.warnings.push(`${f.path}: exists and was not generated from Figma — left as it is (force to overwrite)`)
      } else status = 'updated'
    }
    if (!dryRun && (status === 'created' || status === 'updated')) {
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, f.text)
    }
    report.files.push({ path: f.path, frame: f.frame, type: f.value?.type ?? null, partial: !!f.partial, status })
  }
  return report
}

function text(report, dryRun) {
  const lines = []
  for (const f of report.files) lines.push(`${dryRun && f.status !== 'unchanged' ? 'would be ' : ''}${f.status.padEnd(9)} ${f.path}  ← "${f.frame}"`)
  for (const w of report.warnings) lines.push(`warning: ${w}`)
  return lines.join('\n')
}

async function main(argv) {
  const opts = { report: 'text' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => {
      if (i + 1 >= argv.length) throw new ImportError(`${a} needs a value`)
      return argv[++i]
    }
    if (a === '--key') opts.key = next()
    else if (a === '--json') opts.json = next()
    else if (a === '--out') opts.out = next()
    else if (a === '--frames') opts.frames = next().split(',')
    else if (a === '--dry-run') opts.dryRun = true
    else if (a === '--force') opts.force = true
    else if (a === '--report') opts.report = next()
    else if (a === '--contract') opts.contract = next()
    else if (a === '--schema') opts.schema = next()
    else if (a === '--api') opts.api = next()
    else throw new ImportError(`unknown option ${a}`)
  }
  if (!opts.key === !opts.json) throw new ImportError('Give the Figma file with --key <fileKey> or a downloaded payload with --json <file>.')
  const file = opts.json
    ? JSON.parse(readFileSync(opts.json, 'utf8'))
    : await fetchFigmaFile(opts.key, process.env.FIGMA_TOKEN, { api: opts.api ?? process.env.FIGMA_API_URL ?? undefined })
  const report = importFile(file, opts)
  process.stdout.write((opts.report === 'json' ? JSON.stringify(report) : text(report, opts.dryRun)) + '\n')
}

// run as a script (not imported by a test); realpath: a temp folder is often behind a link (/var → /private/var)
const isMain = () => {
  try {
    return !!process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))
  } catch {
    return false
  }
}
if (isMain()) {
  const major = Number(process.versions.node.split('.')[0])
  if (major < MIN_NODE_MAJOR) {
    process.stderr.write(`figma-import needs Node.js ${MIN_NODE_MAJOR} or newer (this is ${process.version}).\n`)
    process.exit(3)
  }
  main(process.argv.slice(2)).catch((e) => {
    process.stderr.write(`${e instanceof ImportError ? e.message : e?.stack ?? e}\n`)
    process.exit(e instanceof ImportError ? 1 : 4)
  })
}
