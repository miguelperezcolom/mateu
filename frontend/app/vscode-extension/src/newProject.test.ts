import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'yaml'
import {
    NewProjectOptions,
    Resolved,
    incompatibility,
    resolveChoices,
    appTitleOf,
    defaultPackage,
    generateProject,
    latestMateuVersion,
    loadManifest,
    namespaceOf,
    nugetVersion,
    pinnedVersion,
    pypiVersion,
    sourcesFor,
    validate,
    versionFromMetadata,
    writeProject,
} from './newProject'
import { loadCatalogue } from './newFiles'

// Mirrors the IntelliJ plugin's MateuProjectGeneratorTest: same data (starters/ + generator/), same
// shared cases (starters/generator/cases.json).
const sources = sourcesFor(join(__dirname, '..'))
const manifest = loadManifest(sources.starters)
const cases = JSON.parse(readFileSync(join(sources.starters, 'generator', 'cases.json'), 'utf8')).cases as any[]

const text = (files: Map<string, string | Buffer>, p: string) => {
    const c = files.get(p)
    if (c === undefined) throw new Error(`not generated: ${p}`)
    return c.toString()
}

describe('New Mateu project — shared cases', () => {
    for (const c of cases) {
        it(c.name, () => {
            const files = generateProject(sources, c.options as NewProjectOptions)
            for (const p of c.files ?? []) expect([...files.keys()], p).toContain(p)
            for (const p of c.absent ?? []) expect([...files.keys()], p).not.toContain(p)
            for (const [p, subs] of Object.entries(c.contains ?? {})) for (const s of subs as string[]) expect(text(files, p), `${p} ∋ ${s}`).toContain(s)
            for (const [p, subs] of Object.entries(c.lacks ?? {})) for (const s of subs as string[]) expect(text(files, p), `${p} ∌ ${s}`).not.toContain(s)
        })
    }
})

describe('New Mateu project — every combination', () => {
    const catalogue = loadCatalogue(sources.pageCatalogue)
    const all: NewProjectOptions[] = []
    for (const authoring of manifest.authoring) {
        for (const runtimeId of authoring.runtimes.length > 0 ? authoring.runtimes : [undefined]) {
            const r = resolveChoices(manifest, authoring.id, runtimeId) as Resolved
            for (const sample of r.samples) {
                for (const renderer of r.renderers.length > 0 ? r.renderers : [undefined]) {
                    if (incompatibility(manifest, { authoring: authoring.id, runtime: runtimeId, renderer, sample })) continue
                    all.push({
                        authoring: authoring.id, runtime: runtimeId, buildTool: 'maven', renderer, sample,
                        pages: authoring.pages ? catalogue.pageTemplates.map((t) => t.id) : [],
                        groupId: 'com.acme', artifactId: 'my-app', packageName: 'com.acme.myapp', version: '3.0-alpha.999',
                    })
                }
            }
        }
    }

    it('covers every runtime and every authoring flavour', () => {
        expect(new Set(all.map((o) => o.runtime).filter(Boolean))).toEqual(new Set(manifest.runtimes.map((r) => r.id)))
        expect(new Set(all.map((o) => o.authoring))).toEqual(new Set(['code', 'yaml', 'static', 'both']))
    })

    for (const o of all) {
        it(`${o.authoring} / ${o.runtime ?? '-'} / ${o.sample} / ${o.renderer ?? '-'}`, () => {
            const files = generateProject(sources, o)
            expect(files.has('AGENTS.md')).toBe(true)
            expect(text(files, 'CLAUDE.md')).toContain('@AGENTS.md')
            for (const [p, c] of files) {
                expect(p, 'starter package dir moved').not.toContain('com/example/app')
                if (typeof c !== 'string') continue
                expect(c, `${p}: placeholders filled`).not.toMatch(/__(ROUTES|MENU|APP_TITLE|NUGET_VERSION|PYPI_VERSION|TITLE|NAME|PAGE_WIDTH)__/)
                expect(c, `${p}: no starter ids left`).not.toContain('mateu-starter-')
                expect(c, `${p}: no package left`).not.toContain('com.example.app')
                expect(c, `${p}: no repository-relative references`).not.toContain('../../backend')
                if (p.endsWith('.yaml')) expect(() => parse(c), `${p} parses`).not.toThrow()
            }
            // Every route a YAML style declares has its definition, and the menu routes exist.
            const routesFile = [...files.keys()].find((p) => p.endsWith('specs/ui/routes.yaml'))
            if (routesFile) {
                const routes = parse(text(files, routesFile)).routes as any[]
                const dir = routesFile.slice(0, -'routes.yaml'.length)
                for (const r of routes) if (r.layout) expect(files.has(dir + r.layout), r.layout).toBe(true)
                const menu = parse(text(files, dir + 'app.yaml')).menu as any[]
                for (const m of menu) expect(routes.map((r) => r.route)).toContain(m.route)
            }
        })
    }
})

