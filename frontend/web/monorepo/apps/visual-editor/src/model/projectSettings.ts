import { parse } from 'yaml'
import type { ProjectFile } from './projectIndex'

/**
 * The project descriptor — `specs/ui/project.yaml`, `type: Project` — read by the editor: the
 * renderer the whole project paints with, chosen ONCE instead of per page or per session.
 *
 * ```yaml
 * type: Project
 * renderer: redwood   # vaadin | redwood
 * ```
 *
 * One per project; absent means `vaadin`. The editor's canvas and Play open in it; the toolbar can
 * still PEEK at another renderer for the session (that is a preview, never the project setting).
 * Mirrors `io.mateu.uidl.data.ProjectSettings` (Java) and the IDE plugins' descriptor helpers.
 */
export type ProjectRendererId = 'vaadin' | 'redwood'

export const PROJECT_RENDERERS: ProjectRendererId[] = ['vaadin', 'redwood']

export const PROJECT_RENDERER_LABELS: Record<ProjectRendererId, string> = {
    vaadin: 'Vaadin (Lumo)',
    redwood: 'Redwood (Oracle)',
}

/** The Maven artifact that serves each renderer — the editor's copy of `ProjectRenderer.artifactId()`. */
export const RENDERER_ARTIFACTS: Record<ProjectRendererId, string> = {
    vaadin: 'io.mateu:mateu-vaadin',
    redwood: 'io.mateu:mateu-redwood',
}

/** Where the descriptor lives, relative to `specs/ui/`. */
export const PROJECT_DESCRIPTOR_PATH = 'project.yaml'

export interface ProjectSettings {
    renderer: ProjectRendererId
    /** The descriptor's path (relative to specs/ui) when the project has one; undefined = defaults. */
    path?: string
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = { renderer: 'vaadin' }

function parseObject(yaml: string): Record<string, unknown> | undefined {
    try {
        const root = parse(yaml)
        return root && typeof root === 'object' && !Array.isArray(root) ? root as Record<string, unknown> : undefined
    } catch {
        return undefined
    }
}

/** Whether this YAML is the project descriptor (`type: Project`). */
export function isProjectYaml(yaml: string): boolean {
    return parseObject(yaml)?.type === 'Project'
}

/** A renderer value as the descriptor may spell it; anything else reads as vaadin. */
export function parseRenderer(value: unknown): ProjectRendererId {
    return typeof value === 'string' && value.trim().toLowerCase() === 'redwood' ? 'redwood' : 'vaadin'
}

/** The settings a descriptor declares (defaults for what it leaves out). */
export function parseProjectSettings(yaml: string): ProjectSettings {
    return { renderer: parseRenderer(parseObject(yaml)?.renderer) }
}

/** The project's settings, from the first `type: Project` file among the mount's files. */
export function projectSettingsOf(files: ProjectFile[] | undefined): ProjectSettings {
    for (const f of files ?? []) {
        if (isProjectYaml(f.content ?? '')) return { ...parseProjectSettings(f.content), path: f.path }
    }
    return { ...DEFAULT_PROJECT_SETTINGS }
}

/** A fresh descriptor. */
export function newProjectYaml(renderer: ProjectRendererId = 'vaadin'): string {
    return `# The project descriptor: settings true of the whole project. One per project.\n`
        + `# renderer: vaadin (io.mateu:mateu-vaadin, the default) | redwood (io.mateu:mateu-redwood)\n`
        + `type: Project\nrenderer: ${renderer}\n`
}

/**
 * The descriptor with its `renderer:` set — a line edit, so comments and any other keys survive.
 * A file with no `renderer:` line gets one after `type:` (or at the end).
 */
export function withRenderer(yaml: string, renderer: ProjectRendererId): string {
    if (!yaml.trim()) return newProjectYaml(renderer)
    const lines = yaml.split('\n')
    const at = lines.findIndex((l) => /^renderer\s*:/.test(l))
    if (at >= 0) {
        const comment = lines[at].match(/\s+#.*$/)?.[0] ?? ''
        lines[at] = `renderer: ${renderer}${comment}`
        return lines.join('\n')
    }
    const typeAt = lines.findIndex((l) => /^type\s*:/.test(l))
    if (typeAt >= 0) {
        lines.splice(typeAt + 1, 0, `renderer: ${renderer}`)
        return lines.join('\n')
    }
    return yaml.replace(/\n*$/, '\n') + `renderer: ${renderer}\n`
}
