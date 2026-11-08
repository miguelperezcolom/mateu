// The Figma half of the end-to-end check: which fixtures there are and what the converter makes of
// each. Every `*.figma.json` in design/figma/e2e is a fixture — the synthetic one built from the
// plugin's sample-screens plan (sample-screens.figma.json) and any real download of a file where
// the six screens were composed in Figma (real-sample-screens.figma.json) — and every one must give
// the same six pages.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { loadContract, loadSchema } from '../../to-yaml/src/schema.mjs'

export const E2E = join(dirname(fileURLToPath(import.meta.url)), '..')
export const SYNTHETIC = join(E2E, 'sample-screens.figma.json')
export const REAL = join(E2E, 'real-sample-screens.figma.json')
/** The pages every fixture must produce, by file — the routes the e2e app serves them at. */
export const SCREENS = ['contact', 'artwork', 'artworks', 'dashboard', 'onboarding', 'welcome']

export function fixtures(dir = E2E) {
  return readdirSync(dir).filter((f) => f.endsWith('.figma.json')).sort().map((f) => join(dir, f))
}

export function converter() {
  return new FigmaToYaml({ contract: loadContract(), schema: loadSchema() })
}

/** Converts a fixture; with `out`, writes the pages there (emptied first). Returns `{files, warnings}`. */
export function convertFixture(path, out) {
  const result = converter().convert(JSON.parse(readFileSync(path, 'utf8')))
  if (out) {
    rmSync(out, { recursive: true, force: true })
    for (const f of result.files) {
      const target = join(out, f.path)
      mkdirSync(dirname(target), { recursive: true })
      writeFileSync(target, f.text)
    }
  }
  return result
}
