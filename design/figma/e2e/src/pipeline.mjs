// The Figma half of the end-to-end check: which fixtures there are and what the converter makes of
// each. The fixtures are the synthetic one built from the plugin's sample-screens plan
// (sample-screens.figma.json) and, when present, a real download of a file where Mateu Sample
// Screens ran (downloaded-sample-screens.figma.json, written by `npm run e2e:refresh`) — and every
// one must give the same six pages. real-sample-screens.figma.json is NOT one of them: it is a file
// the owner composed by hand, with its own texts, pinned by to-yaml/test/real-sample.test.mjs.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FigmaToYaml } from '../../to-yaml/src/convert.mjs'
import { loadContract, loadSchema } from '../../to-yaml/src/load.mjs'

export const E2E = join(dirname(fileURLToPath(import.meta.url)), '..')
export const SYNTHETIC = join(E2E, 'sample-screens.figma.json')
export const REAL = join(E2E, 'downloaded-sample-screens.figma.json')
/** The pages every fixture must produce, by file — the routes the e2e app serves them at. */
export const SCREENS = ['contact', 'artwork', 'artworks', 'dashboard', 'onboarding', 'welcome']

export function fixtures(dir = E2E) {
  const names = ['sample-screens.figma.json', 'downloaded-sample-screens.figma.json']
  return readdirSync(dir).filter((f) => names.includes(f)).sort().map((f) => join(dir, f))
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
