#!/usr/bin/env node
/**
 * Hexagonal guardrail for the Mateu frontend core (libs/mateu).
 *
 * Enforces two things:
 *  1. HARD invariant — the domain, application and shared (DTO) layers must NOT import any
 *     `@vaadin/*` package. These are the design-system-agnostic core; a leak here is a bug.
 *  2. RATCHET — the number of `ui/infra` files still importing `@vaadin/*` may only go DOWN.
 *     This is the migration debt of the "invert the default" refactor (Level 2): as Vaadin
 *     rendering moves into the Vaadin adapter (apps/vaadin), lower CEILING accordingly.
 *
 * Run: `node scripts/check-core-clean.mjs` (also wired as `yarn check:core`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(root, 'src')

// Ratchet ceiling: the current number of ui/infra files importing @vaadin (static OR dynamic).
// Lower it as the Vaadin rendering is relocated into apps/vaadin. Goal: 0.
const INFRA_VAADIN_CEILING = 11

const HARD_CLEAN = [
    'src/mateu/ui/domain',
    'src/mateu/ui/application',
    'src/mateu/shared',
]
const INFRA = 'src/mateu/ui/infra'

// static `import ... from '@vaadin/x'` / side-effect `import '@vaadin/x'` OR dynamic `import('@vaadin/x')`
const VAADIN_IMPORT = /(?:import|from)\s+['"]@vaadin\/|import\s*\(\s*['"]@vaadin\//

function walk(dir) {
    const out = []
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        if (statSync(full).isDirectory()) out.push(...walk(full))
        else if (full.endsWith('.ts')) out.push(full)
    }
    return out
}

function importsVaadin(file) {
    return VAADIN_IMPORT.test(readFileSync(file, 'utf8'))
}

let failed = false

// 1. Hard invariant
for (const layer of HARD_CLEAN) {
    const dir = join(root, layer)
    const offenders = walk(dir).filter(importsVaadin).map((f) => relative(srcRoot, f))
    if (offenders.length > 0) {
        failed = true
        console.error(`\n✗ HARD INVARIANT BROKEN: ${layer} must not import @vaadin.`)
        offenders.forEach((f) => console.error(`    ${f}`))
    } else {
        console.log(`✓ ${layer} — clean (0 @vaadin)`)
    }
}

// 2. Ratchet on ui/infra
const infraOffenders = walk(join(root, INFRA)).filter(importsVaadin)
const count = infraOffenders.length
if (count > INFRA_VAADIN_CEILING) {
    failed = true
    console.error(`\n✗ RATCHET BROKEN: ${INFRA} has ${count} files importing @vaadin, ceiling is ${INFRA_VAADIN_CEILING}.`)
    console.error(`    A new @vaadin import was added to the core. Move it to apps/vaadin instead.`)
} else {
    console.log(`✓ ${INFRA} — ${count}/${INFRA_VAADIN_CEILING} @vaadin files (ratchet)`)
    if (count < INFRA_VAADIN_CEILING) {
        console.log(`  → progress! lower INFRA_VAADIN_CEILING in this script to ${count}.`)
    }
}

if (failed) {
    console.error('\ncore-clean check FAILED')
    process.exit(1)
}
console.log('\ncore-clean check passed')
