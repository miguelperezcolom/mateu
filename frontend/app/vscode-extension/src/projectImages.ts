import * as fs from 'fs'
import * as path from 'path'

/**
 * The project's images, for the visual editor's image picker — the VS Code twin of the IntelliJ
 * plugin's ProjectImages.kt (same rules): the image files under the folders the app SERVES
 * (`src/main/resources/static` / `public` / `META-INF/resources`, `public/`, .NET `wwwroot`, Python
 * `static`), each with the URL it is served at (`static/img/hero.jpg` → `/img/hero.jpg`). Build output
 * (target, build, node_modules, dist…) is never listed. Pure Node, tested on a temp folder.
 */
export const EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'])
export const SKIPPED = new Set(['target', 'build', 'node_modules', 'dist', 'out', 'bin', 'obj', '.git', '.gradle', '.idea', '.vscode'])
export const WEB_ROOTS = [
    'src/main/resources/static',
    'src/main/resources/public',
    'src/main/resources/META-INF/resources',
    'wwwroot',
    'public',
    'static',
]

/** A module-relative image file and the URL the app serves it at. */
export interface Found { path: string; url: string }

export function isImage(name: string): boolean {
    const dot = name.lastIndexOf('.')
    return dot >= 0 && EXTENSIONS.has(name.slice(dot + 1).toLowerCase())
}

/** The URL a module-relative (`/`-separated) file is served at, or undefined outside a web root. */
export function servedUrl(relativePath: string): string | undefined {
    const rel = relativePath.replace(/\\/g, '/').replace(/^\/+/, '')
    let best: { at: number; root: string } | undefined
    for (const root of WEB_ROOTS) {
        const at = rel.startsWith(root + '/') ? 0 : (() => { const i = rel.indexOf('/' + root + '/'); return i < 0 ? -1 : i + 1 })()
        if (at < 0) continue
        if (!best || at < best.at || (at === best.at && root.length > best.root.length)) best = { at, root }
    }
    if (!best) return undefined
    const rest = rel.slice(best.at + best.root.length + 1)
    return rest ? '/' + rest : undefined
}

const MODULE_FILES = ['pom.xml', 'build.gradle', 'build.gradle.kts', 'pyproject.toml', 'setup.py', 'package.json']

const hasCsproj = (dir: string): boolean => {
    try { return fs.readdirSync(dir).some((n) => n.endsWith('.csproj')) } catch { return false }
}

/** The nearest ancestor of `file` holding a build file (the module), else `fallback` / its folder. */
export function moduleRootOf(file: string, fallback?: string): string {
    let dir = path.dirname(file)
    for (;;) {
        if (MODULE_FILES.some((f) => fs.existsSync(path.join(dir, f))) || hasCsproj(dir)) return dir
        const parent = path.dirname(dir)
        if (parent === dir) break
        dir = parent
    }
    return fallback ?? path.dirname(file)
}

/** Every image under a web root of the module (at most `limit`), sorted by URL. */
export function listImages(moduleRoot: string, limit = 1000): Found[] {
    const out: Found[] = []
    const walk = (dir: string) => {
        if (out.length >= limit) return
        let entries: fs.Dirent[]
        try { entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)) } catch { return }
        for (const e of entries) {
            if (out.length >= limit) return
            const full = path.join(dir, e.name)
            if (e.isDirectory()) {
                if (!SKIPPED.has(e.name) && !e.name.startsWith('.')) walk(full)
            } else if (e.isFile() && isImage(e.name)) {
                const rel = path.relative(moduleRoot, full).split(path.sep).join('/')
                const url = servedUrl(rel)
                if (url) out.push({ path: rel, url })
            }
        }
    }
    walk(moduleRoot)
    return out.sort((a, b) => a.url.localeCompare(b.url))
}

/** Where "Add image to project…" copies a file (see ProjectImages.kt: same rule). */
export function targetDir(moduleRoot: string): string {
    const existing = WEB_ROOTS.map((r) => path.join(moduleRoot, ...r.split('/'))).find((d) => fs.existsSync(d) && fs.statSync(d).isDirectory())
    if (existing) return path.join(existing, 'images')
    if (hasCsproj(moduleRoot)) return path.join(moduleRoot, 'wwwroot', 'images')
    const python = fs.existsSync(path.join(moduleRoot, 'pyproject.toml')) || fs.existsSync(path.join(moduleRoot, 'setup.py'))
    if (python && !fs.existsSync(path.join(moduleRoot, 'src', 'main'))) return path.join(moduleRoot, 'static', 'images')
    return path.join(moduleRoot, 'src', 'main', 'resources', 'static', 'images')
}

/** Copy an image into the project, never over an existing file (`hero-1.jpg`, `hero-2.jpg`…). */
export function copyInto(moduleRoot: string, source: string): Found {
    if (!isImage(path.basename(source))) throw new Error('Not an image: ' + source)
    const dir = targetDir(moduleRoot)
    fs.mkdirSync(dir, { recursive: true })
    const ext = path.extname(source)
    const base = path.basename(source, ext)
    let target = path.join(dir, base + ext)
    for (let n = 1; fs.existsSync(target); n++) target = path.join(dir, `${base}-${n}${ext}`)
    fs.copyFileSync(source, target)
    const rel = path.relative(moduleRoot, target).split(path.sep).join('/')
    return { path: rel, url: servedUrl(rel) ?? '/' + rel }
}

/** Where the loopback server serves a registered module's images. */
export const IMAGES_PREFIX = '/__mateu-images/'

const IMAGE_TYPES: Record<string, string> = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', avif: 'image/avif',
}

/** A stable token for a module root (every editor of the module shares it). */
export function imageToken(root: string): string {
    let h = 0
    for (const c of path.resolve(root)) h = (h * 31 + c.charCodeAt(0)) | 0
    return (h >>> 0).toString(16).padStart(8, '0')
}

/** The loopback URL path of a module-relative image. */
export function imageUrlPath(token: string, relativePath: string): string {
    return IMAGES_PREFIX + token + '/' + relativePath.split('/').map(encodeURIComponent).join('/')
}

/**
 * The file a loopback request names, with its content type — or undefined: unknown token, a path
 * escaping the root, not an image, no such file.
 */
export function imageFileOf(roots: ReadonlyMap<string, string>, urlPath: string): { file: string; contentType: string } | undefined {
    const p = urlPath.split('?')[0]
    if (!p.startsWith(IMAGES_PREFIX)) return undefined
    const rest = p.slice(IMAGES_PREFIX.length)
    const slash = rest.indexOf('/')
    if (slash < 0) return undefined
    const root = roots.get(rest.slice(0, slash))
    if (!root) return undefined
    let rel: string
    try { rel = decodeURIComponent(rest.slice(slash + 1)) } catch { return undefined }
    if (!rel || rel.split('/').includes('..') || !isImage(rel)) return undefined
    const file = path.resolve(root, rel)
    if (!file.startsWith(path.resolve(root) + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) return undefined
    return { file, contentType: IMAGE_TYPES[rel.slice(rel.lastIndexOf('.') + 1).toLowerCase()] ?? 'application/octet-stream' }
}
