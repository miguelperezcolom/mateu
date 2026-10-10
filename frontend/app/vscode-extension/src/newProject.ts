// New Mateu project — the generation logic behind "Mateu: New Project". A faithful port of the
// IntelliJ plugin's MateuProjectGenerator.kt (io.mateu.ijp.newproject): both apply the SAME data —
// the starters (starters/<dir>, compiled and booted by CI) plus starters/generator/
// new-project.json and its overlays — and are kept identical by the shared cases in
// starters/generator/cases.json. Staged into this extension's starters/ by scripts/prepackage.mjs.
// No `vscode` import here, so it is unit-tested with vitest.
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { loadCatalogue, pageFileName, render, templateText, templatesRoot } from './newFiles'

export interface Choice {
    id: string
    label: string
    description?: string
}

export interface RuntimeDef extends Choice {
    language: string
    renderers: string[]
    samples: string[]
    run: string
    url: string
}

/** An authoring flavour: code, YAML served by a backend, static YAML, or code + YAML. */
export interface AuthoringDef extends Choice {
    /** The starter directory; `${runtime}` is the chosen runtime. */
    starter: string
    /** The runtimes it is offered on; empty = there is no runtime to choose. */
    runtimes: string[]
    /** The language when there is no runtime (else the runtime's). */
    language?: string
    /** Overrides the runtime's renderers. */
    renderers?: string[]
    samples: string[]
    keepsSample: boolean
    unmountsSample: boolean
    overlays: Record<string, string>
    pages?: boolean
    run?: string
}

export interface Replacement {
    from?: string
    regex?: string
    to: string
}

export interface LanguageDef {
    sampleFiles: string[]
    unmount?: { file: string; removeLines: string[] }
    sampleRoute?: { route: string; label: string; viewModel: string }
    specsDir?: string
    packageDir?: string
    sourceRoot?: string
    rendererOverlays?: Record<string, string>
    replacements: Replacement[]
    renames: { from: string; to: string }[]
    overlays?: string[]
}

export interface Manifest {
    versionMetadataUrl: string
    exclude: string[]
    binaryExtensions: string[]
    authoring: AuthoringDef[]
    runtimes: RuntimeDef[]
    buildTools: (Choice & { languages: string[] })[]
    renderers: (Choice & { artifactId: string })[]
    samples: Choice[]
    /** Combinations refused, with the reason (verified to fail at runtime). */
    incompatible?: { renderer?: string; sample?: string; authoring?: string; runtime?: string; reason: string }[]
    languages: Record<string, LanguageDef>
}

export interface NewProjectOptions {
    /** `code` | `yaml` | `static` | `both` (new-project.json `authoring`). */
    authoring: string
    /** Required when the flavour lists runtimes. */
    runtime?: string
    buildTool?: string
    renderer?: string
    sample: string
    /** Page template ids (new-file-kinds.json `pageTemplates`), for the flavours with `pages`. */
    pages?: string[]
    groupId: string
    artifactId: string
    packageName: string
    /** The Mateu release; resolve it with {@link latestMateuVersion}. */
    version: string
}

/** Where the generator's data lives: the starters dir (with generator/ inside) and the page templates. */
export interface Sources {
    starters: string
    pageCatalogue: string
    pageTemplatesDir: string
}

/** The staged copy inside the packaged extension, else (running from source) the repository. */
export function sourcesFor(extensionRoot: string): Sources {
    const staged = join(extensionRoot, 'starters')
    const starters = existsSync(join(staged, 'generator', 'new-project.json')) ? staged : join(extensionRoot, '..', '..', '..', 'starters')
    const t = templatesRoot(extensionRoot)
    return { starters, pageCatalogue: t.catalogue, pageTemplatesDir: t.internal }
}

export function loadManifest(starters: string): Manifest {
    return JSON.parse(readFileSync(join(starters, 'generator', 'new-project.json'), 'utf8'))
}

/** What the choices resolve to: the flavour, the runtime (if any), the language and what is offered. */
export interface Resolved {
    authoring: AuthoringDef
    runtime?: RuntimeDef
    language: string
    starter: string
    renderers: string[]
    samples: string[]
}

export function resolveChoices(manifest: Manifest, authoringId: string, runtimeId?: string): Resolved | string {
    const authoring = manifest.authoring.find((a) => a.id === authoringId)
    if (!authoring) return `Unknown authoring '${authoringId}'`
    let runtime: RuntimeDef | undefined
    if (authoring.runtimes.length > 0) {
        if (!runtimeId || !authoring.runtimes.includes(runtimeId)) {
            return `'${authoring.label}' runs on: ${authoring.runtimes.join(', ')}`
        }
        runtime = manifest.runtimes.find((r) => r.id === runtimeId)
        if (!runtime) return `Unknown runtime '${runtimeId}'`
    }
    const language = runtime?.language ?? authoring.language ?? 'java'
    const renderers = authoring.renderers ?? runtime?.renderers ?? []
    const samples = authoring.samples.filter((s) => !runtime || runtime.samples.includes(s))
    return { authoring, runtime, language, starter: expand(authoring.starter, { runtime: runtime?.id ?? '' }), renderers, samples }
}

