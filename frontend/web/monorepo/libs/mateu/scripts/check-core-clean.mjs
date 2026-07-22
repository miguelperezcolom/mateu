#!/usr/bin/env node
/**
 * Hexagonal guardrail for the Mateu frontend core (libs/mateu).
 *
 * Enforces two things:
 *  1. HARD invariant — the domain, application and shared (DTO) layers must NOT import any
 *     `@vaadin/*` package. These are the design-system-agnostic core; a leak here is a bug.
 *  2. RATCHET (imports) — the number of `ui/infra` files still importing `@vaadin/*` may only go
 *     DOWN. This is the migration debt of the "invert the default" refactor (Level 2): as Vaadin
 *     rendering moves into the Vaadin adapter (apps/vaadin), lower CEILING accordingly.
 *  3. RATCHET (tags) — the number of `ui/infra` files still EMITTING a `<vaadin-*>` element tag may
 *     only go DOWN. A `<vaadin-…>` tag needs no import, so it slips past check #1/#2, yet it renders
 *     inert under any non-Vaadin renderer (redwood/sapui5/…) — the exact contamination those
 *     renderers must not inherit. The fix per type: make the neutral renderer render a native /
 *     DS-neutral element, and move the Vaadin-fidelity version into apps/vaadin's widget map.
 *
 * Run: `node scripts/check-core-clean.mjs` (also wired as `yarn check:core`).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = join(root, 'src')

// GOAL REACHED (0): the whole core (domain + application + shared + ui/infra) is now free of any
// `@vaadin` import — all Vaadin rendering lives in the apps/vaadin adapter. This stays at 0 so any
// re-introduced @vaadin import in the core fails the check; move it to apps/vaadin instead.
const INFRA_VAADIN_CEILING = 0

const HARD_CLEAN = [
    'src/mateu/ui/domain',
    'src/mateu/ui/application',
    'src/mateu/shared',
]
const INFRA = 'src/mateu/ui/infra'

// static `import ... from '@vaadin/x'` / side-effect `import '@vaadin/x'` OR dynamic `import('@vaadin/x')`
const VAADIN_IMPORT = /(?:import|from)\s+['"]@vaadin\/|import\s*\(\s*['"]@vaadin\//

// a rendered `<vaadin-*>` element tag (needs no import; leaks the DS into non-Vaadin renderers).
const VAADIN_TAG = /<vaadin-[a-z]/
// Ratchet: files under ui/infra that still emit a <vaadin-*> tag. LOWER as renderers are made
// DS-neutral (their Vaadin fidelity moving into apps/vaadin). Goal: 0.
const INFRA_VAADIN_TAG_CEILING = 16

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

function emitsVaadinTag(file) {
    return !file.endsWith('.test.ts') && VAADIN_TAG.test(readFileSync(file, 'utf8'))
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

// 3. Ratchet on ui/infra <vaadin-*> element TAGS
const infraTagFiles = walk(join(root, INFRA)).filter(emitsVaadinTag)
const tagCount = infraTagFiles.length
if (tagCount > INFRA_VAADIN_TAG_CEILING) {
    failed = true
    console.error(`\n✗ RATCHET BROKEN (tags): ${INFRA} has ${tagCount} files emitting <vaadin-*>, ceiling is ${INFRA_VAADIN_TAG_CEILING}.`)
    console.error(`    A new <vaadin-*> tag leaked into the core. Render a native/DS-neutral element and`)
    console.error(`    move the Vaadin version into apps/vaadin's widget map instead.`)
    infraTagFiles.map((f) => relative(srcRoot, f)).forEach((f) => console.error(`    ${f}`))
} else {
    console.log(`✓ ${INFRA} — ${tagCount}/${INFRA_VAADIN_TAG_CEILING} <vaadin-*> tag files (ratchet)`)
    if (tagCount < INFRA_VAADIN_TAG_CEILING) {
        console.log(`  → progress! lower INFRA_VAADIN_TAG_CEILING in this script to ${tagCount}.`)
    }
}

if (failed) {
    console.error('\ncore-clean check FAILED')
    process.exit(1)
}
console.log('\ncore-clean check passed')
