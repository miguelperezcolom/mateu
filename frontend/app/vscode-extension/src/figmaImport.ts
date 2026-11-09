// The pure logic behind "Mateu: Import from Figma…" — the same three rules the Maven goal
// (FigmaImport.java) and the IntelliJ action (FigmaImport.kt) apply, pinned by the shared corpus
// conformance/client/figma-import.json: a Figma URL (or bare key) → the file key, the routes file a
// specs/ui root registers imported pages in, and the minimal routes.yaml append. The conversion
// itself is design/figma/import/figma-import.mjs (bundled under figma/), run with node.
// No `vscode` import, so it is unit-tested with vitest.
import { yamlScalar } from './newFiles'
import { appendRoute, existingRoutes } from './routesWizard'

/** The marker a routes file may carry to say where imported routes go (before it). */
export const ROUTES_MARKER = /^(\s*)#\s*__ROUTES__\s*$/

export const MIN_NODE_MAJOR = 20

export const TOKEN_HELP =
    'Create a personal access token in Figma (Settings › Security › Personal access tokens) with the scope ' +
    '"File content: Read only".'

const URL_RE = /^(?:https?:\/\/)?(?:[\w-]+\.)?figma\.com\/(?:file|design|proto|board|slides|deck)\/([A-Za-z0-9]+)(?:\/[^/?#]*)?(?:\/branch\/([A-Za-z0-9]+))?/
const KEY_RE = /^[A-Za-z0-9]{6,}$/

/**
 * The file key of a Figma URL (`…/design/<key>/<name>?node-id=…`, `/file/`, `/proto/`, a branch URL →
 * the BRANCH key) or of a bare key. Throws on anything else.
 */
export function figmaFileKey(input: string): string {
    const s = input.trim()
    const m = URL_RE.exec(s)
    if (m) return m[2] ?? m[1]
    if (KEY_RE.test(s)) return s
    throw new Error(`Not a Figma file URL or key: "${s}" (expected https://www.figma.com/design/<key>/…)`)
}

/** `a, b,,c` → [a, b, c]. */
export function framesOf(input: string | undefined): string[] {
    return (input ?? '').split(',').map((f) => f.trim()).filter(Boolean)
}

/**
 * Register an imported page: append `route` → `layout` to a routes file's text, before a
 * `# __ROUTES__` marker line when there is one (at its indentation), else at the end of the
 * `routes:` list — a minimal text edit, never a reformat. Null when the route is already declared
 * (a re-import registers nothing).
 */
export function appendImportedRoute(routesText: string, route: string, layout: string): string | null {
    const r = route.trim().replace(/^\/+|\/+$/g, '')
    if (existingRoutes(routesText).includes(r)) return null
    const nl = routesText.includes('\r\n') ? '\r\n' : '\n'
    const lines = routesText.split(/\r?\n/)
    const at = lines.findIndex((l) => ROUTES_MARKER.test(l))
    if (at >= 0) {
        const indent = ROUTES_MARKER.exec(lines[at])![1]
        lines.splice(at, 0, `${indent}- route: ${scalar(r)}`, `${indent}  layout: ${scalar(layout)}`)
        return lines.join(nl)
    }
    return appendRoute(routesText, { route: r, layout })
}

function scalar(s: string): string {
    return s === '' ? '""' : yamlScalar(s)
}

/** The route an imported page answers: its path under the specs root without `.yaml`. */
export function routeOfPage(path: string): string {
    return path.replace(/\\/g, '/').replace(/\.ya?ml$/, '')
}

/**
 * Which routes file of a specs/ui root gets the imported pages: `routes.yaml` when it is a routes
 * file, else the only routes file, else the first one in path order, else null (= create
 * routes.yaml). `routesFiles` are paths relative to the root.
 */
export function routesFileFor(routesFiles: string[]): string | null {
    if (routesFiles.includes('routes.yaml')) return 'routes.yaml'
    return [...routesFiles].sort()[0] ?? null
}

/** `v20.11.1` → 20; null when it does not read as a node version. */
export function nodeMajor(version: string): number | null {
    const m = /^v?(\d+)\./.exec(version.trim())
    return m ? Number(m[1]) : null
}

export interface ImportedFile {
    path: string
    frame: string
    type: string | null
    partial: boolean
    status: 'created' | 'updated' | 'unchanged' | 'skipped'
}

export interface ImportReport {
    files: ImportedFile[]
    warnings: string[]
    frames: string[]
}

/** The pages of a report that get a route: screens (not partials, not an app shell) that were written. */
export function routablePages(report: ImportReport): ImportedFile[] {
    return report.files.filter((f) => !f.partial && f.type !== 'AppShell' && f.status !== 'skipped')
}

/** One line per file + the routes added, for the notification / the output channel. */
export function summaryOf(report: ImportReport, routesAdded: string[], dryRun = false): string {
    const count = (s: ImportedFile['status']) => report.files.filter((f) => f.status === s).length
    const parts = [`${count('created')} created`, `${count('updated')} updated`, `${count('unchanged')} unchanged`]
    if (count('skipped')) parts.push(`${count('skipped')} skipped`)
    return `${dryRun ? 'Dry run — nothing written. ' : ''}${parts.join(', ')}; ${routesAdded.length} route(s) ${dryRun ? 'to add' : 'added'}` +
        (routesAdded.length ? ` (${routesAdded.join(', ')})` : '') +
        (report.warnings.length ? `; ${report.warnings.length} warning(s)` : '')
}

/**
 * The node executables to try, in order: the configured one alone, else each PATH entry, then the
 * usual install folders (an editor launched from the dock may not inherit the shell's PATH).
 */
export function nodeCandidates(configured: string | undefined, env: Record<string, string | undefined>, home: string, platform: string = process.platform): string[] {
    if (configured?.trim()) return [configured.trim()]
    const win = platform === 'win32'
    const names = win ? ['node.exe', 'node.cmd'] : ['node']
    const dirs = (env.PATH ?? env.Path ?? '').split(win ? ';' : ':').filter((d) => d.trim() !== '')
    dirs.push('/opt/homebrew/bin', '/usr/local/bin', '/usr/bin', `${home}/.volta/bin`)
    const out: string[] = []
    for (const d of dirs) {
        for (const n of names) {
            const p = `${d.replace(/[\\/]+$/, '')}/${n}`
            if (!out.includes(p)) out.push(p)
        }
    }
    return out
}

/** A token from FIGMA_TOKEN or the secrets files every front door reads (`~/.mateu-secrets`, `~/.config/mateu`). */
export function tokenFromEnvOrFiles(env: Record<string, string | undefined>, home: string, read: (p: string) => string | undefined): string | undefined {
    const e = env.FIGMA_TOKEN?.trim()
    if (e) return e
    for (const p of [`${home}/.mateu-secrets/figma-token`, `${home}/.config/mateu/figma-token`]) {
        const t = read(p)?.trim()
        if (t) return t
    }
    return undefined
}
