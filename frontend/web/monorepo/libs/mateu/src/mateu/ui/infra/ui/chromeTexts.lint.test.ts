import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

/**
 * The chrome speaks the page's language: every word Mateu draws by itself comes from the
 * catalogue (chromeTexts.ts). This test fails on a NEW hard-coded chrome string in the shared lib's
 * UI and in the Vaadin renderer — a static English/Spanish text node, aria-label, title or
 * placeholder, or one of the usual button words as a string literal.
 *
 * Legitimate exceptions (a CSS class that happens to look like a word, a protocol value) carry an
 * `i18n-ok` comment on the same line. Designer tools that are not end-user chrome are excluded below.
 */

const MONOREPO = resolve(__dirname, '../../../../../../..')
const ROOTS = [
    join(MONOREPO, 'libs/mateu/src/mateu/ui/infra'),
    join(MONOREPO, 'apps/vaadin/src'),
]

/** Developer/designer tools, not chrome an end user reads; dev overlays; the catalogue itself. */
const EXCLUDED = [
    /chromeTexts\.ts$/, /chatTexts\.ts$/, /confirmationTexts\.ts$/,
    /mateu-form-editor\.ts$/, /mateu-workflow\.ts$/, /testbench\//, /mateu-debug-overlay\.ts$/,
    /\/compiler\//, /\/stubs\//,
]

const WORDS = 'Retry|Cancel|Clear filters|Show more|Filter by|No data\\.?|Ask AI|Save|Close|Delete|Search|Loading…?|'
    + 'Previous|Next|Expand|Collapse|Upload|Replace|Apply|Clear|Undo|Dismiss|Remove|Edit|Select|Reset|Send|'
    + 'Maximize|Back|Menu|Yes|Columns|Notifications|Cerrar|Limpiar|Borrar|Buscar|Guardar|Cancelar'

const PATTERNS: { name: string, re: RegExp }[] = [
    { name: 'static attribute text', re: /\b(?:aria-label|title|placeholder)="[A-Za-z¿¡ÁÉÍÓÚáéíóú][^"${}]*"/ },
    // text between a tag's `>` (not an arrow `=>` or a generic `->`) and a closing tag
    { name: 'static text node', re: /(?<![=-])>\s*[A-Z¿][a-záéíóúñ]+(?:\s+[a-záéíóúñ]+){0,5}[.…]?\s*<\// },
    { name: 'chrome word literal', re: new RegExp(`['"\`](?:${WORDS})['"\`]`) },
]

const files = (dir: string): string[] => readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return /\.ts$/.test(name) && !/\.test\.ts$/.test(name) ? [path] : []
})

/** Lines that are code (not comments) and not explicitly allowed. */
const offending = (path: string): string[] => {
    const out: string[] = []
    readFileSync(path, 'utf8').split('\n').forEach((line, i) => {
        const code = line.trim()
        if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*') || line.includes('i18n-ok')) return
        if (/\bconsole\.(warn|error|debug|log)\(/.test(line)) return
        if (/^\s*(case |if \(|else if)/.test(line) && !/html`/.test(line)) return // matching protocol values
        for (const { name, re } of PATTERNS) {
            if (re.test(line)) out.push(`${relative(MONOREPO, path)}:${i + 1} (${name}): ${code.slice(0, 140)}`)
        }
    })
    return out
}

describe('chrome strings come from the catalogue', () => {
    it('no hard-coded chrome text in the shared UI or the Vaadin renderer', () => {
        const found = ROOTS.flatMap(files)
            .filter((f) => !EXCLUDED.some((re) => re.test(f)))
            .flatMap(offending)
        expect(found, 'move these to chromeTexts.ts (or mark a non-chrome literal with // i18n-ok)').toEqual([])
    })
})
