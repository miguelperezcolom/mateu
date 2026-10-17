import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// The hand-written pages that boot a Mateu renderer (this lib's dev page, the demo sites) carry
// Mateu's icon, never the build tool's default /vite.svg — the same rule Java's IndexPage applies
// to every served page (IndexPage.DEFAULT_FAVICON).
const here = dirname(fileURLToPath(import.meta.url))
const lib = resolve(here, '../..')
const repo = resolve(lib, '../../../../..')

const pages: { page: string; publicDir?: string }[] = [
  { page: resolve(lib, 'index.html'), publicDir: resolve(lib, 'public') },
  { page: resolve(repo, 'demo/sites/vaadin/index.html'), publicDir: resolve(repo, 'demo/sites/vaadin') },
  { page: resolve(repo, 'demo/sites/embedded/index.html') },
]

const iconOf = (html: string) => /<link[^>]*rel="icon"[^>]*href="([^"]+)"/.exec(html)?.[1]

describe('pages that boot a renderer', () => {
  for (const { page, publicDir } of pages) {
    it.runIf(existsSync(page))(`${page.slice(repo.length + 1)} links Mateu's icon`, () => {
      const html = readFileSync(page, 'utf8')
      expect(html).not.toContain('vite.svg')
      const icon = iconOf(html)
      expect(icon).toMatch(/mateu-icon\.svg$/)
      // a local icon resolves to a file the site serves
      if (publicDir && icon && icon.startsWith('/')) {
        expect(existsSync(resolve(publicDir, '.' + icon))).toBe(true)
      }
    })
  }
})
