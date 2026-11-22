import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * The KIT CONTRACT: every name the shared views import from `@kit` (components, hooks, types) and
 * from `@kit/icons` — what a renderer's kit must export, under those names and with the props the
 * views pass (each app's typecheck of the shared views is the full check; this list is the map).
 * views/kit-contract.json is written from it: `node scripts/write-kit-contract.ts`.
 */
export interface KitContract { kit: string[]; icons: string[] }

const sources = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name)
  if (statSync(p).isDirectory()) return sources(p)
  return /\.tsx?$/.test(name) && !/\.test\.ts$/.test(name) ? [p] : []
})

export function kitContractOf(viewsDir: string): KitContract {
  const kit = new Set<string>()
  const icons = new Set<string>()
  for (const file of sources(viewsDir)) {
    const src = readFileSync(file, 'utf8')
    for (const m of src.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*'(@kit(?:\/icons)?)'/g)) {
      const into = m[2] === '@kit' ? kit : icons
      for (const raw of m[1].split(',')) {
        const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0].trim()
        if (name) into.add(name)
      }
    }
  }
  const byName = (a: string, b: string) => a.localeCompare(b, "en")
  return { kit: [...kit].sort(byName), icons: [...icons].sort(byName) }
}
