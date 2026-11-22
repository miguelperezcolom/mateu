import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, relative } from 'node:path'
import { viewOverrides } from '../vite/overrides.ts'

const VIEWS = new URL('../views', import.meta.url).pathname
const APPS = new URL('../../monorepo/apps', import.meta.url).pathname

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name)
  return statSync(p).isDirectory() ? files(p) : [p]
})

/** The names a module exports (declarations and `export { … }` lists; `export *` is not followed). */
export function exportsOf(src: string): Set<string> {
  const out = new Set<string>()
  for (const m of src.matchAll(/export\s+(?:default\s+)?(?:declare\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) out.add(m[1])
  for (const m of src.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const raw of m[1].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '').split(/\s+as\s+/).pop()?.trim()
      if (name) out.add(name)
    }
  }
  if (/export\s+default\b/.test(src)) out.add('default')
  return out
}

test('every renderer override replaces a real shared view and exports at least what it exports', () => {
  const problems: string[] = []
  for (const app of existsSync(APPS) ? readdirSync(APPS) : []) {
    const dir = join(APPS, app, 'src', 'overrides')
    if (!existsSync(dir)) continue
    for (const file of files(dir)) {
      const rel = relative(dir, file)
      const original = join(VIEWS, rel)
      if (!existsSync(original)) { problems.push(`${app}: overrides/${rel} replaces nothing (no views/${rel})`); continue }
      if (!/\.tsx?$/.test(rel)) continue
      const missing = [...exportsOf(readFileSync(original, 'utf8'))].filter((n) => !exportsOf(readFileSync(file, 'utf8')).has(n))
      if (missing.length) problems.push(`${app}: overrides/${rel} lacks ${missing.join(', ')}`)
    }
  }
  assert.deepEqual(problems, [])
})

test('the vite plugin hands an override for a shared view, resolves an override\'s relative imports from the original place, and never swaps a file for itself', async () => {
  const root = mkdtempSync(join(tmpdir(), 'mateu-overrides-'))
  const views = join(root, 'views')
  const overrides = join(root, 'app', 'src', 'overrides')
  for (const f of ['shell/AppShell.tsx', 'shell/header/MenuNav.tsx', 'render/Text.tsx']) {
    mkdirSync(join(views, f, '..'), { recursive: true }); writeFileSync(join(views, f), 'export const x = 1')
  }
  mkdirSync(join(overrides, 'shell'), { recursive: true })
  writeFileSync(join(overrides, 'shell', 'AppShell.tsx'), 'export const x = 2')
  // a stand-in for vite's own resolution: a relative path against the importer, extension added
  const ctx = {
    async resolve(source: string, importer: string) {
      if (!source.startsWith('.')) return null
      const base = join(importer, '..', source)
      const id = existsSync(base) ? base : base + '.tsx'
      return existsSync(id) ? { id, external: false } : null
    },
  }
  const plugin = viewOverrides({ views, overrides })
  const resolveId = (plugin.resolveId as unknown as (this: typeof ctx, s: string, i: string, o: object) => Promise<{ id: string } | string | null>).bind(ctx)
  const idOf = (r: { id: string } | string | null) => (typeof r === 'string' ? r : r?.id ?? null)

  // a shared view importing the overridden one gets the override
  assert.equal(idOf(await resolveId('../AppShell', join(views, 'shell', 'header', 'MenuNav.tsx'), {})), join(overrides, 'shell', 'AppShell.tsx'))
  // one that is not overridden stays shared
  assert.equal(idOf(await resolveId('./header/MenuNav', join(views, 'shell', 'AppShell.tsx'), {})), join(views, 'shell', 'header', 'MenuNav.tsx'))
  // the override's relative import resolves from the original's place (views/shell/…)
  assert.equal(idOf(await resolveId('./header/MenuNav', join(overrides, 'shell', 'AppShell.tsx'), {})), join(views, 'shell', 'header', 'MenuNav.tsx'))
  // and the override never gets itself back when it builds on its original
  assert.equal(idOf(await resolveId('./AppShell', join(overrides, 'shell', 'AppShell.tsx'), {})), join(views, 'shell', 'AppShell.tsx'))
})
