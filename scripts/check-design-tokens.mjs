#!/usr/bin/env node
/**
 * Visual consistency guard — Mateu's OWN components take colour, spacing and type from the design
 * system's tokens (Lumo for the Vaadin renderer, Redwood/JET for VB), never from literals.
 *
 * Why a guard and not a review: every hard-coded `#999` or `padding: 12px` is a value that ignores
 * the theme (it does not follow dark mode, forced colours or a customer's Lumo theme) and breaks the
 * 8-pt rhythm the tokens encode. They creep in one at a time, each one looking harmless.
 *
 * What counts as a violation, in Mateu's sources (libs/mateu/src, apps/vaadin/src, apps/redwood/poc
 * templates + core):
 *  - a colour literal (#rgb/#rrggbb/#rrggbbaa, rgb()/rgba()/hsl()/hsla()) …
 *  - a px length > 2px on a spacing or type property (padding, margin, gap, inset/top/right/bottom/
 *    left, font-size) …
 *  - a font-size in rem/em …
 *  … UNLESS it is the FALLBACK of a `var(--token, <fallback>)` (the DS-neutral components carry
 *  fallbacks so they render without the theme loaded — the token still wins), or the line carries a
 *  `design-token-ok` marker with the reason (e.g. a chart palette, an always-light pastel banner
 *  whose ink must stay dark).
 *
 * It is a RATCHET: scripts/design-tokens-baseline.json records today's count per file; a file may
 * only go down. A new file starts at zero. `--update` rewrites the baseline (use it when you REMOVED
 * literals, so the gain is locked in). `--list <file>` prints a file's violations.
 *
 *   node scripts/check-design-tokens.mjs            # check (CI)
 *   node scripts/check-design-tokens.mjs --update   # lock in improvements
 *   node scripts/check-design-tokens.mjs --list libs/mateu/src/mateu/ui/infra/ui/mateu-notice.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const MONO = path.join(ROOT, 'frontend/web/monorepo')
const BASELINE = path.join(ROOT, 'scripts/design-tokens-baseline.json')

const SOURCES = [
    { dir: 'libs/mateu/src', ext: ['.ts', '.css'] },
    { dir: 'apps/vaadin/src', ext: ['.ts', '.css'] },
    { dir: 'apps/redwood/poc/templates', ext: ['.html'] },
    { dir: 'apps/redwood/poc/core', ext: ['.mjs'] },
]
const SKIP = /(\.test\.|\/test\/|\/__tests__\/|\.d\.ts$|\/fixtures\/|\/assets\/)/

const walk = (dir, exts, acc = []) => {
    if (!fs.existsSync(dir)) return acc
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p, exts, acc)
        else if (exts.some((x) => e.name.endsWith(x)) && !SKIP.test(p)) acc.push(p)
    }
    return acc
}

/** Removes the fallback argument of every `var(--x, fallback)` (nested parens included). */
export const stripVarFallbacks = (s) => {
    let out = ''
    let i = 0
    while (i < s.length) {
        const m = s.slice(i).match(/^var\(\s*--[\w-]+\s*,/)
        if (m) {
            out += 'var(--token'
            i += m[0].length
            let depth = 1
            while (i < s.length && depth > 0) {
                if (s[i] === '(') depth++
                else if (s[i] === ')') depth--
                i++
            }
            out += ')'
        } else {
            out += s[i++]
        }
    }
    return out
}

const COLOR = /(?<![\w&-])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![\w-])|\b(?:rgba?|hsla?)\(/g
const SPACING_PX = /\b(?:padding|margin|gap|row-gap|column-gap|inset|top|right|bottom|left|font-size)(?:-[a-z-]+)?\s*:\s*[^;"'`}]*?(?<![\w.])(\d+(?:\.\d+)?)px/g
const FONT_REM = /\bfont-size\s*:\s*[\d.]+r?em\b/g

/** Violations of one source text (exported for the tests). */
export const violationsOf = (text) => {
    const found = []
    const lines = text.split('\n')
    let inBlockComment = false
    lines.forEach((raw, idx) => {
        let line = raw
        // comments: drop /* … */ and // … (not inside url(//…), which we never write anyway)
        if (inBlockComment) {
            const end = line.indexOf('*/')
            if (end < 0) return
            line = line.slice(end + 2)
            inBlockComment = false
        }
        line = line.replace(/\/\*.*?\*\//g, '')
        const open = line.indexOf('/*')
        if (open >= 0) { line = line.slice(0, open); inBlockComment = true }
        line = line.replace(/(^|[^:])\/\/.*$/, '$1')
        if (/design-token-ok/.test(raw)) return
        const s = stripVarFallbacks(line)
        for (const m of s.matchAll(COLOR)) found.push({ line: idx + 1, kind: 'colour', text: m[0] })
        for (const m of s.matchAll(SPACING_PX)) if (+m[1] > 2) found.push({ line: idx + 1, kind: 'px', text: m[0].slice(0, 60) })
        for (const m of s.matchAll(FONT_REM)) found.push({ line: idx + 1, kind: 'font-size', text: m[0] })
    })
    return found
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
    const files = SOURCES.flatMap(({ dir, ext }) => walk(path.join(MONO, dir), ext))
    const counts = {}
    const details = {}
    for (const f of files) {
        const rel = path.relative(MONO, f)
        const v = violationsOf(fs.readFileSync(f, 'utf8'))
        if (v.length) { counts[rel] = v.length; details[rel] = v }
    }
    const listIdx = process.argv.indexOf('--list')
    if (listIdx > 0) {
        const want = process.argv[listIdx + 1]
        for (const [rel, v] of Object.entries(details)) {
            if (!want || rel.includes(want)) for (const x of v) console.log(`${rel}:${x.line}  ${x.kind}  ${x.text}`)
        }
        process.exit(0)
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    if (process.argv.includes('--update')) {
        const sorted = Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
        fs.writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + '\n')
        console.log(`design tokens: baseline written — ${total} literal(s) in ${Object.keys(counts).length} file(s)`)
        process.exit(0)
    }
    const baseline = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {}
    const worse = []
    let better = 0
    for (const [rel, n] of Object.entries(counts)) {
        const allowed = baseline[rel] ?? 0
        if (n > allowed) worse.push({ rel, n, allowed })
        else if (n < allowed) better += allowed - n
    }
    for (const [rel, allowed] of Object.entries(baseline)) if (!(rel in counts) && allowed > 0) better += allowed
    const baseTotal = Object.values(baseline).reduce((a, b) => a + b, 0)
    if (worse.length) {
        console.error('design tokens: hard-coded colour / spacing / font-size literals ADDED outside the design tokens:\n')
        for (const w of worse) {
            console.error(`  ${w.rel}: ${w.n} (baseline ${w.allowed})`)
            for (const x of details[w.rel].slice(0, 12)) console.error(`      line ${x.line}  ${x.kind}  ${x.text}`)
        }
        console.error('\nUse a token (--lumo-space-*, --lumo-font-size-*, --lumo-*-color …; JET/Redwood --oj-* in VB), or put the')
        console.error('literal as the FALLBACK of var(--token, literal). A justified literal takes a `design-token-ok: <reason>` comment.')
        process.exit(1)
    }
    console.log(`design tokens: OK — ${total} literal(s) (baseline ${baseTotal}${better ? `; ${better} fewer — run with --update to lock it in` : ''})`)
}
