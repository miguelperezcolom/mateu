import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import Ajv from 'ajv'
import { parse } from 'yaml'
import { loadCatalogue, render, templateText, templatesRoot } from './newFiles'
// @ts-ignore — a plain ESM script shared with scripts/prepackage.mjs (no .d.ts: it runs before tsc)
import { dispatchByType, dispatchedFamilyNames } from '../scripts/schema-dispatch.mjs'

// The schema this extension contributes to yaml-language-server (package.json `yamlValidation`, staged
// from backend/shared/uidl/specs-schema.json) must accept every specs/ui file the loader accepts. A
// schema that flags a working page teaches developers to ignore the editor — and that is what the
// 2026-10 authoring walkthrough found: a page as a `layout:` envelope, a multi-component partial,
// components.yaml, a route's `data: <source name>` and a page declaring `actions:` were all "invalid".
//
// So: every file the New › Mateu wizards write, every specs/ui file the repo ships (demos, starters,
// e2e fixtures, generator overlays) and every whole-file YAML example in the docs must validate.

const repo = join(__dirname, '..', '..', '..', '..')
const schema = JSON.parse(readFileSync(join(repo, 'backend/shared/uidl/specs-schema.json'), 'utf8'))
const ajv = new Ajv({ strict: false, allErrors: false })
const validate = ajv.compile(schema)
// What this extension actually contributes: the same schema with its polymorphic families as `type`
// dispatches (scripts/schema-dispatch.mjs) — the shape yaml-language-server validates in milliseconds.
const staged = dispatchByType(schema)
const validateStaged = new Ajv({ strict: false, allErrors: false }).compile(staged)

const SKIPPED = new Set(['node_modules', 'target', '.git', 'build', 'dist', 'bin', 'obj', '.venv', 'out', '.idea', '.gradle'])

function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
        if (SKIPPED.has(name)) continue
        const p = join(dir, name)
        if (statSync(p).isDirectory()) walk(p, out)
        else out.push(p)
    }
    return out
}

/** Which oneOf branch the doc was meant for, to report that branch's errors instead of 13 at once. */
function problems(doc: any): string {
    const kinds = ['UI', 'Routes', null, 'Sources', 'Actions', 'Translations', 'Environment', 'Types', 'Project']
    let idx = kinds.indexOf(doc?.type)
    if (Array.isArray(doc)) idx = 2
    else if (idx < 0) idx = doc?.type ? 9 : doc?.layout || doc?.layoutDelta ? 10 : doc?.components ? 12 : doc?.content ? 11 : doc?.routes ? 1 : 9
    const branch = ajv.compile({ ...schema.oneOf[idx], $defs: schema.$defs })
    branch(doc)
    return (branch.errors ?? []).slice(0, 3).map((e) => `${e.instancePath} ${e.message} ${JSON.stringify(e.params)}`).join('; ')
}

/** Test fixtures may be broken on purpose (a typo the loader must survive); shipped files may not. */
function isShipped(p: string): boolean {
    const f = p.replace(/\\/g, '/')
    return /\/specs\/ui\/.*\.ya?ml$/.test(f) && !f.includes('/src/test/') && !f.includes('/backend/python/tests/') && !f.includes('/backend/dotnet/test/')
}