// ---------------------------------------------------------------------------------------- naming

export const ARTIFACT_ID_PATTERN = /^[a-z][a-z0-9]*([-._][a-z0-9]+)*$/
export const JAVA_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*(\.[A-Za-z_][A-Za-z0-9_]*)*$/

/** `my-shop` → `My shop`. */
export function appTitleOf(artifactId: string): string {
    const words = artifactId.split(/[-._]+/).filter((w) => w !== '')
    const t = words.join(' ')
    return t === '' ? 'My app' : t[0].toUpperCase() + t.slice(1)
}

/** `my-shop` → `MyShop` (the C# namespace and project name). */
export function namespaceOf(artifactId: string): string {
    const n = artifactId
        .split(/[^A-Za-z0-9]+/)
        .filter((w) => w !== '')
        .map((w) => w[0].toUpperCase() + w.slice(1))
        .join('')
    return /^[A-Za-z]/.test(n) ? n : `App${n}`
}

/** `com.acme` + `my-shop` → `com.acme.myshop`. */
export function defaultPackage(groupId: string, artifactId: string): string {
    const tail = artifactId.toLowerCase().replace(/[^a-z0-9]/g, '')
    const safeTail = /^[a-z]/.test(tail) ? tail : `app${tail}`
    return groupId.trim() === '' ? safeTail : `${groupId.trim()}.${safeTail}`
}

/** `3.0-alpha.408` → `3.0.0-alpha.408` (what the release job publishes to NuGet). */
export function nugetVersion(version: string): string {
    return version.replace(/^(\d+)\.(\d+)(-|$)/, '$1.$2.0$3')
}

/** `3.0-alpha.408` → `3.0.0a408` (PEP 440, backend/python/scripts/set_version.py). */
export function pypiVersion(version: string): string {
    const m = /^(\d+(?:\.\d+)*)(?:[-.]?([A-Za-z]+)[-.]?(\d+)?)?$/.exec(version.trim().replace(/^[vV]/, ''))
    if (!m) return version
    const parts = m[1].split('.')
    while (parts.length < 3) parts.push('0')
    let v = parts.map((p) => String(Number(p))).join('.')
    const pre: Record<string, string> = { alpha: 'a', a: 'a', beta: 'b', b: 'b', rc: 'rc', cr: 'rc' }
    if (m[2]) v += `${pre[m[2].toLowerCase()] ?? m[2].toLowerCase()}${Number(m[3] ?? 0)}`
    return v
}


// ------------------------------------------------------------------------------------- versions

/** The `<mateu.version>` the starters pin (moved by scripts/bump-example-version.sh after each release). */
export function pinnedVersion(starters: string, starterDir: string = 'spring-mvc'): string {
    for (const dir of [starterDir, 'spring-mvc']) {
        const pom = join(starters, dir, 'pom.xml')
        if (existsSync(pom)) {
            const m = /<mateu\.version>([^<]+)<\/mateu\.version>/.exec(readFileSync(pom, 'utf8'))
            if (m) return m[1]
        }
    }
    throw new Error('No <mateu.version> pinned in the starters')
}

/** The release in a maven-metadata.xml (`<release>`, else `<latest>`), or null. */
export function versionFromMetadata(xml: string): string | null {
    const m = /<release>([^<]+)<\/release>/.exec(xml) ?? /<latest>([^<]+)<\/latest>/.exec(xml)
    return m ? m[1].trim() : null
}

/** The latest io.mateu:mateu-bom on Maven Central, or [fallback] when it cannot be read. */
export async function latestMateuVersion(
    manifest: Manifest,
    fallback: string,
    fetchText: (url: string) => Promise<string> = defaultFetch,
): Promise<string> {
    try {
        return versionFromMetadata(await fetchText(manifest.versionMetadataUrl)) ?? fallback
    } catch {
        return fallback
    }
}

