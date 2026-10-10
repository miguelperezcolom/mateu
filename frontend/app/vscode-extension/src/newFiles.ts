// New › Mateu catalogue + skeleton rendering — a faithful port of the IntelliJ plugin's
// MateuNewFiles.kt (io.mateu.ijp.newfile). The DATA is shared, not copied: the catalogue
// (new-file-kinds.json) and the skeletons (fileTemplates/internal/*.yaml.ft) live in the IntelliJ
// plugin's resources and are staged into this extension's templates/ by scripts/prepackage.mjs.
// No `vscode` import here, so it is unit-tested with vitest.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface FileKind {
    id: string
    label: string
    description: string
    fileName: string
    template?: string
    page: boolean
    /** One per project (the project descriptor): offered only while the project has none. */
    singleton: boolean
}

export interface PageWidth {
    id: string
    label: string
    style: string | null
}

export interface PageTemplate {
    id: string
    label: string
    description: string
    family: string
    pageWidth: string
    template: string
}

export interface Catalogue {
    files: FileKind[]
    pageWidths: PageWidth[]
    pageTemplates: PageTemplate[]
}

export const PAGE_WIDTH_MARKER = '__PAGE_WIDTH__'

/** Where the catalogue lives: the staged `templates/` dir, else (running from source) the repo copy. */
export function templatesRoot(extensionRoot: string): { catalogue: string; internal: string } {
    const staged = join(extensionRoot, 'templates')
    if (existsSync(join(staged, 'new-file-kinds.json'))) {
        return { catalogue: join(staged, 'new-file-kinds.json'), internal: join(staged, 'internal') }
    }
    const repo = join(extensionRoot, '..', 'intellij-plugin', 'src', 'main', 'resources')
    return {
        catalogue: join(repo, 'mateu', 'new-file-kinds.json'),
        internal: join(repo, 'fileTemplates', 'internal'),
    }
}

export function loadCatalogue(catalogueFile: string): Catalogue {
    const root = JSON.parse(readFileSync(catalogueFile, 'utf8'))
    return {
        files: (root.files ?? []).map((f: any) => ({
            id: String(f.id),
            label: String(f.label),
            description: String(f.description ?? ''),
            fileName: String(f.fileName),
            template: typeof f.template === 'string' ? f.template : undefined,
            page: f.page === true,
            singleton: f.singleton === true,
        })),
        pageWidths: (root.pageWidths ?? []).map((w: any) => ({
            id: String(w.id),
            label: String(w.label),
            style: typeof w.style === 'string' ? w.style : null,
        })),
        pageTemplates: (root.pageTemplates ?? []).map((t: any) => ({
            id: String(t.id),
            label: String(t.label),
            description: String(t.description ?? ''),
            family: String(t.family ?? ''),
            pageWidth: typeof t.pageWidth === 'string' ? t.pageWidth : 'auto',
            template: String(t.template),
        })),
    }
}

export function templateText(internalDir: string, template: string): string {
    const file = join(internalDir, `${template}.yaml.ft`)
    if (!existsSync(file)) throw new Error(`No bundled file template '${template}'`)
    return readFileSync(file, 'utf8')
}

/**
 * Fill a skeleton: `__TITLE__` → a YAML-safe title, `__NAME__` → the file base name, and the line
 * holding only `__PAGE_WIDTH__` → `style: "<css>"` at the same indentation, or nothing.
 */
export function render(templateText: string, name: string, title: string = titleOf(name), pageWidthStyle?: string | null): string {
    const style = pageWidthStyle && pageWidthStyle.trim() !== '' ? pageWidthStyle : null
    const lines: string[] = []
    for (const line of templateText.replace(/\r\n/g, '\n').split('\n')) {
        if (line.trim() === PAGE_WIDTH_MARKER) {
            if (style != null) lines.push(line.substring(0, line.indexOf(PAGE_WIDTH_MARKER)) + 'style: ' + quoted(style))
        } else {
            lines.push(line)
        }
    }
    return lines.join('\n').split('__TITLE__').join(yamlScalar(title)).split('__NAME__').join(yamlScalar(name))
}

/** "customer-orders" → "Customer orders". */
export function titleOf(fileName: string): string {
    let base = fileName.substring(fileName.lastIndexOf('/') + 1)
    for (const suffix of ['.yaml', '.yml', '.ui']) if (base.endsWith(suffix)) base = base.slice(0, -suffix.length)
    base = base.replace(/[-_.]+/g, ' ').trim()
    const spaced = base.replace(/(?<=[a-z0-9])(?=[A-Z])/g, ' ').toLowerCase()
    const t = spaced.length > 0 ? spaced[0].toUpperCase() + spaced.slice(1) : ''
    return t.trim() === '' ? 'Untitled' : t
}

const RESERVED = new Set(['true', 'false', 'yes', 'no', 'on', 'off', 'null', 'y', 'n'])

/** A plain scalar when safe in block AND flow context, otherwise a double-quoted string. */
export function yamlScalar(s: string): string {
    const plainSafe = s.trim() !== '' && s === s.trim() &&
        /^[\p{L}\p{N}][\p{L}\p{N} ._'()/-]*$/u.test(s) && !RESERVED.has(s.toLowerCase())
    return plainSafe ? s : quoted(s)
}

function quoted(s: string): string {
    return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

/** `orders` → `orders.yaml`; keeps an explicit .yaml/.yml. */
export function fileNameOf(name: string): string {
    const n = name.trim()
    return n.endsWith('.yaml') || n.endsWith('.yml') ? n : `${n}.yaml`
}

/** The base name typed in the dialog, without a .yaml/.yml extension. */
export function baseNameOf(name: string): string {
    return name.trim().replace(/\.ya?ml$/, '')
}

export const FILE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/

/** The default file name for a page template: its id kebab-cased (`smartSearch` → `smart-search`). */
export function pageFileName(templateId: string): string {
    return templateId.replace(/(?<=[a-z])(?=[A-Z])/g, '-').toLowerCase()
}

/**
 * Where a new spec goes, given the folder the user right-clicked ([selected], a `/`-separated path).
 * Inside a `specs/ui` folder → that folder. Otherwise the nearest `specs/ui` that exists at or above it
 * (as `src/main/resources/specs/ui` or `specs/ui`), else a new `src/main/resources/specs/ui` when the
 * folder has Maven/Gradle resources, else `<selected>/specs/ui`. The upward search stops at
 * [projectRoot]. Returns a path that may not exist yet.
 */
export function targetDir(selected: string, projectRoot: string | null | undefined, exists: (p: string) => boolean): string {
    const path = selected.replace(/\/+$/, '')
    const marker = '/specs/ui'
    if (path.includes(`${marker}/`) || path.endsWith(marker)) return path
    const stop = projectRoot != null ? projectRoot.replace(/\/+$/, '') : null
    let dir: string | null = path
    while (dir != null && dir !== '' && (stop == null || dir === stop || dir.startsWith(`${stop}/`))) {
        for (const candidate of [`${dir}/src/main/resources/specs/ui`, `${dir}/specs/ui`]) {
            if (exists(candidate)) return candidate
        }
        const i: number = dir.lastIndexOf('/')
        dir = i > 0 ? dir.substring(0, i) : null
    }
    return exists(`${path}/src/main/resources`) ? `${path}/src/main/resources/specs/ui` : `${path}/specs/ui`
}