describe('specs-schema.json accepts what the loader accepts', () => {
    it('every specs/ui file the repo ships', () => {
        const failures: string[] = []
        let checked = 0
        for (const file of walk(repo).filter(isShipped)) {
            const doc = parse(readFileSync(file, 'utf8'))
            if (doc == null) continue
            checked++
            if (!validate(doc)) failures.push(`${relative(repo, file)}: ${problems(doc)}`)
            if (!validateStaged(doc)) failures.push(`${relative(repo, file)} (staged type-dispatch variant): ${JSON.stringify(validateStaged.errors?.slice(0, 2))}`)
        }
        expect(checked).toBeGreaterThan(50)
        expect(failures).toEqual([])
    })

    it('every shipped file that names its own schema ($schema: / yaml-language-server) validates against it', () => {
        // a starter's routes.yaml points editors at routes-schema.json, a page at uidl-schema.json…:
        // those narrower schemas must accept the file too, or the editor flags the starter itself
        const compiled: Record<string, ReturnType<typeof ajv.compile>> = {}
        const failures: string[] = []
        let checked = 0
        for (const file of walk(repo).filter(isShipped)) {
            const text = readFileSync(file, 'utf8')
            const m = /(?:\$schema:\s*|yaml-language-server:\s*\$schema=)\S*\/([a-z-]+-schema\.json)/.exec(text)
            if (!m) continue
            const doc = parse(text)
            if (doc && typeof doc === 'object' && !Array.isArray(doc)) delete doc.$schema
            compiled[m[1]] ??= new Ajv({ strict: false }).compile(JSON.parse(readFileSync(join(repo, 'backend/shared/uidl', m[1]), 'utf8')))
            checked++
            if (!compiled[m[1]](doc)) failures.push(`${relative(repo, file)} (${m[1]}): ${JSON.stringify(compiled[m[1]].errors?.slice(0, 2))}`)
        }
        expect(checked).toBeGreaterThan(20)
        expect(failures).toEqual([])
    })

    it('every file the New › Mateu wizards write', () => {
        const roots = templatesRoot(join(__dirname, '..'))
        const catalogue = loadCatalogue(roots.catalogue)
        const failures: string[] = []
        for (const kind of catalogue.files.filter((k) => !k.page)) {
            const doc = parse(render(templateText(roots.internal, kind.template!), kind.fileName))
            if (doc != null && !validate(doc)) failures.push(`${kind.id}: ${problems(doc)}`)
        }
        for (const t of catalogue.pageTemplates) {
            for (const w of catalogue.pageWidths) {
                const doc = parse(render(templateText(roots.internal, t.template), 'my-page', undefined, w.style))
                if (!validate(doc)) failures.push(`page ${t.id}/${w.id}: ${problems(doc)}`)
            }
        }
        expect(failures).toEqual([])
    })

    it('every whole-file YAML example in the docs', () => {
        const failures: string[] = []
        let checked = 0
        for (const file of walk(join(repo, 'doc/src/content/docs')).filter((f) => /\.mdx?$/.test(f))) {
            const blocks = [...readFileSync(file, 'utf8').matchAll(/```ya?ml[^\n]*\n([\s\S]*?)```/g)]
            blocks.forEach((block, i) => {
                // One block may show several files, each introduced by a `# specs/ui/<file>` comment.
                for (const part of block[1].split(/^(?=# (?:src\/main\/resources\/)?specs\/ui\/)/m)) {
                    // `[...]` / `…` stand for content the example leaves out: not a file to validate.
                    if (!part.trim() || /\[(\.\.\.|…)\]|:\s*…\s*$/m.test(part)) continue
                    let doc: any
                    try {
                        doc = parse(part)
                    } catch {
                        continue // a fragment (a key under discussion), not a file
                    }
                    if (!doc || typeof doc !== 'object' || Array.isArray(doc)) continue
                    const wholeFile = typeof doc.type === 'string' || ['layout', 'layoutDelta', 'routes', 'sources', 'components', 'messages', 'types'].some((k) => k in doc)
                    if (!wholeFile) continue
                    const hint = /^# .*\(type: (\w+)\)/.exec(part.trim())
                    if (doc.type === undefined && hint) doc = { type: hint[1], ...doc }
                    checked++
                    if (!validate(doc)) failures.push(`${relative(repo, file)} block #${i + 1}: ${problems(doc)}`)
                }
            })
        }
        expect(checked).toBeGreaterThan(50)
        expect(failures).toEqual([])
    })
})

describe('the staged schema is a type dispatch (yaml-language-server cost)', () => {
    // The generated schema spells `Component` as a 125-way `oneOf`; yaml-language-server tries every
    // branch at every level on every keystroke (5 s for a 4 KB page in the 2026-10 walkthrough). The
    // extension stages the same families as `type` dispatches — same files accepted, same files refused.
    it('rewrites every polymorphic family and keeps the rest of the schema', () => {
        expect(dispatchedFamilyNames(schema)).toEqual(['Actionable', 'Component', 'FormTemplate', 'Step', 'Trigger', 'UserTrigger'])
        const component = staged.$defs.Component
        expect(component.oneOf).toBeUndefined()
        expect(component.properties.type.enum.length).toBe(schema.$defs.Component.oneOf.length)
        expect(component.properties.type.enum).toContain('Notice')
        expect(component.allOf.find((b: any) => b.if.properties.type.const === 'Notice').then).toEqual({ $ref: '#/$defs/Notice' })
        // untouched: the per-component definitions, the file-kind union, the descriptions
        expect(staged.$defs.Notice).toEqual(schema.$defs.Notice)
        expect(staged.oneOf.length).toBe(schema.oneOf.length)
        expect(staged.$defs.Component.description).toBe(schema.$defs.Component.description)
        // and the generated file itself is not what is staged (the transform is not a no-op)
        expect(JSON.stringify(staged)).not.toBe(JSON.stringify(schema))
    })

    it('refuses what the generated schema refuses', () => {
        const unknownType = { type: 'VerticalLayout', content: [{ type: 'Nonsense' }] }
        const wrongProperty = { type: 'VerticalLayout', content: [{ type: 'Notice', text: 'x', slim: 'yes' }] }
        const good = { type: 'VerticalLayout', content: [{ type: 'Notice', text: 'x', slim: true, content: [{ type: 'Text', text: 'y' }] }] }
        for (const doc of [unknownType, wrongProperty]) {
            expect(validate(doc)).toBe(false)
            expect(validateStaged(doc)).toBe(false)
        }
        expect(validate(good)).toBe(true)
        expect(validateStaged(good)).toBe(true)
    })

    it('is what scripts/prepackage.mjs writes for yamlValidation', () => {
        const prepackage = readFileSync(join(__dirname, '..', 'scripts', 'prepackage.mjs'), 'utf8')
        expect(prepackage).toContain('dispatchByType(schema)')
        expect(prepackage).toContain("join(here, 'schema/specs-schema.json')")
    })
})
