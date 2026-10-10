/**
 * Images in a page: which properties hold one, the project's own image files (listed by the host),
 * and how the canvas shows a project image no backend serves.
 *
 * One rule decides which properties get the image picker ({@link isImageProp}), so the properties
 * panel, the app-shell editor and the canvas's URL mapping agree.
 */

/** A project image, as the host lists it. */
export interface ProjectImage {
    /** The file, relative to the module that serves it (`src/main/resources/static/img/hero.jpg`). */
    path: string
    /** The URL the app serves it at (`/img/hero.jpg`): what the property is set to. */
    url: string
    /** A source the editor can show as a thumbnail (a data URI, or a URL the host serves). */
    thumb: string
    /**
     * A source the CANVAS can load the real image from, where it differs from `thumb` (VS Code: the
     * thumbnail is a webview URI, which the framed Redwood canvas cannot load; this is the loopback
     * server's). Absent: `thumb` is used.
     */
    src?: string
}

/** What a schema prop says about itself that the rule reads. */
export interface ImagePropHint {
    /** The editor's prop kind: only a `string` prop can hold an image URL. */
    kind?: string
    /** A JSON-schema `format` / `contentMediaType` hint, when the schema carries one. */
    format?: string
}

/** Property names that hold an image wherever they appear. */
const IMAGE_NAMES = new Set(['image', 'src', 'avatar', 'logo', 'favicon', 'illustration', 'thumbnail', 'picture', 'photo'])

/**
 * Whether a property holds an image (a URL or a data URI): its name says so (`image`, `src`,
 * `avatar`, `logo`, `favicon`, anything ending in `Image` / `ImageUrl`, like `heroImage` or
 * `backgroundImage`), or the schema hints it (`format: uri` with an image media type, or a
 * `contentMediaType: image/…`). Only a string prop qualifies: a `Form.avatar` that is a COMPONENT is
 * a slot, not an image. Icons (`icon`) are icon names, not images.
 */
export function isImageProp(prop: string, hint: ImagePropHint = {}): boolean {
    if (hint.kind && hint.kind !== 'string') return false
    if (hint.format && /^image\//.test(hint.format)) return true
    if (IMAGE_NAMES.has(prop)) return true
    return /[a-z0-9](Image|ImageUrl|ImageUri|ImageSrc)$/.test(prop) || /^image(Url|Uri|Src)$/.test(prop)
}

const IMAGE_FILE = /\.(png|jpe?g|gif|svg|webp|avif)$/i

/** Whether a file name is an image the picker lists. */
export function isImageFile(name: string): boolean {
    return IMAGE_FILE.test(name)
}

/** The project image a property value names: by its URL, with or without the leading slash. */
export function imageOfValue(images: readonly ProjectImage[], value: unknown): ProjectImage | undefined {
    if (typeof value !== 'string' || !value.trim()) return undefined
    const v = value.trim()
    const bare = v.replace(/^\.?\//, '')
    return images.find((i) => i.url === v || i.url.replace(/^\//, '') === bare)
}

/** The images matching what the author types: every word in the file name or URL, any order. */
export function filterImages(images: readonly ProjectImage[], query: string): ProjectImage[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    const out = images.filter((i) => words.every((w) => (i.url + ' ' + i.path).toLowerCase().includes(w)))
    return out.sort((a, b) => a.url.localeCompare(b.url))
}

/** The image's file name, for its tile in the picker. */
export function imageName(image: ProjectImage): string {
    return image.url.slice(image.url.lastIndexOf('/') + 1) || image.path
}

/**
 * The canvas has no backend serving `/img/hero.jpg` (or a different one): a project image named by a
 * property is swapped for the source the HOST serves it from, so the preview shows the real image.
 * Anything else — an external URL, a data URI, an unknown path — is left as written.
 */
export function previewImageSrc(images: readonly ProjectImage[], value: unknown): string | undefined {
    const image = imageOfValue(images, value)
    return image ? (image.src ?? image.thumb) : undefined
}

/**
 * A deep copy of any definition (a page, an app shell) with every project image swapped for its
 * preview source — what Play runs, since no backend serves the project's images there either.
 */
export function withPreviewImages<T>(value: T, images: readonly ProjectImage[]): T {
    if (!images.length) return value
    const walk = (v: unknown, key?: string): unknown => {
        if (typeof v === 'string') return key && isImageProp(key) ? (previewImageSrc(images, v) ?? v) : v
        if (Array.isArray(v)) return v.map((x) => walk(x))
        if (v && typeof v === 'object') {
            const out: Record<string, unknown> = {}
            for (const [k, x] of Object.entries(v as Record<string, unknown>)) out[k] = walk(x, k)
            return out
        }
        return v
    }
    return walk(value) as T
}
