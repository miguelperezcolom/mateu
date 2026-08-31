import { parse, stringify } from 'yaml'

/**
 * The editor's model of a MOUNT descriptor — a `type: UI` file, the data-driven counterpart of an
 * `@UI` class. It declares a base path and the ordered list of route files whose entries make up
 * this mount's registry (merged, last wins). Several mounts coexist; each is its own file.
 */
export interface MountDoc {
    basePath: string
    routeFiles: string[]
    /** Top-level keys other than type / basePath / routes — kept verbatim. */
    rest: Record<string, unknown>
}

/** Whether this YAML is a mount descriptor (`type: UI`). */
export function isMountYaml(yaml: string): boolean {
    let root: unknown
    try { root = parse(yaml) } catch { return false }
    return !!root && typeof root === 'object' && (root as any).type === 'UI'
}

export function parseMount(yaml: string): MountDoc {
    let root: any
    try { root = parse(yaml) } catch { root = null }
    if (!root || typeof root !== 'object' || Array.isArray(root)) root = {}
    const basePath = typeof root.basePath === 'string' ? root.basePath : ''
    const routeFiles: string[] = Array.isArray(root.routes)
        ? root.routes.filter((r: unknown) => typeof r === 'string')
        : typeof root.routes === 'string'
          ? [root.routes]
          : []
    const rest: Record<string, unknown> = {}
    for (const key of Object.keys(root)) {
        if (key === 'type' || key === 'basePath' || key === 'routes') continue
        rest[key] = root[key]
    }
    return { basePath, routeFiles, rest }
}

export function serializeMount(doc: MountDoc): string {
    const out: Record<string, unknown> = { type: 'UI' }
    out.basePath = doc.basePath ?? ''
    out.routes = doc.routeFiles
    Object.assign(out, doc.rest)
    return stringify(out)
}