async function defaultFetch(url: string): Promise<string> {
    const ctl = new AbortController()
    const timer = setTimeout(() => ctl.abort(), 5000)
    try {
        const res = await fetch(url, { signal: ctl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return await res.text()
    } finally {
        clearTimeout(timer)
    }
}

// ----------------------------------------------------------------------------------- validation

/** Problems with [o] against the manifest; empty when it can be generated. */
export function validate(manifest: Manifest, o: NewProjectOptions): string[] {
    const r = resolveChoices(manifest, o.authoring, o.runtime)
    if (typeof r === 'string') return [r]
    const errors: string[] = []
    if (!r.samples.includes(o.sample)) errors.push(`'${r.authoring.label}' offers the samples: ${r.samples.join(', ')}`)
    if (r.renderers.length > 0 && !r.renderers.includes(o.renderer ?? '')) {
        errors.push(`The renderer must be one of: ${r.renderers.join(', ')}`)
    }
    const clash = incompatibility(manifest, o)
    if (clash) errors.push(clash)
    if (r.language === 'java') {
        const tools = manifest.buildTools.filter((b) => b.languages.includes('java')).map((b) => b.id)
        if (!tools.includes(o.buildTool ?? 'maven')) errors.push(`Build tool must be one of: ${tools.join(', ')}`)
        if (!JAVA_NAME_PATTERN.test(o.groupId)) errors.push('Group id must be a dotted Java name (e.g. com.acme)')
        if (!JAVA_NAME_PATTERN.test(o.packageName)) errors.push('Package must be a dotted Java name (e.g. com.acme.shop)')
    }
    if (!ARTIFACT_ID_PATTERN.test(o.artifactId)) errors.push('Artifact id must be lower-case letters, digits and - . _ (e.g. my-shop)')
    if ((o.pages ?? []).length > 0 && !r.authoring.pages) errors.push(`'${r.authoring.label}' takes no page templates`)
    if (!/^\d+\.\d+/.test(o.version)) errors.push(`Not a Mateu version: '${o.version}'`)
    return errors
}

/** The reason [o] is a refused combination (new-project.json `incompatible`), or null. */
export function incompatibility(manifest: Manifest, o: Partial<NewProjectOptions>): string | null {
    for (const x of manifest.incompatible ?? []) {
        const hit =
            (x.renderer === undefined || x.renderer === o.renderer) &&
            (x.sample === undefined || x.sample === o.sample) &&
            (x.authoring === undefined || x.authoring === o.authoring) &&
            (x.runtime === undefined || x.runtime === o.runtime)
        if (hit) return x.reason
    }
    return null
}

// ----------------------------------------------------------------------------------- generation

/** Generates the project: relative path → content (text as string, binaries as Buffer), sorted by path. */
export function generateProject(sources: Sources, o: NewProjectOptions): Map<string, string | Buffer> {
    const manifest = loadManifest(sources.starters)
    const errors = validate(manifest, o)
    if (errors.length > 0) throw new Error(errors.join('; '))
    const r = resolveChoices(manifest, o.authoring, o.runtime) as Resolved
    const flavour = r.authoring
    const lang = manifest.languages[r.language]
    const isBinary = (p: string) => manifest.binaryExtensions.some((e) => p.toLowerCase().endsWith(e))

    const files = new Map<string, string | Buffer>()
    // (1) the starter
    for (const p of walk(join(sources.starters, r.starter), manifest.exclude)) {
        files.set(p, read(join(sources.starters, r.starter, p), isBinary(p)))
    }
    // (2) the sample
    const keepSample = flavour.keepsSample && o.sample !== 'empty'
    if (!keepSample) for (const f of lang.sampleFiles) files.delete(f)
    // (3) unmount it
    if (keepSample && flavour.unmountsSample && lang.unmount && files.has(lang.unmount.file)) {
        const drop = new Set(lang.unmount.removeLines)
        const text = files.get(lang.unmount.file) as string
        files.set(lang.unmount.file, text.split('\n').filter((l) => !drop.has(l.trim())).join('\n'))
    }
    // (4) overlays: common, the language's own, the flavour's (by sample, else "*"), the renderer's
    const overlays = [...(lang.overlays ?? [])]
    const flavourOverlay = flavour.overlays[o.sample] ?? flavour.overlays['*']
    if (flavourOverlay) overlays.push(flavourOverlay)
    const rendererOverlay = o.renderer ? lang.rendererOverlays?.[o.renderer] : undefined
    if (rendererOverlay) overlays.push(rendererOverlay)
    const overlayRoot = join(sources.starters, 'generator', 'overlays')
    for (const dir of [join(overlayRoot, 'common'), ...overlays.map((ov) => join(overlayRoot, r.language, ov))]) {
        for (const p of walk(dir, manifest.exclude)) files.set(p, read(join(dir, p), isBinary(p)))
    }
    // (5) YAML pages + the routes / menu entries
    if (lang.specsDir) {
        const routes: string[] = []
        const menu: string[] = []
        if (keepSample && flavour.unmountsSample && lang.sampleRoute) {
            routes.push(`  - route: ${lang.sampleRoute.route}`, `    viewModel: ${lang.sampleRoute.viewModel}`)
            menu.push('  - type: RouteLink', `    label: ${lang.sampleRoute.label}`, `    route: ${lang.sampleRoute.route}`)
        }
        if (flavour.pages && (o.pages ?? []).length > 0) {
            const catalogue = loadCatalogue(sources.pageCatalogue)
            for (const id of o.pages ?? []) {
                const t = catalogue.pageTemplates.find((p) => p.id === id)
                if (!t) throw new Error(`Unknown page template '${id}'`)
                const name = pageFileName(t.id)
                const width = catalogue.pageWidths.find((w) => w.id === t.pageWidth)?.style ?? null
                files.set(`${lang.specsDir}/${name}.yaml`, render(templateText(sources.pageTemplatesDir, t.template), name, t.label, width))
                routes.push(`  - route: ${name}`, `    layout: ${name}.yaml`)
                menu.push('  - type: RouteLink', `    label: ${t.label}`, `    route: ${name}`)
            }
        }
        fillMarker(files, `${lang.specsDir}/routes.yaml`, '# __ROUTES__', routes)
        fillMarker(files, `${lang.specsDir}/app.yaml`, '# __MENU__', menu)
    }
    // (6) replacements, renames, the package directory
    const renderer = o.renderer ?? 'vaadin'
    const vars: Record<string, string> = {
        groupId: o.groupId,
        artifactId: o.artifactId,
        package: o.packageName,
        packagePath: o.packageName.replace(/\./g, '/'),
        namespace: namespaceOf(o.artifactId),
        appTitle: appTitleOf(o.artifactId),
        version: o.version,
        nugetVersion: nugetVersion(o.version),
        pypiVersion: pypiVersion(o.version),
        renderer,
        rendererArtifactId: manifest.renderers.find((x) => x.id === renderer)?.artifactId ?? 'mateu-vaadin',
        runtime: r.runtime?.id ?? '',
        starter: r.starter,
    }
    const out = new Map<string, string | Buffer>()
    for (const [path, content] of files) {
        let text = content
        if (typeof text === 'string') {
            for (const rep of lang.replacements) {
                const to = expand(rep.to, vars)
                text = rep.regex != null ? text.replace(new RegExp(rep.regex, 'g'), () => to) : text.split(expand(rep.from!, vars)).join(to)
            }
        }
        let p = path
        for (const rn of lang.renames) if (p === expand(rn.from, vars)) p = expand(rn.to, vars)
        if (lang.packageDir && lang.sourceRoot && p.startsWith(`${lang.packageDir}/`)) {
            p = `${lang.sourceRoot}/${vars.packagePath}/${p.slice(lang.packageDir.length + 1)}`
        }
        out.set(p, text)
    }
    return new Map([...out.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
}

/** How to run the generated project (the flavour's or the runtime's `run`, variables expanded). */
export function runCommand(manifest: Manifest, o: NewProjectOptions): string {
    const r = resolveChoices(manifest, o.authoring, o.runtime)
    if (typeof r === 'string') return ''
    return expand(r.authoring.run ?? r.runtime?.run ?? '', { artifactId: o.artifactId })
}

/** Writes [files] under [target], which must not exist or be empty. */
export function writeProject(files: Map<string, string | Buffer>, target: string): void {
    if (existsSync(target) && readdirSync(target).length > 0) throw new Error(`${target} is not empty`)
    for (const [p, content] of files) {
        const file = join(target, p)
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, content)
    }
}

function expand(s: string, vars: Record<string, string>): string {
    return s.replace(/\$\{([A-Za-z]+)\}/g, (all, k: string) => (k in vars ? vars[k] : all))
}

/** Replaces each line that is exactly [marker] (ignoring indentation) by [lines]. */
function fillMarker(files: Map<string, string | Buffer>, path: string, marker: string, lines: string[]): void {
    const text = files.get(path)
    if (typeof text !== 'string') return
    const out: string[] = []
    for (const line of text.split('\n')) {
        if (line.trim() === marker) out.push(...lines)
        else out.push(line)
    }
    files.set(path, out.join('\n'))
}

function read(file: string, binary: boolean): string | Buffer {
    return binary ? readFileSync(file) : readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
}

/** Relative `/`-separated paths of the files under [root], minus the [exclude] names (`dir/` or file). */
function walk(root: string, exclude: string[]): string[] {
    const result: string[] = []
    const visit = (dir: string, rel: string) => {
        for (const name of readdirSync(dir).sort()) {
            const path = join(dir, name)
            const isDir = statSync(path).isDirectory()
            if (exclude.includes(isDir ? `${name}/` : name)) continue
            const r = rel === '' ? name : `${rel}/${name}`
            if (isDir) visit(path, r)
            else result.push(r)
        }
    }
    if (existsSync(root)) visit(root, '')
    return result
}