describe('The starters themselves', () => {
    const dirs = readdirSync(sources.starters).filter((d) => d !== 'generator' && statSync(join(sources.starters, d)).isDirectory())

    it('every starter ships a CLAUDE.md that imports its AGENTS.md', () => {
        expect(dirs).toEqual(expect.arrayContaining(['spring-mvc', 'yaml', 'static', 'dotnet', 'python']))
        for (const d of dirs) {
            expect(existsSync(join(sources.starters, d, 'AGENTS.md')), `${d}/AGENTS.md`).toBe(true)
            expect(readFileSync(join(sources.starters, d, 'CLAUDE.md'), 'utf8'), `${d}/CLAUDE.md`).toContain('@AGENTS.md')
        }
    })

    it('every starter is the starter of some authoring flavour', () => {
        const used = new Set<string>()
        for (const a of manifest.authoring) for (const rt of a.runtimes.length > 0 ? a.runtimes : ['']) used.add((resolveChoices(manifest, a.id, rt || undefined) as Resolved).starter)
        for (const d of dirs) expect(used.has(d), d).toBe(true)
    })

    it('the static starter ships the same UI as the YAML one (one design, two deployments)', () => {
        const specs = (d: string) => join(sources.starters, d, 'src/main/resources/specs/ui')
        const names = readdirSync(specs('yaml')).sort()
        expect(readdirSync(specs('static')).sort()).toEqual(names)
        for (const n of names) expect(readFileSync(join(specs('static'), n), 'utf8'), n).toBe(readFileSync(join(specs('yaml'), n), 'utf8'))
    })
})

describe('New Mateu project — helpers', () => {
    it('derives names', () => {
        expect(appTitleOf('my-shop')).toBe('My shop')
        expect(namespaceOf('my-shop')).toBe('MyShop')
        expect(namespaceOf('1st-app')).toBe('App1stApp')
        expect(defaultPackage('com.acme', 'my-shop')).toBe('com.acme.myshop')
    })

    it('spells the release for NuGet and PyPI like the release jobs', () => {
        expect(nugetVersion('3.0-alpha.408')).toBe('3.0.0-alpha.408')
        expect(nugetVersion('3.1.2')).toBe('3.1.2')
        expect(pypiVersion('3.0-alpha.408')).toBe('3.0.0a408')
        expect(pypiVersion('3.1')).toBe('3.1.0')
    })

    it('resolves the latest release, falling back to the pinned one', async () => {
        const xml = '<metadata><versioning><latest>3.0-alpha.410</latest><release>3.0-alpha.409</release></versioning></metadata>'
        expect(versionFromMetadata(xml)).toBe('3.0-alpha.409')
        expect(await latestMateuVersion(manifest, 'x', async () => xml)).toBe('3.0-alpha.409')
        expect(await latestMateuVersion(manifest, 'fallback', async () => { throw new Error('offline') })).toBe('fallback')
        expect(pinnedVersion(sources.starters, 'python')).toMatch(/^\d+\.\d+/)
        expect(pinnedVersion(sources.starters, 'static')).toBe(pinnedVersion(sources.starters))
    })

    it('rejects what cannot be generated', () => {
        const base: NewProjectOptions = { authoring: 'code', runtime: 'quarkus', buildTool: 'maven', renderer: 'vaadin', sample: 'crud', groupId: 'com.acme', artifactId: 'x', packageName: 'com.acme.x', version: '3.0-alpha.1' }
        expect(validate(manifest, base)).toEqual([])
        expect(validate(manifest, { ...base, renderer: 'redwood' }).join()).toContain('renderer')
        expect(validate(manifest, { ...base, buildTool: 'gradle' }).join()).toContain('Build tool')
        expect(validate(manifest, { ...base, artifactId: 'My App' }).join()).toContain('Artifact id')
        expect(validate(manifest, { ...base, packageName: 'com.1x' }).join()).toContain('Package')
        expect(validate(manifest, { ...base, authoring: 'yaml', runtime: 'spring-mvc', sample: 'crud' }).join()).toContain('samples')
        expect(validate(manifest, { ...base, authoring: 'yaml' }).join()).toContain('runs on')
        expect(validate(manifest, { ...base, runtime: 'dotnet', sample: 'empty' }).join()).toContain('samples')
        expect(validate(manifest, { ...base, authoring: 'static', runtime: undefined, sample: 'listing' })).toEqual([])
        expect(validate(manifest, { ...base, pages: ['form'] }).join()).toContain('page templates')
        expect(validate(manifest, { ...base, runtime: 'spring-mvc', renderer: 'redwood' })).toEqual([])
        const withRule = { ...manifest, incompatible: [{ renderer: 'redwood', sample: 'crud', reason: 'not on Redwood yet' }] }
        expect(validate(withRule as typeof manifest, { ...base, runtime: 'spring-mvc', renderer: 'redwood' }).join()).toContain('not on Redwood yet')
        expect(validate(manifest, { ...base, runtime: 'spring-mvc', renderer: 'redwood', sample: 'empty' })).toEqual([])
        expect(validate(manifest, { ...base, authoring: 'both', runtime: 'micronaut' }).join()).toContain('runs on')
    })

    it('writes into an empty folder only', () => {
        const dir = mkdtempSync(join(tmpdir(), 'mateu-new-project-'))
        try {
            const target = join(dir, 'app')
            writeProject(generateProject(sources, cases[0].options), target)
            expect(existsSync(join(target, 'src/main/java/com/acme/shop/Products.java'))).toBe(true)
            expect(readdirSync(target)).toContain('AGENTS.md')
            expect(() => writeProject(new Map([['x', 'y']]), target)).toThrow('not empty')
        } finally {
            rmSync(dir, { recursive: true, force: true })
        }
    })
})
