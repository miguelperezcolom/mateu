// The hash of the renderer's SOURCES: what the packaged jar (io.mateu:mateu-redwood) is built from.
//
// scripts/copy.mjs stamps it into the jar (static/mateu-build-info.json) and uses it to cache-bust
// the app's modules; scripts/check-bundle-freshness.sh (repo root) recomputes it and fails when the
// committed jar was built from different sources. Content-based, so it is deterministic: the same
// sources give the same hash on any machine, whatever the build time or the toolchain.
//
// Sources = webApps/ (the VB app: pages, chains, the generated bridge, css) + poc/ minus what never
// reaches the bundle (tests, wire fixtures, screenshots, the capture/probe tooling).
// Usage: node scripts/source-hash.mjs   → prints the hash

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const rendererRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Paths (relative to the renderer root, '/'-separated) left out of the hash. */
export const EXCLUDED = [
  /^poc\/fixtures\//,
  /^poc\/shots\//,
  /^poc\/test[^/]*\.mjs$/,
  /^poc\/capture[^/]*\.mjs$/,
  /^poc\/probe[^/]*\.mjs$/,
  // the generators and the parity check: what they produce (the bridge, the page) is in webApps/
  /^poc\/(make-amd|make-html|coverage|parity-check)\.mjs$/,
  /(^|\/)\.DS_Store$/,
]

export function isSource(rel) {
  return !EXCLUDED.some((re) => re.test(rel))
}

function walk(dir, out) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, out)
    else out.push(path)
  }
  return out
}

/** The source files, sorted, as '/'-separated paths relative to the renderer root. */
export function sourceFiles(root = rendererRoot) {
  return ['poc', 'webApps']
    .flatMap((d) => walk(join(root, d), []))
    .map((p) => relative(root, p).split(sep).join('/'))
    .filter(isSource)
    // code-unit order, not locale order: the hash must be identical on every machine
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
}

/** sha256 over every source file's path and bytes; hex, first 16 characters. */
export function sourceHash(root = rendererRoot) {
  const h = createHash('sha256')
  for (const rel of sourceFiles(root)) {
    h.update(rel + '\0')
    // line endings normalised: a checkout with CRLF must not look like a different source
    h.update(readFileSync(join(root, rel), 'utf8').replace(/\r\n/g, '\n'))
    h.update('\0')
  }
  return h.digest('hex').slice(0, 16)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(sourceHash())
}
