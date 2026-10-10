#!/usr/bin/env node
/**
 * Bundle-size budget for the Vaadin renderer: fails when the JavaScript a page loads EAGERLY grows
 * past the recorded ceiling.
 *
 * "Eager" = the entry script of dist/index.html, every <link rel="modulepreload"> it declares, and
 * every chunk those reach through a STATIC import (followed transitively). Chunks only reached via
 * dynamic import() — charts, diagrams, maps, the rich-text editor — are async and do not count.
 *
 * Why: @ui5/webcomponents once landed in an eagerly preloaded vendor chunk (≈640 KB on every page)
 * for one optional field stereotype, and nobody noticed for months. A ceiling makes such a
 * regression a red build instead of a slow app.
 *
 * Usage: node scripts/check-bundle-budget.mjs [distDir]   (after `npx vite build` in apps/vaadin)
 *        node scripts/check-bundle-budget.mjs --update     rewrite the ceiling to measured + 5%
 */
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const here = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const update = args.includes('--update')
const dist = resolve(args.find((a) => !a.startsWith('--')) ?? join(here, '..', 'dist'))
const budgetFile = join(here, 'bundle-budget.json')

/** The chunks a built index.html loads eagerly, plus their static-import closure. */
const eagerChunks = (distDir) => {
    const html = readFileSync(join(distDir, 'index.html'), 'utf8')
    const roots = new Set()
    for (const m of html.matchAll(/<script[^>]*type="module"[^>]*src="([^"]+\.js)"/g)) roots.add(m[1])
    for (const m of html.matchAll(/<link[^>]*rel="modulepreload"[^>]*href="([^"]+\.js)"/g)) roots.add(m[1])
    const seen = new Set()
    const queue = [...roots].map((u) => join(distDir, u.replace(/^\//, '')))
    while (queue.length) {
        const file = queue.shift()
        if (seen.has(file) || !existsSync(file)) continue
        seen.add(file)
        const code = readFileSync(file, 'utf8')
        // static imports only: `import x from "./a.js"`, `import "./a.js"`, `export * from "./a.js"`
        // (a dynamic `import("./a.js")` has a `(` after `import`, which this pattern does not accept)
        for (const m of code.matchAll(/(?:^|[;\s}])(?:import|export)\s*(?:[\w*{}\s,$]+\s*from\s*)?["']([^"']+\.js)["']/g)) {
            queue.push(resolve(dirname(file), m[1]))
        }
    }
    return [...seen]
}

if (!existsSync(join(dist, 'index.html'))) {
    console.error(`No ${join(dist, 'index.html')} — run \`npx vite build\` in apps/vaadin first.`)
    process.exit(2)
}

const files = eagerChunks(dist)
let raw = 0
let gzip = 0
const rows = []
for (const f of files) {
    const size = statSync(f).size
    const gz = gzipSync(readFileSync(f)).length
    raw += size
    gzip += gz
    rows.push([f.slice(dist.length + 1), size, gz])
}
rows.sort((a, b) => b[1] - a[1])
const kb = (n) => `${(n / 1024).toFixed(1)} KB`
console.log('Eagerly loaded JavaScript:')
for (const [name, size, gz] of rows) console.log(`  ${name.padEnd(36)} ${kb(size).padStart(10)}  gzip ${kb(gz).padStart(9)}`)
console.log(`  ${'TOTAL'.padEnd(36)} ${kb(raw).padStart(10)}  gzip ${kb(gzip).padStart(9)}`)

if (update) {
    const ceiling = {
        rawBytes: Math.ceil(raw * 1.05), gzipBytes: Math.ceil(gzip * 1.05),
        measuredRawBytes: raw, measuredGzipBytes: gzip,
        note: 'Ceiling = measured + 5%. Raise it only as a reviewed change, saying why.',
    }
    writeFileSync(budgetFile, JSON.stringify(ceiling, null, 2) + '\n')
    console.log(`Budget rewritten: ${kb(ceiling.rawBytes)} raw / ${kb(ceiling.gzipBytes)} gzip`)
    process.exit(0)
}

const budget = JSON.parse(readFileSync(budgetFile, 'utf8'))
const over = []
if (raw > budget.rawBytes) over.push(`raw ${kb(raw)} > ceiling ${kb(budget.rawBytes)}`)
if (gzip > budget.gzipBytes) over.push(`gzip ${kb(gzip)} > ceiling ${kb(budget.gzipBytes)}`)
if (over.length) {
    console.error(`\nBundle budget exceeded: ${over.join('; ')}.`)
    console.error('Make the new dependency an async chunk (dynamic import + its own group in vite.vendorChunks.ts),')
    console.error('or, if the growth is intended, raise the ceiling with `--update` as a reviewed change.')
    process.exit(1)
}
console.log(`\nWithin budget (ceiling ${kb(budget.rawBytes)} raw / ${kb(budget.gzipBytes)} gzip).`)
