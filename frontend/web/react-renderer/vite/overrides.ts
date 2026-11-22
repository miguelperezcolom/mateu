import { existsSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Per-renderer OVERRIDES of the shared views (frontend/web/react-renderer/views).
 *
 * The views are ONE copy, drawn with `@kit`. Where a design system needs a different STRUCTURE (a
 * Fiori floorplan, SLDS's global header…), the renderer app puts a file at
 * `<app>/src/overrides/<the same path below views/>` and every import of that view — from the
 * shared views or from the app — gets the override instead. The rest stays shared.
 *
 * Rules:
 * - an override exports the same names as the view it replaces (overrides.test.ts checks it);
 * - an override imports shared code through `@mr/views/…` (absolute: tsc resolves it, and so does
 *   this plugin — which then hands it the override of THAT file if there is one, never itself);
 *   a relative import from an override is resolved as if the file sat at its original place, so a
 *   copied view keeps working unchanged.
 */
export function viewOverrides(opts: { views: string; overrides: string }): Plugin {
  const views = resolve(opts.views)
  const overrides = resolve(opts.overrides)
  const inside = (file: string, dir: string) => file === dir || file.startsWith(dir + sep)
  const strip = (id: string) => id.split('?')[0]

  return {
    name: 'mateu-view-overrides',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer) return null
      const from = strip(importer)
      // a relative import from an override: resolved from the original's place
      let effectiveImporter = importer
      if (inside(from, overrides) && source.startsWith('.')) {
        effectiveImporter = join(views, relative(overrides, from))
      }
      const resolved = await this.resolve(source, effectiveImporter, { ...options, skipSelf: true })
      if (!resolved || resolved.external) return resolved
      const id = strip(resolved.id)
      if (!inside(id, views)) return effectiveImporter === importer ? null : resolved
      const candidate = join(overrides, relative(views, id))
      // an override never replaces itself (it may build on its original through @mr/views/…)
      if (candidate === from || !existsSync(candidate)) return resolved
      return candidate + resolved.id.slice(id.length)
    },
  }
}

/** The overrides folder of an app (its `src/overrides`), for the app's vite config. */
export const overridesOf = (appDir: string) => join(appDir, 'src', 'overrides')

