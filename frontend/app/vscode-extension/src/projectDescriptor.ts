// The project descriptor (`specs/ui/project.yaml`, `type: Project`) — the settings true of the whole
// project, today the RENDERER it paints with. The file is the truth: the `mateu.renderer` setting and
// "Mateu: Project Settings…" edit it, New File… creates it, and anything that needs the renderer's
// Maven artifact asks here. Absent file or key = vaadin. A port of the IntelliJ plugin's
// ProjectDescriptor.kt; mirrors io.mateu.uidl.data.ProjectSettings / ProjectRenderer.
// No `vscode` import here, so it is unit-tested with vitest.
import { parse } from 'yaml'

export const PROJECT_TYPE = 'Project'
export const PROJECT_FILE_NAME = 'project.yaml'
export const RENDERER_GROUP_ID = 'io.mateu'

export type RendererId = 'vaadin' | 'redwood'

export interface RendererInfo {
    id: RendererId
    label: string
    /** The Maven artifact that serves it — the ONE place the extension spells it (artifacts are due a rename). */
    artifactId: string
}

export const RENDERERS: readonly RendererInfo[] = [
    { id: 'vaadin', label: 'Vaadin (Lumo)', artifactId: 'vaadin-lit' },
    { id: 'redwood', label: 'Redwood (Oracle)', artifactId: 'redwood' },
]

export const DEFAULT_RENDERER: RendererId = 'vaadin'

export function rendererInfo(id: RendererId): RendererInfo {
    return RENDERERS.find((r) => r.id === id) ?? RENDERERS[0]
}

/** `io.mateu:<artifact>` of a renderer — what a served app must depend on. */
export function coordinatesOf(id: RendererId): string {
    return `${RENDERER_GROUP_ID}:${rendererInfo(id).artifactId}`
}

/** The renderer a value names (case-insensitive), or undefined. */
export function parseRenderer(value: unknown): RendererId | undefined {
    if (typeof value !== 'string') return undefined
    const v = value.trim().toLowerCase()
    return RENDERERS.find((r) => r.id === v)?.id
}

function rootOf(text: string | undefined | null): Record<string, unknown> | undefined {
    if (!text || text.trim() === '') return undefined
    try {
        const doc = parse(text)
        return doc && typeof doc === 'object' && !Array.isArray(doc) ? (doc as Record<string, unknown>) : undefined
    } catch {
        return undefined
    }
}

/** Whether `text` is a project descriptor (`type: Project`). */
export function isProjectDescriptor(text: string | undefined | null): boolean {
    return rootOf(text)?.type === PROJECT_TYPE
}

/** The renderer the descriptor declares; vaadin when absent, unreadable or naming none. */
export function rendererOf(text: string | undefined | null): RendererId {
    return parseRenderer(rootOf(text)?.renderer) ?? DEFAULT_RENDERER
}

/** A fresh descriptor for `renderer`. */
export function newDescriptor(renderer: RendererId): string {
    return [
        '# The project descriptor: settings true of the whole project, not of one page.',
        '# renderer — the design system the project paints with: vaadin (io.mateu:vaadin-lit, the',
        '# default) or redwood (io.mateu:redwood). The visual editor and Play open in it and the static',
        '# bundle ships it; a served app still renders with its Maven dependency (the server warns when',
        '# the two disagree).',
        `type: ${PROJECT_TYPE}`,
        `renderer: ${renderer}`,
        '',
    ].join('\n')
}

/**
 * `text` with its `renderer:` set, touching nothing else: the top-level `renderer:` line is replaced
 * (keeping a trailing comment) or added after `type:` (or at the end). Blank → a fresh descriptor.
 */
export function withRenderer(text: string | undefined | null, renderer: RendererId): string {
    if (!text || text.trim() === '') return newDescriptor(renderer)
    const lines = text.replace(/\r\n/g, '\n').split('\n')
    const at = lines.findIndex((l) => /^renderer\s*:/.test(l))
    if (at >= 0) {
        const rest = lines[at].substring(lines[at].indexOf(':') + 1)
        const comment = /\s+#.*$/.exec(rest)?.[0] ?? ''
        lines[at] = `renderer: ${renderer}${comment}`
    } else {
        const typeAt = lines.findIndex((l) => /^type\s*:/.test(l))
        if (typeAt >= 0) lines.splice(typeAt + 1, 0, `renderer: ${renderer}`)
        else lines.splice(lines[lines.length - 1] === '' ? lines.length - 1 : lines.length, 0, `renderer: ${renderer}`)
    }
    return lines.join('\n')
}

/** The `<dependency>` a pom needs to serve `renderer` — for the wizards that write a pom (the New Project one). */
export function dependencyXml(renderer: RendererId, version = '${mateu.version}', indent = '        '): string {
    return [
        `${indent}<dependency>`,
        `${indent}    <groupId>${RENDERER_GROUP_ID}</groupId>`,
        `${indent}    <artifactId>${rendererInfo(renderer).artifactId}</artifactId>`,
        `${indent}    <version>${version}</version>`,
        `${indent}</dependency>`,
    ].join('\n')
}
